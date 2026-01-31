
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error("❌ API Key is missing in .env.local");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// Helper for error response
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
        const { action, ...data } = req.body;

        if (!action) {
            throw new Error("Action is required");
        }

        // Default for text
        let model = 'gemini-2.5-flash';
        let contents = [];

        if (action === 'generate-greeting') {
            model = 'gemini-2.5-flash';
            const { name, newAddress, hobbies } = data;
            const prompt = `
                世帯主名: ${name}
                新住所: ${newAddress.prefecture}${newAddress.city}
                趣味や楽しみ: ${hobbies}
                
                あなたは温かい雰囲気の挨拶状を書くプロです。新築一戸建てへの引っ越し挨拶状の本文（150文字程度）を作成してください。趣味や楽しみについても触れ、親しみやすく丁寧な言葉遣いにしてください。注意：挨拶状の本文以外のテキスト（「書き換えのヒント」「ポイント」「タイトル」など）は一切出力しないでください。純粋なメッセージ本文のみを返してください。
            `;
            contents = prompt;

        } else if (action === 'transform-image') {
            model = 'models/gemini-2.5-flash-image';
            const { image, style } = data;
            const base64Data = image.includes(',') ? image.split(',')[1] : image;
            const mimeTypeMatch = image.match(/data:([^;]+);/);
            const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
            const prompt = `Convert this photo into a warm watercolor anime style illustration for a moving card. Style: ${style}. Keep the atmosphere happy and protect privacy.`;

            contents = {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: prompt }
                ]
            };

        } else if (action === 'edit-image') {
            model = 'models/gemini-2.5-flash-image';
            const { image, prompt: userPrompt } = data;
            const base64Data = image.includes(',') ? image.split(',')[1] : image;
            const mimeTypeMatch = image.match(/data:([^;]+);/);
            const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

            contents = {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: userPrompt }
                ]
            };
        } else {
            throw new Error(`Unknown action: ${action}`);
        }

        console.log(`[API] Processing action: ${action} with model: ${model}`);

        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
        });

        // Response handling
        if (action === 'generate-greeting') {
            res.json({ text: response.text });
        } else {
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        res.json({ image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
                        return;
                    }
                }
                // If no image, check for text to see what the model said
                const textPart = response.candidates[0].content.parts.find(p => p.text);
                if (textPart) {
                    console.log("Model response (Text):", textPart.text);
                    throw new Error(`No image generated. Model responded: "${textPart.text.substring(0, 200)}..."`);
                }
            }
            console.log("Model response did not contain an image or text.");
            throw new Error("No image generated and no text explanation found.");
        }

    } catch (error) {
        handleError(res, error, "api/gemini");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
