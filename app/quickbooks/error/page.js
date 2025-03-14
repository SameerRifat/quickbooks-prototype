'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An unknown error occurred';
  const decodedError = decodeURIComponent(errorMessage);

  useEffect(() => {
    // Log the error for debugging
    console.error('QuickBooks error:', decodedError);
  }, [decodedError]);

  // Determine if this is a JSON parsing error
  const isJsonParsingError = decodedError.includes('Unexpected token') && decodedError.includes('is not valid JSON');
  
  // Determine if this is a redirect URI mismatch
  const isRedirectUriError = decodedError.includes('redirect_uri_mismatch') || 
                            (decodedError.includes('<!DOCTYPE') && decodedError.includes('HTML'));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-red-600">QuickBooks Error</h1>
        
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          <p className="font-semibold mb-2">Error Details:</p>
          <p>{decodedError}</p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            There was an error connecting to QuickBooks. 
            {isJsonParsingError && (
              <span className="block mt-2 font-semibold">
                It appears that QuickBooks returned HTML instead of JSON. This typically happens when there&apos;s a mismatch between the redirect URI in your app and the one registered in the QuickBooks Developer Portal.
              </span>
            )}
            {isRedirectUriError && (
              <span className="block mt-2 font-semibold">
                There appears to be a redirect URI mismatch. Make sure the redirect URI in your QuickBooks Developer account exactly matches: <code className="bg-gray-100 px-1">http://localhost:3000/api/auth/callback/quickbooks</code>
              </span>
            )}
          </p>
          
          <p className="text-gray-600 mt-4">This could be due to:</p>
          <ul className="list-disc pl-5 text-gray-600 mb-6">
            <li>Invalid or expired credentials</li>
            <li>Redirect URI mismatch in QuickBooks Developer Portal</li>
            <li>Missing required permissions</li>
            <li>Connection timeout</li>
            <li>QuickBooks service unavailability</li>
          </ul>
          
          <div className="flex justify-between">
            <Link href="/" className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
              Go Home
            </Link>
            
            <Link href="/quickbooks/connect" className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const QuickBooksErrorPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading error details...</div>}>
      <ErrorContent />
    </Suspense>
  );
};

export default QuickBooksErrorPage; 