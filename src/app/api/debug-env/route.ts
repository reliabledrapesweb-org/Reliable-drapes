import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils/url';

export async function GET() {
  // Only allow in development or with a secret key for security
  const isDev = process.env.NODE_ENV === 'development';
  const debugKey = process.env.DEBUG_KEY;
  
  if (!isDev && !debugKey) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    baseUrl: getBaseUrl(),
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(envInfo);
}