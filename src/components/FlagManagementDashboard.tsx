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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Search, 
  Download, 
  Eye,
  Plus,
  X,
  RefreshCw
} from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';

interface FlagData {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: string;
  detectedBy?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  autoResolved: boolean;
}

interface AnswerSheet {
  _id: string;
  examId: string;
  studentId?: {
    _id: string;
    name: string;
    rollNumber: string;
    email: string;
  };
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
  flags: FlagData[];
  processingStatus: string;
  flagCount: number;
  hasCriticalFlags: boolean;
  flagResolutionRate: number;
}

interface FlagStatistics {
  totalFlags: number;
  resolvedFlags: number;
  unresolvedFlags: number;
  criticalFlags: number;
  flagsByType: Record<string, number>;
  flagsBySeverity: Record<string, number>;
  averageResolutionTime: number;
  resolutionRate: number;
}

const FlagManagementDashboard = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [exams, setExams] = useState<any[]>([]);
  const [flaggedSheets, setFlaggedSheets] = useState<AnswerSheet[]>([]);
  const [flagStatistics, setFlagStatistics] = useState<FlagStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    severity: '',
    type: '',
    resolved: '',
    search: ''
  });
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [showAddFlagDialog, setShowAddFlagDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedSheetForFlag, setSelectedSheetForFlag] = useState<AnswerSheet | null>(null);
  const [newFlag, setNewFlag] = useState({
    type: '',
    severity: 'MEDIUM' as const,
    description: ''
  });
  const [resolutionNotes, setResolutionNotes] = useState('');
  const { toast } = useToast();

  // Load exams
  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teacherDashboardAPI.getExamsWithContext();
      setExams(response.data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      toast({
        title: "Error",
        description: `Failed to load exams: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load flagged answer sheets
  const loadFlaggedSheets = useCallback(async (examId: string) => {
    try {
      setLoading(true);
      const response = await teacherDashboardAPI.getFlaggedAnswerSheets(examId, {
        severity: filters.severity || undefined,
        type: filters.type || undefined,
        resolved: filters.resolved ? filters.resolved === 'true' : undefined
      });
      setFlaggedSheets(response.data || []);
    } catch (error) {
      console.error('Error loading flagged sheets:', error);
      toast({
        title: "Error",
        description: `Failed to load flagged answer sheets: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Load flag statistics
  const loadFlagStatistics = useCallback(async (examId: string) => {
    try {
      setLoadingStats(true);
      const response = await teacherDashboardAPI.getFlagStatistics(examId);
      setFlagStatistics(response.data);
    } catch (error) {
      console.error('Error loading flag statistics:', error);
      toast({
        title: "Error",
        description: `Failed to load flag statistics: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
    }
  }, [toast]);

  // Handle exam selection
  const handleExamChange = async (examId: string) => {
    setSelectedExam(examId);
    if (examId) {
      await Promise.all([
        loadFlaggedSheets(examId),
        loadFlagStatistics(examId)
      ]);
    } else {
      setFlaggedSheets([]);
      setFlagStatistics(null);
    }
  };

  // Add flag to answer sheet
  const handleAddFlag = async () => {
    if (!selectedSheetForFlag || !newFlag.type || !newFlag.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await teacherDashboardAPI.addFlag(selectedSheetForFlag._id, {
        type: newFlag.type,
        severity: newFlag.severity,
        description: newFlag.description,
        autoResolved: false
      });

      toast({
        title: "Success",
        description: "Flag added successfully",
      });

      setShowAddFlagDialog(false);
      setNewFlag({ type: '', severity: 'MEDIUM', description: '' });
      setSelectedSheetForFlag(null);

      // Reload data
      if (selectedExam) {
        await loadFlaggedSheets(selectedExam);
        await loadFlagStatistics(selectedExam);
      }
    } catch (error) {
      console.error('Error adding flag:', error);
      toast({
        title: "Error",
        description: `Failed to add flag: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Resolve all flags for selected sheets
  const handleBulkResolve = async () => {
    if (selectedSheets.length === 0) {
      toast({
        title: "Error",
        description: "Please select answer sheets to resolve flags",
        variant: "destructive",
      });
      return;
    }

    try {
      await teacherDashboardAPI.bulkResolveFlags(selectedSheets, {
        resolutionNotes: resolutionNotes || 'Bulk resolution',
        autoResolved: false
      });

      toast({
        title: "Success",
        description: `Flags resolved for ${selectedSheets.length} answer sheet(s)`,
      });

      setShowResolveDialog(false);
      setSelectedSheets([]);
      setResolutionNotes('');

      // Reload data
      if (selectedExam) {
        await loadFlaggedSheets(selectedExam);
        await loadFlagStatistics(selectedExam);
      }
    } catch (error) {
      console.error('Error bulk resolving flags:', error);
      toast({
        title: "Error",
        description: `Failed to resolve flags: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Auto-detect flags for answer sheet
  const handleAutoDetectFlags = async (answerSheet: AnswerSheet) => {
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

      // Reload data
      if (selectedExam) {
        await loadFlaggedSheets(selectedExam);
        await loadFlagStatistics(selectedExam);
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

  // Filter flagged sheets
  const filteredSheets = flaggedSheets.filter(sheet => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        sheet.originalFileName.toLowerCase().includes(searchTerm) ||
        sheet.studentId?.name.toLowerCase().includes(searchTerm) ||
        sheet.studentId?.rollNumber.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    if (selectedExam) {
      loadFlaggedSheets(selectedExam);
      loadFlagStatistics(selectedExam);
    }
  }, [selectedExam, loadFlaggedSheets, loadFlagStatistics]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM': return <Flag className="h-4 w-4" />;
      case 'LOW': return <Flag className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Flag Management Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Comprehensive Flag System
        </Badge>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Exam Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-select">Select Exam</Label>
            <Select value={selectedExam} onValueChange={handleExamChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading exams..." : "Choose an exam"} />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam._id} value={exam._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{exam.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {exam.examType} • {exam.studentCount} students
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Flag Statistics */}
      {flagStatistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Flag Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{flagStatistics.totalFlags}</div>
                <div className="text-sm text-muted-foreground">Total Flags</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{flagStatistics.resolvedFlags}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{flagStatistics.unresolvedFlags}</div>
                <div className="text-sm text-muted-foreground">Unresolved</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{flagStatistics.criticalFlags}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Resolution Rate</span>
                <span>{flagStatistics.resolutionRate.toFixed(1)}%</span>
              </div>
              <Progress value={flagStatistics.resolutionRate} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flagged-sheets">Flagged Answer Sheets</TabsTrigger>
          <TabsTrigger value="bulk-operations">Bulk Operations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {flagStatistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flags by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Flags by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(flagStatistics.flagsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm">{type.replace(/_/g, ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Flags by Severity */}
              <Card>
                <CardHeader>
                  <CardTitle>Flags by Severity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(flagStatistics.flagsBySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(severity)}
                          <span className="text-sm">{severity}</span>
                        </div>
                        <Badge variant={getSeverityColor(severity) as any}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Flagged Answer Sheets Tab */}
        <TabsContent value="flagged-sheets" className="space-y-4">
          {!selectedExam ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please select an exam first to view flagged answer sheets.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All severities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All severities</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All types</SelectItem>
                          <SelectItem value="UNMATCHED_ROLL">Unmatched Roll</SelectItem>
                          <SelectItem value="POOR_QUALITY">Poor Quality</SelectItem>
                          <SelectItem value="MISSING_PAGES">Missing Pages</SelectItem>
                          <SelectItem value="ALIGNMENT_ISSUE">Alignment Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={filters.resolved} onValueChange={(value) => setFilters(prev => ({ ...prev, resolved: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All statuses</SelectItem>
                          <SelectItem value="false">Unresolved</SelectItem>
                          <SelectItem value="true">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or roll number..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flagged Sheets List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Flagged Answer Sheets ({filteredSheets.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddFlagDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Flag
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSheets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No flagged answer sheets found.
                      </div>
                    ) : (
                      filteredSheets.map((sheet) => (
                        <div key={sheet._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedSheets.includes(sheet._id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedSheets(prev => [...prev, sheet._id]);
                                  } else {
                                    setSelectedSheets(prev => prev.filter(id => id !== sheet._id));
                                  }
                                }}
                              />
                              <div>
                                <p className="font-medium">{sheet.originalFileName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Student: {sheet.studentId?.name} ({sheet.studentId?.rollNumber}) • 
                                  Flags: {sheet.flagCount} • 
                                  Status: {sheet.processingStatus}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={sheet.hasCriticalFlags ? 'destructive' : 'secondary'}>
                                {sheet.hasCriticalFlags ? 'Critical' : 'Normal'}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAutoDetectFlags(sheet)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Flags */}
                          <div className="space-y-2">
                            {sheet.flags.map((flag, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div className="flex items-center gap-2">
                                  {getSeverityIcon(flag.severity)}
                                  <span className="text-sm font-medium">{flag.type.replace(/_/g, ' ')}</span>
                                  <Badge variant={getSeverityColor(flag.severity) as any} className="text-xs">
                                    {flag.severity}
                                  </Badge>
                                  {flag.resolved && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Resolved
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(flag.detectedAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk-operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Answer Sheets: {selectedSheets.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Select answer sheets from the flagged sheets tab to perform bulk operations
                  </p>
                </div>
                <Button
                  onClick={() => setShowResolveDialog(true)}
                  disabled={selectedSheets.length === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve All Flags
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Flag Dialog */}
      <Dialog open={showAddFlagDialog} onOpenChange={setShowAddFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Flag to Answer Sheet</DialogTitle>
            <DialogDescription>
              Add a new flag to track issues with an answer sheet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Answer Sheet</Label>
              <Select onValueChange={(value) => {
                const sheet = flaggedSheets.find(s => s._id === value);
                setSelectedSheetForFlag(sheet || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select answer sheet" />
                </SelectTrigger>
                <SelectContent>
                  {flaggedSheets.map((sheet) => (
                    <SelectItem key={sheet._id} value={sheet._id}>
                      {sheet.originalFileName} - {sheet.studentId?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Flag Type</Label>
              <Select value={newFlag.type} onValueChange={(value) => setNewFlag(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select flag type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNMATCHED_ROLL">Unmatched Roll Number</SelectItem>
                  <SelectItem value="POOR_QUALITY">Poor Quality</SelectItem>
                  <SelectItem value="MISSING_PAGES">Missing Pages</SelectItem>
                  <SelectItem value="ALIGNMENT_ISSUE">Alignment Issue</SelectItem>
                  <SelectItem value="DUPLICATE_UPLOAD">Duplicate Upload</SelectItem>
                  <SelectItem value="INVALID_FORMAT">Invalid Format</SelectItem>
                  <SelectItem value="SIZE_TOO_LARGE">Size Too Large</SelectItem>
                  <SelectItem value="CORRUPTED_FILE">Corrupted File</SelectItem>
                  <SelectItem value="MANUAL_REVIEW_REQUIRED">Manual Review Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={newFlag.severity} onValueChange={(value: any) => setNewFlag(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue..."
                value={newFlag.description}
                onChange={(e) => setNewFlag(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddFlagDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFlag}>
                Add Flag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Flags Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Flags</DialogTitle>
            <DialogDescription>
              Resolve all flags for the selected answer sheets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Add notes about the resolution..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkResolve}>
                Resolve Flags
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlagManagementDashboard;
