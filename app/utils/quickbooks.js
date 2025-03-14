import { cookies } from "next/headers";
import OAuthClient from "intuit-oauth";
import QuickBooks from "node-quickbooks";

// Helper function to get a QuickBooks client with the current access token
export async function getQuickBooksClient() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("qbo_access_token")?.value;
  const refreshToken = cookieStore.get("qbo_refresh_token")?.value;
  const realmId = cookieStore.get("qbo_realm_id")?.value;

  if (!accessToken || !realmId) {
    throw new Error("Not authenticated with QuickBooks");
  }

  // Initialize QuickBooks client
  const qbo = new QuickBooks(
    process.env.QUICKBOOKS_CLIENT_ID,
    process.env.QUICKBOOKS_CLIENT_SECRET,
    accessToken,
    false, // no OAuth version 1
    realmId,
    process.env.QUICKBOOKS_ENVIRONMENT === "sandbox", // sandbox?
    true, // debug?
    null, // minor version
    "2.0", // OAuth version
    refreshToken // refresh token
  );

  return qbo;
}

// Helper function to refresh the access token
export async function refreshAccessToken() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("qbo_refresh_token")?.value;

  if (!refreshToken) {
    throw new Error("No refresh token available");
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

  return tokens.access_token;
}

// Helper function to handle API requests with token refresh
export async function withTokenRefresh(apiCall) {
  try {
    // First try with the current token
    return await apiCall();
  } catch (error) {
    // If the token is expired, refresh it and try again
    if (error.message.includes("token expired") || error.message.includes("unauthorized")) {
      const newAccessToken = await refreshAccessToken();
      // Try again with the new token
      return await apiCall(newAccessToken);
    }
    // If it's not a token issue, rethrow the error
    throw error;
  }
} 