import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Download,
  Search,
  Filter,
  Clock,
  Users,
  BookOpen,
  RefreshCw,
  X,
  Plus,
  Image,
  Scan,
  Target,
  Zap,
  BarChart3,
  Trash2
} from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';

interface TeacherAccess {
  classAccess: Array<{
    classId: string;
    className: string;
    accessLevel: string;
    canUploadSheets: boolean;
    canMarkAbsent: boolean;
    canMarkMissing: boolean;
    canOverrideAI: boolean;
  }>;
  subjectAccess: Array<{
    subjectId: string;
    subjectName: string;
    accessLevel: string;
    canCreateQuestions: boolean;
    canUploadSyllabus: boolean;
  }>;
  globalPermissions: {
    canViewAllClasses: boolean;
    canViewAllSubjects: boolean;
    canAccessAnalytics: boolean;
    canPrintReports: boolean;
    canSendNotifications: boolean;
  };
}

interface Exam {
  _id: string;
  title: string;
  subjectIds: {
    _id: string;
    name: string;
  }[];
  classId: {
    _id: string;
    name: string;
  };
  examType: string;
  scheduledDate: string;
  duration: number;
  totalMarks: number;
}

interface UploadResult {
  answerSheetId?: string;
  filename?: string;
  originalFileName?: string;
  status: string;
  fileSize?: number;
  rollNumberDetected?: boolean;
  rollNumberConfidence?: number;
  scanQuality?: string;
  isAligned?: boolean;
  issues?: string[];
  suggestions?: string[];
  error?: string;
}

interface AnswerSheet {
  _id: string;
  originalFileName: string;
  status: string;
  uploadedAt: string;
  scanQuality?: string;
  rollNumberDetected?: string;
  studentId?: {
    name: string;
    rollNumber: string;
  };
  uploadedBy?: {
    name: string;
  };
}

