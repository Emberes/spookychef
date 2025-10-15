import { NextResponse } from 'next/server';

let cachedStatus: { available: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuter

export async function GET() {
  // Returnera cached status om den är färsk
  if (cachedStatus && Date.now() - cachedStatus.timestamp < CACHE_DURATION) {
    return NextResponse.json({ 
      available: cachedStatus.available,
      cached: true,
      age: Math.floor((Date.now() - cachedStatus.timestamp) / 1000)
    });
  }

  // Kör health check
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    // Testa med en enkel bild-URL (HEAD request för att undvika att ladda hela bilden)
    const response = await fetch('https://image.pollinations.ai/models', {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    const available = response.ok;
    cachedStatus = { available, timestamp: Date.now() };
    
    return NextResponse.json({ 
      available,
      cached: false,
      age: 0
    });
  } catch (error) {
    cachedStatus = { available: false, timestamp: Date.now() };
    
    return NextResponse.json({ 
      available: false,
      cached: false,
      age: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
