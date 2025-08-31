
import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we will throw an error if the key is missing.
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateBio = async (currentBio: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Refine this professional summary for a portfolio. Make it more impactful and concise, while maintaining a professional tone. Here is the current summary:\n\n"${currentBio}"`,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 32,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Error: Could not generate bio. Please check your API key and network connection.";
  }
};

export const generateBlogPost = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, engaging blog post (around 3-4 paragraphs) about the following topic: "${topic}". The tone should be informative and accessible for a tech audience. Use markdown for formatting.`,
       config: {
        temperature: 0.8,
        topP: 1,
        topK: 40,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating blog post:", error);
    return "Error: Could not generate blog post.";
  }
};

export const generateProjectDescription = async (projectName: string, technologies: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a compelling one-paragraph project description for a portfolio. The project is called "${projectName}" and uses the following technologies: ${technologies}. Highlight the key features and purpose of the project.`,
       config: {
        temperature: 0.7,
        topP: 1,
        topK: 32,
        maxOutputTokens: 150,
        thinkingConfig: { thinkingBudget: 75 },
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating project description:", error);
    return "Error: Could not generate project description.";
  }
};

export const generateProjectImage = async (prompt: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A professional, high-quality image for a software project portfolio. The image should be visually appealing, modern, and represent the following concept: "${prompt}". Do not include any text or logos.`,
      config: {
        numberOfImages: 2,
        outputMimeType: 'image/png',
        aspectRatio: '4:3',
      },
    });
    return response.generatedImages.map(img => img.image.imageBytes);
  } catch (error) {
    console.error("Error generating project image:", error);
    return [];
  }
};

export const generateSeoSuggestions = async (
  postTitle: string,
  postContent: string
): Promise<{ seoTitle: string; seoDescription: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following blog post title and content, generate an optimized SEO title and meta description.

      Title: "${postTitle}"
      
      Content:
      "${postContent.substring(0, 1000)}..."
      
      The SEO title should be compelling and under 60 characters.
      The SEO description should be a concise summary under 160 characters.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoTitle: {
              type: Type.STRING,
              description: 'The SEO-optimized title.'
            },
            seoDescription: {
              type: Type.STRING,
              description: 'The SEO-optimized meta description.'
            }
          },
          required: ['seoTitle', 'seoDescription']
        },
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error generating SEO suggestions:", error);
    return {
      seoTitle: "Error: Could not generate title.",
      seoDescription: "Error: Could not generate description."
    };
  }
};
