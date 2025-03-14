'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

const QuickBooksConnectPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(error || '');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Get the base URL from the server-side environment variable
    // This will ensure we're using the correct URL for the callback
    fetch('/api/get-base-url')
      .then(res => res.json())
      .then(data => {
        setBaseUrl(data.baseUrl);
      })
      .catch(err => {
        console.error('Error fetching base URL:', err);
        // Fallback to window.location.origin if API call fails
        setBaseUrl(window.location.origin);
      });
  }, []);

  const handleConnect = async () => {
    try {
      setErrorMessage('');
      setIsConnecting(true);
      console.log('Initiating QuickBooks OAuth flow...');
      
      // Use the baseUrl from the server or fallback to window.location.origin
      const callbackUrl = `${baseUrl || window.location.origin}/quickbooks/dashboard`;
      console.log('Using callback URL:', callbackUrl);
      
      // Use NextAuth's signIn function with the quickbooks provider
      // This will redirect to QuickBooks authorization page
      await signIn('quickbooks', { 
        callbackUrl,
        redirect: true
      });
      
      // Note: The code won't reach here because signIn will redirect the browser
    } catch (error) {
      setIsConnecting(false);
      console.error('Error connecting to QuickBooks:', error);
      setErrorMessage(error.message || 'Failed to connect to QuickBooks');
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Connecting to QuickBooks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Connect to QuickBooks</h1>
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            Error: {errorMessage}
          </div>
        )}
        
        <p className="mb-6 text-gray-600">
          Connect your QuickBooks Online account to access your financial data within this application.
        </p>
        
        <button
          onClick={handleConnect}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
          disabled={isConnecting}
        >
          Connect to QuickBooks
        </button>
      </div>
    </div>
  );
};

export default QuickBooksConnectPage; 