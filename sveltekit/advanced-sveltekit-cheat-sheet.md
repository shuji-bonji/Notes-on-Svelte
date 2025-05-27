# SvelteKit チートシート（Advanced）

## 1. フック (hooks)

フックは特定のイベントに応じてSvelteKitが呼び出すアプリ全体の関数です。

### サーバーサイドフック (`src/hooks.server.js`)

```javascript
// src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';

// すべてのリクエストを処理するハンドラー
export const handle = async ({ event, resolve }) => {
  // リクエストヘッダーからセッショントークンを取得
  const sessionToken = event.cookies.get('sessionToken');
  
  if (sessionToken) {
    // データベースからユーザー情報を取得
    const user = await db.getUserByToken(sessionToken);
    // locals に保存してルート内で利用可能に
    event.locals.user = user;
  }
  
  // カスタムレスポンスヘッダーの追加
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace(
      '%theme%',
      event.cookies.get('theme') || 'light'
    )
  });
  
  response.headers.set('X-Custom-Header', 'SvelteKit App');
  
  return response;
};

// 複数のハンドルを順番に実行（ミドルウェアのチェーン）
export const handle = sequence(
  handleAuthentication,
  handleAuthorization,
  handleTheme
);

// サーバーサイドfetchのカスタマイズ
export const handleFetch = async ({ event, request, fetch }) => {
  // API呼び出しにクッキーを追加
  if (request.url.startsWith('https://api.example.com/')) {
    request.headers.set('cookie', event.request.headers.get('cookie'));
  }
  
  return fetch(request);
};

// サーバーサイドエラーのハンドリング
export const handleError = async ({ error, event }) => {
  // エラーログやモニタリングサービスへの連携
  console.error(error);
  
  // Sentryなどのサービスに送信
  Sentry.captureException(error, { extra: { url: event.url.pathname } });
  
  return {
    message: 'エラーが発生しました',
    code: error.code || 'UNKNOWN'
  };
};
```

### クライアントサイドフック (`src/hooks.client.js`)

```javascript
// src/hooks.client.js
// クライアントサイドでのエラーハンドリング
export const handleError = async ({ error, event }) => {
  console.error('クライアントエラー:', error);
  
  // アナリティクスへ送信
  trackError(error, event);
  
  return {
    message: 'エラーが発生しました。後でもう一度お試しください。'
  };
};
```

## 2. ページオプション

```javascript
// src/routes/blog/+page.js
export const prerender = true; // 静的生成
export const ssr = true;      // サーバーサイドレンダリング
export const csr = true;      // クライアントサイドレンダリング

// サーバー側のみのオプション
// src/routes/blog/+page.server.js
export const config = {
  isr: {
    expiration: 60 // 60秒ごとに再生成（Incremental Static Regeneration）
  }
};

// 条件付き静的生成
export const prerender = ({ params, route }) => {
  // 特定のパスのみ静的生成
  return route.id.startsWith('/blog');
};
```

## 3. リンクオプション

### prefetchingの制御

```svelte
<!-- data-sveltekit-preload-data="hover" が暗黙的にデフォルト -->
<a href="/blog">ホバーでプリフェッチ</a>

<!-- プリフェッチの制御 -->
<a href="/blog" data-sveltekit-preload-data="hover">ホバーでプリフェッチ</a>
<a href="/blog" data-sveltekit-preload-data="tap">タップ/クリック時にプリフェッチ</a>
<a href="/blog" data-sveltekit-preload-data="off">プリフェッチしない</a>

<!-- スクロールの制御 -->
<a href="/blog" data-sveltekit-reload>ページ全体を再読み込み</a>
<a href="/blog" data-sveltekit-noscroll>スクロール位置を保持</a>
```

### プログラムによるナビゲーション

