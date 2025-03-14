export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose">
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p>
          By accessing or using our QuickBooks integration application, you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use our application.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Description of Service</h2>
        <p>
          Our application provides integration with QuickBooks Online to help users manage their financial data.
          The service is provided "as is" and we make no warranties regarding its functionality or availability.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
        <p>
          To use our application, you must have a valid QuickBooks Online account. You are responsible for maintaining
          the confidentiality of your account information and for all activities that occur under your account.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Privacy</h2>
        <p>
          We respect your privacy and are committed to protecting your data. Please refer to our Privacy Policy
          for information on how we collect, use, and disclose information.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Intellectual Property</h2>
        <p>
          All content, features, and functionality of our application are owned by us and are protected by
          international copyright, trademark, and other intellectual property laws.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">6. Limitation of Liability</h2>
        <p>
          In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">7. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will provide notice of any material changes
          by updating the date at the top of these terms and/or by notifying you via email.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">8. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
          without regard to its conflict of law provisions.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">9. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at [Your Contact Email].
        </p>
        
        <div className="mt-8 text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
} 