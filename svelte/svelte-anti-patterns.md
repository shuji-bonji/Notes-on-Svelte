# 🚨 **Svelte 5 アンチパターン集**

## **1. Runesの誤用・混在**

### **❌ アンチパターン：古い記法との混在**
```svelte
<script>
  // ❌ Svelte 3/4 の古い記法と Svelte 5 を混在
  let count = 0;  // 古い記法
  let name = $state(''); // 新しい記法
  
  // ❌ リアクティブ文と$derivedの混在
  $: doubled = count * 2;  // 古い記法
  let tripled = $derived(count * 3); // 新しい記法
  
  // ❌ $stateを関数内で宣言
  function createCounter() {
    let value = $state(0); // ❌ 動作しない
    return value;
  }
</script>
```

### **✅ 正しいパターン**
```svelte
<script>
  // ✅ Svelte 5 Runes で統一
  let count = $state(0);
  let name = $state('');
  
  // ✅ $derived で統一
  let doubled = $derived(count * 2);
  let tripled = $derived(count * 3);
  
  // ✅ Runesはトップレベルで宣言
  let counter = $state(0);
  
  function increment() {
    counter++; // ✅ 状態更新のみ
  }
</script>
```

## **2. Angular脳での過度な分離**

### **❌ アンチパターン：不要なサービス層作成**
```svelte
<!-- ❌ Angular的な過度な抽象化 -->
<script>
  // ❌ 不要なサービス層
  class CounterService {
    constructor() {
      this.count = $state(0);
    }
    
    increment() {
      this.count++;
    }
  }
  
  const counterService = new CounterService();
  
  // ❌ 単純なカウンターにサービス層は過剰
</script>

<button onclick={() => counterService.increment()}>
  {counterService.count}
</button>
```

### **✅ 正しいパターン：適切な簡潔性**
```svelte
<script>
  // ✅ シンプルな状態は直接管理
  let count = $state(0);
  
  const increment = () => count++;
</script>

<button onclick={increment}>{count}</button>
```

## **3. $effectの濫用**

### **❌ アンチパターン：不要な副作用**
```svelte
<script>
  let name = $state('');
  let displayName = $state('');
  
  // ❌ $derivedで十分なのに$effectを使用
  $effect(() => {
    displayName = name.toUpperCase();
  });
  
  let items = $state([]);
  let count = $state(0);
  
  // ❌ 計算結果の保存に$effect使用
  $effect(() => {
    count = items.length;
  });
</script>
```

### **✅ 正しいパターン**
```svelte
<script>
  let name = $state('');
  
  // ✅ 計算結果は$derivedで
  let displayName = $derived(name.toUpperCase());
  
  let items = $state([]);
  
  // ✅ 単純な計算は$derivedで
  let count = $derived(items.length);
  
  // ✅ $effectは真の副作用のみ
  $effect(() => {
    console.log(`アイテム数が変更: ${count}`);
    // DOM操作、API呼び出し、ログ出力など
  });
</script>
```

## **4. イベントハンドリングの誤解**

### **❌ アンチパターン：Angular的な記法の期待**
```svelte
<script>
  let value = $state('');
  
  // ❌ Angularのように$eventを期待
  function handleInput($event) {
    value = $event.target.value;
  }
  
  // ❌ 型安全性を無視
  function handleClick(e) {
    console.log(e.currentTarget.value); // undefinedの可能性
  }
</script>

<!-- ❌ Angular的な記法 -->
<input oninput="handleInput($event)" />
<button onclick="handleClick($event)">Click</button>
```

### **✅ 正しいパターン**
```svelte
<script>
  let value = $state('');
  
  // ✅ Svelte的なイベントハンドリング
  const handleInput = (e) => {
    value = e.currentTarget.value;
  };
  
  // ✅ TypeScript での型安全性
  const handleClick = (e: MouseEvent & { currentTarget: HTMLButtonElement }) => {
    console.log('ボタンがクリックされました');
  };
</script>

<!-- ✅ 関数参照または直接記述 -->
<input oninput={handleInput} />
<input oninput={(e) => value = e.currentTarget.value} />
<button onclick={handleClick}>Click</button>
```
