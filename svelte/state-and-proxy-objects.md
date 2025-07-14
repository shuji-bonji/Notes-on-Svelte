# $stateとProxyオブジェクト

## Proxyオブジェクトとは

Proxyは、オブジェクトへの操作を「横取り」して、カスタムの動作を定義できるJavaScriptの機能です。ES2015で導入され、オブジェクトの基本操作（読み取り、書き込み、削除など）をインターセプトできます。

```typescript
// 基本的な使い方
const target = { value: 0 };
const proxy = new Proxy(target, {
  get(target, property) {
    console.log(`読み取り: ${String(property)}`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`書き込み: ${String(property)} = ${value}`);
    target[property] = value;
    return true;
  }
});

proxy.value; // "読み取り: value"
proxy.value = 10; // "書き込み: value = 10"
```

## なぜSvelteはProxyを採用したのか

Svelte 5では、リアクティビティシステムの中核にProxyを採用しました。これにより：

1. **自然な文法**: 通常のJavaScriptのように書ける
2. **自動追跡**: 依存関係を自動的に検出
3. **細粒度の更新**: 変更された部分のみを効率的に更新

## 実例：ショッピングカートの実装

同じショッピングカート機能を、3つの異なるアプローチで実装してみましょう。

### 1. RxJS（Angularスタイル）での実装

```typescript
import { BehaviorSubject, combineLatest, map } from 'rxjs';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

class CartServiceRxJS {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  
  // 公開用のObservable
  items$ = this.itemsSubject.asObservable();
  
  // 合計金額の計算
  total$ = this.items$.pipe(
    map(items => items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    ))
  );
  
  // アイテムの追加
  addItem(item: Omit<CartItem, 'quantity'>) {
    const currentItems = this.itemsSubject.value;
    const existingItem = currentItems.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      currentItems.push({ ...item, quantity: 1 });
    }
    
    this.itemsSubject.next([...currentItems]);
  }
  
  // 数量の更新
  updateQuantity(id: number, quantity: number) {
    const items = this.itemsSubject.value.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    this.itemsSubject.next(items);
  }
  
  // アイテムの削除
  removeItem(id: number) {
    const items = this.itemsSubject.value.filter(item => item.id !== id);
    this.itemsSubject.next(items);
  }
}

// 使用例
const cart = new CartServiceRxJS();
cart.total$.subscribe(total => console.log(`合計: ¥${total}`));
cart.addItem({ id: 1, name: "商品A", price: 1000 });
```

### 2. 素のProxyでの実装

```typescript
interface CartState {
  items: CartItem[];
  total: number;
}

class CartServiceProxy {
  private subscribers: Set<() => void> = new Set();
  private state: CartState;
  public proxy: CartState;
  
  constructor() {
    this.state = {
      items: [],
      total: 0
    };
    
    // Proxyでラップ
    this.proxy = new Proxy(this.state, {
      get: (target, property) => {
        // 配列メソッドもインターセプト
        if (property === 'items') {
          return new Proxy(target.items, {
            get: (arr, arrProp) => {
              const value = arr[arrProp as any];
              // push, splice等のメソッドをラップ
              if (typeof value === 'function') {
                return (...args: any[]) => {
                  const result = (value as Function).apply(arr, args);
                  this.updateTotal();
                  this.notify();
                  return result;
                };
              }
              return value;
            },
            set: (arr, index, value) => {
              arr[index as any] = value;
              this.updateTotal();
              this.notify();
              return true;
            }
          });
        }
        return target[property as keyof CartState];
      },
      set: (target, property, value) => {
        target[property as keyof CartState] = value;
        if (property === 'items') {
          this.updateTotal();
        }
        this.notify();
        return true;
      }
    });
  }
  
  private updateTotal() {
    this.state.total = this.state.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  }
  
  private notify() {
    this.subscribers.forEach(callback => callback());
  }
  
  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  addItem(item: Omit<CartItem, 'quantity'>) {
    const existingItem = this.proxy.items.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.proxy.items.push({ ...item, quantity: 1 });
    }
  }
  
  updateQuantity(id: number, quantity: number) {
    const item = this.proxy.items.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
    }
  }
  
  removeItem(id: number) {
    const index = this.proxy.items.findIndex(i => i.id === id);
    if (index !== -1) {
      this.proxy.items.splice(index, 1);
    }
  }
}

// 使用例
const cart = new CartServiceProxy();
cart.subscribe(() => console.log(`合計: ¥${cart.proxy.total}`));
cart.addItem({ id: 1, name: "商品A", price: 1000 });
```

### 3. Svelte 5の$stateでの実装

```typescript
// CartStore.svelte.ts
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

class CartStore {
  // $stateで自動的にリアクティブに
  items = $state<CartItem[]>([]);
  
  // 派生値も自動計算
  get total() {
    return this.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  }
  
  addItem(item: Omit<CartItem, 'quantity'>) {
    const existingItem = this.items.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity++; // 直接変更でOK！
    } else {
      this.items.push({ ...item, quantity: 1 }); // 配列メソッドも使える！
    }
  }
  
  updateQuantity(id: number, quantity: number) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.quantity = quantity; // シンプル！
    }
  }
  
  removeItem(id: number) {
    const index = this.items.findIndex(i => i.id === id);
    if (index !== -1) {
      this.items.splice(index, 1); // 破壊的メソッドもOK！
    }
  }
}

export const cart = new CartStore();
```

```svelte
<!-- Cart.svelte -->
<script lang="ts">
  import { cart } from './CartStore.svelte.ts';
  
  // リアクティブな値は自動的に更新される
  $: formattedTotal = `¥${cart.total.toLocaleString()}`;
</script>

<div class="cart">
  <h2>ショッピングカート</h2>
  
  {#each cart.items as item}
    <div class="cart-item">
      <span>{item.name}</span>
      <input 
        type="number" 
        bind:value={item.quantity}
        min="1"
      />
      <span>¥{(item.price * item.quantity).toLocaleString()}</span>
      <button onclick={() => cart.removeItem(item.id)}>削除</button>
    </div>
  {/each}
  
  <div class="total">
    合計: {formattedTotal}
  </div>
</div>
```

## 各アプローチの比較

### RxJS（Angular）
**メリット**
- 明示的なデータフロー
- 強力な演算子（debounce、switchMapなど）
- 非同期処理との親和性が高い

**デメリット**
- 学習曲線が急
- ボイラープレートが多い
- サブスクリプション管理が必要

### 素のProxy
**メリット**
- ネイティブJavaScriptの機能
- 自然な文法
- フレームワーク非依存

**デメリット**
- 手動でのサブスクリプション管理
- エッジケースの処理が複雑
- TypeScriptの型推論が弱い

### Svelte 5の$state
**メリット**
- 最もシンプルな記述
- 自動的な依存関係追跡
- 破壊的メソッドも使用可能
- TypeScriptとの完全な互換性

**デメリット**
- Svelteコンポーネント内でのみ使用可能
- まだ新しい機能（Svelte 5）

## まとめ

Svelte 5の`$state`は、Proxyの力を活用して、RxJSの明示的なリアクティビティと、通常のJavaScriptの簡潔さの「いいとこ取り」を実現しています。Angular開発者にとっては、最初は戸惑うかもしれませんが、慣れるとその簡潔さと表現力に驚くはずです。

特に、配列やオブジェクトの操作が自然に書けること、依存関係の自動追跡、そしてTypeScriptとの優れた統合は、開発体験を大きく向上させます。