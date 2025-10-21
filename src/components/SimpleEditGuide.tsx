import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Edit3, 
  Upload, 
  Download, 
  CheckCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const SimpleEditGuide: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Edit3 className="w-5 h-5" />
          <span>Simple Question Editing Workflow</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow Steps */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">How to Edit a Specific Question:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm text-blue-900">Select Question</h5>
                <p className="text-xs text-blue-700 mt-1">
                  Click on any question from the list to select it for editing
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm text-green-900">Edit Question</h5>
                <p className="text-xs text-green-700 mt-1">
                  Click "Edit This Question" to modify the question text, options, and correct answer
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm text-purple-900">Upload PDF</h5>
                <p className="text-xs text-purple-700 mt-1">
                  Upload your edited PDF to replace the existing one
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">What You Can Do:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-semibold text-sm text-gray-900">Question Editing</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Edit question text directly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Modify answer options</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Update correct answer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Save changes instantly</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-semibold text-sm text-gray-900">PDF Management</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Download original PDF</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Upload edited PDF</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Automatic replacement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">No manual deletion needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-semibold text-sm text-gray-900 mb-3">Quick Actions:</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline" className="justify-center">
              <FileText className="w-3 h-3 mr-1" />
              View Questions
            </Badge>
            <Badge variant="outline" className="justify-center">
              <Edit3 className="w-3 h-3 mr-1" />
              Edit Text
            </Badge>
            <Badge variant="outline" className="justify-center">
              <Upload className="w-3 h-3 mr-1" />
              Upload PDF
            </Badge>
            <Badge variant="outline" className="justify-center">
              <Download className="w-3 h-3 mr-1" />
              Download
            </Badge>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-sm text-yellow-900">Important Notes:</h5>
              <ul className="text-sm text-yellow-800 mt-1 space-y-1 list-disc list-inside">
                <li>Only PDF files are accepted for upload</li>
                <li>Uploading a new PDF will automatically replace the existing one</li>
                <li>Make sure to save your question changes before uploading the PDF</li>
                <li>You can download the original PDF anytime for reference</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleEditGuide;
