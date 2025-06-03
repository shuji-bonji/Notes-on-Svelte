# SvelteKit の use:enhance は、form の送信を interceptしてリクエストに置き換える

SvelteKit の use:enhance は、form の action と method 属性を使って通常送信されるリクエストをフックし、JavaScript で処理する仕組みです。

ただし、「form の action / submit を使わない」というよりも、

- 通常の HTML の form の送信を intercept（介入）して
- fetch API を使ったクライアントサイドのリクエストに置き換える

という意味になります。


## use:enhance の挙動

```html
<form method="POST" use:enhance={options}>
```

このように記述すると、フォームは以下のように機能します。

1. フォーム送信時、ページ遷移せずに JavaScript で fetch を使って送信される
2. フォームの送信後、SvelteKit が自動で以下のことを行う
   - サーバー側の +page.server.ts の actions に処理を送る
   - 成功時は結果を受け取り、UI を更新（エラー時も対応可能）


## 通常の submit イベントと何が違う？

### 通常の `<form>`
   - ブラウザがフォームをサーバーに送信し、ページをリロードして結果を表示

### `use:enhance` 使用時
   - ページリロードなし（SPA的な動き）
   - fetch + FormData を使って非同期送信
   - エラーや成功の状態をクライアントで制御できる


## なぜ use:enhance が必要なのか？

`use:enhance` は、**フォーム送信後にページをフルリロードせず、よりスムーズでインタラクティブなユーザー体験を実現するため**にあります。

### 通常のフォーム送信の課題

- ページが完全にリロードされるため、画面の状態（スクロール位置や入力値、アニメーションなど）が失われる
- ユーザーにとってタイムラグが感じられやすい
- エラー処理や状態管理が HTML だけでは難しい

### `use:enhance` の導入で得られる利点

| 機能・効果                      | 説明 |
|------------------------------|------|
| ページリロードなし            | 画面のスムーズな更新。状態保持もできる |
| 非同期 fetch に置き換え       | 自動で `FormData` を送信してくれる |
| サーバーの `actions` と連携   | SSR の `+page.server.ts` の `actions` に自動で接続 |
| バリデーション・エラーの扱いが簡単 | `form.error` を使って簡単に UI に反映可能 |


## 補足：SvelteKit の actions を使う場合

```ts
// +page.server.ts
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    // バリデーションや保存処理など
    return { success: true };
  }
}
```

このように actions に定義しておくと、use:enhance 付きのフォームが自動的にこの関数を呼び出します。

- use:enhance は HTML form をベースにしている
- ただし「完全な HTML の submit（ページ遷移あり）」ではない
- フォームを SPA 的に「強化（enhance）」するための SvelteKit の仕組み


### まとめ

- `use:enhance` を使えば、SvelteKit の `actions` と連動しつつも、SPA のようにスムーズなフォーム送信体験を提供できます。
- ページをリロードせずに送信処理を完結させたい場合に非常に効果的です。
