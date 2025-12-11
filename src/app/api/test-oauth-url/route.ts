import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils/url';

export async function GET() {
  const baseUrl = getBaseUrl();
  const redirectUrl = `${baseUrl}/`;
  
  return NextResponse.json({
    baseUrl,
    redirectUrl,
    env: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV
    }
  });
}