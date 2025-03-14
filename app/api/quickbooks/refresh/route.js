import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OAuthClient from "intuit-oauth";

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("qbo_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token available" },
        { status: 401 }
      );
    }

    // Initialize the OAuth client
    const oauthClient = new OAuthClient({
      clientId: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
      environment: process.env.QUICKBOOKS_ENVIRONMENT,
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
    });

    // Set the refresh token
    oauthClient.setToken({
      refresh_token: refreshToken,
    });

    // Refresh the token
    const authResponse = await oauthClient.refresh();
    const tokens = authResponse.getJson();

    // Update the cookies with the new tokens
    cookieStore.set("qbo_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokens.expires_in,
      path: "/",
    });

    if (tokens.refresh_token) {
      cookieStore.set("qbo_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error refreshing QuickBooks token:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refresh token" },
      { status: 500 }
    );
  }
} 