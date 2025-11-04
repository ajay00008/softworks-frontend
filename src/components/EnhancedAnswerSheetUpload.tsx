import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Users, AlertCircle, CheckCircle, Clock, Download, Eye } from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';

interface ExamContextData {
  exam: {
    _id: string;
    title: string;
    description?: string;
    examType: string;
    duration: number;
    scheduledDate: string;
    endDate?: string;
    status: string;
    classId: any;
    subjectIds: any[];
    questionPaperId?: any;
    instructions?: string;
  };
  accessibleClasses: any[];
  accessibleSubjects: any[];
  students: any[];
  evaluationSettings?: any;
  teacherAccess: {
    canUpload: boolean;
    canEvaluate: boolean;
    canViewResults: boolean;
  };
}

interface ExamWithContext {
  _id: string;
  title: string;
  description?: string;
  examType: string;
  duration: number;
  scheduledDate: string;
  endDate?: string;
  status: string;
  classId: any;
  subjectIds: any[];
  questionPaperId?: any;
  instructions?: string;
  hasEvaluationSettings: boolean;
  studentCount: number;
}

interface AnswerSheet {
  _id: string;
  examId: string;
  studentId?: string;
  originalFileName: string;
  cloudStorageUrl: string;
  status: string;
  scanQuality: string;
  isAligned: boolean;
  rollNumberDetected: string;
  rollNumberConfidence: number;
  uploadedAt: string;
  uploadedBy?: {
    name: string;
  };
}

interface ExamStatistics {
  totalStudents: number;
  uploadedSheets: number;
  evaluatedSheets: number;
  flaggedSheets: number;
  averageScore: number;
  completionRate: number;
}

const EnhancedAnswerSheetUpload = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [examContext, setExamContext] = useState<ExamContextData | null>(null);
  const [examsWithContext, setExamsWithContext] = useState<ExamWithContext[]>([]);
  const [examStatistics, setExamStatistics] = useState<ExamStatistics | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAnswerSheets, setExistingAnswerSheets] = useState<AnswerSheet[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const { toast } = useToast();

  // Load exams with context data
  const loadExamsWithContext = useCallback(async () => {
    try {
      setLoadingExams(true);
      const response = await teacherDashboardAPI.getExamsWithContext();
      setExamsWithContext(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load exams: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingExams(false);
    }
  }, [toast]);

  // Load exam context when exam is selected
  const loadExamContext = useCallback(async (examId: string) => {
    try {
      setLoadingContext(true);
      const response = await teacherDashboardAPI.getExamContext(examId);
      setExamContext(response.data);
      
      // Load exam statistics
      const statsResponse = await teacherDashboardAPI.getExamStatistics(examId);
      setExamStatistics(statsResponse.data);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load exam context: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingContext(false);
    }
  }, [toast]);

  // Handle exam selection
  const handleExamChange = async (examId: string) => {
    setSelectedExam(examId);
    if (examId) {
      await loadExamContext(examId);
    } else {
      setExamContext(null);
      setExamStatistics(null);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedExam || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select an exam and files to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('examId', selectedExam);
      selectedFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await teacherDashboardAPI.uploadAnswerSheets(selectedExam, formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Success",
        description: `${selectedFiles.length} answer sheet(s) uploaded successfully`,
      });

      // Reset form
      setSelectedFiles([]);
      setUploadProgress(0);
      
      // Reload exam context to get updated statistics
      if (selectedExam) {
        await loadExamContext(selectedExam);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload files: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Load existing answer sheets
  const loadExistingAnswerSheets = useCallback(async (examId: string) => {
    try {
      const response = await teacherDashboardAPI.getAnswerSheets(examId);
      setExistingAnswerSheets(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load answer sheets: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadExamsWithContext();
  }, [loadExamsWithContext]);

  useEffect(() => {
    if (selectedExam) {
      loadExistingAnswerSheets(selectedExam);
    }
  }, [selectedExam, loadExistingAnswerSheets]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Answer Sheet Upload</h1>
        <Badge variant="outline" className="text-sm">
          Enhanced Exam Context Flow
        </Badge>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exam Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-select">Select Exam</Label>
            <Select value={selectedExam} onValueChange={handleExamChange} disabled={loadingExams}>
              <SelectTrigger>
                <SelectValue placeholder={loadingExams ? "Loading exams..." : "Choose an exam"} />
              </SelectTrigger>
              <SelectContent>
                {examsWithContext.map((exam) => (
                  <SelectItem key={exam._id} value={exam._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{exam.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {exam.examType} • {exam.studentCount} students
                        {exam.hasEvaluationSettings && " • Settings configured"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Context Display */}
          {examContext && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Class</Label>
                <p className="font-medium">{examContext.exam.classId?.name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Subjects</Label>
                <div className="flex flex-wrap gap-1">
                  {examContext.accessibleSubjects.map((subject) => (
                    <Badge key={subject._id} variant="secondary" className="text-xs">
                      {subject.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Students</Label>
                <p className="font-medium">{examContext.students.length} enrolled</p>
              </div>
            </div>
          )}

          {/* Exam Statistics */}
          {examStatistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{examStatistics.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{examStatistics.uploadedSheets}</div>
                <div className="text-sm text-muted-foreground">Uploaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{examStatistics.evaluatedSheets}</div>
                <div className="text-sm text-muted-foreground">Evaluated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{examStatistics.flaggedSheets}</div>
                <div className="text-sm text-muted-foreground">Flagged</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Answer Sheets</TabsTrigger>
          <TabsTrigger value="existing">Existing Answer Sheets</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          {!selectedExam ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select an exam first to upload answer sheets.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Answer Sheets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select Files</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop answer sheet images here, or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span>Choose Files</span>
                      </Button>
                    </label>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <Label>Upload Progress</Label>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      {uploadProgress}% complete
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedExam || selectedFiles.length === 0 || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Answer Sheets
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Existing Answer Sheets Tab */}
        <TabsContent value="existing" className="space-y-4">
          {!selectedExam ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select an exam first to view existing answer sheets.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Existing Answer Sheets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {existingAnswerSheets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No answer sheets uploaded yet for this exam.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {existingAnswerSheets.map((sheet) => (
                        <div key={sheet._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{sheet.originalFileName}</p>
                              <p className="text-sm text-muted-foreground">
                                Roll: {sheet.rollNumberDetected || 'Not detected'} • 
                                Quality: {sheet.scanQuality} • 
                                Status: {sheet.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              sheet.status === 'EVALUATED' ? 'default' :
                              sheet.status === 'UPLOADED' ? 'secondary' :
                              'destructive'
                            }>
                              {sheet.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnswerSheetUpload;