```svelte
<script>
  import { goto, invalidate, prefetch, beforeNavigate, afterNavigate } from '$app/navigation';
  
  // プログラムによるナビゲーション
  function navigateToBlog() {
    goto('/blog', {
      // オプション
      replaceState: false,        // 履歴に追加するか置換するか
      noScroll: false,            // スクロール位置をリセットするか
      invalidateAll: false,       // すべてのロード関数を再実行
      state: { scrollY: window.scrollY } // 履歴エントリーに状態を追加
    });
  }
  
  // データの再取得（無効化）
  async function refreshData() {
    // 特定のURLデータを無効化
    await invalidate('/api/posts');
    
    // カスタム依存関係の無効化
    await invalidate('app:posts');
    
    // すべてのデータを無効化
    await invalidate();
  }
  
  // リンクのプリフェッチ
  function hoverLink(href) {
    prefetch(href);
  }
  
  // ナビゲーション前のフック
  beforeNavigate((navigation) => {
    if (!formSubmitted && navigation.to?.url.pathname === '/leave') {
      // ナビゲーションをキャンセル
      navigation.cancel();
      showConfirmDialog();
    }
    
    // ナビゲーション前にデータを保存
    saveFormData();
  });
  
  // ナビゲーション後のフック
  afterNavigate((navigation) => {
    // ナビゲーション後の処理
    if (navigation.from?.url.pathname === '/old') {
      // 分析データの送信など
      trackPageView(navigation.to.url.pathname);
    }
  });
</script>
```

## 4. 高度なルーティング

### パラメータマッチャー

```javascript
// src/params/slug.js
// /blog/:slug パラメータのバリデーション
export function match(param) {
  return /^[a-z0-9-]+$/.test(param);
}

// src/params/id.js
export function match(param) {
  return /^\d+$/.test(param);
}
```

### レストパラメータ

```
src/routes/files/[...path]/+page.svelte - /files/a/b/c などにマッチ
```

```javascript
// src/routes/files/[...path]/+page.js
export function load({ params }) {
  // params.path は 'a/b/c' になる
  return {
    path: params.path.split('/')
  };
}
```

### ルートグループとレイアウトの分離

```
src/routes/
├── (app)/                # アプリエリア
│   ├── dashboard/
│   ├── settings/
│   └── +layout.svelte    # アプリエリア用レイアウト
├── (marketing)/          # マーケティングエリア
│   ├── about/
│   ├── pricing/
│   └── +layout.svelte    # マーケティングエリア用レイアウト
└── +layout.svelte        # 共通ルートレイアウト
```

### レイアウトのリセット

```
src/routes/
├── (app)/
│   ├── +layout.svelte    # アプリレイアウト
│   └── settings/
│       └── +layout@.svelte  # すべてのレイアウトをリセット
└── +layout.svelte        # ルートレイアウト
```

## 5. 高度なデータローディング

### ユニバーサルロード関数

クライアントとサーバーで共有するロードロジック：

```javascript
// src/routes/products/+page.js
export async function load({ fetch, depends }) {
  // depends を使用してカスタム依存関係を登録
  depends('app:products');
  
  // このデータは両方の環境で共有される
  const products = await fetch('/api/products').then(r => r.json());
  
  return { products };
}
```

### 両方のロード関数の使用

```javascript
// src/routes/products/+page.js (クライアント/サーバー両方)
export async function load({ fetch, depends }) {
  depends('app:products');
  
  const products = await fetch('/api/products').then(r => r.json());
  
  return { products };
}

// src/routes/products/+page.server.js (サーバーのみ)
export async function load({ locals, cookies }) {
  // サーバーデータを追加
  const user = locals.user;
  const preferences = await db.getUserPreferences(user.id);
  
  return { 
    preferences,
    userTimeZone: cookies.get('tz') || 'UTC'
  };
}

// 両方のデータは自動的にマージされる
```

### 親データの使用

```javascript
// src/routes/+layout.js
export async function load() {
  return {
    theme: await fetchTheme()
  };
}

// src/routes/profile/+page.js
export async function load({ parent }) {
  // 親レイアウトからデータを取得
  const parentData = await parent();
  
  return {
    // parentData.theme が利用可能
    profile: await fetchProfile(parentData.theme)
  };
}
```

### データの無効化

