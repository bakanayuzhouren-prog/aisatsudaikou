import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function
export default async function handler(req, res) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: { message: 'Method Not Allowed' } });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
        console.error("❌ API Key is missing");
        res.status(500).json({ error: { message: "Server configuration error: API Key missing" } });
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const { action, ...data } = req.body;

        if (!action) {
            throw new Error("Action is required");
        }

        // --- 1. 挨拶状生成 ---
        if (action === 'generate-greeting') {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
            const text = response.text();
            res.status(200).json({ text });

            // --- 2. 画像変換 ---
        } else if (action === 'transform-image' || action === 'edit-image') {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
            const { image, style, prompt: userPrompt } = data;

            let base64Data = image;
            if (image.includes(',')) {
                base64Data = image.split(',')[1];
            }
            base64Data = base64Data.replace(/[\s\n\r\t]/g, '');

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
                        res.status(200).json({ image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
                        return;
                    }
                }
            }
            throw new Error("No image generated");

        } else {
            throw new Error(`Unknown action: ${action}`);
        }

    } catch (error) {
        console.error("API Error:", error);
        const status = error.status || 500;
        let message = error.message || "Internal Server Error";
        if (status === 429) {
            message = "AIサービスの利用制限（レートリミット）に達しました。しばらく時間を置いてから再度お試しください。";
        }

        res.status(status).json({
            error: {
                message: message,
                details: error.toString(),
                code: status
            }
        });
    }
}
