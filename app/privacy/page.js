export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose">
        <p className="mb-4">
          This Privacy Policy describes how we collect, use, and handle your information when you use our QuickBooks integration application.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <p>
          When you use our application, we collect the following types of information:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Account information from QuickBooks (with your permission)</li>
          <li>Usage data and analytics</li>
          <li>Information you provide directly to us</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send notifications, updates, and support messages</li>
          <li>Respond to your comments and questions</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share information in the following circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>With your consent</li>
          <li>For legal reasons, if required by law</li>
          <li>With service providers who help us operate our application</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information from unauthorized access,
          alteration, disclosure, or destruction.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your personal information, including:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access to your data</li>
          <li>Correction of inaccurate data</li>
          <li>Deletion of your data</li>
          <li>Restriction of processing</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">6. Third-Party Services</h2>
        <p>
          Our application integrates with QuickBooks and may include links to third-party websites or services.
          This Privacy Policy does not apply to those third-party services, and we encourage you to review their privacy policies.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the effective date.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">8. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at [Your Contact Email].
        </p>
        
        <div className="mt-8 text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
} 