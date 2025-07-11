# Svelte チートシート（Advanced ）

## 1. 高度なリアクティビティ

### 生のステート (Raw State)

通常の `$state()` は、内部で Proxy によりリアクティブな変数を生成しますが、`$state.raw()` はそのプロキシ化を行わず、生のオブジェクトや値を直接扱うための低レベルな方法です。

これは、手動で `$get()` / `$set()` による制御を行いたい場合や、`Map` や `Set` などのネイティブオブジェクトの正確な操作が必要な場合に有効です。

例えるなら、`$state()` は「スマート家電のリモコン操作」、`$state.raw()` は「内部の配線に直接触る感覚」です。

### 🔍 いつ使うの？

- 自前で `$get()` / `$set()` による更新ロジックを書きたいとき
- `Map`, `Set`, `Date`, `File` など Proxy 化が難しい型を扱うとき
- 高度なライブラリ連携で内部状態を明示的に制御したいとき

```svelte
<script>
  // 値を生のまま操作する
  let count = $state.raw(0);
  
  function increment() {
    $set(count, $get(count) + 1);
  }
</script>
```

### リアクティブクラス

```svelte
<script>
  class Box {
    width = $state(0);
    height = $state(0);
    area = $derived(this.width * this.height);
    
    embiggen() {
      this.width *= 2;
      this.height *= 2;
    }
  }
  
  let box = new Box();
</script>

<div>
  <input type="range" bind:value={box.width} min="0" max="100" />
  <input type="range" bind:value={box.height} min="0" max="100" />
  <p>面積: {box.area}</p>
  <button onclick={() => box.embiggen()}>拡大</button>
</div>
```

### ゲッターとセッター

```svelte
<script>
  let _value = $state(0);
  
  // getterを$derivedで実装
  let value = $derived({
    get: () => _value,
    set: (v) => { _value = v; }
  });
</script>
```

### リアクティブなビルトイン

```svelte
<script>
  const map = $state(new Map());
  const set = $state(new Set());
  
  // Mapへの追加はリアクティビティをトリガーする
  function addItem() {
    map.set('key' + map.size, 'value');
  }
  
  // Setへの追加もリアクティビティをトリガーする
  function addToSet() {
    set.add(set.size);
  }
</script>
```

### ストア

```svelte
<script>
  import { writable, readable, derived } from 'svelte/store';
  
  // 書き込み可能なストア
  const count = writable(0);
  
  // 読み取り専用ストア
  const time = readable(new Date(), (set) => {
    const interval = setInterval(() => {
      set(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  });
  
  // 派生ストア
  const elapsed = derived(time, $time => {
    return Math.round(($time - start) / 1000);
  });
  
  let start = new Date();
  
  function increment() {
    count.update(n => n + 1);
  }
</script>

<button onclick={increment}>
  カウント: {$count}
</button>

<p>現在時刻: {$time.toLocaleTimeString()}</p>
<p>経過時間: {$elapsed}秒</p>
```

## 2. コンテンツの再利用

### スニペットとレンダータグ

```svelte
<script>
  const name = $state('ゲスト');
  
  // スニペットの定義
  const greeting = @render() => {
    return <p>こんにちは、{name}さん！</p>;
  };
</script>

<!-- スニペットの使用 -->
{@render greeting()}

<!-- インラインレンダータグ -->
{@render
  <div class="alert">
    <p>重要なお知らせ</p>
  </div>
}
```

### コンポーネントへのスニペット渡し

```svelte
<!-- Parent.svelte -->
<script>
  import Box from './Box.svelte';
</script>

<Box>
  {@render header()}
  <p>本文コンテンツ</p>
  {@render footer()}
</Box>

<!-- Box.svelte -->
<script>
  const { header = () => <h2>デフォルトヘッダー</h2>, footer, children } = $props();
</script>

<div class="box">
  <div class="header">
    {@render header()}
  </div>
  
  <div class="content">
    {@render children()}
  </div>
  
  {#if footer}
    <div class="footer">
      {@render footer()}
    </div>
  {/if}
</div>
```

## 3. モーション

### Tweened値

```svelte
<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  
  const progress = tweened(0, {
    duration: 400,
    easing: cubicOut
  });
</script>

<button 
  onclick={() => progress.set(1)}
>
  進行
</button>

<progress value={$progress}></progress>
```

### Springs

```svelte
<script>
  import { spring } from 'svelte/motion';
  
  const coords = spring({ x: 0, y: 0 }, {
    stiffness: 0.1,
    damping: 0.25
  });
  
  function handleMousemove(event) {
    coords.set({ x: event.clientX, y: event.clientY });
  }
</script>

<div onmousemove={handleMousemove}>
  <div 
    style="position: absolute; left: {$coords.x}px; top: {$coords.y}px;"
  >
    ●
  </div>
</div>
```

## 4. 高度なバインディング

### コンテンツ編集可能なバインディング

```svelte
<script>
  let html = $state('<p>編集可能なHTML</p>');
</script>

<div contenteditable bind:innerHTML={html}></div>
<pre>{html}</pre>
```

### eachブロックのバインディング

```svelte
<script>
  let todos = $state([
    { done: false, text: 'Todo 1' },
    { done: false, text: 'Todo 2' },
    { done: false, text: 'Todo 3' }
  ]);
</script>

{#each todos as todo}
  <label>
    <input type="checkbox" bind:checked={todo.done} />
    <input bind:value={todo.text} />
  </label>
{/each}
```

### メディア要素のバインディング

