import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OAuthClient from "intuit-oauth";

export async function POST() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("qbo_access_token")?.value;
    const refreshToken = cookieStore.get("qbo_refresh_token")?.value;

    if (accessToken && refreshToken) {
      // Initialize the OAuth client
      const oauthClient = new OAuthClient({
        clientId: process.env.QUICKBOOKS_CLIENT_ID,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
        environment: process.env.QUICKBOOKS_ENVIRONMENT,
        redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
      });

      // Set the tokens in the client
      oauthClient.setToken({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      // Revoke the tokens
      await oauthClient.revoke();
    }

    // Clear the cookies
    cookieStore.delete("qbo_access_token");
    cookieStore.delete("qbo_refresh_token");
    cookieStore.delete("qbo_realm_id");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting from QuickBooks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to disconnect from QuickBooks" },
      { status: 500 }
    );
  }
} 