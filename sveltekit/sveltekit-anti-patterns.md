
# 🌐 **SvelteKit アンチパターン集**

## **1. load関数の誤用**

### **❌ アンチパターン：実行環境の誤解**
```typescript
// ❌ +page.ts で秘密情報にアクセス
export const load = async ({ fetch }) => {
  // ❌ これはブラウザでも実行される！
  const apiKey = process.env.SECRET_API_KEY; // undefined になる
  
  // ❌ localStorage をサーバーで使おうとする
  const token = localStorage.getItem('token'); // エラー
  
  return {
    data: await fetch('/api/data', {
      headers: { 'Authorization': apiKey } // 秘密情報がブラウザに露出
    })
  };
};
```

### **✅ 正しいパターン：環境別の適切な処理**
```typescript
// +page.server.ts - サーバー専用
export const load = async ({ fetch, locals }) => {
  // ✅ サーバーでのみ実行
  const apiKey = process.env.SECRET_API_KEY;
  
  // ✅ 認証情報はlocalsから取得
  const user = locals.user;
  
  return {
    data: await fetch('/api/data', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
  };
};

// +page.ts - ユニバーサル（安全な処理のみ）
export const load = async ({ fetch, data }) => {
  // ✅ 公開データのみ
  const publicData = await fetch('/api/public').then(r => r.json());
  
  return {
    publicData
  };
};
```

## **2. SPA脳でのSSR無視**

### **❌ アンチパターン：全てをクライアントで処理**
```typescript
// ❌ Angular的な発想：全部クライアントで
export const ssr = false; // 全ページでSSR無効化

export const load = async ({ fetch }) => {
  // ❌ 毎回クライアントでAPI呼び出し
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return {
      data: await fetch('/api/data', {
        headers: { 'Authorization': token }
      })
    };
  }
  return { data: null };
};
```

### **✅ 正しいパターン：SSRを活用**
```typescript
// +page.server.ts - サーバーで事前取得
export const load = async ({ locals, cookies }) => {
  const token = cookies.get('auth-token');
  
  if (!token) {
    throw redirect(302, '/login');
  }
  
  // ✅ サーバーで認証済みデータを事前取得
  const data = await fetch('/api/data', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return { data };
};
```

## **3. ファイル構成の誤解**

### **❌ アンチパターン：Angular的なフォルダ構成期待**
```
src/
├── routes/
│   └── games/
│       ├── game.component.svelte  ❌ Angularライクな命名
│       ├── game.service.ts        ❌ サービス層を無理に分離
│       ├── game.module.ts         ❌ モジュール概念の混同
│       └── game.routing.ts        ❌ ルーティング設定ファイル
```

### **✅ 正しいパターン：SvelteKit規約に従う**
```
src/routes/
├── games/
│   ├── +page.svelte        ✅ UI
│   ├── +page.server.ts     ✅ サーバー処理
│   ├── +layout.svelte      ✅ 共通レイアウト
│   └── [id]/
│       ├── +page.svelte    ✅ ゲーム詳細
│       ├── +page.server.ts ✅ ゲーム詳細データ
│       └── +server.ts      ✅ API エンドポイント
```

## **4. セキュリティアンチパターン**

### **❌ アンチパターン：クライアント側での秘密管理**
```svelte
<script>
  // ❌ 秘密情報をクライアントに露出
  const API_SECRET = 'secret-key-123';
  
  // ❌ 認証チェックをクライアントのみで実行
  let isAuthenticated = $state(false);
  
  onMount(() => {
    const token = localStorage.getItem('token');
    if (token) {
      isAuthenticated = true; // ❌ サーバー検証なし
    }
  });
</script>

{#if isAuthenticated}
  <!-- ❌ クライアント認証のみでの表示 -->
  <AdminPanel />
{/if}
```

