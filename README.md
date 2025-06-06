# QuickBooks Test App

A Next.js application that integrates with QuickBooks Online API.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm
- ngrok (download from [ngrok.com/download](https://ngrok.com/download))

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Make sure ngrok is installed and in your PATH

### Development

#### Option 1: Run with ngrok (Recommended for QuickBooks Integration)

This will start both the Next.js development server and ngrok tunnel in a single command:

```bash
npm run dev:ngrok
```

The script will:
- Start the Next.js development server
- Configure ngrok with your auth token
- Start an ngrok tunnel to expose your local server
- Update your .env file with the correct URLs
- Display the QuickBooks configuration information

#### Option 2: Standard Development

If you don't need the QuickBooks integration, you can run the standard development server:

```bash
npm run dev
```

### QuickBooks Configuration

After running `npm run dev:ngrok`, you'll see the QuickBooks configuration information in the console. Use these values to configure your QuickBooks app in the Intuit Developer Portal:

1. **Host Domain**: The ngrok domain (e.g., quickbooks-test-app.ngrok.io)
2. **Launch URL**: The URL for connecting to QuickBooks
3. **Disconnect URL**: The URL for disconnecting from QuickBooks
4. **Redirect URI**: The callback URL for OAuth authentication
5. **Terms of Service URL**: URL to your terms of service page
6. **Privacy Policy URL**: URL to your privacy policy page

## Important Notes

- Free ngrok accounts get random subdomains each time you restart ngrok
- If you get a random subdomain, you'll need to update your QuickBooks app settings each time
- For a more seamless experience, consider upgrading to a paid ngrok account

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [QuickBooks API Documentation](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/account)
- [ngrok Documentation](https://ngrok.com/docs)
#   q u i c k b o o k s - p r o t o t y p e  
 