import { NextResponse } from "next/server";
import { getQuickBooksClient, withTokenRefresh } from "../../../utils/quickbooks";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const reportType = url.searchParams.get("type") || "ProfitAndLoss";
    const startDate = url.searchParams.get("startDate") || getDefaultStartDate();
    const endDate = url.searchParams.get("endDate") || getDefaultEndDate();
    
    console.log(`Fetching ${reportType} report from ${startDate} to ${endDate}`);
    
    // Get the QuickBooks client and handle token refresh
    const report = await withTokenRefresh(async (newToken) => {
      const qbo = await getQuickBooksClient();
      
      // Wrap the QuickBooks API call in a Promise
      return new Promise((resolve, reject) => {
        // Different report types require different API calls
        switch (reportType) {
          case "ProfitAndLoss":
            qbo.reportProfitAndLoss({ start_date: startDate, end_date: endDate }, (err, report) => {
              if (err) reject(err);
              else resolve(report);
            });
            break;
            
          case "BalanceSheet":
            qbo.reportBalanceSheet({ start_date: startDate, end_date: endDate }, (err, report) => {
              if (err) reject(err);
              else resolve(report);
            });
            break;
            
          case "CashFlow":
            qbo.reportCashFlow({ start_date: startDate, end_date: endDate }, (err, report) => {
              if (err) reject(err);
              else resolve(report);
            });
            break;
            
          case "TrialBalance":
            qbo.reportTrialBalance({ start_date: startDate, end_date: endDate }, (err, report) => {
              if (err) reject(err);
              else resolve(report);
            });
            break;
            
          case "SalesByCustomer":
            qbo.reportSalesByCustomer({ start_date: startDate, end_date: endDate }, (err, report) => {
              if (err) reject(err);
              else resolve(report);
            });
            break;
            
          case "InventoryValuation":
            qbo.reportInventoryValuationSummary({ start_date: startDate, end_date: endDate }, (err, report) => {
              if (err) reject(err);
              else resolve(report);
            });
            break;
            
          case "AgedReceivables":
            qbo.reportAgedReceivables({ report_date: endDate }, (err, report) => {
              if (err) reject(err);
              else resolve(report);
            });
            break;
            
          case "AgedPayables":
            qbo.reportAgedPayables({ report_date: endDate }, (err, report) => {
              if (err) reject(err);
              else resolve(report);
            });
            break;
            
          default:
            reject(new Error(`Unsupported report type: ${reportType}`));
        }
      });
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error(`Error fetching QuickBooks ${url.searchParams.get("type") || "report"}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch report" },
      { status: error.message.includes("Not authenticated") ? 401 : 500 }
    );
  }
}

// Helper functions to get default date ranges
function getDefaultStartDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1); // Default to 1 month ago
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

function getDefaultEndDate() {
  return new Date().toISOString().split('T')[0]; // Today formatted as YYYY-MM-DD
} 