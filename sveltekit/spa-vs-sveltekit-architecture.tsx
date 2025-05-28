import React, { useState } from 'react';

const SPAvsSSRComparison = () => {
  const [currentView, setCurrentView] = useState('spa');

  const SPAView = () => (
    <div className="bg-blue-50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">🚀 SPA（あなたの経験）</h2>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded border-l-4 border-blue-500">
          <h3 className="font-bold mb-2">アーキテクチャ</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-100 p-3 rounded">
              <h4 className="font-semibold">フロントエンド</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Angular アプリ</li>
                <li>• ブラウザでのみ実行</li>
                <li>• component.ts + template</li>
                <li>• クライアントサイドルーティング</li>
              </ul>
            </div>
            <div className="bg-green-100 p-3 rounded">
              <h4 className="font-semibold">バックエンド</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• .NET Web API</li>
                <li>• サーバーでのみ実行</li>
                <li>• RESTful API</li>
                <li>• JSON レスポンス</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border-l-4 border-blue-500">
          <h3 className="font-bold mb-2">データフロー</h3>
          <div className="text-sm space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">1</span>
              <span>ブラウザで Angular アプリ起動</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">2</span>
              <span>HttpClient で Web API 呼び出し</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">3</span>
              <span>JSON データを受信</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">4</span>
              <span>Angular でデータをレンダリング</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border-l-4 border-blue-500">
          <h3 className="font-bold mb-2">コード例</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Angular Component
@Component({...})
export class GameComponent {
  game$ = this.http.get<Game>('/api/games/123');
}

// .NET Web API
[HttpGet("games/{id}")]
public async Task<Game> GetGame(int id) {
  return await _gameService.GetGameAsync(id);
}`}
          </pre>
        </div>
      </div>
    </div>
  );

  const SvelteKitView = () => (
    <div className="bg-green-50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-800">🌐 SvelteKit（新しい世界）</h2>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded border-l-4 border-green-500">
          <h3 className="font-bold mb-2">アーキテクチャ</h3>
          <div className="bg-yellow-100 p-3 rounded mb-3">
            <h4 className="font-semibold">🤯 ここが混乱ポイント！</h4>
            <p className="text-sm mt-1">
              <strong>フロントエンドとバックエンドが同じプロジェクト内</strong>にある<br/>
              でも、実行環境は分かれている
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-100 p-3 rounded">
              <h4 className="font-semibold">クライアントサイド</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• +page.svelte（UI）</li>
                <li>• +page.ts（データ取得）</li>
                <li>• ブラウザで実行</li>
              </ul>
            </div>
            <div className="bg-green-100 p-3 rounded">
              <h4 className="font-semibold">サーバーサイド</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• +page.server.ts（サーバー処理）</li>
                <li>• +server.ts（API）</li>
                <li>• Node.js で実行</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border-l-4 border-green-500">
          <h3 className="font-bold mb-2">ファイル構成の意味</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-mono">+page.svelte</span>
              <div>
                <p className="font-semibold">UI コンポーネント</p>
                <p className="text-sm text-gray-600">Angular の component.ts + template と同じ</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono">+page.ts</span>
              <div>
                <p className="font-semibold">ユニバーサルデータ取得</p>
                <p className="text-sm text-gray-600">サーバー・ブラウザ両方で実行される（公開データ）</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-mono">+page.server.ts</span>
              <div>
                <p className="font-semibold">サーバー専用処理</p>
                <p className="text-sm text-gray-600">.NET Web API と同じ（秘密データ・DB直接アクセス）</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-mono">+layout.svelte</span>
              <div>
                <p className="font-semibold">共通レイアウト</p>
                <p className="text-sm text-gray-600">Angular の app.component.html と同じ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border-l-4 border-green-500">
          <h3 className="font-bold mb-2">コード例</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// +page.server.ts（サーバーで実行）
export const load = async ({ params }) => {
  // DB直接アクセス（.NET Web API と同じ）
  const game = await db.query('SELECT * FROM games WHERE id = ?', [params.id]);
  return { game };
};

// +page.svelte（ブラウザで実行）
<script>
  export let data; // load関数からのデータ
</script>
<h1>{data.game.title}</h1>`}
          </pre>
        </div>
      </div>
    </div>
  );

  const ComparisonView = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">🔄 直接比較</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-200">
              <tr>
                <th className="p-3 text-left">観点</th>
                <th className="p-3 text-left">SPA（あなたの経験）</th>
                <th className="p-3 text-left">SvelteKit</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="bg-white">
                <td className="p-3 font-semibold">実行環境</td>
                <td className="p-3">フロント：ブラウザのみ<br/>API：サーバーのみ</td>
                <td className="p-3">混在：サーバー + ブラウザ</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-semibold">データ取得</td>
                <td className="p-3">HttpClient → JSON API</td>
                <td className="p-3">load 関数 → 直接データ</td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 font-semibold">ルーティング</td>
                <td className="p-3">Angular Router（設定ファイル）</td>
                <td className="p-3">ファイル構造がそのままルート</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-semibold">認証</td>
                <td className="p-3">JWT → Angular Guard</td>
                <td className="p-3">セッション → load 関数</td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 font-semibold">SEO</td>
                <td className="p-3">弱い（CSRのみ）</td>
                <td className="p-3">強い（SSR対応）</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-3 text-red-800">⚠️ SPA開発者が混乱するポイント</h3>
        <div className="space-y-3">
          <div className="bg-white p-3 rounded border-l-4 border-red-400">
            <p className="font-semibold">「なんで同じプロジェクトにサーバーコードが？」</p>
            <p className="text-sm text-gray-600 mt-1">
              SvelteKitはフルスタックフレームワーク。1つのプロジェクトでフロント+バックエンドを統合管理
            </p>
          </div>
          <div className="bg-white p-3 rounded border-l-4 border-red-400">
            <p className="font-semibold">「いつサーバーで実行されるの？」</p>
            <p className="text-sm text-gray-600 mt-1">
              +page.server.ts は常にサーバー、+page.ts は初回はサーバー・以降はブラウザ
            </p>
          </div>
          <div className="bg-white p-3 rounded border-l-4 border-red-400">
            <p className="font-semibold">「APIエンドポイントはどこ？」</p>
            <p className="text-sm text-gray-600 mt-1">
              +server.ts が API エンドポイント。でも load 関数で直接データを渡すことも多い
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">SPA経験者のためのSvelteKit理解</h1>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentView('spa')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'spa'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            SPA（慣れ親しんだ世界）
          </button>
          <button
            onClick={() => setCurrentView('sveltekit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'sveltekit'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            SvelteKit（新しい世界）
          </button>
          <button
            onClick={() => setCurrentView('comparison')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'comparison'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            直接比較
          </button>
        </div>
      </div>

      {currentView === 'spa' && <SPAView />}
      {currentView === 'sveltekit' && <SvelteKitView />}
      {currentView === 'comparison' && <ComparisonView />}
    </div>
  );
};

export default SPAvsSSRComparison;