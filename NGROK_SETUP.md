# QuickBooks Test App with ngrok Setup

This guide explains how to use ngrok to create a consistent public URL for your QuickBooks Test App during development.

## Prerequisites

1. Install ngrok from [ngrok.com/download](https://ngrok.com/download)
2. Make sure Node.js is installed on your system

## Setup Instructions

### 1. Install ngrok

Download and install ngrok from [ngrok.com/download](https://ngrok.com/download).

### 2. Run the Development Environment

We've created a simple batch script that starts both your Next.js app and ngrok tunnel:

```bash
# Simply run the batch file
start-dev.bat
```

This will:
1. Start your Next.js development server
2. Start ngrok with a consistent subdomain (quickbooks-test-app.ngrok.io)
3. Update your .env file with the correct URLs
4. Display the QuickBooks configuration information

### 3. Configure QuickBooks Developer Portal

Use the information displayed in the ngrok terminal to configure your QuickBooks app:

1. **Host Domain**: quickbooks-test-app.ngrok.io
2. **Launch URL**: https://quickbooks-test-app.ngrok.io/quickbooks/connect
3. **Disconnect URL**: https://quickbooks-test-app.ngrok.io/quickbooks/disconnect
4. **Redirect URI**: https://quickbooks-test-app.ngrok.io/api/auth/callback/quickbooks
5. **Terms of Service URL**: https://quickbooks-test-app.ngrok.io/terms
6. **Privacy Policy URL**: https://quickbooks-test-app.ngrok.io/privacy

## Important Notes

1. **Consistent Subdomain**: The script attempts to use a consistent subdomain (quickbooks-test-app), but this requires a paid ngrok account. If you're using a free account, ngrok will assign a random subdomain each time.

2. **Updating URLs**: If you get a random subdomain, you'll need to update your QuickBooks app settings each time you restart ngrok.

3. **Paid ngrok Account**: For a more seamless experience, consider upgrading to a paid ngrok account, which allows you to reserve custom subdomains.

## Troubleshooting

- **"The subdomain is already in use"**: This means someone else is using the 'quickbooks-test-app' subdomain. The script will fall back to using a random subdomain.

- **"ngrok not found"**: Make sure ngrok is installed and added to your system PATH.

- **Authentication errors**: Ensure your .env file has been updated with the correct ngrok URLs and that your QuickBooks app settings match exactly.

## Manual ngrok Usage

If you prefer to run ngrok manually:

```bash
# Start ngrok with your auth token
ngrok http 3000 --subdomain=quickbooks-test-app
```

Then update your .env file and QuickBooks app settings with the displayed URL. 