import { NextResponse } from "next/server";
import { getQuickBooksClient, withTokenRefresh } from "../../../utils/quickbooks";

export async function GET() {
  try {
    // Get the QuickBooks client and handle token refresh
    const customers = await withTokenRefresh(async (newToken) => {
      const qbo = await getQuickBooksClient();
      
      // Wrap the QuickBooks API call in a Promise
      return new Promise((resolve, reject) => {
        qbo.findCustomers({}, (err, customers) => {
          if (err) {
            reject(err);
          } else {
            resolve(customers);
          }
        });
      });
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching QuickBooks customers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers" },
      { status: error.message.includes("Not authenticated") ? 401 : 500 }
    );
  }
} 