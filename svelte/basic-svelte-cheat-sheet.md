# Svelte チートシート（Basic）

## 1. プロジェクト作成

```bash
# SvelteKitを使用したプロジェクト作成（推奨）
npx sv create myapp
cd myapp
npm install
npm run dev

# Viteを使用したスタンドアロンSvelteプロジェクト
npm create vite@latest my-app -- --template svelte
```

## 2. コンポーネント基本

Svelteファイル（.svelte）は以下の3つのセクションで構成されます。

```svelte
<script>
  // JavaScriptロジック
</script>

<style>
  /* コンポーネントスコープのCSS */
</style>

<!-- HTMLマークアップ -->
<div>コンテンツ</div>
```

## 3. リアクティビティ

### `$state`: リアクティブな状態変数を宣言

```svelte
<script>
  // Svelte 5のRunes
  let count = $state(0);
  
  function increment() {
    count++;  // 自動的にUI更新
  }
</script>

<button onclick={increment}>
  クリック数: {count}
</button>
```

### ディープリアクティビティ

```svelte
<script>
  let numbers = $state([1, 2, 3]);
  
  function addNumber() {
    numbers.push(numbers.length + 1);  // 配列の変更でUIも更新(「Svelte 5 では push/pop などのミューテーションも追跡される」)
  }
  
  let user = $state({
    name: "鈴木",
    age: 25
  });
  
  function birthday() {
    user.age++;  // オブジェクトプロパティの変更でUIも更新
  }
</script>
```

### `$derived`: 派生状態を作成

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  // より複雑な派生状態
  let status = $derived(
    count > 10 ? "多い" : "少ない"
  );
</script>

<p>カウント: {count}</p>
<p>2倍: {doubled}</p>
<p>状態: {status}</p>
```

### `$effect`: 状態変更時に副作用を実行

```svelte
<script>
  let count = $state(0);
  
  $effect(() => {
    console.log(`カウントが変更されました: ${count}`);
    // 副作用を実行（DOMの操作、APIコール等）
    
    // クリーンアップ関数を返すことができる
    return () => {
      console.log('クリーンアップ実行');
    };
  });
</script>
```

## 4. プロパティ

```svelte
<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
</script>

<Child name="太郎" age={30} />

<!-- Child.svelte -->
<script>
  // プロパティの宣言
  export let name;
  // デフォルト値あり
  export let age = 20;
</script>

<p>{name}さん、{age}歳</p>
```

### Svelte 5のプロパティ（$props）
`$props()` は Svelte 5 の新しいプロパティ取得関数

```svelte
<!-- Child.svelte -->
<script>
  const { name = "ゲスト", age = 20 } = $props();
