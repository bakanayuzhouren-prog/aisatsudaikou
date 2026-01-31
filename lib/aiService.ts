
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
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'transform-image', image: base64Image, style })
    });

    const result = await handleApiResponse(response);
    return result.image;
  } catch (error) {
    console.error("Image transform error:", error);
    throw error;
  }
};

export const editImageWithPrompt = async (base64Image: string, promptText: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit-image', image: base64Image, prompt: promptText })
    });

    const result = await handleApiResponse(response);
    return result.image;
  } catch (error) {
    console.error("Image edit error:", error);
    throw error;
  }
};
