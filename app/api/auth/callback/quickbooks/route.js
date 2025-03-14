import { NextResponse } from "next/server";
import OAuthClient from "intuit-oauth";
import { cookies } from "next/headers";

// Helper function to handle the callback logic
async function handleCallback(request) {
  try {
    console.log("QuickBooks callback received");
    const url = new URL(request.url);
    const { searchParams } = url;
    const code = searchParams.get("code");
    const realmId = searchParams.get("realmId");
    const state = searchParams.get("state");

    console.log("Callback parameters:", { code: !!code, realmId: !!realmId, state });

    if (!code || !realmId) {
      console.error("Missing required parameters:", { code: !!code, realmId: !!realmId });
      return NextResponse.redirect(new URL("/quickbooks/error?message=Missing+required+parameters", process.env.NEXTAUTH_URL));
    }

    // Initialize the OAuth client
    const oauthClient = new OAuthClient({
      clientId: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
      environment: process.env.QUICKBOOKS_ENVIRONMENT,
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
    });

    // Exchange the authorization code for tokens
    console.log("Exchanging authorization code for tokens");
    try {
      // Use the authorization code directly instead of the full URL
      console.log("Using authorization code for token exchange:", code);
      
      // Important: Pass the full URL to createToken instead of setting token separately
      // This is the key fix - the library needs the full URL with the code parameter
      const authResponse = await oauthClient.createToken(request.url);
      const tokens = authResponse.getJson();
      
      console.log("Tokens received:", { 
        access_token: !!tokens.access_token, 
        refresh_token: !!tokens.refresh_token,
        expires_in: tokens.expires_in
      });

      // Store the tokens and realmId in cookies (in a real app, you'd use a more secure method)
      const cookieStore = cookies();
      
      // Make sure to await the cookie operations
      await cookieStore.set("qbo_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: tokens.expires_in,
        path: "/",
      });
      
      await cookieStore.set("qbo_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      
      await cookieStore.set("qbo_realm_id", realmId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      console.log("Redirecting to dashboard");
      // Redirect to the dashboard using the NEXTAUTH_URL environment variable
      const baseUrl = process.env.NEXTAUTH_URL || url.origin;
      return NextResponse.redirect(new URL("/quickbooks/dashboard", baseUrl));
    } catch (error) {
      console.error("Token exchange error:", error);
      // Check if the error response contains HTML
      if (error.message && error.message.includes('<!DOCTYPE')) {
        console.error("Received HTML response instead of JSON. This often indicates an invalid redirect URI or authentication issue.");
        console.error("Make sure the redirect URI in your QuickBooks Developer account matches exactly:", process.env.QUICKBOOKS_REDIRECT_URI);
      }
      const errorMessage = encodeURIComponent(error.message || "Unknown error");
      const baseUrl = process.env.NEXTAUTH_URL || url.origin;
      return NextResponse.redirect(new URL(`/quickbooks/error?message=${errorMessage}`, baseUrl));
    }
  } catch (error) {
    console.error("QuickBooks callback error:", error);
    const errorMessage = encodeURIComponent(error.message || "Unknown error");
    const url = new URL(request.url);
    const baseUrl = process.env.NEXTAUTH_URL || url.origin;
    return NextResponse.redirect(new URL(`/quickbooks/error?message=${errorMessage}`, baseUrl));
  }
}

// Export both GET and POST handlers using the same logic
export async function GET(request) {
  return handleCallback(request);
}

export async function POST(request) {
  return handleCallback(request);
} 