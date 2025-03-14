import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import OAuthClient from "intuit-oauth";

// Configure NextAuth
const handler = NextAuth({
  providers: [
    {
      id: "quickbooks",
      name: "QuickBooks",
      type: "oauth",
      authorization: {
        url: "https://appcenter.intuit.com/connect/oauth2",
        params: {
          client_id: process.env.QUICKBOOKS_CLIENT_ID,
          response_type: "code",
          scope: "com.intuit.quickbooks.accounting openid profile email phone address",
          redirect_uri: process.env.QUICKBOOKS_REDIRECT_URI,
          state: Math.random().toString(36).substring(7),
        },
      },
      token: {
        async request({ params, provider, checks }) {
          console.log("Token request params:", params);
          // We handle the token exchange in the callback route
          // This is just a placeholder as the actual token exchange happens in the callback route
          return { tokens: { access_token: "" } };
        },
      },
      userinfo: {
        async request() {
          // This function is not actually used since we handle user info in the callback route
          return { sub: "quickbooks-user" };
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: "QuickBooks User",
          email: "quickbooks@example.com",
        };
      },
      clientId: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.realmId = account.realmId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.realmId = token.realmId;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects use the correct base URL
      if (url.startsWith("/")) {
        // For relative URLs, use the NEXTAUTH_URL from env
        return `${process.env.NEXTAUTH_URL}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/quickbooks/connect",
    error: "/quickbooks/error",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST }; 