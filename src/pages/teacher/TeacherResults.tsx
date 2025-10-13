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
  Award, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Search,
  Filter,
  Clock,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Target,
  CheckCircle,
  AlertTriangle,
  X
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

interface StudentResult {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNumber: string;
  };
  examId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank: number;
  status: string;
  aiCorrectionResults?: {
    questionWiseResults: Array<{
      questionNumber: number;
      correctAnswer: string;
      studentAnswer: string;
      isCorrect: boolean;
      marksObtained: number;
      maxMarks: number;
      feedback: string;
    }>;
    overallFeedback: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  manualOverride?: {
    totalMarks: number;
    obtainedMarks: number;
    reason: string;
    overriddenBy: string;
    overriddenAt: string;
  };
  submittedAt: string;
  correctedAt: string;
}

interface ClassStats {
  totalStudents: number;
  appearedStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passPercentage: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

const TeacherResults = () => {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedExam, setSelectedExam] = useState('');
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const { toast } = useToast();

  useEffect(() => {
    loadTeacherAccess();
  }, []);

  useEffect(() => {
    if (teacherAccess && selectedExam) {
      loadResults();
      loadClassStats();
    }
  }, [teacherAccess, selectedExam]);

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

  const loadResults = async () => {
    if (!selectedExam) return;

    try {
      setLoadingResults(true);
      const response = await teacherDashboardAPI.getExamResults(selectedExam);
      setStudentResults(response.data || []);
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Error",
        description: "Failed to load results",
        variant: "destructive",
      });
    } finally {
      setLoadingResults(false);
    }
  };

  const loadClassStats = async () => {
    if (!selectedExam) return;

    try {
      const response = await teacherDashboardAPI.getClassStats(selectedExam);
      setClassStats(response.data);
    } catch (error) {
      console.error('Error loading class stats:', error);
      toast({
        title: "Error",
        description: "Failed to load class statistics",
        variant: "destructive",
      });
    }
  };

  const getGradeBadge = (grade: string) => {
    const gradeConfig = {
      A: { color: 'bg-green-100 text-green-800', icon: Award },
      B: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      C: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      D: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      F: { color: 'bg-red-100 text-red-800', icon: X },
    };

    const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig.F;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        Grade {grade}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PASSED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-800', icon: X },
      ABSENT: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const filteredResults = studentResults.filter(result => {
    const matchesSearch = result.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        result.studentId.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || result.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return a.rank - b.rank;
      case 'marks':
        return b.obtainedMarks - a.obtainedMarks;
      case 'percentage':
        return b.percentage - a.percentage;
      case 'name':
        return a.studentId.name.localeCompare(b.studentId.name);
      default:
        return a.rank - b.rank;
    }
  });

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
          <h1 className="text-3xl font-bold">Exam Results</h1>
          <p className="text-gray-600">
            View and analyze student performance and results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadResults}
            disabled={loadingResults}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingResults ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {/* Exams will be loaded based on class and subject filters */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                  <SelectItem value="D">Grade D</SelectItem>
                  <SelectItem value="F">Grade F</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="marks">Marks</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="search">Search Students</Label>
            <Input
              id="search"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Class Statistics */}
      {classStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{classStats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Appeared</p>
                  <p className="text-2xl font-bold">{classStats.appearedStudents}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Marks</p>
                  <p className="text-2xl font-bold">{classStats.averageMarks.toFixed(1)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pass Percentage</p>
                  <p className="text-2xl font-bold">{classStats.passPercentage.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Distribution */}
      {classStats && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(classStats.gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600">Grade {grade}</div>
                  <Progress 
                    value={(count / classStats.totalStudents) * 100} 
                    className="mt-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      {loadingResults ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading results...</span>
            </div>
          </CardContent>
        </Card>
      ) : sortedResults.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedExam ? 'No results found for this exam.' : 'Please select an exam to view results.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedResults.map((result) => (
            <Card key={result._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{result.studentId.name}</CardTitle>
                    <CardDescription>
                      Roll Number: {result.studentId.rollNumber} | Rank: #{result.rank}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getGradeBadge(result.grade)}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Marks Obtained</div>
                    <div className="text-lg font-bold">
                      {result.obtainedMarks} / {result.totalMarks}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Percentage</div>
                    <div className="text-lg font-bold">{result.percentage.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Grade</div>
                    <div className="text-lg font-bold">{result.grade}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="text-lg font-bold">{result.status}</div>
                  </div>
                </div>

                {result.aiCorrectionResults && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">AI Feedback</div>
                    <div className="text-sm text-blue-700">{result.aiCorrectionResults.overallFeedback}</div>
                  </div>
                )}

                {result.manualOverride && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800 mb-2">Manual Override</div>
                    <div className="text-sm text-purple-700">
                      Reason: {result.manualOverride.reason}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherResults;
