/**
 * Utility functions for working with QuickBooks reports
 */

/**
 * Formats a currency value for display
 * @param {number|string} value - The currency value to format
 * @param {string} currencyCode - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currencyCode = 'USD') {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Formats a date string for display
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Extracts a specific column value from a report row
 * @param {Object} row - The report row
 * @param {string} colType - The column type to extract
 * @returns {string} The column value
 */
export function getColumnValue(row, colType) {
  if (!row || !row.ColData) return '';
  
  const col = row.ColData.find(col => col.id === colType || col.type === colType);
  return col ? col.value : '';
}

/**
 * Generates a CSV string from a QuickBooks report
 * @param {Object} report - The QuickBooks report object
 * @returns {string} CSV formatted string
 */
export function reportToCsv(report) {
  if (!report || !report.Rows || !report.Rows.Row) {
    return '';
  }
  
  const header = report.Header || {};
  const columns = report.Columns?.Column || [];
  const rows = report.Rows.Row || [];
  
  // Create header row with column titles
  const headerRow = columns.map(col => `"${col.ColTitle || col.ColType}"`).join(',');
  
  // Process all rows recursively
  const processedRows = [];
  processRows(rows, processedRows);
  
  // Join all rows with newlines
  return [
    `"${header.ReportName}"`,
    `"${header.StartPeriod || ''} to ${header.EndPeriod || ''}"`,
    '',
    headerRow,
    ...processedRows
  ].join('\n');
}

/**
 * Helper function to recursively process report rows for CSV export
 * @param {Array} rows - The rows to process
 * @param {Array} result - The array to store results
 * @param {number} level - The current nesting level
 */
function processRows(rows, result, level = 0) {
  if (!rows || !rows.length) return;
  
  rows.forEach(row => {
    // Skip header rows if needed
    if (row.type !== 'Header') {
      const indent = '  '.repeat(level);
      
      // Process the current row
      if (row.ColData) {
        const rowValues = row.ColData.map(col => {
          // Add indentation to the first column
          const value = col.value || '';
          return col.id === 'account' || col.id === 'name' 
            ? `"${indent}${value}"`
            : `"${value}"`;
        });
        
        result.push(rowValues.join(','));
      }
    }
    
    // Recursively process child rows
    if (row.Rows && row.Rows.Row) {
      processRows(row.Rows.Row, result, level + 1);
    }
  });
}

/**
 * Generates a PDF-friendly HTML representation of a QuickBooks report
 * @param {Object} report - The QuickBooks report object
 * @returns {string} HTML string
 */
export function reportToHtml(report) {
  if (!report || !report.Rows || !report.Rows.Row) {
    return '<div>No report data available.</div>';
  }
  
  const header = report.Header || {};
  const columns = report.Columns?.Column || [];
  const rows = report.Rows.Row || [];
  
  // Create HTML header
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 5px;">${header.ReportName || 'QuickBooks Report'}</h2>
        <p style="color: #666; margin: 0;">
          ${header.StartPeriod && header.EndPeriod 
            ? `${header.StartPeriod} to ${header.EndPeriod}` 
            : header.ReportPeriod || header.ReportDate || ''}
        </p>
        ${header.ReportBasis 
          ? `<p style="color: #666; margin: 0;">Basis: ${header.ReportBasis}</p>` 
          : ''}
      </div>
  `;
  
  // Create table
  html += `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background-color: #f3f4f6; text-align: left;">
          ${columns.map(col => 
            `<th style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${col.ColTitle || col.ColType}</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  // Process rows recursively
  html += processRowsHtml(rows);
  
  // Close table and container
  html += `
      </tbody>
    </table>
  </div>
  `;
  
  return html;
}

/**
 * Helper function to recursively process report rows for HTML export
 * @param {Array} rows - The rows to process
 * @param {number} level - The current nesting level
 * @returns {string} HTML string for the rows
 */
function processRowsHtml(rows, level = 0) {
  if (!rows || !rows.length) return '';
  
  let html = '';
  
  rows.forEach(row => {
    // Determine row styling
    const isHeader = row.type === 'Section' || row.type === 'Header';
    const isSummary = row.type === 'Section' || row.type === 'Summary';
    const rowStyle = isHeader 
      ? 'background-color: #f9fafb; font-weight: 600;' 
      : isSummary 
        ? 'font-weight: 600;' 
        : '';
    
    // Process the current row
    if (row.ColData) {
      html += `<tr style="${rowStyle}">`;
      
      row.ColData.forEach((col, colIndex) => {
        const paddingLeft = colIndex === 0 ? (level * 20 + 10) : 10;
        const cellStyle = `padding: 8px; padding-left: ${paddingLeft}px; border-bottom: 1px solid #e5e7eb;`;
        
        html += `<td style="${cellStyle}">${col.value || ''}</td>`;
      });
      
      html += `</tr>`;
    }
    
    // Recursively process child rows
    if (row.Rows && row.Rows.Row) {
      html += processRowsHtml(row.Rows.Row, level + 1);
    }
  });
  
  return html;
} 