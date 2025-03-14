import { NextResponse } from "next/server";

export async function GET() {
  // Return the NEXTAUTH_URL from the environment variables
  // This ensures we're using the correct URL for redirects
  return NextResponse.json({ 
    baseUrl: process.env.NEXTAUTH_URL || "https://quickbooks-test-app.loca.lt"
  });
} 