import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { buildFoodImagePrompt } from '../../../lib/image_prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" }); // Assuming gemini-pro-vision can generate images from text

// Simple in-memory cache for image URLs
const imageCache: Record<string, string> = {};

export async function POST(request: Request) {
  try {
    const { recipeTitle, ingredients, recipeId } = await request.json();

    if (imageCache[recipeId]) {
      return NextResponse.json({ imageUrl: imageCache[recipeId] });
    }

    const prompt = buildFoodImagePrompt(recipeTitle, ingredients);

    // Placeholder for actual image generation call
    // In a real scenario, you'd use a dedicated image generation API
    // For now, we'll simulate a response or use a placeholder image service if available
    // The Gemini API (gemini-pro-vision) is primarily for vision tasks (image input), not text-to-image generation.
    // A dedicated text-to-image model would be needed here.
    // For this task, I will return a placeholder image URL.

    const placeholderImageUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(recipeTitle)}`;

    imageCache[recipeId] = placeholderImageUrl;

    return NextResponse.json({ imageUrl: placeholderImageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
