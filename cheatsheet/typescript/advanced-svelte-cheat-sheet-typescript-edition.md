# Svelte チートシート（Advanced） - TypeScript版

## 1. 高度なリアクティビティ

### リアクティブクラス

```svelte
<script lang="ts">
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
<script lang="ts">
  let _value = $state(0);

  // getterを$derivedで実装
  let value = $derived({
    get: () => _value,
    set: (v: number) => {
      _value = v;
    }
  });
</script>
```

### リアクティブなビルトイン

```svelte
<script lang="ts">
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
<script lang="ts">
  import { derived, readable, writable } from 'svelte/store';

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
  const elapsed = derived(time, ($time) => {
    return Math.round(($time.getTime() - start.getTime()) / 1000);
  });

  let start = new Date();

  function increment() {
    count.update((n) => n + 1);
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
<script lang="ts">
  let name = $state('ゲスト');
</script>

<!-- スニペットの定義は {#snippet} を使う -->
{#snippet greeting()}
  <p>こんにちは、{name}さん！</p>
{/snippet}

<!-- スニペットの呼び出しは {@render} を使う -->
{@render greeting()}
```

### コンポーネントへのスニペット渡し

```svelte
<!-- Box.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
  }
  
  let { header, footer, children }: Props = $props();
</script>

<div class="box">
  <div class="header">
    {#if header}
      {@render header()}
    {:else}
      <h2>デフォルトヘッダー</h2>
    {/if}
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

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import Box from '$lib/components/Child.svelte';
</script>

<!-- スニペットを定義 -->
{#snippet header()}
  <h2>カスタムヘッダー</h2>
{/snippet}

{#snippet footer()}
  <p>フッター情報</p>
{/snippet}

<!-- コンポーネントにスニペットを渡す -->
<Box {header} {footer}>
  <p>本文コンテンツ</p>
</Box>

```

## 3. モーション

### Tweened値

```svelte
<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  const progress = tweened(0, {
    duration: 400,
    easing: cubicOut
  });
</script>

<button onclick={() => progress.set(1)}> 進行 </button>

<progress value={$progress}></progress>

```

### Springs

```svelte
<script lang="ts">
  import { spring } from 'svelte/motion';

  const coords = spring(
    { x: 0, y: 0 },
    {
      stiffness: 0.1,
      damping: 0.25
    }
  );

  function handleMousemove(event: MouseEvent) {
    coords.set({ x: event.clientX, y: event.clientY });
  }
</script>

<div onmousemove={handleMousemove}>
  <div style="position: absolute; left: {$coords.x}px; top: {$coords.y}px;">●</div>
</div>
```

## 4. 高度なバインディング

### コンテンツ編集可能なバインディング

```svelte
<script lang="ts">
  let html = $state('<p>編集可能なHTML</p>');
</script>

<div contenteditable bind:innerHTML={html}></div>
<pre>{html}</pre>
```

### eachブロックのバインディング

```svelte
<script lang="ts">
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
<script lang="ts">
  let video;
  let time = 0;
  let duration = 0;
  let paused = true;
  let volume = 1;
  let kind = 'caption';
</script>

<video
  bind:this={video}
  bind:currentTime={time}
  bind:duration
  bind:paused
  bind:volume
  src="video.mp4"
>
  <track kind="captions" src="captions.vtt" srclang="ja" label="日本語のキャプション" default />
</video>

<div>
  <button onclick={() => (paused = !paused)}>
    {paused ? '再生' : '一時停止'}
  </button>
  <input type="range" bind:value={time} max={duration} step="0.01" />
  <input type="range" bind:value={volume} min="0" max="1" step="0.01" />
</div>

```

### コンポーネントインスタンスへのバインディング

```svelte
<script lang="ts">
  import InputField from '$lib/components/InputField.svelte';

  let field: InputField;

  function focusField() {
    field.focus();
  }
</script>

<InputField bind:this={field} />
<button onclick={focusField}>フォーカス</button>
```

```svelte
<!-- InputField.svelte -->
<script lang="ts">
  export function focus() {
    input.focus();
  }

  let input: HTMLInputElement;
</script>

<input bind:this={input} />

```

## 5. 高度なトランジション

### 遅延トランジション

