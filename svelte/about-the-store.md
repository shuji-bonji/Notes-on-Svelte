# Svelte/SvelteKit におけるストアの基礎と実践

## 🎯 ストアとは何か？

Svelte のストアは、**コンポーネント間で状態（state）を共有するための仕組み**です。特に SvelteKit のような大規模アプリケーションでは、状態管理が重要になるため、ストアの理解は不可欠です。

ストアは単なる「オブジェクト」ですが、以下の3つのインターフェースを満たすことで Svelte に認識され、リアクティブに扱われます：

- `subscribe(callback)` — 状態の変化を監視
- `set(value)` — 値の直接更新
- `update(fn)` — 関数による更新

## 🔄 なぜストアを使うのか？

- **親子を超えたコンポーネント間の状態共有**
- **状態の一元管理によるロジックの単純化**
- **サーバーで取得した値をクライアントに展開する際の中継**
- **ルーティングをまたぐ共通設定（例: テーマ、ユーザー）を保持**

## 📁 ストアの定義場所と実体

通常、以下のように `src/lib/stores.js` や `src/lib/stores/index.ts` に定義されます：

```ts
// src/lib/stores.js
import { writable } from 'svelte/store';

export const count = writable(0);
```

ストアは「**モジュールスコープのシングルトンオブジェクト**」として扱われ、インポートした全コンポーネント間で状態が共有されます。


## 🔰 基本ストア：`writable()`

```ts
import { writable } from 'svelte/store';

export const theme = writable('light');
```

```svelte
<script>
  import { theme } from '$lib/stores';
</script>

<p>現在のテーマ: {$theme}</p>
<button onclick={() => theme.set('dark')}>ダークモードに切替</button>
```


## 🔁 派生ストア：`derived()`

`derived()` は、他のストアの値から計算されたストアを作るために使います。

```ts
import { writable, derived } from 'svelte/store';

export const count = writable(1);
export const double = derived(count, $count => $count * 2);
```

```svelte
<p>{$double}</p> <!-- 自動的に count が変われば double も更新される -->
```

- ✅ 非同期にも対応（第2引数に `set` を使う形式）


## 🛠️ カスタムストア：`custom store`

ロジックをカプセル化したストアを定義したい場合に使います。

```ts
import { writable } from 'svelte/store';

function createCounter() {
  const { subscribe, set, update } = writable(0);
  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0)
  };
}

export const counter = createCounter();
```

```svelte
<p>{$counter}</p>
<button onclick={counter.increment}>+1</button>
<button onclick={counter.decrement}>-1</button>
```


## ✅ SvelteKitでの活用例

### セッションやユーザー情報の共有

```ts
// src/hooks.server.ts などで取得
event.locals.user = getUserFromSession(...);
```

```ts
// src/lib/stores/user.ts
import { writable } from 'svelte/store';
export const user = writable(null);
```

```svelte
<!-- layout.svelte などで初期化 -->
<script>
  import { user } from '$lib/stores/user';
  export let data;
  user.set(data.user);
</script>
```


## 📌 注意点まとめ

| 項目 | 内容 |
|------|------|
| 自動購読 | `$storeName` で書けば自動購読＋再描画 |
| グローバル共有 | 全コンポーネントで同一のストアインスタンス |
| SSR対応 | サーバー側で初期化 → クライアントへ渡す処理が必要な場合あり |
| データの永続化 | `localStorage` 連携などはカスタムストアで対応 |


## 🏁 結論

Svelte のストアは「最小限のAPIで最大の柔軟性」を提供する、非常に洗練された状態管理ツールです。

- 少数のインターフェースで使える
- SvelteKitとの相性も抜群
- カスタムストアで複雑なロジックも整理可能

まずは `writable()` を使った共有から始め、必要に応じて `derived()` や `custom store` を導入していくのがおすすめです。
