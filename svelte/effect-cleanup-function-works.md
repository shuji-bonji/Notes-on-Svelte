# $effectのクリーンアップ関数の仕組み

## $effectの型定義

```typescript
// Svelteの内部的な型定義（簡略化）
type EffectFunction = () => void | (() => void);

function $effect(fn: EffectFunction): void;
```

つまり：
- `$effect`自体の戻り値は`void`
- 引数の関数は`void`または「**クリーンアップ関数**」を返せる

## クリーンアップ関数とは

`$effect`の引数として渡す関数が返す関数は、**クリーンアップ関数**と呼ばれ、以下のタイミングで自動的に実行されます：

1. **依存値が変更されて、次の`$effect`が実行される前**
2. **コンポーネントが破棄される時**

## 具体例で理解する

### 例1: タイマーのクリーンアップ

```typescript
<script lang="ts">
  let count = $state(0);
  let interval = $state(1000); // ミリ秒
  
  $effect(() => {
    console.log(`タイマー開始: ${interval}ms間隔`);
    
    const timer = setInterval(() => {
      count++;
    }, interval);
    
    // これがクリーンアップ関数
    // Svelteが適切なタイミングで呼び出す
    return () => {
      console.log('タイマー停止');
      clearInterval(timer);
    };
  });
</script>

<button onclick={() => interval = interval === 1000 ? 500 : 1000}>
  間隔を変更
</button>
<p>カウント: {count}</p>
```

**動作の流れ：**
1. 初回: `$effect`実行 → タイマー開始
2. `interval`を変更 → クリーンアップ関数実行（古いタイマー停止） → 新しい`$effect`実行
3. コンポーネント破棄時 → クリーンアップ関数実行（タイマー停止）

### 例2: イベントリスナーのクリーンアップ

```typescript
<script lang="ts">
  let mousePosition = $state({ x: 0, y: 0 });
  let trackMouse = $state(true);
  
  $effect(() => {
    if (!trackMouse) return; // 早期リターン（クリーンアップ関数なし）
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition = { x: e.clientX, y: e.clientY };
    };
    
    // イベントリスナー登録
    document.addEventListener('mousemove', handleMouseMove);
    
    // クリーンアップ関数を返す
    return () => {
      // イベントリスナー解除
      document.removeEventListener('mousemove', handleMouseMove);
    };
  });
</script>
```

### 例3: WebSocketのクリーンアップ

```typescript
<script lang="ts">
  let messages = $state<string[]>([]);
  let wsUrl = $state('ws://localhost:8080');
  
  $effect(() => {
    console.log(`WebSocket接続: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      messages = [...messages, event.data];
    };
    
    ws.onerror = (error) => {
      console.error('WebSocketエラー:', error);
    };
    
    // クリーンアップ: WebSocket接続を閉じる
    return () => {
      console.log('WebSocket切断');
      ws.close();
    };
  });
</script>
```

## なぜクリーンアップが重要か

### メモリリークの防止

```typescript
<script lang="ts">
  // ❌ 悪い例: クリーンアップなし
  $effect(() => {
    setInterval(() => {
      console.log('実行中...');
    }, 1000);
    // クリーンアップなし → メモリリーク！
  });
  
  // ✅ 良い例: 適切なクリーンアップ
  $effect(() => {
    const timer = setInterval(() => {
      console.log('実行中...');
    }, 1000);
    
    return () => clearInterval(timer);
  });
</script>
```

## Angularとの比較

```typescript
// Angular (RxJS)
export class Component implements OnDestroy {
  private subscription: Subscription;
  
  ngOnInit() {
    this.subscription = interval(1000).subscribe(n => {
      console.log(n);
    });
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe(); // 手動でクリーンアップ
  }
}

// Svelte
$effect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  return () => clearInterval(timer); // 自動でクリーンアップ
});
```

## 高度な例: 複数のクリーンアップ

```typescript
<script lang="ts">
  let userId = $state(1);
  let userData = $state<User | null>(null);
  let loading = $state(false);
  
  $effect(() => {
    let cancelled = false;
    const controller = new AbortController();
    
    // 複数の副作用
    loading = true;
    
    // 1. API呼び出し
    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          userData = data;
          loading = false;
        }
      })
      .catch(err => {
        if (!cancelled && err.name !== 'AbortError') {
          console.error(err);
          loading = false;
        }
      });
    
    // 2. ログ送信
    const logTimer = setTimeout(() => {
      console.log(`User ${userId} viewed`);
    }, 1000);
    
    // 複数のクリーンアップを一つの関数で
    return () => {
      cancelled = true;
      controller.abort(); // API呼び出しをキャンセル
      clearTimeout(logTimer); // タイマーをクリア
    };
  });
</script>
```

## まとめ

`$effect`のクリーンアップ関数は：

1. **Svelteフレームワークに返される**（開発者が直接呼び出すものではない）
2. **自動的に適切なタイミングで実行される**
3. **リソースの解放やメモリリークの防止に必須**

この仕組みにより、Angularの`ngOnDestroy`のような明示的なライフサイクルメソッドを書く必要がなく、より直感的にクリーンアップを記述できます。