# `<script>` と `<script module>` の違い

Svelte コンポーネントには、2種類の `<script>` ブロックが存在します。それぞれの役割と使い分けを正しく理解することが、SvelteKit 開発において非常に重要です。

> 💡 Svelte 5 では `<script context="module">` は `<script module>` に短縮されました。本ドキュメントでは Svelte 5 の表記に準拠します。

## ✅ 基本比較表

| 種類                        | 記述方法                        | 実行タイミング       | スコープ              | 主な用途                               |
|-----------------------------|----------------------------------|----------------------|-----------------------|----------------------------------------|
| インスタンススクリプト      | `<script>`                      | クライアントで実行   | コンポーネントのインスタンスごと | リアクティブ変数、イベント、状態管理など |
| モジュールスクリプト（module） | `<script module>`     | ビルド時または SSR時 | モジュール単位（1度のみ）     | `load()`、`prerender` などSvelteKit固有の設定やサーバー向け処理 |


## 🧠 イメージ図

```text
┌────────────────────────────┐
│      <script module>       │ ← サーバー / ビルド側（静的）
└────────────────────────────┘
           ↓ props 渡し
┌───────────────────────┐
│       <script>        │ ← クライアント / 実行時（動的）
└───────────────────────┘
```


## 📘 主な用途とコード例

### `<script>` の例（クライアント側）

```svelte
<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>
  Count: {count}
</button>
```

- 状態管理やイベント処理など、UIのロジックを記述
- `onMount()` などのライフサイクルフックもここ


### `<script module>` の例（SvelteKit連携）

```svelte
<script module>
  export const prerender = true;

  export async function load() {
    return { props: { message: 'Hello from server' } };
  }
</script>

<script>
  export let message;
</script>

<h1>{message}</h1>
```

- `load()` 関数を使ったサーバーサイドデータの取得
- `export const ssr = false` や `trailingSlash` などのページオプションもここ


## 🔁 使い分けの指針

| シーン                             | 適用するスクリプト          | 理由                                      |
|----------------------------------|------------------------------|-------------------------------------------|
| クライアントで状態管理をしたい      | `<script>`                   | 状態（countなど）を動的に扱いたい        |
| ページの事前レンダリングを有効化    | `<script module>`  | `export const prerender = true` を定義   |
| SSRでのデータフェッチを記述したい    | `<script module>`  | `load()` を使う                           |
| ページ内でイベントバインディングしたい| `<script>`                   | DOM と連動した動的処理を書くため         |


## ✅ 結論

- `module` は **ビルド時/SSR用の設定・処理を書く場所**
- 通常の `<script>` は **クライアントでの動的動作（状態管理・UI操作）を書く場所**
- 両者は共存可能で、それぞれの責務を明確に分担して使うと◎