import { GoogleGenAI, Modality } from "@google/genai";
import { ImageData } from '../types';

if (!process.env.API_KEY) {
  // This is a safeguard; the environment is expected to provide the API key.
  console.warn("API_KEY environment variable is not set. The application will not work without it.");
}


export const editImage = async (
  baseImage: ImageData,
  prompt: string
): Promise<ImageData | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: baseImage.base64,
              mimeType: baseImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw new Error("Failed to edit image. The API returned an error.");
  }
};
