# $derivedと$derived.byの違い

Svelte 5 の 新しいリアクティビティ API（Runes API） において、$derived と $derived.by はどちらも 派生値の定義 に使いますが、用途と挙動に違いがあります。

## 📌 $derived とは
- 単純な依存関係から値を派生させる場合 に使います。
- 1つまたは複数の reactive rune から値を計算する「純粋関数的」な用途 に適しています。
- 依存する値が変わったとき、自動的に再計算されます。

#### 例:

```svelte
<script>
  import { $state, $derived } from 'svelte';

  const count = $state(0);
  const double = $derived(() => count * 2);
</script>

<p>count: {count}</p>
<p>double: {double}</p>
```

## 📌 $derived.by とは
- 副作用的な処理や、非同期処理、unsubscribe が必要な場合 に使います。
- $derived.by(set => { ... }) のように set 関数を使って 値の更新タイミングを細かく制御 できます。
- リソースの管理（例えば subscription の解除処理）も可能 です。

#### 例:

```svelte
<script>
  import { $state, $derived } from 'svelte';

  const count = $state(0);

  const asyncDouble = $derived.by(set => {
    const unsubscribe = count.subscribe(value => {
      // 例えば非同期に2倍した結果をセットする例
      setTimeout(() => set(value * 2), 100);
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<p>async double: {asyncDouble}</p>
```

## 🔔 違いのまとめ

|項目|$derived|$derived.by|
|---|---|---|
主な用途|シンプルな派生値|副作用・非同期・手動制御
API|関数を渡す|set を引数に取る関数を渡す
再計算のタイミング|依存関係が変わるたび自動で|set を明示的に呼び出す必要がある
Unsubscribe 処理|なし|クリーンアップ用に関数を return できる
適したケース|純粋関数的・同期的派生|非同期・イベント購読・サブスクリプションのクリーンアップ


## ✅ ポイント
- 同期的・純粋関数なら $derived がシンプルで適切
- 非同期処理、subscribe ベースの反応などなら $derived.by が必要

