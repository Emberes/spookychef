import { NextResponse } from 'next/server';
import personas from '@/data/personas_pool.json';

export async function GET() {
  const randomIndex = Math.floor(Math.random() * personas.length);
  const persona = personas[randomIndex];
  return NextResponse.json(persona);
}