```svelte
<script>
  let video;
  let time = 0;
  let duration = 0;
  let paused = true;
  let volume = 1;
</script>

<video
  bind:this={video}
  bind:currentTime={time}
  bind:duration
  bind:paused
  bind:volume
  src="video.mp4"
></video>

<div>
  <button onclick={() => paused = !paused}>
    {paused ? '再生' : '一時停止'}
  </button>
  <input type="range" bind:value={time} max={duration} step="0.01" />
  <input type="range" bind:value={volume} min="0" max="1" step="0.01" />
</div>
```

### コンポーネントインスタンスへのバインディング

```svelte
<script>
  import InputField from './InputField.svelte';
  
  let field;
  
  function focusField() {
    field.focus();
  }
</script>

<InputField bind:this={field} />
<button onclick={focusField}>フォーカス</button>

<!-- InputField.svelte -->
<script>
  export function focus() {
    input.focus();
  }
  
  let input;
</script>

<input bind:this={input} />
```

## 5. 高度なトランジション

### 遅延トランジション

```svelte
<script>
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  let visible = $state([true, true, true]);
  let selected = $state(0);
</script>

{#each [0, 1, 2] as i}
  {#if visible[i]}
    <div
      transition:slide={{
        delay: selected === i ? 0 : 150,
        duration: 300,
        easing: quintOut
      }}
    >
      コンテンツ {i + 1}
    </div>
  {/if}
{/each}

<div>
  {#each [0, 1, 2] as i}
    <button
      onclick={() => {
        selected = i;
        visible[i] = false;
        setTimeout(() => (visible[i] = true), 10);
      }}
    >
      リセット {i + 1}
    </button>
  {/each}
</div>
```

### アニメーション

```svelte
<script>
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  
  let list = $state([1, 2, 3, 4, 5]);
  
  function shuffle() {
    list = list.sort(() => Math.random() - 0.5);
  }
</script>

<button onclick={shuffle}>シャッフル</button>

<div>
  {#each list as item (item)}
    <div animate:flip={{ duration: 300, easing: quintOut }}>
      {item}
    </div>
  {/each}
</div>
```

## 6. コンテキストAPI

```svelte
<!-- App.svelte -->
<script>
  import { setContext } from 'svelte';
  import Child from './Child.svelte';
  
  const theme = $state('light');
  
  // コンテキストの設定
  setContext('theme', {
    getTheme: () => theme,
    toggleTheme: () => {
      theme = theme === 'light' ? 'dark' : 'light';
    }
  });
</script>

<Child />

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';
  import GrandChild from './GrandChild.svelte';
  
  // コンテキストの取得
  const { getTheme, toggleTheme } = getContext('theme');
</script>

<div class={getTheme()}>
  <p>現在のテーマ: {getTheme()}</p>
  <button onclick={toggleTheme}>テーマ切り替え</button>
  
  <GrandChild />
</div>

<!-- GrandChild.svelte -->
<script>
  import { getContext } from 'svelte';
  
  // 親と同じコンテキストにアクセス可能
  const { getTheme } = getContext('theme');
</script>

<p>孫コンポーネントのテーマ: {getTheme()}</p>
```

## 7. 特殊要素

### svelte:window

```svelte
<script>
  let scrollY = $state(0);
  let innerWidth = $state(0);
  let online = $state(navigator.onLine);
</script>

<svelte:window
  bind:scrollY
  bind:innerWidth
  online={online}
  onoffline={() => (online = false)}
/>

<p>スクロール位置: {scrollY}px</p>
<p>ウィンドウ幅: {innerWidth}px</p>
<p>オンライン状態: {online ? 'オンライン' : 'オフライン'}</p>
```

### svelte:document

```svelte
<script>
  let fullscreen = $state(false);
  
  function handleFullscreenChange() {
    fullscreen = !!document.fullscreenElement;
  }
</script>

<svelte:document
  onfullscreenchange={handleFullscreenChange}
/>

<button
  onclick={() => document.documentElement.requestFullscreen()}
>
  フルスクリーン
</button>

{#if fullscreen}
  <p>フルスクリーンモード</p>
{/if}
```

### svelte:head

```svelte
<script>
  export let title = $props('タイトル');
  export let description = $props('説明');
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>
```

### svelte:element

```svelte
<script>
  let tagName = $state('div');
  
  const options = ['div', 'h1', 'h2', 'p', 'span', 'button'];
</script>

<select bind:value={tagName}>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>

<svelte:element this={tagName}>
  これは {tagName} 要素です
</svelte:element>
```

### svelte:boundary

```svelte
<script>
  let showError = $state(false);
</script>

<button onclick={() => showError = true}>
  エラー発生
</button>

<svelte:boundary fallback={(error) => `エラー: ${error.message}`}>
  {#if showError}
    {nonExistentVariable}
  {/if}
</svelte:boundary>
```

## 8. スクリプトモジュール

```svelte
<script context="module">
  // コンポーネントインスタンス間で共有される

  // モジュールレベルの変数
  const sharedData = [];
  
  // ヘルパー関数
  export function addSharedData(item) {
    sharedData.push(item);
    return sharedData;
  }
  
  // モジュールコンテキストのみでアクセス可能な変数
  let privateCounter = 0;
</script>

<script>
  // コンポーネントの通常のスクリプト
  // モジュールスクリプトで定義された変数にアクセス可能
  let localData = $state([...sharedData]);
  
  function addLocalItem(item) {
    localData.push(item);
    addSharedData(item);
    privateCounter++;
  }
</script>

<button onclick={() => addLocalItem('新しいアイテム')}>
  アイテム追加
</button>

<p>ローカルデータ: {localData.join(', ')}</p>
<p>共有データ: {sharedData.join(', ')}</p>
```
