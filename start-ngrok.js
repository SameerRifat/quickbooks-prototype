const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3000;
const SUBDOMAIN = 'quickbooks-test-app'; // This will be your consistent subdomain
const AUTH_TOKEN = '2uIsGomdM1yuuVuMITrRI2nwQwH_aGs3VFyBihM41nKXjqDh';

// Function to check if ngrok is installed
function isNgrokInstalled() {
  try {
    execSync('ngrok --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to install ngrok if not installed
function installNgrok() {
  console.log('ngrok is not installed. Installing...');
  
  try {
    // For Windows
    if (process.platform === 'win32') {
      console.log('Please install ngrok manually from https://ngrok.com/download');
      console.log('After installing, run this script again.');
      process.exit(1);
    } 
    // For macOS/Linux
    else {
      execSync('npm install -g ngrok', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Failed to install ngrok:', error.message);
    process.exit(1);
  }
}

// Function to configure ngrok with auth token
function configureNgrok() {
  try {
    console.log('Configuring ngrok with your auth token...');
    execSync(`ngrok config add-authtoken ${AUTH_TOKEN}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to configure ngrok:', error.message);
    process.exit(1);
  }
}

// Function to start ngrok with a fixed subdomain
function startNgrok() {
  try {
    console.log(`Starting ngrok with subdomain: ${SUBDOMAIN}`);
    console.log(`Your application will be available at: https://${SUBDOMAIN}.ngrok.io`);
    console.log('Press Ctrl+C to stop the tunnel');
    
    // Start ngrok with the specified subdomain
    execSync(`ngrok http ${PORT} --subdomain=${SUBDOMAIN}`, { stdio: 'inherit' });
  } catch (error) {
    if (error.message.includes('failed to start')) {
      console.error('Failed to start ngrok. The subdomain might be taken or you need a paid plan for custom subdomains.');
      console.log('Trying with a random subdomain instead...');
      execSync(`ngrok http ${PORT}`, { stdio: 'inherit' });
    } else {
      console.error('Error starting ngrok:', error.message);
    }
  }
}

// Function to update .env file with ngrok URL
function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.warn('.env file not found. Skipping environment variable update.');
    return;
  }
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update the redirect URI and NextAuth URL
    const ngrokUrl = `https://${SUBDOMAIN}.ngrok.io`;
    
    // Replace or add QUICKBOOKS_REDIRECT_URI
    if (envContent.includes('QUICKBOOKS_REDIRECT_URI=')) {
      envContent = envContent.replace(
        /QUICKBOOKS_REDIRECT_URI=.*/,
        `QUICKBOOKS_REDIRECT_URI=${ngrokUrl}/api/auth/callback/quickbooks`
      );
    } else {
      envContent += `\nQUICKBOOKS_REDIRECT_URI=${ngrokUrl}/api/auth/callback/quickbooks`;
    }
    
    // Replace or add NEXTAUTH_URL
    if (envContent.includes('NEXTAUTH_URL=')) {
      envContent = envContent.replace(
        /NEXTAUTH_URL=.*/,
        `NEXTAUTH_URL=${ngrokUrl}`
      );
    } else {
      envContent += `\nNEXTAUTH_URL=${ngrokUrl}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('Updated .env file with ngrok URL');
    
    // Display QuickBooks configuration information
    console.log('\n=== QuickBooks Configuration Information ===');
    console.log(`Host Domain: ${SUBDOMAIN}.ngrok.io`);
    console.log(`Launch URL: ${ngrokUrl}/quickbooks/connect`);
    console.log(`Disconnect URL: ${ngrokUrl}/quickbooks/disconnect`);
    console.log(`Redirect URI: ${ngrokUrl}/api/auth/callback/quickbooks`);
    console.log('=======================================\n');
    
  } catch (error) {
    console.error('Failed to update .env file:', error.message);
  }
}

// Main function
async function main() {
  console.log('Starting ngrok tunnel for your QuickBooks Test App...');
  
  // Check if ngrok is installed
  if (!isNgrokInstalled()) {
    installNgrok();
  }
  
  // Configure ngrok with auth token
  configureNgrok();
  
  // Update .env file with ngrok URL
  updateEnvFile();
  
  // Start ngrok
  startNgrok();
}

// Run the main function
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
}); 