```javascript
// コンポーネント内でのデータ無効化
<script>
  import { invalidate, invalidateAll } from '$app/navigation';
  
  async function refreshProducts() {
    // 特定のリソースを無効化
    await invalidate('/api/products');
    
    // または、カスタム依存関係を無効化
    await invalidate('app:products');
    
    // または、すべてを無効化
    await invalidateAll();
  }
</script>
```

### カスタム依存関係

```javascript
// src/routes/products/+page.js
export async function load({ fetch, depends }) {
  // カスタム依存関係を登録
  depends('app:products');
  depends('app:categories');
  
  return { 
    products: await fetch('/api/products').then(r => r.json())
  };
}

// 別のコンポーネントから
<script>
  import { invalidate } from '$app/navigation';
  
  async function updateProduct(id, data) {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    // 登録した依存関係を無効化
    await invalidate('app:products');
  }
</script>
```

## 6. 環境変数

### プライベート環境変数（サーバーのみ）

```javascript
// src/routes/api/data/+server.js
import { SECRET_API_KEY } from '$env/static/private';
// または
import { env } from '$env/dynamic/private';

export function GET() {
  // SECRET_API_KEY を使用
  // または env.SECRET_API_KEY を使用
  
  return new Response('...');
}
```

### パブリック環境変数（クライアントでも使用可能）

```javascript
// src/routes/+page.svelte
import { PUBLIC_API_URL } from '$env/static/public';
// または
import { env } from '$env/dynamic/public';

// PUBLIC_API_URL を使用
// または env.PUBLIC_API_URL を使用
```

### 静的vs動的環境変数

- `$env/static/*`: ビルド時に評価され、値は最適化される
- `$env/dynamic/*`: 実行時に評価され、変更があれば新しい値を反映

```javascript
// $env/static/private - ビルド時に評価
import { DATABASE_URL } from '$env/static/private';

// $env/dynamic/private - 実行時に評価
import { env } from '$env/dynamic/private';
const databaseUrl = env.DATABASE_URL;
```

## 7. フォームアクション

### 基本フォームアクション

```javascript
// src/routes/login/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    
    if (!username || !password) {
      return fail(400, { 
        username,
        message: 'ユーザー名とパスワードが必要です'
      });
    }
    
    try {
      const user = await login(username, password);
      cookies.set('sessionId', user.sessionId, { path: '/' });
      
      throw redirect(303, '/dashboard');
    } catch (e) {
      return fail(401, {
        username,
        message: '認証に失敗しました'
      });
    }
  }
};
```

### 名前付きフォームアクション

```javascript
// src/routes/profile/+page.server.js
export const actions = {
  updateProfile: async ({ request, locals }) => {
    const formData = await request.formData();
    // ...
    return { success: true };
  },
  
  changePassword: async ({ request, locals }) => {
    const formData = await request.formData();
    // ...
    return { success: true };
  }
};
```

```svelte
<!-- src/routes/profile/+page.svelte -->
<form method="POST" action="?/updateProfile">
  <!-- フォームフィールド -->
</form>

<form method="POST" action="?/changePassword">
  <!-- パスワード変更フィールド -->
</form>
```

### プログレッシブエンハンスメント

```svelte
<script>
  import { enhance } from '$app/forms';
  
  export let form;
</script>

<!-- デフォルトの強化 -->
<form method="POST" use:enhance>
  <!-- フォームフィールド -->
</form>

<!-- カスタム強化 -->
<form method="POST" use:enhance={({ formElement, formData, action, cancel }) => {
  // 送信前の処理
  if (!confirm('本当に送信しますか？')) {
    cancel();
  }
  
  // 任意のデータを追加
  formData.append('clientTime', new Date().toISOString());
  
  // 送信中と送信後の処理
  return async ({ result, update }) => {
    if (result.type === 'success') {
      // 成功時の処理
      showSuccessMessage();
    }
    
    // DOM更新の制御
    update({ resetForm: false });
  };
}}>
  <!-- フォームフィールド -->
</form>
```

