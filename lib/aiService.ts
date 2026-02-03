
import { FormData, IllustrationStyle } from "../types";

// Helper to handle API response
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
  }
  return response.json();
};

export const generateGreetingMessageV2 = async (data: FormData): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate-greeting', ...data })
    });

    const result = await handleApiResponse(response);
    return result.text;
  } catch (error: any) {
    console.error("AI Text generation error:", error);
    return `[SERVER-API] エラーが発生しました: ${error.message}`;
  }
};

// Aliasing for compatibility if needed, or just export V2 as the main one
export const generateGreetingMessage = generateGreetingMessageV2;


export const transformImageToIllustration = async (base64Image: string, style: IllustrationStyle = 'standard'): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transform-image', image: base64Image, style }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await handleApiResponse(response);
    return result.image;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("Image transform timed out");
      throw new Error("生成がタイムアウトしました。サーバーが混み合っている可能性があります。");
    }
    console.error("Image transform error:", error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const editImageWithPrompt = async (base64Image: string, promptText: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit-image', image: base64Image, prompt: promptText }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await handleApiResponse(response);
    return result.image;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("生成がタイムアウトしました。");
    }
    console.error("Image edit error:", error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
