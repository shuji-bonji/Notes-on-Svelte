# $props.id() とは
$props.id() は、Svelte 5（またはSvelteKit）における runes API での「propsの取得」に関係する構文です。Svelte 5では runes を使うことで、より明確で型安全な方法でpropsや状態を扱えるようになっています。

## 🔍 $props.id()とは？

基本構文
```svelte
<script>
  import { $props } from 'svelte';

  let { id } = $props(); // すべてのpropsをオブジェクトとして取得
  // または
  let id = $props.id();  // `id` という特定のpropだけを取得
</script>

<p>ID: {id}</p>
```

## ✅ 概要

構文|説明
---|---
$props()|コンポーネントに渡された全てのpropsを取得する。返り値はオブジェクト。
$props.id()|特定のprop id を取得する。通常はリアクティブで再評価される。


## 📘 使用例

親コンポーネント：

```svelte
<!-- Parent.svelte -->
<script>
  let userId = 'abc123';
</script>

<Child id={userId} />
```

子コンポーネント：

```svelte
<!-- Child.svelte -->
<script>
  import { $props } from 'svelte';

  let id = $props.id();
</script>

<p>ユーザーID: {id}</p>
```

## 📌 注意点
- $props は サーバーコンポーネントや <script context="module"> では使用不可。
- $props.id() のように個別に取得することで、不要な再レンダリングを防ぎつつパフォーマンスを向上できる。
- 型推論が有効に働くため、TypeScriptとの相性が良い。

## 🆚 export let id との違い

比較項目  $props.id()  export let id
再代入  ❌（再代入はできない）  ✅（再代入可能）
取得スタイル  関数呼び出し（id()）  変数として参照（id）
利用時の意図  propsを 読み取り専用 で扱いたい時  propsを 通常の変数 として使いたい時
Rune構文対応  ✅  ❌（従来構文）


## 🧠 補足
- $props.id() は リアクティブ なので、親コンポーネントから id が変化すれば自動的に更新されます。
- $props() を展開するパターンもありますが、不要なpropsまで取得するより個別アクセスが推奨されます。