## 8. サーバーレスデプロイ

### アダプター設定

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'; // 自動検出
// または特定のプラットフォーム用
// import adapter from '@sveltejs/adapter-vercel';
// import adapter from '@sveltejs/adapter-netlify';
// import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // アダプター固有のオプション
      edge: false,
      external: [],
      split: false
    })
  }
};

export default config;
```

### プラットフォーム固有の機能

```javascript
// src/app.js
export const handlePlatform = ({ platform }) => {
  // Vercel Edge固有のランタイムAPIにアクセス
  if (platform.env) {
    return {
      kv: platform.env.KV,
      r2: platform.env.R2
    };
  }
  
  return {};
};
```

```javascript
// src/routes/api/data/+server.js
export async function GET({ platform }) {
  // プラットフォーム固有のAPIを使用
  const data = await platform.kv.get('someKey');
  
  return new Response(JSON.stringify(data));
}
```

## 9. WebSocketとリアルタイム通信

### SvelteKitでのWebSocket使用

```javascript
// src/lib/socket.js
import { browser } from '$app/environment';

let socket;

export function getSocket() {
  if (browser && !socket) {
    socket = new WebSocket('wss://example.com/socket');
    
    socket.addEventListener('open', () => {
      console.log('接続確立');
    });
    
    socket.addEventListener('close', () => {
      console.log('接続終了');
      socket = null;
    });
  }
  
  return socket;
}
```

```svelte
<!-- src/routes/chat/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { getSocket } from '$lib/socket';
  
  let messages = [];
  let socket;
  
  onMount(() => {
    socket = getSocket();
    
    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      messages = [...messages, data];
    });
    
    // 接続確立を通知
    socket.send(JSON.stringify({ type: 'join', room: 'general' }));
  });
  
  onDestroy(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'leave', room: 'general' }));
    }
  });
  
  function sendMessage() {
    if (messageText && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        room: 'general',
        text: messageText
      }));
      messageText = '';
    }
  }
  
  let messageText = '';
</script>

<div class="chat">
  <div class="messages">
    {#each messages as message}
      <div class="message">
        <strong>{message.user}:</strong> {message.text}
      </div>
    {/each}
  </div>
  
  <form onsubmit|preventDefault={sendMessage}>
    <input bind:value={messageText} placeholder="メッセージを入力...">
    <button type="submit">送信</button>
  </form>
</div>
```

### サーバーとの通信（WebTransport）

```javascript
// src/lib/transport.js
import { browser } from '$app/environment';

export async function createTransport() {
  if (!browser) return null;
  
  try {
    const transport = new WebTransport('https://example.com/transport');
    await transport.ready;
    
    return transport;
  } catch (e) {
    console.error('WebTransport初期化エラー:', e);
    return null;
  }
}

export async function closeTransport(transport) {
  if (transport) {
    try {
      await transport.close();
    } catch (e) {
      console.error('WebTransport終了エラー:', e);
    }
  }
}
```

```svelte
<!-- src/routes/game/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { createTransport, closeTransport } from '$lib/transport';
  
  let transport;
  let writer;
  
  onMount(async () => {
    transport = await createTransport();
    
    if (transport) {
      // 双方向ストリームを作成
      const stream = await transport.createBidirectionalStream();
      writer = stream.writable.getWriter();
      
      // 読み取り用リーダー
      const reader = stream.readable.getReader();
      
      // データ読み取りループ
      readLoop(reader);
    }
  });
  
  async function readLoop(reader) {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // 受信データを処理
        processMessage(new TextDecoder().decode(value));
      }
    } catch (e) {
      console.error('読み取りエラー:', e);
    }
  }
  
  function processMessage(message) {
    // 受信メッセージの処理
    console.log('受信:', message);
    // ...
  }
  
  async function sendMessage(message) {
    if (writer) {
      try {
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(message));
      } catch (e) {
        console.error('送信エラー:', e);
      }
    }
  }
  
  onDestroy(() => {
    closeTransport(transport);
  });
</script>
```
