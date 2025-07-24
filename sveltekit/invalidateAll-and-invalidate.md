# `invalidate()`() と `invalidateAll()` の違い

SvelteKit における `invalidateAll()` と `invalidate()`() は、いずれも `load()` 関数を再実行してデータを更新するための関数 ですが、対象範囲や使いどころが異なります。

## ✅ `invalidate()`() と `invalidateAll()` の違い

|比較項目|`invalidate()`|`invalidateAll()`|
|---|---|---|
|再実行される範囲|指定した依存キーを持つ `load()` 関数|現在のページおよび layout の全 `load()` 関数|
|引数|string（依存キー）|なし|
|依存キー（depends）が必要|必要|不要|
|主な用途|特定の API の更新、局所的な再読み込み|全体のリセットや状態更新が必要な場面|
|主な再実行対象|対象の `depends()` がある `load()`|`+layout.ts` や `+page.ts` の全ての `load()`|


## 📘 `invalidate()`() の使い方と例
キーが一致するすべての `load()` が再実行される。

```ts
// +page.ts
export async function load({ fetch, depends }) {
  depends('app:data:user');
  const res = await fetch('/api/user');
  const user = await res.json();
  return { user };
}
```

```svelte
<script>
  import { `invalidate()` } from '$app/navigation';

  function reloadUser() {
    `invalidate()`('app:data:user');
  }
</script>

<button onclick={reloadUser}>ユーザーを再取得</button>
```


## `invalidateAll()` の使い方と例
`depends()` の指定がなくても、現在のルートに関するすべての `load()` 関数が再実行される。

```svelte
<script>
  import { `invalidate()`All } from '$app/navigation';

  function reloadEverything() {
    `invalidateAll()`;
  }
</script>

<button onclick={reloadEverything}>ページ全体を再読み込み</button>
```

## 使い分けの指針

|状況例|選ぶべき関数|
|---|---|
|ユーザー情報など、特定データだけを再取得したい|`invalidate('app:data:user')`|
|ページ表示の全体をリフレッシュしたい（全APIや全表示の再取得）|`invalidateAll()`|
|WebSocket の通知で局所的に特定データだけ再取得したい|`invalidate()`|
|設定変更やログアウトなどでページ全体を再構成したい|`invalidateAll()`|


## 📌 注意点
- `invalidate()`は depends() を使っていないと効果がありません。
- `invalidateAll()` は ブラウザリロードに近い挙動ですが、状態（たとえば `$state`）は維持されます。
