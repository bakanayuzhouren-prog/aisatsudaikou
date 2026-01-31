
# AI 引っ越し挨拶状メーカー 🏠✨

Google Gemini APIを活用した、新築一戸建て向け引っ越し挨拶状作成アプリです。
プライバシーに配慮し、入力データや写真はすべてブラウザ内に保存されます。

## 🌟 主な機能
- **AI挨拶文生成**: 趣味や出身地を元に、Geminiが最適な文章を作成。
- **2Dイラスト変換**: 家族写真をプライバシーに配慮した温かいイラスト調に加工。
- **印刷レイアウト調整**: A4やハガキサイズに合わせてAIが配置を自動提案。
- **PWA対応**: スマホのホーム画面に追加してアプリとして利用可能。
- **セキュリティ**: パスコードロック機能により、共有端末でも安心。

## 🚀 デプロイと設定 (GitHub & Vercel)

このアプリはGitHubとVercelを使って簡単に無料で公開できます。

1. **Google Gemini APIキーの取得**
   [Google AI Studio](https://aistudio.google.com/app/apikey) でAPIキーを取得してください。

2. **ローカルでの開発**
   `.env` ファイルを作成し、APIキーを設定します。
   （Viteを使用しているため、接頭辞 `VITE_` が必要です）
   ```bash
   VITE_API_KEY=your_api_key_here
   ```
   
   インストールと起動:
   ```bash
   npm install
   npm run dev
   ```

3. **Vercelへのデプロイ**
   - GitHubにこのリポジトリをPushします。
   - Vercelで "New Project" からリポジトリをインポートします。
   - **Environment Variables** (環境変数) の設定で以下を追加します:
     - Name: `VITE_API_KEY`
     - Value: (取得したGemini APIキー)
   - [Deploy] をクリックすれば完了です！

## 🛠 技術スタック
- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Tooling**: Vite

## 📄 ライセンス
MIT License
