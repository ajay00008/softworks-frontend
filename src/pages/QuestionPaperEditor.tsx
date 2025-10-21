import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import QuestionPaperList from '@/components/QuestionPaperList';
import EditQuestionPaper from '@/components/EditQuestionPaper';

export default function QuestionPaperEditor() {
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'create'>('list');
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setSelectedPaperId(id);
    setCurrentView('edit');
  };

  const handleCreate = () => {
    setSelectedPaperId(null);
    setCurrentView('create');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPaperId(null);
  };

  const handleSave = () => {
    // Optionally refresh the list or show success message
    setCurrentView('list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {currentView === 'list' && (
          <QuestionPaperList
            onEdit={handleEdit}
            onCreateNew={handleCreate}
          />
        )}

        {currentView === 'edit' && selectedPaperId && (
          <div className="p-6">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Question Papers
              </Button>
            </div>
            <EditQuestionPaper
              questionPaperId={selectedPaperId}
              onClose={handleBackToList}
              onSave={handleSave}
            />
          </div>
        )}

        {currentView === 'create' && (
          <div className="p-6">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Question Papers
              </Button>
            </div>
            <div className="text-center py-12">
              <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Create New Question Paper
              </h2>
              <p className="text-gray-600 mb-6">
                This feature will be implemented to create new question papers.
              </p>
              <Button onClick={handleBackToList}>
                Back to List
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
