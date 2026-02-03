import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error("❌ API Key is missing in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const handleError = (res, error, context) => {
    console.error(`Error in ${context}:`, error);
    const status = error.status || 500;
    let message = error.message || "Internal Server Error";
    if (status === 429) {
        message = "AIサービスの利用制限（レートリミット）に達しました。しばらく時間を置いてから再度お試しください。";
    }

    res.status(status).json({
        error: {
            message: message,
            details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
            code: status
        }
    });
};

app.post('/api/gemini', async (req, res) => {
    try {
        console.log(`[API] Received Gemini request: ${req.body.action}`);
        const { action, ...data } = req.body;

        if (!action) {
            throw new Error("Action is required");
        }

        // --- 1. 挨拶状生成 ---
        if (action === 'generate-greeting') {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            console.log("📝 Generating greeting with data:", JSON.stringify(data, null, 2)); // Debug log
            const { name, newAddress, hobbies } = data;
            const prompt = `
                世帯主名: ${name}
                新住所: ${newAddress.prefecture}${newAddress.city}
                趣味や楽しみ: ${hobbies}

                あなたは温かい雰囲気の挨拶状を書くプロです。新築一戸建てへの引っ越し挨拶状の本文（150文字程度）を作成してください。
                
                【重要なお願い】
                以下の形式を必ず守って文章を構成してください。
                1. 冒頭で、名前と趣味を以下の定型文で自己紹介してください（挨拶文の中に自然に組み込んでください）。
                   「${name}と申します。趣味は${hobbies}です。」
                   ※もし趣味が空欄の場合は「${name}と申します。」のみにしてください。

                2. 趣味や楽しみについても触れ、親しみやすく丁寧な言葉遣いにしてください。
                
                注意：挨拶状の本文以外のテキスト（「書き換えのヒント」「ポイント」「タイトル」など）は一切出力しないでください。純粋なメッセージ本文のみを返してください。
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            res.json({ text: response.text() });

            // --- 2. 画像変換 ---
        } else if (action === 'transform-image' || action === 'edit-image') {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const { image, style, prompt: userPrompt } = data;

            // Base64処理
            let base64Data = image;
            if (image.includes(',')) {
                base64Data = image.split(',')[1];
            }
            base64Data = base64Data.replace(/[\s\n\r\t]/g, '');

            // 念のためログ出力
            const mimeTypeMatch = image.match(/data:([^;]+);/);
            const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
            console.log(`Processing image: mimeType=${mimeType}, base64Length=${base64Data.length}, Model=gemini-2.5-flash-image`);

            const promptText = action === 'transform-image'
                ? `Convert this photo into a warm watercolor anime style illustration. Style: ${style}.`
                : userPrompt;

            const result = await model.generateContent([
                { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
                { text: promptText }
            ]);

            const response = await result.response;

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        res.json({ image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
                        return;
                    }
                }
            }
            throw new Error("No image generated");

        } else {
            throw new Error(`Unknown action: ${action}`);
        }

    } catch (error) {
        handleError(res, error, "api/gemini");
    }
});

// Bind to 0.0.0.0 to accept connections from outside localhost (e.g. mobile via LAN)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