```svelte
<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';

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
<script lang="ts">
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
<script lang="ts">
	import Child from '$lib/components/Child.svelte';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const theme = writable<'light' | 'dark'>('light');

	setContext('theme', theme);
</script>

<Child />
```

```svelte
<!-- Child.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import GrandChild from './GrandChild.svelte';

	const theme = getContext<Writable<'light' | 'dark'>>('theme');
</script>

<div class={$theme}>
	<p>現在のテーマ: {$theme}</p>
	<button onclick={() => theme.update((t) => (t === 'light' ? 'dark' : 'light'))}>
		テーマ切り替え
	</button>

	<GrandChild />
</div>

```

```svelte
<!-- GrandChild.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  const theme = getContext<Writable<'light' | 'dark'>>('theme');
</script>

<p>孫コンポーネントのテーマ: {$theme}</p>
```

## 7. 特殊要素

### svelte:window

```svelte
<script lang="ts">
	let scrollY = $state(0);
	let innerWidth = $state(0);
	let online = $state(navigator.onLine);
</script>

<svelte:window
	bind:scrollY
	bind:innerWidth
	ononline={() => (online = true)}
	onoffline={() => (online = false)}
/>

<p>スクロール位置: {scrollY}px</p>
<p>ウィンドウ幅: {innerWidth}px</p>
<p>オンライン状態: {online ? 'オンライン' : 'オフライン'}</p>
```

### svelte:document

```svelte
<script lang="ts">
	let fullscreen = $state(false);

	function handleFullscreenChange() {
		fullscreen = !!document.fullscreenElement;
	}
</script>

<svelte:document onfullscreenchange={handleFullscreenChange} />

<button onclick={() => document.documentElement.requestFullscreen()}> フルスクリーン </button>

{#if fullscreen}
	<p>フルスクリーンモード</p>
{/if}
```

### svelte:head

```svelte
<script lang="ts">
	const { title, description } = $props();
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
<script lang="ts">
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
<script lang="ts">
	function explode() {
		throw new Error('💣️');
	}
	let count = $state(0);
</script>

<svelte:boundary>
	{count > 4 ? explode() : null}
	<button onclick={() => count++}>
		{count}
	</button>
	{#snippet failed(error: unknown, reset: () => void)}
		<p>Error: {error instanceof Error ? error.message : String(error)}</p>
		<button onclick={reset}>Reset</button>
	{/snippet}
</svelte:boundary>

```



## 生のステート (Raw State)
現在のSvelte 5では：
- **99%のケースで通常の`$state()`で十分**
- Map、Set、Dateなども`$state()`で自動的にリアクティブになる
- `$state.raw()`は非常に特殊な場合のみ検討

### なぜ`$state.raw()`が存在するのか？

プロジェクトナレッジによると、元々は以下のような場面で使う想定でした：

1. **Map、Set、Dateなどの特殊なオブジェクト**を扱うとき
2. **外部ライブラリ**と連携するとき
3. **Proxyによる自動追跡を避けたい**とき

### しかし、現在のSvelte 5では...

```svelte
<script lang="ts">
  // 実は、Map、Set、DateもそのままでOK！
  let myMap = $state(new Map());
  let mySet = $state(new Set());
  let now = $state(new Date());
  
  // これらは自動的にリアクティブになる
  myMap.set('key', 'value'); // UIが更新される
  mySet.add('item'); // UIが更新される
</script>
```

Svelte 5では、これらの特殊なクラスも**自動的にリアクティブ対応**されているため、`$state.raw()`を使う必要性は大幅に減りました。

### 📝 では、いつ`$state.raw()`を使うのか？

現在のSvelte 5では、以下のような**非常に限定的な場面**でのみ使用を検討します：

### 1. Proxyによる変更検知を完全に避けたい場合

```svelte
<script lang="ts">
  // 大量のデータで、細かい変更検知が不要な場合
  let hugeData = $state.raw(new Float32Array(1000000));
  
  // 手動で更新通知をしたい場合
  function updateData() {
    // 何らかの処理...
    // 手動で再レンダリングをトリガーする方法が必要
  }
</script>
```

### 2. 外部ライブラリとの特殊な連携

```svelte
<script lang="ts">
  // 外部ライブラリが独自の状態管理を持っている場合
  let externalState = $state.raw(externalLibrary.createState());
</script>
```
