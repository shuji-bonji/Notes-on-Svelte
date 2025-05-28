# SPA経験者のためのSvelteKit理解
SPA開発者が一番混乱するのは「**実行環境の概念**」です。

## **🔥 あなたの現在の世界（SPA）**
```typescript
// フロントエンド（Angular）- ブラウザでのみ実行
@Component({...})
export class GameComponent implements OnInit {
  game: Game;
  
  ngOnInit() {
    // HTTP APIを呼び出してデータ取得
    this.http.get<Game>('/api/games/123').subscribe(game => {
      this.game = game;
    });
  }
}
```

```csharp
// バックエンド（.NET Web API）- サーバーでのみ実行
[ApiController]
public class GamesController : ControllerBase {
    [HttpGet("games/{id}")]
    public async Task<Game> GetGame(int id) {
        return await _gameService.GetGameAsync(id);
    }
}
```

## **🌟 新しい世界（SvelteKit）**
```typescript
// +page.server.ts - サーバーでのみ実行（.NET APIと同じ感覚）
export const load: PageServerLoad = async ({ params }) => {
  // データベース直接アクセス（APIを経由しない！）
  const game = await db.getGame(params.id);
  return { game };
};
```

```svelte
<!-- +page.svelte - ブラウザで実行（Angularコンポーネントと同じ感覚） -->
<script lang="ts">
  // load関数からデータを受け取る（HTTP APIなし！）
  export let data;
  $: game = data.game;
</script>

<h1>{game.title}</h1>
```

## 🧠 頭の切り替えポイント

### **1. データ取得の概念転換**
```typescript
// SPA思考: 「APIを叩いてJSONを取得」
this.http.get('/api/games/123').subscribe(...)

// SvelteKit思考: 「サーバー側で事前にデータを準備」
export const load = async () => {
  const data = await fetchFromDatabase();
  return { data }; // ページコンポーネントに自動で渡される
};
```

### **2. ルーティングの概念転換**
```typescript
// SPA思考: 「ルート設定ファイルで定義」
const routes = [
  { path: 'game/:id', component: GameComponent }
];

// SvelteKit思考: 「ファイル構造がそのままルート」
// src/routes/game/[id]/+page.svelte → /game/:id に自動でなる
```

### **3. 認証の概念転換**
```typescript
// SPA思考: 「JWTをlocalStorageに保存してGuardでチェック」
@Injectable()
export class AuthGuard {
  canActivate() {
    return this.authService.isAuthenticated(); // JWT確認
  }
}

// SvelteKit思考: 「サーバーサイドセッションで事前チェック」
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login'); // サーバーで事前にリダイレクト
  }
  return { user: locals.user };
};
```

## 🎯 実際のジャンケンゲームで理解を深める

SPAアプローチとSvelteKitアプローチを比較してみましょう：

### **SPAアプローチ（あなたの慣れた方法）**
```typescript
// Angular: ゲーム参加コンポーネント
@Component({...})
export class JoinGameComponent {
  constructor(private http: HttpClient, private route: ActivatedRoute) {}
  
  ngOnInit() {
    const gameId = this.route.snapshot.params['id'];
    // API呼び出し
    this.http.get(`/api/games/${gameId}`).subscribe(game => {
      this.game = game;
    });
  }
  
  joinGame() {
    // 参加API呼び出し
    this.http.post(`/api/games/${this.gameId}/join`, {
      playerName: this.playerName
    }).subscribe(...);
  }
}
```

### **SvelteKitアプローチ（新しい方法）**
```typescript
// src/routes/game/[id]/+page.server.ts
export const load: PageServerLoad = async ({ params }) => {
  // APIを経由せず、直接データ取得
  const game = await gameService.getGame(params.id);
  return { game };
};

export const actions = {
  join: async ({ request, params }) => {
    const data = await request.formData();
    const playerName = data.get('playerName');
    
    // 直接ゲームサービスを呼び出し
    await gameService.joinGame(params.id, playerName);
    return { success: true };
  }
};
```

```svelte
<!-- src/routes/game/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  export let data; // load関数から自動で渡される
  
  let playerName = '';
</script>

<h1>{data.game.title}</h1>

<form method="POST" action="?/join" use:enhance>
  <input bind:value={playerName} name="playerName" />
  <button type="submit">参加</button>
</form>
```