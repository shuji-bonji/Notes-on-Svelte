# Svelte チートシート（Basic） - TypeScript版

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
<script lang="ts">
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
<script lang="ts">
  // Svelte 5のRunes
  let count = $state<number>(0);

  function increment() {
    count++; // 自動的にUI更新
  }
</script>

<button onclick={increment}>
  クリック数: {count}
</button>
```

### ディープリアクティビティ

```svelte
<script lang="ts">
  let numbers = $state<number[]>([1, 2, 3]);

  function addNumber() {
    numbers.push(numbers.length + 1); // 配列の変更でUIも更新(「Svelte 5 では push/pop などのミューテーションも追跡される」)
  }

  interface User {
    name: string;
    age: number;
  }

  // type User = {
  //   name: string;
  //   age: number;
  // };

  let user = $state<User>({
    name: '鈴木',
    age: 25
  });

  function birthday() {
    user.age++; // オブジェクトプロパティの変更でUIも更新
  }
</script>

```

### `$derived`: 派生状態を作成

基本的にTypeScriptでは、宣言時の変数に型で適用されるので、あえて `$state<number>(0)`や、`$derived<"多い" | "少ない">(expression: "多い" | "少ない"): "多い" | "少ない"`などする必要はない。

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  // より複雑な派生状態
  let status = $derived(count > 10 ? '多い' : '少ない');
</script>

<p>カウント: {count}</p>
<p>2倍: {doubled}</p>
<p>状態: {status}</p>
```

### `$effect`: 状態変更時に副作用を実行

```svelte
<script lang="ts">
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
<script lang="ts">
  import Child from '$lib/components/Child.svelte';
</script>

<Child name="太郎" age={30} />
```
```svelte
<!-- Child.svelte -->
<script lang="ts">
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
<script lang="ts">
  const { name = 'ゲスト', age = 20 } = $props();
</script>

<p>{name}さん、{age}歳</p>
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
<script lang="ts">
  let items = $state(['りんご', 'バナナ', 'オレンジ']); // 例では`$state`を利用しているが特に通常の配列でも同様
  let users = $state([
    {
      id: 1,
      name: 'pika',
      age: 4
    },
    {
      id: 2,
      name: 'poke',
      age: 6
    }
  ]);
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
<script lang="ts">
  // 仮のデータ取得関数を定義
  async function fetchData(): Promise<string> {
    // 例として1秒後にデータを返す
    return new Promise((resolve) => {
      setTimeout(() => resolve('サンプルデータ'), 1000);
    });
  }

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
<script lang="ts">
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
<script lang="ts">
  // Svelte 5：コールバック関数としてのイベント
  const { onMessage } = $props();
</script>

<button onclick={() => onMessage('こんにちは')}> メッセージ送信 </button>
```

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import Child from '$lib/components/Child.svelte';

  function handleMessage(msg: string) {
    alert(msg);
  }
</script>

<Child onMessage={handleMessage} />
```

## 7. バインディング

### テキスト入力

```svelte
<script lang="ts">
  let name = $state('');
</script>

<input type="text" bind:value={name} />
<p>こんにちは、{name}さん</p>
```

### チェックボックス

```svelte
<script lang="ts">
  let checked = $state(false);
</script>

<input type="checkbox" bind:checked />
<p>現在の状態: {checked ? 'オン' : 'オフ'}</p>
```

### セレクトボックス

```svelte
<script lang="ts">
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
<script lang="ts">
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
<script lang="ts">
  let active = $state(true);
  let color = $state('red');
</script>

<!-- 条件付きクラス -->
<div class:active>アクティブ要素</div>
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
<script lang="ts">
  let color = $state('red');
  let fontSize = $state(16);
</script>

<p style:color style:font-size="{fontSize}px">スタイル適用テキスト</p>
<!-- 実際の出力: <p style="color: red; font-size: 16px;">スタイル適用テキスト</p> -->
```

## 9. アクション
useアクションは、要素がDOMにマウント（追加）されたときに実行されます。

```svelte
<script lang="ts">
  // 入力欄が表示されたら自動的にフォーカスする
  function autofocus(node: HTMLInputElement) {
    // マウント時に即座にフォーカス
    node.focus();
    
    return {
      destroy() {
        // 特に処理なし
      }
    };
  }
  
  let showInput = $state(false);
</script>

<button onclick={() => showInput = !showInput}>
  入力欄を表示
</button>

{#if showInput}
  <input 
    use:autofocus
    type="text" 
    placeholder="自動的にフォーカスされます"
  />
{/if}
```

```svelte
<script lang="ts">
  interface ActionOptions {
    duration: number;
    callback?: () => void;
  }
  
  function complexAction(node: HTMLElement, options: ActionOptions) {
    console.log('1. マウント時 - アクション開始');
    
    // 初期設定
    const originalText = node.textContent;
    node.style.transition = `opacity ${options.duration}ms`;
    
    // イベントリスナーの設定
    const handleClick = () => {
      console.log('要素がクリックされました');
      options.callback?.();
    };
    
    node.addEventListener('click', handleClick);
    
    return {
      // パラメータが更新されたとき
      update(newOptions: ActionOptions) {
        console.log('2. 更新時 - パラメータが変更されました');
        node.style.transition = `opacity ${newOptions.duration}ms`;
      },
      
      // 要素がDOMから削除されるとき
      destroy() {
        console.log('3. アンマウント時 - クリーンアップ');
        node.removeEventListener('click', handleClick);
        node.textContent = originalText;
      }
    };
  }
  
  let duration = $state(300);
</script>

<div use:complexAction={{ duration, callback: () => console.log('コールバック実行') }}>
  クリックしてみてください
</div>

<input type="range" bind:value={duration} min="100" max="1000" />
```

## 10. トランジション

```svelte
<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  let visible = $state(true);
</script>

<button onclick={() => (visible = !visible)}> 切り替え </button>

{#if visible}
  <p transition:fade>フェードイン/アウト</p>

  <div transition:fly={{ y: 200, duration: 2000 }}>フライイン/アウト</div>

  <p in:slide out:fade>スライドイン、フェードアウト</p>
{/if}

```

### `{#key}` ブロックとトランジション

`{#key}` ブロックは、キーが変化したときに要素を再生成し、トランジションを発火させるために使う。

通常の `{#if}` では要素の再利用によりトランジションが発火しない場合がありますが、`{#key}` を使うことで要素を再生成し、確実にトランジションを適用できます。

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';
  let visible = true;
</script>

<button on:click={() => (visible = !visible)}> 切り替え </button>

{#key visible}
  <p transition:fade>
    {visible ? '表示中' : '非表示中'}
  </p>
{/key}
<!-- `visible` が変わるたびに <p> 要素を再生成し、fade トランジションを適用 -->
```