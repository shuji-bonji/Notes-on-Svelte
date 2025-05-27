# $derived と $effect の違い

Svelte 5 の Rune API では、リアクティブな振る舞いを $state, $effect, $derived などの関数で制御します。その中でも $derived と $effect の違い は混乱しやすいため、ここで明確に整理します。

## $derived: 「値の計算」用

### 📌 目的

依存している状態の変更に応じて **「新しい値を算出」** したい場合に使用します。

### 🧠 特徴
- 戻り値あり（値を返す）
- 副作用を伴わない純粋関数的な計算に最適
- React で言えば useMemo に近い

##### 例
```svelte
<script>
  let numbers = $state([1, 2, 3]);
  let total = $derived(numbers.reduce((a, b) => a + b, 0));
</script>

<p>合計: {total}</p>
```
numbers が変更されるたびに total も再計算される。

## $effect: 「副作用」用

### 📌 目的

依存する状態が変わったときに、**何らかの副作用（DOM操作、ログ出力、fetchなど）** を実行したい場合に使用。

### 🧠 特徴
- 戻り値なし
- 副作用のための関数
- React で言えば useEffect に相当

例

```svelte
<script>
  let name = $state('太郎');
  $effect(() => {
    console.log(`名前が変わりました: ${name}`);
  });
</script>
```
name が変わるたびに console.log() が呼ばれる。

## 🔁 比較表

|項目|$derived|$effect|
|---|---|---|
|用途|値の計算|副作用の実行|
|戻り値|あり|なし|
|副作用|なし（純粋関数推奨）|あり（ログ、DOM操作、非同期処理など）|
|React類似|useMemo|useEffect|
|再実行条件|依存ステートの変更|依存ステートの変更|


## 💡 まとめ
- 値の変化を 「再利用・バインディング」 したいなら $derived
- 状態の変化を 「検知して何か処理」 したいなら $effect

この違いを意識するだけで、Svelteのリアクティビティが より直感的かつ安全に扱える ようになります。