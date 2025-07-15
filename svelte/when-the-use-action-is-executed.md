# `use`アクションの実行タイミング

`use`アクションは、要素が**DOMにマウント（追加）されたとき**に実行されます。「選ばれたとき」（クリックやフォーカス）ではありません。

## 基本的なライフサイクル

```svelte
<script lang="ts">
  function myAction(node: HTMLElement) {
    console.log('1. アクションが実行されました（マウント時）');
    
    // オプション: 破棄時の処理
    return {
      destroy() {
        console.log('3. アクションが破棄されました（アンマウント時）');
      }
    };
  }
  
  let showElement = $state(true);
</script>

{#if showElement}
  <!-- この要素が表示されたときにアクションが実行される -->
  <div use:myAction>
    この要素がDOMに追加されるとアクションが実行されます
  </div>
{/if}

<button onclick={() => showElement = !showElement}>
  要素の表示/非表示
</button>
```

## パラメータ付きアクションの例

```svelte
<script lang="ts">
  let color = $state('red');
  
  function highlight(node: HTMLElement, color: string) {
    console.log(`要素がマウントされました。色: ${color}`);
    node.style.backgroundColor = color;
    
    return {
      // パラメータが変更されたとき
      update(newColor: string) {
        console.log(`色が変更されました: ${newColor}`);
        node.style.backgroundColor = newColor;
      },
      
      // 要素が削除されるとき
      destroy() {
        console.log('要素がアンマウントされました');
      }
    };
  }
</script>

<div use:highlight={color}>
  背景色が設定されます
</div>

<input type="color" bind:value={color} />
```

## 📅 アクションのライフサイクル完全版

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

## 🎯 実用的な例：フォーカス管理

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

## 🔍 外部ライブラリとの連携例

```svelte
<script lang="ts">
  import tippy from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  
  function tooltip(node: HTMLElement, content: string) {
    // マウント時にTooltipを初期化
    const instance = tippy(node, {
      content,
      placement: 'top'
    });
    
    return {
      update(newContent: string) {
        // コンテンツが変更されたら更新
        instance.setContent(newContent);
      },
      
      destroy() {
        // アンマウント時にTooltipを破棄
        instance.destroy();
      }
    };
  }
  
  let tooltipText = $state('ホバーしてください');
</script>

<button use:tooltip={tooltipText}>
  ツールチップ付きボタン
</button>

<input bind:value={tooltipText} placeholder="ツールチップのテキスト" />
```

## ⏰ タイミングのまとめ

| タイミング | 説明 | メソッド |
|---------|------|---------|
| **マウント時** | 要素がDOMに追加されたとき | アクション関数本体 |
| **更新時** | パラメータが変更されたとき | `update()` |
| **アンマウント時** | 要素がDOMから削除されるとき | `destroy()` |

## 💡 重要なポイント

1. **アクションは要素がDOMに追加された瞬間に実行される**
2. **クリックやフォーカスなどのユーザー操作では実行されない**
3. **要素の表示/非表示を切り替えると、毎回実行される**
4. **パラメータが変更されると`update()`が呼ばれる**
5. **クリーンアップ処理は`destroy()`で行う**

Angularの`@ViewChild`と`AfterViewInit`に似た概念ですが、よりシンプルで直感的な実装になっています！