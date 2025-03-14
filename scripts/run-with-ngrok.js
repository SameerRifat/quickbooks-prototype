// scripts/run-with-ngrok.js
const { spawn } = require('child_process');
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
  console.log('ngrok is not installed or not in PATH.');
  console.log('Please install ngrok from https://ngrok.com/download');
  console.log('After installing, make sure it\'s in your PATH or run this script again.');
  process.exit(1);
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

// Function to update .env file with ngrok URL
function updateEnvFile(ngrokUrl) {
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
    
  } catch (error) {
    console.error('Failed to update .env file:', error.message);
  }
}

// Function to display QuickBooks configuration information
function displayQuickBooksConfig(ngrokUrl) {
  console.log('\n=== QuickBooks Configuration Information ===');
  console.log(`Host Domain: ${new URL(ngrokUrl).host}`);
  console.log(`Launch URL: ${ngrokUrl}/quickbooks/connect`);
  console.log(`Disconnect URL: ${ngrokUrl}/quickbooks/disconnect`);
  console.log(`Redirect URI: ${ngrokUrl}/api/auth/callback/quickbooks`);
  console.log(`Terms of Service URL: ${ngrokUrl}/terms`);
  console.log(`Privacy Policy URL: ${ngrokUrl}/privacy`);
  console.log('=======================================\n');
}

// Function to extract ngrok URL from output
function extractNgrokUrl(data) {
  const output = data.toString();
  const match = output.match(/Forwarding\s+(https:\/\/[^\s]+)\s+->/) || 
                output.match(/url=https:\/\/([^\.]+\.ngrok\.io)/);
  
  if (match && match[1]) {
    return match[1].startsWith('https://') ? match[1] : `https://${match[1]}`;
  }
  return null;
}

// Main function
async function main() {
  console.log('Starting QuickBooks Test App with ngrok...');
  
  // Check if ngrok is installed
  if (!isNgrokInstalled()) {
    installNgrok();
  }
  
  // Configure ngrok with auth token
  configureNgrok();
  
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
  
  // Start ngrok
  console.log('Starting ngrok tunnel...');
  let ngrokUrl = null;
  
  try {
    // Try with custom subdomain first
    console.log(`Attempting to use subdomain: ${SUBDOMAIN}`);
    const ngrokProcess = spawn('ngrok', ['http', PORT.toString(), '--subdomain=' + SUBDOMAIN], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });
    
    // Handle ngrok output
    ngrokProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
      
      // Try to extract the ngrok URL
      const url = extractNgrokUrl(data);
      if (url && !ngrokUrl) {
        ngrokUrl = url;
        updateEnvFile(ngrokUrl);
        displayQuickBooksConfig(ngrokUrl);
      }
    });
    
    ngrokProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
      
      // If subdomain is taken, try with random subdomain
      if (data.toString().includes('failed to start') || data.toString().includes('subdomain')) {
        console.log('Subdomain might be taken. Trying with random subdomain...');
        const randomNgrokProcess = spawn('ngrok', ['http', PORT.toString()], {
          stdio: ['inherit', 'pipe', 'pipe'],
          shell: true
        });
        
        randomNgrokProcess.stdout.on('data', (randomData) => {
          process.stdout.write(randomData);
          
          // Try to extract the ngrok URL
          const randomUrl = extractNgrokUrl(randomData);
          if (randomUrl && !ngrokUrl) {
            ngrokUrl = randomUrl;
            updateEnvFile(ngrokUrl);
            displayQuickBooksConfig(ngrokUrl);
          }
        });
        
        randomNgrokProcess.stderr.on('data', (randomError) => {
          process.stderr.write(randomError);
        });
      }
    });
    
    // Handle process exit
    process.on('SIGINT', () => {
      console.log('Shutting down...');
      ngrokProcess.kill();
      nextProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error starting ngrok:', error.message);
    console.log('Trying with random subdomain instead...');
    
    const randomNgrokProcess = spawn('ngrok', ['http', PORT.toString()], {
      stdio: 'inherit',
      shell: true
    });
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
}); 