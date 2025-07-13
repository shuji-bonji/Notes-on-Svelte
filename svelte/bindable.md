 🔧 $bindable() とは？
 
 はい、Svelte 5 の runes API の一つである $bindable() と $bindable('fallback') は、親コンポーネントからバインディング可能なプロパティを定義するための仕組みです。従来の export let value に bind:value を適用する形と同等のことが、より明示的・安全な方法で表現できます。

## ✅ 目的
- 親コンポーネントから bind:xxx で双方向バインディングできるプロパティを定義する
- Svelte 5 の **runes API（関数ベース）**で定義

## ✳️ 基本構文

```svelte
<script>
  import { $bindable } from 'svelte';

  let count = $bindable(); // 親からbind:countできるようになる
</script>

<p>{count}</p>
```

親コンポーネントで：

```svelte
<Child bind:count={value} />

これは従来の：

<script>
  export let count;
</script>
```

とほぼ同じ機能を runes で表した形です。

## 🔄 $bindable('fallback') とは？

✅ 目的
- 親が bind:xxx を渡してこなかった場合の デフォルト値（フォールバック値） を指定できる

✨ 使用例

```svelte
<script>
  import { $bindable } from 'svelte';

  let name = $bindable('名無しの権兵衛');
</script>

<p>こんにちは、{name}さん！</p>
```

親が bind:name を渡してきたらそれを使うが、そうでなければ '名無しの権兵衛' を使う。


## 📊 まとめ表

機能  $bindable()  $bindable('fallback')
親から bind: 可能か  ✅  ✅
デフォルト値あり  ❌  ✅（引数に指定した値が使われる）
子コンポーネント内で再代入可  ✅  ✅
再代入時に親にも反映  ✅（親が bind: していれば）  ✅（親が bind: していれば）


## 🔁 親子連携の例

親コンポーネント

```svelte
<script>
  let username = 'Alice';
</script>

<Child bind:name={username} />
<p>親の値: {username}</p>
```

子コンポーネント（Child.svelte）

```svelte
<script>
  import { $bindable } from 'svelte';
  let name = $bindable('デフォルト名');
</script>

<input bind:value={name} />
<p>こんにちは、{name}さん</p>
```

親が bind:name を渡してくればそれを使い、渡してこなければ 'デフォルト名' を使う。

## 🧠 補足ポイント
- $bindable() を使うと、Svelte が内部的に「親子間の双方向バインディング」を適切に処理します。
- fallback を与えない場合、undefined になる可能性があるため、nullチェックなど必要なケースがあります。
- $bindable() は 双方向 が必要なときにのみ使い、読み取り専用で良ければ $props() の方が良いです。
