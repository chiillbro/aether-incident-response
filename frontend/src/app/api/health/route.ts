// frontend/src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // No auth needed for health check
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() }, { status: 200 });
}