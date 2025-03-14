import { NextResponse } from "next/server";
import { getQuickBooksClient, withTokenRefresh } from "../../../utils/quickbooks";

export async function GET() {
  try {
    // Get the QuickBooks client and handle token refresh
    const invoices = await withTokenRefresh(async (newToken) => {
      const qbo = await getQuickBooksClient();
      
      // Wrap the QuickBooks API call in a Promise
      return new Promise((resolve, reject) => {
        qbo.findInvoices({}, (err, invoices) => {
          if (err) {
            reject(err);
          } else {
            resolve(invoices);
          }
        });
      });
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching QuickBooks invoices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: error.message.includes("Not authenticated") ? 401 : 500 }
    );
  }
} 