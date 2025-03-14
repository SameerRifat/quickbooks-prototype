import React from 'react';
import Link from 'next/link';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Your App</h1>
        
        <p className="mb-6 text-gray-600">
          This application integrates with QuickBooks Online to help you manage your financial data.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/quickbooks/connect" 
            className="block w-full py-2 px-4 bg-blue-500 text-white rounded text-center hover:bg-blue-600 transition-colors"
          >
            Connect to QuickBooks
          </Link>
          
          <Link 
            href="/quickbooks/dashboard" 
            className="block w-full py-2 px-4 bg-green-500 text-white rounded text-center hover:bg-green-600 transition-colors"
          >
            QuickBooks Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;