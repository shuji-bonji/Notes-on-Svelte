# アクションの`use:`と、DOMイベントに関数を割り当てとの違い

Svelteにおける `use:`（アクション）と、`on:event={functionName}` などで関数を割り当てるイベントハンドラとの主な違いは、引数に DOM 要素（node）を受け取るかどうかと、それに伴う用途や責任の違いにあります。

以下に、違いをわかりやすく比較します。

## 🧩 `use:`（アクション）

#### ✅ 特徴:
- DOM要素（node）が第1引数として渡される
- DOMに対する低レベルな操作や初期化処理に使う
- 必要ならクリーンアップ関数やパラメータの変更時の更新処理を返せる

#### 🔧 例:

```svelte
<script>
  function autofocus(node) {
    node.focus(); // DOM操作
    return {
      destroy() {
        console.log('removed');
      }
    };
  }
</script>

<input use:autofocus>
```

## 🧠 on:event={handler}（イベントハンドラ）

#### ✅ 特徴:
- 関数の引数として渡されるのは、イベントオブジェクト（event）
- DOM操作には向かず、**アプリケーションのロジック処理（状態更新など）**に使う

#### 🔧 例:
```svelte
<script>
  function handleClick(event) {
    console.log('clicked', event.target);
  }
</script>

<button on:click={handleClick}>Click me</button>
```


## 📊 比較表

|項目|use:action|on:event={handler}|
|---|---|---|
|呼び出しタイミング|要素が DOM にマウントされたとき|イベント発生時（クリック等）|
|第1引数|DOMノード（node）|イベントオブジェクト（event）|
|返り値|{ destroy(), update() } を含むオブジェクト（任意）|なし|
|主な用途|DOM 直接操作（フォーカス、Observer、外部ライブラリ）|状態変更やロジック実行|
|使用対象|DOM 要素|DOM 要素のイベント|


## 👀 使い分けのポイント

|目的|選ぶべき手段|
|---|---|
|DOM ノードにアクセスしたい|✅ `use:`|
|ユーザーの入力に応じて処理したい|✅ `on:click={...}` など|


## 🎓補足：on:click={() => handleClick(node)}としたい場合

通常、イベントハンドラにnodeを渡したい場合、アクションを使ってあらかじめDOMノードを渡しておき、内部状態として保持させるなどの工夫が必要です。Svelteのテンプレート上でon:の中でnodeを参照することはできません。

## ご希望があれば、「アクションとイベントを組み合わせるパターン」もご紹介できます！