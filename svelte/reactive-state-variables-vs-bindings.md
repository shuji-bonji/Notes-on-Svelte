# `$state`: リアクティブな状態変数と、バインディングの違い

Svelte 5の`$state`は、新しいリアクティビティモデル（いわゆる「`Runes`」）の一部であり、従来のSvelte 3/4における`bind:`構文や`$:`によるリアクティブステート管理とは異なる新しいスタイルです。

ここでは、Svelte 5の`$state`と、従来からあるバインディングとの違いを明確に比較して説明します。

## 🔁 $state（Svelte 5の新リアクティブ変数）

#### 概要:

- $stateは、リアクティブな状態（状態の変更を自動で追跡）を定義する方法。
- Svelte 5では、runesという新しい仕組みで、より明示的なリアクティビティ制御が可能。
- state()関数を使って定義し、$stateVarのようにプレフィックス付きでアクセス・更新。

#### 例:
```svelte
<script>
  import { state } from 'svelte';

  const count = state(0);
</script>

<button on:click={() => $count++}>
  Clicked {$count} times
</button>
```

#### 特徴:
- state()で定義された変数は、プリミティブな値やオブジェクトでもリアクティブに追跡される。
- $countのように$を付けることでリアクティブに読み取り・書き込みができる。
- 書き込み時も自動的に再描画が起きる。

## 🔗 bind:（双方向バインディング）

#### 概要:
- DOM要素の属性（例: value, checked, selected）と変数を同期させる。
- ユーザーの入力に応じて変数が自動的に更新される。

#### 例:

```svelte
<script>
  let name = '';
</script>

<input bind:value={name} />
<p>Hello {name}!</p>
```

#### 特徴:
- DOMとの 双方向バインディング を行う。
- ユーザー入力と内部状態を同期させたい場合に便利。
- コンポーネント間のbind:propによるバインディングも可能。

## ✅ 違いのまとめ

|項目|`$state`(Svelte 5)|`bind:` (従来機能)|
|---|---|---|
|主な用途|状態管理（内部）|DOMや子コンポーネントとの同期|
|宣言方法|state()関数|bind:xxx={var}|
|リアクティブ性|varでアクセス・更新|DOMイベントで自動更新|
|状態更新時|自動再描画|自動再描画|
|Svelteバージョン|5以降（Runes）|3以降（継続使用可）|


## 👀 注意点

- `bind:`は引き続き使えるので、Svelte 5でも`<input bind:value={$stateVar}>`のような使い方も可能です。
- `$state()`で定義した変数をDOMにバインドする際には、$を忘れずに。

