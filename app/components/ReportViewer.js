import React, { useState, useEffect } from 'react';
import { reportToCsv, reportToHtml } from '../utils/reportHelpers';

const ReportViewer = ({ isConnected }) => {
  const [reportType, setReportType] = useState('ProfitAndLoss');
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportTypes = [
    { id: 'ProfitAndLoss', name: 'Profit and Loss' },
    { id: 'BalanceSheet', name: 'Balance Sheet' },
    { id: 'CashFlow', name: 'Cash Flow' },
    { id: 'TrialBalance', name: 'Trial Balance' },
    { id: 'SalesByCustomer', name: 'Sales by Customer' },
    { id: 'InventoryValuation', name: 'Inventory Valuation' },
    { id: 'AgedReceivables', name: 'Aged Receivables' },
    { id: 'AgedPayables', name: 'Aged Payables' },
  ];

  const fetchReport = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    setReport(null);
    
    try {
      const queryParams = new URLSearchParams({
        type: reportType,
        startDate,
        endDate
      }).toString();
      
      const response = await fetch(`/api/quickbooks/reports?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Report fetched successfully:', reportType);
        setReport(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching report:', errorData);
        setError(errorData.error || `Failed to fetch ${reportType} report`);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setError(error.message || `Failed to fetch ${reportType} report`);
    } finally {
      setIsLoading(false);
    }
  };

  // Export report as CSV
  const exportCsv = () => {
    if (!report) return;
    
    const csvContent = reportToCsv(report);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.Header?.ReportName || reportType}_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export report as PDF (using HTML conversion and print dialog)
  const exportPdf = () => {
    if (!report) return;
    
    const htmlContent = reportToHtml(report);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${report.Header?.ReportName || reportType}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper function to render the report based on its structure
  const renderReport = () => {
    if (!report || !report.Rows || !report.Rows.Row) {
      return <div className="text-gray-500">No report data available.</div>;
    }

    // Extract header information
    const header = report.Header || {};
    const columns = report.Columns?.Column || [];
    const rows = report.Rows.Row || [];

    return (
      <div className="space-y-4">
        {/* Report Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold">{header.ReportName}</h3>
          <p className="text-sm text-gray-600">
            {header.StartPeriod && header.EndPeriod 
              ? `${header.StartPeriod} to ${header.EndPeriod}` 
              : header.ReportPeriod || header.ReportDate || ''}
          </p>
          {header.ReportBasis && (
            <p className="text-sm text-gray-600">Basis: {header.ReportBasis}</p>
          )}
        </div>

        {/* Export Options */}
        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={exportCsv}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={exportPdf}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Export PDF
          </button>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Headers */}
            {columns.length > 0 && (
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th 
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.ColTitle || column.ColType}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            
            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {renderReportRows(rows)}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper function to recursively render report rows
  const renderReportRows = (rows) => {
    if (!rows || !rows.length) return null;

    return rows.map((row, index) => {
      // Check if this is a summary or header row
      const isHeader = row.type === 'Section' || row.type === 'Header';
      const isSummary = row.type === 'Section' || row.type === 'Summary';
      
      return (
        <React.Fragment key={index}>
          {/* Render the current row */}
          <tr className={`${isHeader ? 'bg-gray-50 font-semibold' : ''} ${isSummary ? 'font-semibold' : ''}`}>
            {row.ColData && row.ColData.map((col, colIndex) => (
              <td 
                key={colIndex}
                className={`px-6 py-4 whitespace-nowrap text-sm ${colIndex === 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                style={{ paddingLeft: `${(row.indent || 0) * 20 + 24}px` }}
              >
                {col.value}
              </td>
            ))}
          </tr>
          
          {/* Recursively render child rows if they exist */}
          {row.Rows && row.Rows.Row && renderReportRows(row.Rows.Row)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">QuickBooks Reports</h2>
      
      {!isConnected ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          <p>You need to connect to QuickBooks to generate reports.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Report Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={['AgedReceivables', 'AgedPayables'].includes(reportType)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchReport}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {isLoading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-5/6 mb-2"></div>
            </div>
          )}
          
          {/* Report Display */}
          {report && !isLoading && renderReport()}
        </div>
      )}
    </div>
  );
};

// Helper functions to get default date ranges
function getDefaultStartDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1); // Default to 1 month ago
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

function getDefaultEndDate() {
  return new Date().toISOString().split('T')[0]; // Today formatted as YYYY-MM-DD
}

export default ReportViewer; 