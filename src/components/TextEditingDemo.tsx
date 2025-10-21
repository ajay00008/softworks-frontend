import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Edit3, Type, MousePointer, Save } from 'lucide-react';

const TextEditingDemo: React.FC = () => {
  return (
    <Card className="max-h-80 overflow-y-auto">
      <CardHeader className="sticky top-0 bg-white z-10 border-b">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Edit3 className="w-4 h-4" />
          <span>Text Editing Features</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-gray-700">Text Selection & Editing</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <MousePointer className="w-3 h-3 text-blue-500" />
                <span className="text-xs">Click on any text in the PDF to select it</span>
              </div>
              <div className="flex items-center space-x-2">
                <Edit3 className="w-3 h-3 text-green-500" />
                <span className="text-xs">Edit the selected text directly</span>
              </div>
              <div className="flex items-center space-x-2">
                <Save className="w-3 h-3 text-purple-500" />
                <span className="text-xs">Save changes to the PDF</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-gray-700">Available Actions</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                <MousePointer className="w-2 h-2 mr-1" />
                Select
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Type className="w-2 h-2 mr-1" />
                Add
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Edit3 className="w-2 h-2 mr-1" />
                Edit
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <h5 className="font-semibold text-xs text-blue-900 mb-1">How to Use:</h5>
          <ol className="text-xs text-blue-800 space-y-0.5 list-decimal list-inside">
            <li>Click "Select Text" to enable text selection mode</li>
            <li>Click on any text in the PDF to select it</li>
            <li>Edit the text in the input field</li>
            <li>Click the checkmark to save changes</li>
            <li>Use "Add Text" to add new text annotations</li>
          </ol>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <h5 className="font-semibold text-xs text-green-900 mb-1">Features:</h5>
          <ul className="text-xs text-green-800 space-y-0.5 list-disc list-inside">
            <li>Extract and edit existing text from PDF questions</li>
            <li>Add new text annotations anywhere in the PDF</li>
            <li>Real-time text editing with visual feedback</li>
            <li>Save changes back to the PDF document</li>
            <li>Undo/redo functionality for all edits</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextEditingDemo;
