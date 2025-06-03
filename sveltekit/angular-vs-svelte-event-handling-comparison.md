# Angular vs Svelte のイベントハンドリング比較

## 🎯 **Angular のアプローチ（あなたの慣れた方法）**
```typescript
// component.ts - ロジックとテンプレートが分離
export class TodoComponent {
  async addTodo(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    const input = event.target as HTMLInputElement;
    // ロジック処理...
  }
}
```

```html
<!-- template.html - 簡潔 -->
<input (keydown)="addTodo($event)" />
```

## 🆚 **Svelte 5 のアプローチ（新しい記法）**

### **パターン1: インライン（提示されたコード）**
```svelte
<input onkeydown={async (e) => {
  if (e.key !== 'Enter') return;
  // 長いロジックがここに...
}} />
```

### **パターン2: 関数分離（Angularライク）**
```svelte
<script>
  let { data } = $props();

  // 🎯 Angular のような分離アプローチ
  async function handleAddTodo(e) {
    if (e.key !== 'Enter') return;
    
    const input = e.currentTarget;
    const description = input.value;

    const response = await fetch('/todo', {
      method: 'POST',
      body: JSON.stringify({ description }),
      headers: { 'Content-Type': 'application/json' }
    });

    const { id } = await response.json();
    
    data = {
      ...data,
      todos: [
        ...data.todos,
        { id, description, done: false }
      ]
    };
    
    input.value = '';
  }

  async function handleToggleTodo(todo, done) {
    // トグル処理
  }

  async function handleDeleteTodo(todoId) {
    // 削除処理
  }
</script>

<!-- ✅ Angular ライクな簡潔なテンプレート -->
<div class="centered">
  <h1>todos</h1>

  <label>
    add a todo:
    <input type="text" autocomplete="off" onkeydown={handleAddTodo} />
  </label>

  <ul class="todos">
    {#each data.todos as todo (todo.id)}
      <li>
        <label>
          <input 
            type="checkbox" 
            checked={todo.done}
            onchange={(e) => handleToggleTodo(todo, e.currentTarget.checked)}
          />
          <span>{todo.description}</span>
          <button onclick={() => handleDeleteTodo(todo.id)}></button>
        </label>
      </li>
    {/each}
  </ul>
</div>
```

## 🤔 **なぜインライン記法が流行っているのか？**

### **React/JSX の影響**
React コミュニティでは昔からインライン記法が一般的：
```jsx
// React - これが普通
<button onClick={(e) => {
  // インラインロジック
}}>
  Click me
</button>
```

### **Svelte の設計思想**
- **コンポーネント単位の凝集性**重視
- **ボイラープレートコード削減**
- **小さなロジックはインライン、複雑なものは分離**

## 🎯 **Angular開発者へのおすすめアプローチ**

### **✅ 推奨：ハイブリッドアプローチ**
```svelte
<script>
  // 🔧 複雑なロジックは関数として分離
  async function handleComplexOperation(data) {
    // 複雑な処理
  }

  // 💡 シンプルな操作は変数として定義
  const handleSimpleClick = () => count++;
  
  let count = $state(0);
</script>

<!-- ✅ 複雑な処理は関数参照 -->
<button onclick={handleComplexOperation}>Complex</button>

<!-- ✅ シンプルな処理はインライン -->
<button onclick={() => count++}>Simple</button>

<!-- ✅ 1行で済む場合はインライン -->
<input onchange={(e) => value = e.target.value} />
```

### **🎨 TypeScript での型安全な書き方**
```svelte
<script lang="ts">
  interface Todo {
    id: string;
    description: string;
    done: boolean;
  }

  let { data }: { data: { todos: Todo[] } } = $props();

  // 🎯 型安全なイベントハンドラー
  const handleKeydown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
    if (e.key !== 'Enter') return;
    
    const input = e.currentTarget;
    addTodo(input.value);
    input.value = '';
  };

  async function addTodo(description: string): Promise<void> {
    // 型安全なAPI呼び出し
    const response = await fetch('/todo', {
      method: 'POST',
      body: JSON.stringify({ description }),
      headers: { 'Content-Type': 'application/json' }
    });

    const { id }: { id: string } = await response.json();
    
    data = {
      ...data,
      todos: [...data.todos, { id, description, done: false }]
    };
  }
</script>

<input type="text" onkeydown={handleKeydown} />
```

## 🏗️ **アーキテクチャ的な整理法**

### **コンポーネント分離アプローチ**
```svelte
<!-- TodoApp.svelte - メインコンポーネント -->
<script>
  import TodoInput from './TodoInput.svelte';
  import TodoList from './TodoList.svelte';
  
  let { data } = $props();
</script>

<div class="centered">
  <h1>todos</h1>
  <TodoInput bind:todos={data.todos} />
  <TodoList bind:todos={data.todos} />
</div>
```

```svelte
<!-- TodoInput.svelte - 入力コンポーネント -->
<script>
  let { todos = $bindable() } = $props();

  async function addTodo(description) {
    // ここに集約
  }

  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
      addTodo(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };
</script>

<label>
  add a todo:
  <input type="text" autocomplete="off" onkeydown={handleKeydown} />
</label>
```

## 💡 **結論：あなたへのおすすめ**

### **🎯 移行戦略**
1. **最初はAngularライク**な関数分離で書く
2. **慣れてきたら**シンプルなものはインライン
3. **複雑なロジック**は必ず分離・テスト可能に

### **✅ ベストプラクティス**
```svelte
<script>
  // ❌ 避ける：長いインラインロジック
  // ✅ 推奨：適度な分離
  
  const handleSimple = () => count++; // シンプル
  
  async function handleComplex(data) { // 複雑
    // テスタブルな関数として分離
  }
</script>

<!-- ✅ 使い分け -->
<button onclick={handleSimple}>Simple</button>
<button onclick={() => handleComplex(data)}>Complex</button>
```

Angular のような明確な分離に慣れていると確かに違和感ありますが、**適度な分離とインラインの使い分け**が Svelte らしい書き方になります！