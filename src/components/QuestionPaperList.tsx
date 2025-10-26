import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Edit,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';
import { questionPaperAPI, QuestionPaper, examsAPI } from '@/services/api';

interface QuestionPaperListProps {
  onEdit: (id: string) => void;
  onCreateNew: () => void;
}

export default function QuestionPaperList({ onEdit, onCreateNew }: QuestionPaperListProps) {
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exams, setExams] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestionPapers();
    loadExams();
  }, [currentPage, selectedClass]);

  const loadExams = async () => {
    try {
      const response = await examsAPI.getAll();
      setExams(response?.data || response?.exams || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      setExams([]);
    }
  };

  const loadQuestionPapers = async () => {
    try {
      setLoading(true);
      const response = await questionPaperAPI.getAllQuestionPapers({
        page: currentPage,
        limit: 10,
        className: selectedClass || undefined,
      });
      
      setQuestionPapers(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load question papers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question paper?')) return;

    try {
      await questionPaperAPI.deleteQuestionPaper(id);
      setQuestionPapers(questionPapers.filter(paper => paper._id !== id));
      toast({
        title: 'Success',
        description: 'Question paper deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question paper',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (questionPaper: QuestionPaper) => {
    try {
      const questionPaperId = questionPaper._id || questionPaper.id;
      const response = await questionPaperAPI.download(questionPaperId);
      
      if (response.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = `${questionPaper.title || 'question-paper'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Download Started',
          description: `Downloading ${questionPaper.title}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  const filteredPapers = questionPapers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading question papers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Papers</h1>
          <p className="text-gray-600">Manage your question papers</p>
          {exams.length === 0 && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> No exams are available. Please create an exam first before creating question papers.
              </p>
            </div>
          )}
        </div>
        <Button 
          onClick={onCreateNew}
          disabled={exams.length === 0}
          title={exams.length === 0 ? "No exams available. Please create an exam first." : ""}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search question papers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  <SelectItem value="Class 1">Class 1</SelectItem>
                  <SelectItem value="Class 2">Class 2</SelectItem>
                  <SelectItem value="Class 3">Class 3</SelectItem>
                  <SelectItem value="Class 4">Class 4</SelectItem>
                  <SelectItem value="Class 5">Class 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Papers Grid */}
      {filteredPapers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Question Papers Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedClass
                ? 'No question papers match your search criteria.'
                : 'Create your first question paper to get started.'}
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Question Paper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <Card key={paper._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{paper.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {paper.className}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(paper._id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(paper._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {paper.subjects.map((subject, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(paper.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {paper.createdBy.name}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">
                        {paper.questions.length} questions
                      </span>
                      <span className="text-gray-600">
                        {paper.totalMarks} marks
                      </span>
                    </div>
                    <Badge variant="outline">
                      {paper.duration} min
                    </Badge>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(paper._id)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {paper.pdfUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(paper)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
