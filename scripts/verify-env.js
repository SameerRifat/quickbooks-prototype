// scripts/verify-env.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('=== Environment Variables ===');
console.log('QUICKBOOKS_CLIENT_ID:', process.env.QUICKBOOKS_CLIENT_ID ? '✓ Set' : '✗ Not set');
console.log('QUICKBOOKS_CLIENT_SECRET:', process.env.QUICKBOOKS_CLIENT_SECRET ? '✓ Set' : '✗ Not set');
console.log('QUICKBOOKS_ENVIRONMENT:', process.env.QUICKBOOKS_ENVIRONMENT);
console.log('QUICKBOOKS_REDIRECT_URI:', process.env.QUICKBOOKS_REDIRECT_URI);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Not set');
console.log('===============================');

// Check if the redirect URI in the environment matches what's in the QuickBooks Developer Portal
console.log('\n=== Redirect URI Check ===');
console.log('Make sure the redirect URI in your QuickBooks Developer Portal matches:');
console.log(process.env.QUICKBOOKS_REDIRECT_URI);
console.log('=============================');

// Verify that the .env file exists and has the required variables
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('\n=== .env File Check ===');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('File exists:', '✓');
  console.log('Contains QUICKBOOKS_REDIRECT_URI:', envContent.includes('QUICKBOOKS_REDIRECT_URI=') ? '✓' : '✗');
  console.log('Contains NEXTAUTH_URL:', envContent.includes('NEXTAUTH_URL=') ? '✓' : '✗');
  console.log('=======================');
} else {
  console.log('\n=== .env File Check ===');
  console.log('File exists:', '✗');
  console.log('=======================');
}

// Provide instructions for fixing common issues
console.log('\n=== Troubleshooting Tips ===');
console.log('1. Make sure the redirect URI in your QuickBooks Developer Portal exactly matches the QUICKBOOKS_REDIRECT_URI in your .env file.');
console.log('2. Ensure your localtunnel or ngrok is running and accessible.');
console.log('3. Check that your .env file is being loaded correctly.');
console.log('4. Verify that the NEXTAUTH_URL is set to your public URL.');
console.log('5. If using localtunnel, make sure it\'s using the same subdomain each time.');
console.log('============================'); 