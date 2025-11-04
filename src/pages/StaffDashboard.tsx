import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Download,
  Printer,
  Send,
  Search,
  Filter,
  Clock,
  Award,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Zap,
  RefreshCw,
  X,
  Plus
} from 'lucide-react';
import ResultsChartsStaff from '@/components/Results/ResultsChartsStaff';

// Mock data for demonstration
const mockStaffData = {
  assignedClasses: [
    { id: '1', name: 'Class 11A', subject: 'Mathematics', students: 30, pendingSheets: 5 },
    { id: '2', name: 'Class 11B', subject: 'Physics', students: 28, pendingSheets: 3 },
    { id: '3', name: 'Class 11C', subject: 'Chemistry', students: 32, pendingSheets: 7 }
  ],
  recentUploads: [
    { id: '1', studentName: 'John Doe', rollNumber: '001', exam: 'Mathematics Unit Test', uploadedAt: '2 hours ago', status: 'AI_CORRECTED', confidence: 92 },
    { id: '2', studentName: 'Jane Smith', rollNumber: '002', exam: 'Physics Mid-term', uploadedAt: '4 hours ago', status: 'MANUALLY_REVIEWED', confidence: 88 },
    { id: '3', studentName: 'Mike Johnson', rollNumber: '003', exam: 'Chemistry Unit Test', uploadedAt: '6 hours ago', status: 'PROCESSING', confidence: 0 }
  ],
  aiCorrections: [
    { id: '1', studentName: 'Alice Brown', rollNumber: '004', totalMarks: 85, aiMarks: 82, manualMarks: 85, confidence: 94, needsReview: false },
    { id: '2', studentName: 'Bob Wilson', rollNumber: '005', totalMarks: 78, aiMarks: 75, manualMarks: 78, confidence: 89, needsReview: true },
    { id: '3', studentName: 'Carol Davis', rollNumber: '006', totalMarks: 92, aiMarks: 90, manualMarks: 92, confidence: 96, needsReview: false }
  ],
  missingSheets: [
    { id: '1', studentName: 'David Lee', rollNumber: '007', exam: 'Mathematics Unit Test', reason: 'Sheet not submitted', markedAt: '1 hour ago' },
    { id: '2', studentName: 'Emma Garcia', rollNumber: '008', exam: 'Physics Mid-term', reason: 'Student absent', markedAt: '3 hours ago' }
  ]
};

const StaffDashboard = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [missingReason, setMissingReason] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    setIsUploading(false);
    toast({
      title: "Upload Complete",
      description: `${fileArray.length} answer sheet(s) uploaded successfully`,
    });
  };

  const handleMarkMissing = () => {
    if (!missingReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for marking as missing",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Marked as Missing",
      description: "Answer sheet has been marked as missing",
    });
    setShowMissingDialog(false);
    setMissingReason('');
  };

  const handleMarkAbsent = () => {
    toast({
      title: "Marked as Absent",
      description: "Student has been marked as absent",
    });
  };

  const handleAICorrection = async (sheetId: string) => {
    toast({
      title: "AI Correction Started",
      description: "AI is processing the answer sheet...",
    });
  };

  const handleManualOverride = (sheetId: string) => {
    toast({
      title: "Manual Override",
      description: "Manual correction interface opened",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED': return 'text-blue-600 bg-blue-100';
      case 'PROCESSING': return 'text-yellow-600 bg-yellow-100';
      case 'AI_CORRECTED': return 'text-green-600 bg-green-100';
      case 'MANUALLY_REVIEWED': return 'text-purple-600 bg-purple-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Answer sheet management and AI-powered correction
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Sheets
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Reports
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Send Results
          </Button>
        </div>
      </div>

      {/* Assigned Classes Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {mockStaffData.assignedClasses.map((cls) => (
          <Card key={cls.id} className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{cls.name}</CardTitle>
              <CardDescription>{cls.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Students:</span>
                  <span className="font-medium">{cls.students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending Sheets:</span>
                  <Badge variant={cls.pendingSheets > 0 ? "destructive" : "default"}>
                    {cls.pendingSheets}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="uploads" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="uploads">Recent Uploads</TabsTrigger>
          <TabsTrigger value="corrections">AI Corrections</TabsTrigger>
          <TabsTrigger value="missing">Missing/Absent</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        {/* Recent Uploads Tab */}
        <TabsContent value="uploads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Recent Answer Sheet Uploads
              </CardTitle>
              <CardDescription>
                Monitor uploaded answer sheets and their processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStaffData.recentUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{upload.studentName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Roll: {upload.rollNumber} • {upload.exam}
                        </p>
                        <p className="text-xs text-muted-foreground">{upload.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(upload.status)}>
                        {upload.status.replace('_', ' ')}
                      </Badge>
                      {upload.confidence > 0 && (
                        <span className={`text-sm font-medium ${getConfidenceColor(upload.confidence)}`}>
                          {upload.confidence}% confidence
                        </span>
                      )}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {upload.status === 'UPLOADED' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAICorrection(upload.id)}
                          >
                            <Brain className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Corrections Tab */}
        <TabsContent value="corrections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Correction Results
              </CardTitle>
              <CardDescription>
                Review AI corrections and make manual overrides if needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStaffData.aiCorrections.map((correction) => (
                  <div key={correction.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{correction.studentName}</h4>
                        <p className="text-sm text-muted-foreground">Roll: {correction.rollNumber}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{correction.totalMarks}</div>
                          <div className="text-xs text-muted-foreground">Total Marks</div>
                        </div>
                        <Badge className={correction.needsReview ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                          {correction.needsReview ? "Needs Review" : "Approved"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">AI Marks</div>
                        <div className="text-lg font-semibold">{correction.aiMarks}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Manual Marks</div>
                        <div className="text-lg font-semibold">{correction.manualMarks}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className={`text-lg font-semibold ${getConfidenceColor(correction.confidence)}`}>
                          {correction.confidence}%
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManualOverride(correction.id)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Override
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Missing/Absent Tab */}
        <TabsContent value="missing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Missing Answer Sheets & Absent Students
              </CardTitle>
              <CardDescription>
                Track missing sheets and absent students requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStaffData.missingSheets.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <div>
                        <h4 className="font-medium text-red-900">{item.studentName}</h4>
                        <p className="text-sm text-red-700">
                          Roll: {item.rollNumber} • {item.exam}
                        </p>
                        <p className="text-xs text-red-600">Reason: {item.reason}</p>
                        <p className="text-xs text-red-500">{item.markedAt}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowMissingDialog(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Update Reason
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Notify Admin
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <ResultsChartsStaff />
        </TabsContent>
      </Tabs>

      {/* Upload Answer Sheets Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Answer Sheets</DialogTitle>
            <DialogDescription>
              Upload scanned answer sheets for AI processing and correction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Exam</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math-unit-1">Mathematics Unit Test 1</SelectItem>
                  <SelectItem value="physics-mid">Physics Mid-term</SelectItem>
                  <SelectItem value="chemistry-unit-2">Chemistry Unit Test 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Files</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop answer sheet images here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
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

            {isUploading && (
              <div className="space-y-2">
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {uploadProgress}% complete
                </p>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files</Label>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark Missing Dialog */}
      <Dialog open={showMissingDialog} onOpenChange={setShowMissingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Missing</DialogTitle>
            <DialogDescription>
              Provide a reason for marking this answer sheet as missing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Enter reason for missing answer sheet..."
                value={missingReason}
                onChange={(e) => setMissingReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMissingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkMissing}>
                Mark as Missing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDashboard;