</script>
```

## 5. 制御構文

### 条件分岐

```svelte
{#if condition}
  <p>条件が真の場合</p>
{:else if otherCondition}
  <p>別の条件が真の場合</p>
{:else}
  <p>条件が偽の場合</p>
{/if}
```

### 繰り返し処理

```svelte
<script>
  let items = $state(['りんご', 'バナナ', 'オレンジ']);
</script>

<ul>
  {#each items as item, index (item)}
    <li>{index + 1}: {item}</li>
  {/each}
</ul>

<!-- オブジェクト配列 -->
<ul>
  {#each users as user (user.id)}
    <li>{user.name}</li>
  {/each}
</ul>
```

### 非同期データ処理

```svelte
<script>
  let dataPromise = fetchData(); // Promise返却関数
</script>

{#await dataPromise}
  <p>ロード中...</p>
{:then data}
  <p>データ: {data}</p>
{:catch error}
  <p>エラー: {error.message}</p>
{/await}

<!-- 短縮形 -->
{#await dataPromise then data}
  <p>データ: {data}</p>
{/await}
```

## 6. イベント処理

### DOMイベント

```svelte
<script>
  let count = $state(0);
  
  function handleClick() {
    count++;
  }

  // DOMイベントと同じHTML属性名で、関数を定義する
  const onclick = () => count++;

</script>

<!-- Svelte 5: イベントハンドラーはプロパティ -->
<button onclick={handleClick}>
  クリック数: {count}
</button>

<!-- 短縮構文 -->
<button {onclick}>
  クリック数: {count}
</button>

<!-- インラインハンドラー -->
<button onclick={() => count++}>
  クリック数: {count}
</button>
```

### コンポーネントイベント

```svelte
<!-- Child.svelte -->
<script>
  // Svelte 5：コールバック関数としてのイベント
  const { onMessage } = $props();
</script>

<button onclick={() => onMessage('こんにちは')}>
  メッセージ送信
</button>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  
  function handleMessage(msg) {
    alert(msg);
  }
</script>

<Child onMessage={handleMessage} />
```

## 7. バインディング

### テキスト入力

```svelte
<script>
  let name = $state('');
</script>

<input type="text" bind:value={name} />
<p>こんにちは、{name}さん</p>
```

### チェックボックス

```svelte
<script>
  let checked = $state(false);
</script>

<input type="checkbox" bind:checked={checked} />
<p>現在の状態: {checked ? 'オン' : 'オフ'}</p>
```

### セレクトボックス

```svelte
<script>
  let selected = $state('apple');
  let options = ['apple', 'banana', 'orange'];
</script>

<select bind:value={selected}>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>
<p>選択された値: {selected}</p>
```

### グループ入力

```svelte
<script>
  let favoriteFruits = $state([]);
  let fruits = ['りんご', 'バナナ', 'オレンジ'];
</script>

{#each fruits as fruit}
  <label>
    <input type="checkbox" bind:group={favoriteFruits} value={fruit} />
    {fruit}
  </label>
{/each}

<p>お気に入りフルーツ: {favoriteFruits.join(', ')}</p>
```

## 8. スタイリング

### クラス指定

```svelte
<script>
  let active = $state(true);
  let color = $state('red');
</script>

<!-- 条件付きクラス -->
<div class:active={active}>アクティブ要素</div>
<!-- 実際の出力: <div class="active">アクティブ要素</div> -->

<!-- 複数のクラス -->
<div class:active class:red={color === 'red'}>複数クラス</div>
<!-- 実際の出力: <div class="active red">複数クラス</div> -->

<!-- クラス名と変数名が同じ場合 -->
<div class:active>短縮記法</div>
<!-- 実際の出力: <div class="active">短縮記法</div> -->

```

### スタイルディレクティブ

```svelte
<script>
  let color = $state('red');
  let fontSize = $state(16);
</script>

<p style:color style:font-size="{fontSize}px">
  スタイル適用テキスト
</p>
<!-- 実際の出力: <p style="color: red; font-size: 16px;">スタイル適用テキスト</p> -->

```

## 9. アクション

```svelte
<script>
  // クリック時に要素内のテキストを選択するアクション
  function selectOnUse(node) {
    const handleClick = () => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    };
    
    node.addEventListener('click', handleClick);
    
    return {
      destroy() {
        node.removeEventListener('click', handleClick);
      }
    };
  }
</script>

<p use:selectOnUse>クリックして選択</p>
```

```svelte
<script>
  import tippy from 'tippy.js';

  let content = $state('Hello!');

  function tooltip(node, fn) {
    $effect(() => {
      const tooltip = tippy(node, fn());

      return tooltip.destroy;
    });
  }
</script>

<input bind:value={content} />

<button use:tooltip={() => ({ content })}>
  Hover me
</button>
```

## 10. トランジション

```svelte
<script>
  import { fade, fly, slide } from 'svelte/transition';
  let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>
  切り替え
</button>

{#if visible}
  <p transition:fade>フェードイン/アウト</p>
  
  <div transition:fly={{ y: 200, duration: 2000 }}>
    フライイン/アウト
  </div>
  
  <p in:slide out:fade>
    スライドイン、フェードアウト
  </p>
{/if}
```

### `{#key}` ブロックとトランジション

`{#key}` ブロックは、キーが変化したときに要素を再生成し、トランジションを発火させるために使う。

通常の `{#if}` では要素の再利用によりトランジションが発火しない場合がありますが、`{#key}` を使うことで要素を再生成し、確実にトランジションを適用できます。

```svelte
<script>
  import { fade } from 'svelte/transition';
  let visible = true;
</script>

<button on:click={() => visible = !visible}>
  切り替え
</button>

{#key visible}
  <p transition:fade>
    {visible ? '表示中' : '非表示中'}
  </p>
{/key}
<!-- `visible` が変わるたびに <p> 要素を再生成し、fade トランジションを適用 -->
```