# {@attach} の使い方と用途

## 概要

`{@attach}` は Svelte 5 に導入された新しい構文で、DOM要素を JavaScript の変数にバインド（アタッチ）するためのものです。`bind:this={...}` に似ていますが、より宣言的で柔軟な記述が可能です。

## 基本構文

```svelte
<script>
  let button;
</script>

<button {@attach button}>
  Click me
</button>
```

これは以下とほぼ同等です：

```svelte
<button bind:this={button}>Click me</button>
```

## 利用用途

- **DOM要素の参照を変数に代入したい場合**
- **フォーカスやスクロール、要素サイズ取得などの Imperative DOM 操作を行いたい場合**
- **スロットや `<svelte:fragment>` の中でも利用したい場合**
- **より宣言的にテンプレートを記述したい場合**

## 例：フォーカス制御

```svelte
<script>
  let input;
  function focusInput() {
    input.focus();
  }
</script>

<input {@attach input} />
<button onclick={focusInput}>Focus Input</button>
```

## bind:this との違いと比較

| 項目           | `bind:this`                       | `{@attach}`                          |
|----------------|----------------------------------|--------------------------------------|
| 書き方         | 属性として記述                   | ディレクティブ構文                  |
| スコープの柔軟性 | 通常のローカル変数のみ           | `let` 宣言された変数なら何でも可     |
| 利用できる場所 | 一部制限あり（slot など不可）   | slot 内部や fragment でも使用可能   |
| スタイル       | Imperative 寄り                  | 宣言的                               |

## 補足

`{@attach}` はテンプレートとロジックをきれいに分離したい場合や、コンポーネント設計をより柔軟に行いたい場合に特に有用です。