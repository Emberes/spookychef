import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ available: false, error: 'OPENAI_API_KEY not configured' }, { status: 200 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Attempt a simple API call to verify connectivity, e.g., list models
    // This is a lightweight call that doesn't generate an image
    await openai.models.list();

    return NextResponse.json({ available: true, cached: false, age: 0 }, { status: 200 });
  } catch (error) {
    console.error('OpenAI health check failed:', error);
    return NextResponse.json({ available: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 200 });
  }
}
