import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
  Brain,
  Target
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
  subjectId: {
    _id: string;
    name: string;
  };
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

const AnswerSheetUpload = () => {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedExam, setSelectedExam] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeacherAccess();
  }, []);

  useEffect(() => {
    if (teacherAccess) {
      loadExams();
    }
  }, [teacherAccess, selectedClass, selectedSubject]);

  const loadTeacherAccess = async () => {
    try {
      const response = await teacherDashboardAPI.getAccess();
      setTeacherAccess(response.data);
    } catch (error) {
      console.error('Error loading teacher access:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher access",
        variant: "destructive",
      });
    }
  };

  const loadExams = async () => {
    try {
      setLoadingExams(true);
      const response = await teacherDashboardAPI.getExams({
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
      });
      setExams(response.data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      toast({
        title: "Error",
        description: "Failed to load exams",
        variant: "destructive",
      });
    } finally {
      setLoadingExams(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('Files selected:', files);
    setSelectedFiles(prev => {
      const newFiles = [...prev, ...files];
      console.log('Updated selected files:', newFiles);
      return newFiles;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    console.log('Upload attempt:', { 
      selectedExam, 
      selectedExamType: typeof selectedExam,
      selectedFiles: selectedFiles.length, 
      files: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
    
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
        console.log('Added file to FormData:', file.name, file.size, file.type);
      });

      console.log('Calling API with:', { 
        examId: selectedExam, 
        selectedFiles: selectedFiles.length,
        formDataEntries: Array.from(formData.entries()).length
      });
      const response = await teacherDashboardAPI.uploadAnswerSheetFiles(selectedExam, formData);
      console.log('API Response:', response);
      
      setUploadResults(response.data.results || []);
      
      // Clear selected files after successful upload to allow new uploads
      setSelectedFiles([]);
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${selectedFiles.length} answer sheets. Select new files to upload more.`,
      });
    } catch (error) {
      console.error('Error uploading answer sheets:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
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

  if (!teacherAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Answer Sheet Upload</h1>
          <p className="text-gray-600">
            Upload and process student answer sheets with AI
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {teacherAccess.classAccess.map((cls) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {teacherAccess.subjectAccess.map((subject) => (
                    <SelectItem key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={(value) => {
                console.log('Exam selected:', value);
                setSelectedExam(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.title} - {exam.subjectId.name} ({exam.classId.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Answer Sheets
          </CardTitle>
          <CardDescription>
            Select answer sheet images to upload and process with AI
          </CardDescription>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-medium">📋 Upload Steps:</p>
            <ol className="text-sm text-blue-700 mt-1 ml-4 list-decimal">
              <li>Select Class and Subject (optional)</li>
              <li>Click "Load Exams" to fetch available exams</li>
              <li>Select an Exam from the dropdown</li>
              <li>Select PDF files to upload</li>
              <li>Click "Upload" button</li>
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
            backgroundColor: selectedExam && selectedFiles.length > 0 ? '#d1fae5' : '#fef3c7',
            color: selectedExam && selectedFiles.length > 0 ? '#065f46' : '#92400e'
          }}>
            Status: {!selectedExam ? '❌ Please select an exam first' : selectedFiles.length === 0 ? '❌ Please select files to upload' : '✅ Ready to upload!'}
            <br />
            Debug: Exam={selectedExam ? 'Yes' : 'No'}, Files={selectedFiles.length}, Uploading={isUploading ? 'Yes' : 'No'}
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
                Processing answer sheets with AI...
              </p>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedExam || selectedFiles.length === 0 || isUploading}
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
              AI processing results for uploaded answer sheets
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
    </div>
  );
};

export default AnswerSheetUpload;