### **✅ 正しいパターン：サーバー側認証**
```typescript
// +page.server.ts
export const load = async ({ locals }) => {
  // ✅ サーバーで認証チェック
  if (!locals.user || !locals.user.isAdmin) {
    throw error(403, 'アクセス権限がありません');
  }
  
  // ✅ 認証済みユーザーのみデータ取得
  const adminData = await getAdminData();
  return { adminData };
};
```

## **5. パフォーマンスアンチパターン**

### **❌ アンチパターン：不要なリアクティビティ**
```svelte
<script>
  let items = $state([]);
  
  // ❌ 毎回新しい配列を生成
  let filteredItems = $derived(
    items.filter(item => item.active)  // 毎回新しい配列
  );
  
  // ❌ 複雑な計算を$derivedで毎回実行
  let expensiveCalculation = $derived(
    items.reduce((acc, item) => {
      // 重い計算処理
      return acc + heavyCalculation(item);
    }, 0)
  );
</script>
```

### **✅ 正しいパターン：最適化された計算**
```svelte
<script>
  let items = $state([]);
  let filter = $state('active');
  
  // ✅ メモ化された計算
  let filteredItems = $derived.by(() => {
    // 依存関係が変わった時のみ再計算
    return items.filter(item => 
      filter === 'all' || item.status === filter
    );
  });
  
  // ✅ 重い計算は必要時のみ
  let expensiveResult = $derived.by(() => {
    if (filteredItems.length === 0) return 0;
    
    return filteredItems.reduce((acc, item) => 
      acc + item.value, 0
    );
  });
</script>
```

## 🎮 **リアルタイムジャンケンゲームでのアンチパターン例**

### **❌ Angular脳でのアンチパターン**
```svelte
<!-- ❌ 過度に分離・複雑化 -->
<script>
  // ❌ 不要なサービス層
  class GameStateService {
    constructor() {
      this.state = $state('waiting');
      this.players = $state([]);
    }
  }
  
  class WebSocketService {
    constructor(gameService) {
      this.gameService = gameService;
    }
  }
  
  // ❌ Angular的な依存注入の模倣
  const gameService = new GameStateService();
  const wsService = new WebSocketService(gameService);
  
  // ❌ 過度なリアクティブ管理
  $effect(() => {
    if (gameService.state === 'playing') {
      wsService.startGame();
    }
  });
</script>
```

### **✅ Svelte的なシンプルなパターン**
```svelte
<script>
  // ✅ 必要最小限の状態管理
  let gameState = $state('waiting');
  let players = $state([]);
  let socket = $state(null);
  
  // ✅ 直接的な副作用
  $effect(() => {
    if (gameState === 'playing' && socket) {
      socket.send(JSON.stringify({ type: 'game_start' }));
    }
  });
  
  // ✅ シンプルな計算
  let canStart = $derived(
    players.length >= 2 && players.every(p => p.isReady)
  );
</script>
```

## 💡 **Angular経験者向けマインドセット転換**

### **🔄 思考の転換ポイント**

| Angular思考 | Svelte思考 | 理由 |
|------------|-----------|------|
| `Injectable Service` | 必要時のみモジュール分離 | Svelteは軽量性重視 |
| `ngOnInit()` | `onMount()` + `$effect()` | ライフサイクルの違い |
| `@Input()/@Output()` | `$props()` + コールバック | より直接的な通信 |
| `Router Guard` | `+page.server.ts` load | サーバー側での事前チェック |
| `HttpInterceptor` | `hooks.server.ts` | リクエスト処理の一元化 |

### **✅ ベストプラクティス**

1. **🎯 シンプルさを維持**：Angularほど抽象化しない
2. **🌐 実行環境を意識**：サーバー/クライアントの違いを理解
3. **⚡ リアクティビティを信頼**：手動更新は最小限に
4. **🔐 セキュリティはサーバー側**：クライアント認証は補助のみ
5. **📁 規約に従う**：SvelteKitのファイル命名規則を守る
