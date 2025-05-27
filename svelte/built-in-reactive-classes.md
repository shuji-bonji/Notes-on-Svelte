# Svelte のビルトインリアクティブクラスまとめ

Svelte 5 では、`Map`、`Set`、`Date`、`URL`、`URLSearchParams` といった **特殊なネイティブクラスがリアクティブに使えるよう拡張** されています。これらは `$state()` でラップすることで、**自動的に Proxy によるリアクティブトラッキング**が行われ、通常の状態変数と同様に UI と同期できます。

このドキュメントでは、Svelte にビルトインされているリアクティブクラスの使い方と注意点を紹介します。

## ✅ 対象となるリアクティブクラス

以下のクラスが Svelte によりリアクティブに拡張されています。

- `Map`
- `Set`
- `Date`
- `URL`
- `URLSearchParams`

これらは `$state()` と組み合わせることで、通常の変数と同様にリアクティブになります。

## 🔁 基本的な使い方

### Map
```svelte
<script>
  let myMap = $state(new Map());
  myMap.set('foo', 'bar');
</script>

<p>{myMap.get('foo')}</p>
```


### Set

```svelte
<script>
  let mySet = $state(new Set(['A']));
  mySet.add('B');
</script>

<p>{Array.from(mySet).join(', ')}</p>
```


### Date

```svelte
<script>
  let now = $state(new Date());
  setInterval(() => now.setTime(Date.now()), 1000);
</script>

<p>{now.toLocaleTimeString()}</p>
```


### URL

```svelte
<script>
  let url = $state(new URL('https://example.com?foo=1'));
  url.searchParams.set('bar', '2');
</script>

<p>{url.href}</p>
```


### URLSearchParams

```svelte
<script>
  let params = $state(new URLSearchParams('a=1&b=2'));
  params.set('c', '3');
</script>

<p>{params.toString()}</p>
```

## 🔍 注意点

|注意点|内容|
|---|---|
|Proxy による拡張|`$state()` により自動的にProxyでラップされます|
|リアクティブ読み出し|`.get()` や `.has()` を UI で使っていないとリアクティブ更新が無視されることがあります|
|`$get()` / `$set()` は不要|通常は `$state()` を使えば明示的に `$get()` などを使う必要はありません|
|`.delete()` なども検知可能|削除系操作も再描画トリガーになります|


## ✅ 結論

Svelte 5 の `$state()` は、通常のプリミティブ値だけでなく Map, Set, Date, URL などの特殊クラスにも対応しています。これらは自動的にリアクティブ化されており、通常の状態変数と同様に扱えるため、非常に強力かつ直感的です。

明示的な Proxy ラップや `$state.raw()` の使用は不要な限り避け、まずは $state() での自動同期を活用するのがベストです。

