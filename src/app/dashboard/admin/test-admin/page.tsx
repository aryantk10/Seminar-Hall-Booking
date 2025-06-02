"use client";

export default function TestAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          🎉 ADMIN TEST PAGE WORKING!
        </h1>
        <p className="text-green-700 text-lg mb-4">
          This is a brand new admin test page created at: {new Date().toISOString()}
        </p>
        <div className="space-y-2">
          <p className="text-green-600">✅ Route: /dashboard/admin/test-admin</p>
          <p className="text-green-600">✅ File: src/app/dashboard/admin/test-admin/page.tsx</p>
          <p className="text-green-600">✅ Deployment: Working</p>
          <p className="text-green-600">✅ No Cache Issues: Fresh file</p>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h2 className="font-bold text-blue-800 mb-2">Next Steps:</h2>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>If you see this page, deployment is working</li>
            <li>The issue is with the original halls page</li>
            <li>We need to recreate the halls page from scratch</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