const AnswerSheetUpload = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [existingAnswerSheets, setExistingAnswerSheets] = useState<AnswerSheet[]>([]);
  const [loadingExistingSheets, setLoadingExistingSheets] = useState(false);
  const [activeTab, setActiveTab] = useState('existing');
  const [examStudents, setExamStudents] = useState<Array<{
    id: string;
    name: string;
    rollNumber: string;
    email: string;
    hasAnswerSheet: boolean;
    answerSheetId?: string;
  }>>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [matchingSheet, setMatchingSheet] = useState<{ id: string; fileName: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; answerSheetId: string | null; fileName: string }>({
    isOpen: false,
    answerSheetId: null,
    fileName: ''
  });
  const { toast } = useToast();

  const loadExams = useCallback(async () => {
    try {
      setLoadingExams(true);
      // Use the new exam context API for enhanced data
      const response = await teacherDashboardAPI.getExamsWithContext();
      setExams(response.data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid or expired token') || error.message.includes('No authentication token')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        // Redirect to login or clear auth data
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      toast({
        title: "Error",
        description: `Failed to load exams: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingExams(false);
    }
  }, [toast]);

  const loadExistingAnswerSheets = useCallback(async (examId: string) => {
    try {
      setLoadingExistingSheets(true);
      const response = await teacherDashboardAPI.getAnswerSheets(examId);
      setExistingAnswerSheets(response.data || []);
    } catch (error) {
      console.error('Error loading existing answer sheets:', error);
      toast({
        title: "Error",
        description: `Failed to load existing answer sheets: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingExistingSheets(false);
    }
  }, [toast]);

  const loadExamStudents = useCallback(async (examId: string) => {
    try {
      setLoadingStudents(true);
      const response = await teacherDashboardAPI.getExamStudents(examId);
      setExamStudents(response.data.students || []);
    } catch (error) {
      console.error('Error loading exam students:', error);
      toast({
        title: "Error",
        description: `Failed to load students: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  }, [toast]);

  const handleMatchAnswerSheet = async (answerSheetId: string, rollNumber: string) => {
    try {
      const response = await teacherDashboardAPI.matchAnswerSheetToStudent(answerSheetId, rollNumber);
      toast({
        title: "Success",
        description: response.message,
      });
      
      // Refresh both lists
      if (selectedExam) {
        await Promise.all([
          loadExistingAnswerSheets(selectedExam),
          loadExamStudents(selectedExam)
        ]);
      }
      setMatchingSheet(null);
    } catch (error: unknown) {
      console.error('Error matching answer sheet:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to match answer sheet to student",
        variant: "destructive",
      });
    }
  };

  const handleExamChange = (examId: string) => {
    setSelectedExam(examId);
    if (examId) {
      loadExistingAnswerSheets(examId);
      loadExamStudents(examId);
    } else {
      setExistingAnswerSheets([]);
      setExamStudents([]);
    }
  };

  useEffect(() => {
    // Check if user is authenticated before loading exams
    const token = localStorage.getItem('auth-token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      window.location.href = '/login';
      return;
    }
    
    loadExams();
  }, [loadExams, toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => {
      const newFiles = [...prev, ...files];
      return newFiles;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteAnswerSheet = (answerSheetId: string, fileName: string) => {
    setDeleteConfirm({
      isOpen: true,
      answerSheetId,
      fileName
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.answerSheetId) return;

    try {
      await teacherDashboardAPI.deleteAnswerSheet(deleteConfirm.answerSheetId);
      
      // Remove from upload results
      setUploadResults(prev => prev.filter(result => result.answerSheetId !== deleteConfirm.answerSheetId));
      
      // Remove from existing answer sheets
      setExistingAnswerSheets(prev => prev.filter(sheet => sheet._id !== deleteConfirm.answerSheetId));
      
      toast({
        title: "Success",
        description: `Answer sheet "${deleteConfirm.fileName}" deleted successfully`,
      });
      
      setDeleteConfirm({ isOpen: false, answerSheetId: null, fileName: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete answer sheet: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, answerSheetId: null, fileName: '' });
  };

  // Auto-detect flags for answer sheet
  const handleAutoDetectFlags = async (answerSheet: any) => {
    try {
      const analysisData = {
        rollNumberDetected: answerSheet.rollNumberDetected,
        rollNumberConfidence: answerSheet.rollNumberConfidence,
        scanQuality: answerSheet.scanQuality,
        isAligned: answerSheet.isAligned,
        fileSize: 0, // Would need to get from file
        fileFormat: 'application/pdf'
      };

      const response = await teacherDashboardAPI.autoDetectFlags(answerSheet._id, analysisData);

      toast({
        title: "Success",
        description: `${response.data.length} flags auto-detected`,
      });

      // Reload existing answer sheets to show updated flags
      if (selectedExam) {
        await loadExistingAnswerSheets(selectedExam);
      }
    } catch (error) {
      console.error('Error auto-detecting flags:', error);
      toast({
        title: "Error",
        description: `Failed to auto-detect flags: ${error.message}`,
        variant: "destructive",
      });
    }
  };


  const handleUpload = async () => {
    
    if (!selectedExam || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select an exam and at least one file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
        });
      const response = await teacherDashboardAPI.uploadAnswerSheetFiles(selectedExam, formData);
      setUploadResults(response.data.results || []);
      
      // Clear selected files after successful upload to allow new uploads
      setSelectedFiles([]);
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${selectedFiles.length} answer sheets. Select new files to upload more.`,
      });

      // Refresh existing answer sheets list
      if (selectedExam) {
        loadExistingAnswerSheets(selectedExam);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload answer sheets: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getQualityBadge = (quality: string) => {
    const qualityConfig = {
      EXCELLENT: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      GOOD: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      FAIR: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      POOR: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      UNREADABLE: { color: 'bg-red-100 text-red-800', icon: X },
    };

    const config = qualityConfig[quality as keyof typeof qualityConfig] || qualityConfig.POOR;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {quality}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      UPLOADED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      ERROR: { color: 'bg-red-100 text-red-800', icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PROCESSING;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  // No need for teacher access check since we load all exams directly

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Answer Sheet Management</h1>
          <p className="text-gray-600">
            View existing answer sheets and upload new ones
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadExams}
            disabled={loadingExams}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingExams ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>Choose the exam to view or upload answer sheets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={handleExamChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.title} - {exam.subjectIds.map(s => s.name).join(', ')} ({exam.classId.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      {selectedExam && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Existing Answer Sheets
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New Sheets
            </TabsTrigger>
          </TabsList>

          {/* Existing Answer Sheets Tab */}
          <TabsContent value="existing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Existing Answer Sheets
                  {loadingExistingSheets && <RefreshCw className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <CardDescription>
                  Answer sheets already uploaded for this exam
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingExistingSheets ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading existing answer sheets...</span>
                  </div>
                ) : existingAnswerSheets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No answer sheets uploaded yet for this exam</p>
                    <p className="text-sm mt-2">Switch to the "Upload New Sheets" tab to add answer sheets</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {existingAnswerSheets.map((sheet, index) => (
                      <div key={sheet._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{sheet.originalFileName}</span>
                            {sheet.studentId && (
                              <Badge variant="outline" className="text-xs">
                                {sheet.studentId.name} ({sheet.studentId.rollNumber})
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(sheet.status)}
                            {sheet.scanQuality && getQualityBadge(sheet.scanQuality)}
                            {/* Flag count indicator */}
                            {sheet.flagCount > 0 && (
                              <Badge variant={sheet.hasCriticalFlags ? 'destructive' : 'secondary'} className="text-xs">
                                <Flag className="h-3 w-3 mr-1" />
                                {sheet.flagCount}
                              </Badge>
                            )}
                            {/* Auto-detect flags button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAutoDetectFlags(sheet)}
                              title="Auto-detect flags"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAnswerSheet(sheet._id, sheet.originalFileName)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Uploaded:</span>
                            <div>{new Date(sheet.uploadedAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <div>{sheet.status}</div>
                          </div>
                          {sheet.rollNumberDetected && (
                            <div>
                              <span className="text-gray-500">Roll Number:</span>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{sheet.rollNumberDetected}</span>
                              </div>
                            </div>
                          )}
                          {sheet.scanQuality && (
                            <div>
                              <span className="text-gray-500">Quality:</span>
                              <div>{sheet.scanQuality}</div>
                            </div>
                          )}
                        </div>

                        {sheet.uploadedBy && (
                          <div className="mt-2 text-xs text-gray-500">
                            Uploaded by: {sheet.uploadedBy.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Matching Interface */}
            {selectedExam && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Matching
                    {loadingStudents && <RefreshCw className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>
                    Match uploaded answer sheets to students by roll number
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading students...</span>
                    </div>
                  ) : examStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No students found for this exam</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Unmatched Answer Sheets */}
                      <div>
                        <h4 className="font-medium mb-3 text-orange-600">Unmatched Answer Sheets</h4>
                        <div className="space-y-2">
                          {existingAnswerSheets
                            .filter(sheet => !sheet.studentId)
                            .map(sheet => (
                              <div key={sheet._id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-orange-600" />
                                  <span className="font-medium">{sheet.originalFileName}</span>
                                  {sheet.rollNumberDetected && (
                                    <Badge variant="outline" className="text-xs">
                                      Detected: {sheet.rollNumberDetected}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => setMatchingSheet({ id: sheet._id, fileName: sheet.originalFileName })}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Match Student
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Student List */}
                      <div>
                        <h4 className="font-medium mb-3 text-green-600">Students in Class</h4>
                        <div className="grid gap-2 max-h-60 overflow-y-auto">
                          {examStudents.map(student => (
                            <div 
                              key={student.id} 
                              className={`flex items-center justify-between p-3 border rounded-lg ${
                                student.hasAnswerSheet 
                                  ? 'border-green-200 bg-green-50' 
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{student.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  Roll: {student.rollNumber}
                                </Badge>
                                {student.hasAnswerSheet && (
                                  <Badge variant="default" className="text-xs bg-green-600">
                                    Sheet Uploaded
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.email}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upload New Sheets Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Answer Sheets
                </CardTitle>
                <CardDescription>
                  Select answer sheet images to upload
                </CardDescription>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 font-medium">📋 Upload Steps:</p>
                  <ol className="text-sm text-blue-700 mt-1 ml-4 list-decimal">
                    <li>Select PDF files to upload</li>
                    <li>Click "Upload" button</li>
                    <li>Switch to "Existing Answer Sheets" tab to view uploaded files</li>
                  </ol>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Drop files here or click to browse
                        </span>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          accept="application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </Label>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF files up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Info */}
                <div className="text-xs p-2 rounded" style={{
                  backgroundColor: selectedFiles.length > 0 ? '#d1fae5' : '#fef3c7',
                  color: selectedFiles.length > 0 ? '#065f46' : '#92400e'
                }}>
                  Status: {selectedFiles.length === 0 ? '❌ Please select files to upload' : '✅ Ready to upload!'}
                  <br />
                  Debug: Files={selectedFiles.length}, Uploading={isUploading ? 'Yes' : 'No'}
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <Label>Uploading...</Label>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500">
                      Uploading answer sheets...
                    </p>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || isUploading}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : selectedFiles.length > 0 ? `Upload ${selectedFiles.length} Answer Sheets` : 'Select Files to Upload'}
                  </Button>
                  {selectedFiles.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFiles([])}
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Files
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Upload Results
                  </CardTitle>
                  <CardDescription>
                    Upload results for answer sheets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{result.filename || result.originalFileName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(result.status)}
                            {result.scanQuality && getQualityBadge(result.scanQuality)}
                            {result.answerSheetId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAnswerSheet(result.answerSheetId!, result.filename || result.originalFileName || 'Unknown')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">File Size:</span>
                            <div>{result.fileSize ? (result.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <div>{result.status}</div>
                          </div>
                          {result.rollNumberDetected !== undefined && (
                            <div>
                              <span className="text-gray-500">Roll Number:</span>
                              <div className="flex items-center gap-1">
                                {result.rollNumberDetected ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500" />
                                )}
                                <span>{result.rollNumberDetected ? 'Detected' : 'Not Detected'}</span>
                              </div>
                            </div>
                          )}
                          {result.rollNumberConfidence !== undefined && (
                            <div>
                              <span className="text-gray-500">Confidence:</span>
                              <div>{Math.round(result.rollNumberConfidence * 100)}%</div>
                            </div>
                          )}
                          {result.isAligned !== undefined && (
                            <div>
                              <span className="text-gray-500">Alignment:</span>
                              <div className="flex items-center gap-1">
                                {result.isAligned ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                )}
                                <span>{result.isAligned ? 'Aligned' : 'Needs Alignment'}</span>
                              </div>
                            </div>
                          )}
                          {result.scanQuality && (
                            <div>
                              <span className="text-gray-500">Quality:</span>
                              <div>{result.scanQuality}</div>
                            </div>
                          )}
                        </div>

                        {result.issues && result.issues.length > 0 && (
                          <div className="mt-3 p-2 bg-yellow-50 rounded">
                            <div className="text-sm font-medium text-yellow-800 mb-1">Issues:</div>
                            <ul className="text-sm text-yellow-700">
                              {result.issues.map((issue, i) => (
                                <li key={i}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.suggestions && result.suggestions.length > 0 && (
                          <div className="mt-3 p-2 bg-blue-50 rounded">
                            <div className="text-sm font-medium text-blue-800 mb-1">Suggestions:</div>
                            <ul className="text-sm text-blue-700">
                              {result.suggestions.map((suggestion, i) => (
                                <li key={i}>• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.error && (
                          <div className="mt-3 p-2 bg-red-50 rounded">
                            <div className="text-sm font-medium text-red-800 mb-1">Error:</div>
                            <div className="text-sm text-red-700">{result.error}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Answer Sheet</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the answer sheet <strong>"{deleteConfirm.fileName}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This will permanently remove the file and all associated data.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={false}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Matching Dialog */}
      {matchingSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Match Answer Sheet</h3>
                <p className="text-sm text-gray-500">Enter student roll number</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Match <strong>"{matchingSheet.fileName}"</strong> to a student:
              </p>
              <div>
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  placeholder="Enter student roll number"
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const rollNumber = (e.target as HTMLInputElement).value.trim();
                      if (rollNumber) {
                        handleMatchAnswerSheet(matchingSheet.id, rollNumber);
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setMatchingSheet(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const rollNumber = (document.getElementById('rollNumber') as HTMLInputElement)?.value.trim();
                  if (rollNumber) {
                    handleMatchAnswerSheet(matchingSheet.id, rollNumber);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Match Student
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerSheetUpload;
