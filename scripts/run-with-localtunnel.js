// scripts/run-with-localtunnel.js
const { spawn } = require('child_process');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3000;
const SUBDOMAIN = 'quickbooks-test-app'; // Your preferred subdomain

// Function to check if localtunnel is installed
function isLocaltunnelInstalled() {
  try {
    execSync('lt --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to install localtunnel if not installed
function installLocaltunnel() {
  console.log('localtunnel is not installed. Installing now...');
  try {
    execSync('npm install -g localtunnel', { stdio: 'inherit' });
    console.log('localtunnel installed successfully.');
    return true;
  } catch (error) {
    console.error('Failed to install localtunnel:', error.message);
    console.log('Please install localtunnel manually: npm install -g localtunnel');
    process.exit(1);
  }
}

// Function to update .env file with localtunnel URL
function updateEnvFile(ltUrl) {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.warn('.env file not found. Creating a new one...');
    fs.writeFileSync(envPath, '');
  }
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace or add QUICKBOOKS_REDIRECT_URI
    if (envContent.includes('QUICKBOOKS_REDIRECT_URI=')) {
      envContent = envContent.replace(
        /QUICKBOOKS_REDIRECT_URI=.*/,
        `QUICKBOOKS_REDIRECT_URI=${ltUrl}/api/auth/callback/quickbooks`
      );
    } else {
      envContent += `\nQUICKBOOKS_REDIRECT_URI=${ltUrl}/api/auth/callback/quickbooks`;
    }
    
    // Replace or add NEXTAUTH_URL
    if (envContent.includes('NEXTAUTH_URL=')) {
      envContent = envContent.replace(
        /NEXTAUTH_URL=.*/,
        `NEXTAUTH_URL=${ltUrl}`
      );
    } else {
      envContent += `\nNEXTAUTH_URL=${ltUrl}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('Updated .env file with localtunnel URL');
    
  } catch (error) {
    console.error('Failed to update .env file:', error.message);
  }
}

// Function to display QuickBooks configuration information
function displayQuickBooksConfig(ltUrl) {
  console.log('\n=== QuickBooks Configuration Information ===');
  console.log(`Host Domain: ${new URL(ltUrl).host}`);
  console.log(`Launch URL: ${ltUrl}/quickbooks/connect`);
  console.log(`Disconnect URL: ${ltUrl}/quickbooks/disconnect`);
  console.log(`Redirect URI: ${ltUrl}/api/auth/callback/quickbooks`);
  console.log(`Terms of Service URL: ${ltUrl}/terms`);
  console.log(`Privacy Policy URL: ${ltUrl}/privacy`);
  console.log('=======================================\n');
}

// Main function
async function main() {
  console.log('Starting QuickBooks Test App with localtunnel...');
  
  // Check if localtunnel is installed
  if (!isLocaltunnelInstalled()) {
    installLocaltunnel();
  }
  
  // Start Next.js
  console.log('Starting Next.js development server...');
  const nextProcess = spawn('npm', ['run', 'dev'], { 
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true
  });
  
  // Handle Next.js process
  nextProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  nextProcess.on('error', (error) => {
    console.error('Failed to start Next.js:', error.message);
    process.exit(1);
  });
  
  // Wait for Next.js to start
  console.log('Waiting for Next.js to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Start localtunnel
  console.log('Starting localtunnel...');
  let ltUrl = null;
  
  // Try with custom subdomain first
  console.log(`Attempting to use subdomain: ${SUBDOMAIN}`);
  const ltProcess = spawn('lt', ['--port', PORT.toString(), '--subdomain', SUBDOMAIN], {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true
  });
  
  // Handle localtunnel output
  ltProcess.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(data);
    
    // Extract the localtunnel URL
    const match = output.match(/your url is: (https:\/\/[^\s]+)/i);
    if (match && match[1] && !ltUrl) {
      ltUrl = match[1];
      updateEnvFile(ltUrl);
      displayQuickBooksConfig(ltUrl);
      console.log(`\nYour public URL: ${ltUrl}`);
    }
  });
  
  // Handle process exit
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    ltProcess.kill();
    nextProcess.kill();
    process.exit(0);
  });
}

// Run the main function
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});