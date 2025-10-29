import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Trash2,
  Fingerprint,
  Hash,
  FileImage,
  ArrowRight,
  ArrowLeft,
  Copy,
  AlertOctagon,
  UserCheck,
  UserX,
  Brain,
  Camera,
  FileUp,
  CheckSquare,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';

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
  matchedStudent?: {
    id: string;
    name: string;
    rollNumber: string;
  };
}

interface AnswerSheet {
  _id: string;
  originalFileName: string;
  status: string;
  uploadedAt: string;
  scanQuality?: string;
  rollNumberDetected?: string;
  rollNumberConfidence?: number;
  studentId?: {
    name: string;
    rollNumber: string;
  };
  uploadedBy?: {
    name: string;
  };
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  hasAnswerSheet: boolean;
  answerSheetId?: string;
}

const AnswerSheetUploadEnhanced = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [existingAnswerSheets, setExistingAnswerSheets] = useState<AnswerSheet[]>([]);
  const [loadingExistingSheets, setLoadingExistingSheets] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [examStudents, setExamStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const loadExams = useCallback(async () => {
    try {
      setLoadingExams(true);
      const response = await teacherDashboardAPI.getExamsWithContext();
      setExams(response.data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid or expired token') || error.message.includes('No authentication token')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
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

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    if (selectedExam) {
      loadExistingAnswerSheets(selectedExam);
      loadExamStudents(selectedExam);
    }
  }, [selectedExam, loadExistingAnswerSheets, loadExamStudents]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid file type. Please upload PDF or image files.`,
          variant: "destructive",
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Please upload files smaller than 10MB.`,
          variant: "destructive",
        });
      }
      
      return isValidType && isValidSize;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedExam) {
      toast({
        title: "Error",
        description: "Please select an exam first",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setAiProcessing(true);
      setProcessingStep('Preparing files...');
      
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Simulate AI processing steps
      const steps = [
        'Uploading files...',
        'AI analyzing images...',
        'Detecting roll numbers...',
        'Matching students...',
        'Finalizing upload...'
      ];

      let currentStep = 0;
      const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
          setProcessingStep(steps[currentStep]);
          setUploadProgress(((currentStep + 1) / steps.length) * 100);
          currentStep++;
        } else {
          clearInterval(stepInterval);
        }
      }, 1000);

      const response = await teacherDashboardAPI.batchUploadAnswerSheetsEnhanced(selectedExam, formData);
      
      clearInterval(stepInterval);
      
      if (response.success) {
        setUploadResults(response.data || []);
        
        // Show results with AI matching
        const matchedCount = response.data?.filter((r: UploadResult) => r.matchedStudent).length || 0;
        const unmatchedCount = response.data?.length - matchedCount;
        
        toast({
          title: "Upload Successful",
          description: `Uploaded ${response.data?.length || 0} files. ${matchedCount} automatically matched, ${unmatchedCount} need manual matching.`,
        });
        
        // Clear selected files and reload data
        setSelectedFiles([]);
        loadExistingAnswerSheets(selectedExam);
        loadExamStudents(selectedExam);
        setActiveTab('results');
      } else {
        toast({
          title: "Upload Failed",
          description: response.error || "Failed to upload answer sheets",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: `Failed to upload answer sheets: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setAiProcessing(false);
      setUploadProgress(0);
      setProcessingStep('');
    }
  };

  const handleManualMatch = async (answerSheetId: string, studentId: string) => {
    try {
      const student = examStudents.find(s => s.id === studentId);
      if (!student) return;

      const response = await teacherDashboardAPI.matchAnswerSheetToStudentEnhanced(answerSheetId, {
        rollNumber: student.rollNumber
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `Answer sheet matched to ${student.name}`,
        });
        loadExistingAnswerSheets(selectedExam);
        loadExamStudents(selectedExam);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to match answer sheet: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnswerSheet = async (answerSheetId: string) => {
    try {
      const response = await teacherDashboardAPI.deleteAnswerSheet(answerSheetId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Answer sheet deleted successfully",
        });
        loadExistingAnswerSheets(selectedExam);
        loadExamStudents(selectedExam);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete answer sheet: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      UPLOADED: { color: 'bg-blue-100 text-blue-800', icon: Upload },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      AI_CORRECTED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      MANUALLY_REVIEWED: { color: 'bg-purple-100 text-purple-800', icon: Edit },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckSquare },
      ERROR: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UPLOADED;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const matchedSheets = existingAnswerSheets.filter(sheet => sheet.studentId);
  const unmatchedSheets = existingAnswerSheets.filter(sheet => !sheet.studentId);
  const studentsWithoutSheets = examStudents.filter(student => !student.hasAnswerSheet);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Upload className="h-8 w-8 text-blue-600" />
            Answer Sheet Upload
          </h1>
          <p className="text-gray-600">
            Upload and manage student answer sheets with AI-powered roll number detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadExistingAnswerSheets(selectedExam);
              loadExamStudents(selectedExam);
            }}
            disabled={loadingExistingSheets || loadingStudents}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loadingExistingSheets || loadingStudents) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>Choose an exam to upload answer sheets for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
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
            {selectedExam && (
              <div>
                <Label>Exam Details</Label>
                <div className="text-sm text-gray-600 mt-1">
                  {exams.find(e => e._id === selectedExam)?.examType} • 
                  {exams.find(e => e._id === selectedExam)?.totalMarks} marks • 
                  {exams.find(e => e._id === selectedExam)?.duration} minutes
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedExam && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{matchedSheets.length}</div>
                  <div className="text-sm text-gray-600">Matched Sheets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{unmatchedSheets.length}</div>
                  <div className="text-sm text-gray-600">Unmatched Sheets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{studentsWithoutSheets.length}</div>
                  <div className="text-sm text-gray-600">Missing Sheets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {existingAnswerSheets.filter(s => s.rollNumberDetected).length}
                  </div>
                  <div className="text-sm text-gray-600">AI Detected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      {selectedExam && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="matched" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Matched ({matchedSheets.length})
            </TabsTrigger>
            <TabsTrigger value="unmatched" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Unmatched ({unmatchedSheets.length})
            </TabsTrigger>
            <TabsTrigger value="missing" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Missing ({studentsWithoutSheets.length})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Answer Sheets
                </CardTitle>
                <CardDescription>
                  Upload answer sheet files. AI will automatically detect roll numbers and match students.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drop files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports PDF and image files up to 10MB each
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileImage className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="font-medium">{file.name}</div>
                              <div className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || isUploading || !selectedExam}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload {selectedFiles.length} Files
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Processing Progress */}
                {aiProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Processing</span>
                      <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-600">{processingStep}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matched Sheets Tab */}
          <TabsContent value="matched" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Matched Answer Sheets
                </CardTitle>
                <CardDescription>
                  Answer sheets that have been successfully matched to students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchedSheets.map((sheet) => (
                    <div key={sheet._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{sheet.studentId?.name || 'Unknown Student'}</div>
                          <div className="text-sm text-gray-600">
                            Roll: {sheet.studentId?.rollNumber || 'N/A'} • File: {sheet.originalFileName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(sheet.status)}
                          {sheet.rollNumberDetected && (
                            <Badge className="bg-green-100 text-green-800">
                              <Fingerprint className="w-3 h-3 mr-1" />
                              AI Matched
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Uploaded:</span>
                          <div>{new Date(sheet.uploadedAt).toLocaleDateString()}</div>
                        </div>
                        {sheet.scanQuality && (
                          <div>
                            <span className="text-gray-500">Quality:</span>
                            <div>{sheet.scanQuality}</div>
                          </div>
                        )}
                        {sheet.rollNumberConfidence && (
                          <div>
                            <span className="text-gray-500">Confidence:</span>
                            <div>{Math.round(sheet.rollNumberConfidence)}%</div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div>{sheet.status}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPreviewFile(sheet as any);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAnswerSheet(sheet._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}

                  {matchedSheets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No matched answer sheets found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unmatched Sheets Tab */}
          <TabsContent value="unmatched" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-orange-600" />
                  Unmatched Answer Sheets
                </CardTitle>
                <CardDescription>
                  Answer sheets that need to be manually matched to students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unmatchedSheets.map((sheet) => (
                    <div key={sheet._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{sheet.originalFileName}</div>
                          <div className="text-sm text-gray-600">
                            Uploaded: {new Date(sheet.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(sheet.status)}
                          {sheet.rollNumberDetected && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Hash className="w-3 h-3 mr-1" />
                              Roll: {sheet.rollNumberDetected}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">File:</span>
                          <div className="truncate">{sheet.originalFileName}</div>
                        </div>
                        {sheet.scanQuality && (
                          <div>
                            <span className="text-gray-500">Quality:</span>
                            <div>{sheet.scanQuality}</div>
                          </div>
                        )}
                        {sheet.rollNumberConfidence && (
                          <div>
                            <span className="text-gray-500">Confidence:</span>
                            <div>{Math.round(sheet.rollNumberConfidence)}%</div>
                          </div>
                        )}
                      </div>

                      {/* Manual Matching */}
                      <div className="mt-3">
                        <Label className="text-sm font-medium text-gray-600">Match to Student:</Label>
                        <div className="flex gap-2 mt-2">
                          <Select onValueChange={(studentId) => handleManualMatch(sheet._id, studentId)}>
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                              {examStudents.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name} (Roll: {student.rollNumber})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {unmatchedSheets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      All answer sheets have been matched to students.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missing Sheets Tab */}
          <TabsContent value="missing" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-red-600" />
                      Students Without Answer Sheets
                    </CardTitle>
                    <CardDescription>
                      Students who haven't submitted their answer sheets yet
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Notification Sent",
                          description: `Reminder sent to ${studentsWithoutSheets.length} students`,
                        });
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentsWithoutSheets.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-600">
                            Roll: {student.rollNumber} | Email: {student.email}
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          <AlertOctagon className="w-3 h-3 mr-1" />
                          Missing Sheet
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {studentsWithoutSheets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      All students have submitted their answer sheets.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Answer Sheet Preview
            </DialogTitle>
            <DialogDescription>
              Preview of the uploaded answer sheet
            </DialogDescription>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">File preview would be displayed here</p>
                <p className="text-sm text-gray-500">{previewFile.name}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnswerSheetUploadEnhanced;
