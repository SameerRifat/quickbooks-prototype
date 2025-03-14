'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import QuickBooksConnect from '../../components/QuickBooksConnect';
import CustomersList from '../../components/CustomersList';
import InvoicesList from '../../components/InvoicesList';
import ReportViewer from '../../components/ReportViewer';

export const dynamic = 'force-dynamic';

function DashboardContent() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [customers, setCustomers] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [customersError, setCustomersError] = useState(null);
  const [invoicesError, setInvoicesError] = useState(null);
  const [activeTab, setActiveTab] = useState('customers');

  const fetchInvoices = useCallback(async () => {
    if (!isConnected) return;
    
    setLoadingInvoices(true);
    setInvoicesError(null);
    
    try {
      console.log('Fetching QuickBooks invoices...');
      const response = await fetch('/api/quickbooks/invoices');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Invoices fetched successfully');
        setInvoices(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching invoices:', errorData);
        setInvoicesError(errorData.error || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoicesError(error.message || 'Failed to fetch invoices');
    } finally {
      setLoadingInvoices(false);
    }
  }, [isConnected]);

  // Check if connected to QuickBooks
  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingConnection(true);
      try {
        console.log('Checking QuickBooks connection...');
        const response = await fetch('/api/quickbooks/customers');
        console.log('Connection check response:', response.status);
        
        if (response.ok) {
          setIsConnected(true);
          const data = await response.json();
          setCustomers(data);
          fetchInvoices();
        } else {
          console.log('Not connected to QuickBooks');
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error checking QuickBooks connection:', error);
        setIsConnected(false);
      } finally {
        setIsCheckingConnection(false);
      }
    };

    checkConnection();
  }, [fetchInvoices]);

  const fetchCustomers = async () => {
    if (!isConnected) return;
    
    setLoadingCustomers(true);
    setCustomersError(null);
    
    try {
      console.log('Fetching QuickBooks customers...');
      const response = await fetch('/api/quickbooks/customers');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Customers fetched successfully');
        setCustomers(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching customers:', errorData);
        setCustomersError(errorData.error || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomersError(error.message || 'Failed to fetch customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting from QuickBooks...');
      const response = await fetch('/api/quickbooks/disconnect', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('Successfully disconnected from QuickBooks');
        setIsConnected(false);
        setCustomers(null);
        setInvoices(null);
        router.push('/');
      } else {
        console.error('Error disconnecting from QuickBooks');
      }
    } catch (error) {
      console.error('Error disconnecting from QuickBooks:', error);
    }
  };

  if (isCheckingConnection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Checking QuickBooks connection...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">QuickBooks Dashboard</h1>
      
      <div className="mb-6">
        <QuickBooksConnect 
          isConnected={isConnected} 
          onDisconnect={handleDisconnect} 
        />
      </div>
      
      {isConnected ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('customers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reports
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'customers' && (
            <CustomersList 
              customers={customers} 
              isLoading={loadingCustomers} 
              error={customersError} 
            />
          )}
          
          {activeTab === 'invoices' && (
            <InvoicesList 
              invoices={invoices} 
              isLoading={loadingInvoices} 
              error={invoicesError} 
            />
          )}
          
          {activeTab === 'reports' && (
            <ReportViewer isConnected={isConnected} />
          )}
        </div>
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          <p>You are not connected to QuickBooks. Please connect to view your financial data.</p>
        </div>
      )}
    </div>
  );
}

const QuickBooksDashboard = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default QuickBooksDashboard; 