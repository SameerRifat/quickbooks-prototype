import React from 'react';
import { signIn } from 'next-auth/react';

const QuickBooksConnect = ({ isConnected, onDisconnect }) => {
  const handleConnect = async () => {
    await signIn('quickbooks', { callbackUrl: '/quickbooks/dashboard' });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">QuickBooks Connection</h2>
      
      {isConnected ? (
        <div>
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Connected to QuickBooks</span>
          </div>
          <button
            onClick={onDisconnect}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Disconnect from QuickBooks
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Not connected to QuickBooks</span>
          </div>
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Connect to QuickBooks
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickBooksConnect; 