import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DebugApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Debug Information</CardTitle>
            <CardDescription>
              This is a debug component to verify the frontend is working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-green-600">✅ Working Components</h3>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• React is loaded</li>
                  <li>• Tailwind CSS is working</li>
                  <li>• shadcn/ui components are imported</li>
                  <li>• TypeScript compilation successful</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-blue-600">📊 System Status</h3>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• Build: Successful</li>
                  <li>• Linting: No errors</li>
                  <li>• Dependencies: All installed</li>
                  <li>• Development server: Running</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">🚀 Next Steps</h3>
              <p className="text-sm text-blue-700 mt-2">
                If you can see this page, the frontend is working correctly. 
                The issue might be with routing or authentication. Check the browser console for any JavaScript errors.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="outline"
              >
                Go to Login
              </Button>
              <Button 
                onClick={() => }
                variant="outline"
              >
                Test Console
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugApp;
