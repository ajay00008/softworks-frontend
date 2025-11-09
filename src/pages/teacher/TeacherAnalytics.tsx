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
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Target,
  Award,
  Clock,
  RefreshCw,
  Download,
  Eye,
  Brain,
  Zap,
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

interface AnalyticsData {
  classPerformance: {
    className: string;
    averageMarks: number;
    passPercentage: number;
    totalStudents: number;
    appearedStudents: number;
    gradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  }[];
  subjectPerformance: {
    subjectName: string;
    averageMarks: number;
    passPercentage: number;
    totalExams: number;
    difficultyLevel: string;
    questionTypeDistribution: {
      type: string;
      count: number;
      averageMarks: number;
    }[];
  }[];
  studentProgress: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    totalExams: number;
    averageMarks: number;
    improvement: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }[];
  examTrends: {
    examId: string;
    examTitle: string;
    date: string;
    averageMarks: number;
    passPercentage: number;
    difficultyLevel: string;
    totalQuestions: number;
  }[];
  bloomsTaxonomyAnalysis: {
    level: string;
    percentage: number;
    averageMarks: number;
    difficulty: string;
  }[];
  questionTypeAnalysis: {
    type: string;
    count: number;
    averageMarks: number;
    difficulty: string;
    successRate: number;
  }[];
}

const TeacherAnalytics = () => {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess | null>(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeacherAccess();
  }, []);

  useEffect(() => {
    if (teacherAccess) {
      loadAnalytics();
    }
  }, [teacherAccess, selectedClass, selectedSubject, selectedTimeRange]);

  const loadTeacherAccess = async () => {
    try {
      const response = await teacherDashboardAPI.getAccess();
      setTeacherAccess(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teacher access",
        variant: "destructive",
      });
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await teacherDashboardAPI.getAnalytics({
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
        timeRange: selectedTimeRange,
      });
      setAnalyticsData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = {
      EASY: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      MODERATE: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      TOUGHEST: { color: 'bg-red-100 text-red-800', icon: X },
    };

    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.MODERATE;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {difficulty}
      </Badge>
    );
  };

  const getImprovementBadge = (improvement: number) => {
    if (improvement > 0) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{improvement.toFixed(1)}%
        </Badge>
      );
    } else if (improvement < 0) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <TrendingDown className="w-3 h-3 mr-1" />
          {improvement.toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          <Target className="w-3 h-3 mr-1" />
          No Change
        </Badge>
      );
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Comprehensive analytics and insights for teaching performance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={loadingAnalytics}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingAnalytics ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loadingAnalytics ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading analytics...</span>
            </div>
          </CardContent>
        </Card>
      ) : !analyticsData ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
              <p className="mt-1 text-sm text-gray-500">
                No analytics data available for the selected filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Class Performance Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.classPerformance.map((classData, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">{classData.className}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Marks</span>
                      <span className="font-bold">{classData.averageMarks.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pass Percentage</span>
                      <span className="font-bold">{classData.passPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Students</span>
                      <span className="font-bold">{classData.appearedStudents}/{classData.totalStudents}</span>
                    </div>
                    <Progress value={classData.passPercentage} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance Analysis</CardTitle>
              <CardDescription>
                Performance metrics across different subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.subjectPerformance.map((subject, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">{subject.subjectName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{subject.totalExams} exams</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {getDifficultyBadge(subject.difficultyLevel)}
                        <Badge variant="outline" className="text-xs">
                          {subject.averageMarks.toFixed(1)} avg marks
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Average Marks</span>
                        <div className="font-medium">{subject.averageMarks.toFixed(1)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Pass Percentage</span>
                        <div className="font-medium">{subject.passPercentage.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Exams</span>
                        <div className="font-medium">{subject.totalExams}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty</span>
                        <div className="font-medium">{subject.difficultyLevel}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Tracking</CardTitle>
              <CardDescription>
                Individual student performance and improvement tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.studentProgress.map((student, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">{student.studentName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Roll: {student.rollNumber}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {getImprovementBadge(student.improvement)}
                        <Badge variant="outline" className="text-xs">
                          {student.averageMarks.toFixed(1)} avg
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total Exams</span>
                        <div className="font-medium">{student.totalExams}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Average Marks</span>
                        <div className="font-medium">{student.averageMarks.toFixed(1)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Improvement</span>
                        <div className="font-medium">{student.improvement.toFixed(1)}%</div>
                      </div>
                    </div>
                    {student.strengths.length > 0 && (
                      <div className="mt-3 p-2 bg-green-50 rounded">
                        <div className="text-sm font-medium text-green-800 mb-1">Strengths:</div>
                        <div className="text-sm text-green-700">
                          {student.strengths.join(', ')}
                        </div>
                      </div>
                    )}
                    {student.weaknesses.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 rounded">
                        <div className="text-sm font-medium text-red-800 mb-1">Areas for Improvement:</div>
                        <div className="text-sm text-red-700">
                          {student.weaknesses.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exam Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Trends</CardTitle>
              <CardDescription>
                Performance trends across different exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.examTrends.map((exam, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">{exam.examTitle}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{new Date(exam.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {getDifficultyBadge(exam.difficultyLevel)}
                        <Badge variant="outline" className="text-xs">
                          {exam.totalQuestions} questions
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Average Marks</span>
                        <div className="font-medium">{exam.averageMarks.toFixed(1)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Pass Percentage</span>
                        <div className="font-medium">{exam.passPercentage.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty</span>
                        <div className="font-medium">{exam.difficultyLevel}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Questions</span>
                        <div className="font-medium">{exam.totalQuestions}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bloom's Taxonomy Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Bloom's Taxonomy Analysis</CardTitle>
              <CardDescription>
                Distribution and performance across cognitive levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.bloomsTaxonomyAnalysis.map((level, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{level.level}</h3>
                      <Badge variant="outline">{level.percentage.toFixed(1)}%</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average Marks</span>
                        <span className="font-medium">{level.averageMarks.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Difficulty</span>
                        <span className="font-medium">{level.difficulty}</span>
                      </div>
                      <Progress value={level.percentage} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question Type Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Question Type Analysis</CardTitle>
              <CardDescription>
                Performance analysis across different question types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.questionTypeAnalysis.map((type, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{type.type}</h3>
                      <Badge variant="outline">{type.count} questions</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average Marks</span>
                        <span className="font-medium">{type.averageMarks.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Success Rate</span>
                        <span className="font-medium">{type.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Difficulty</span>
                        <span className="font-medium">{type.difficulty}</span>
                      </div>
                      <Progress value={type.successRate} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TeacherAnalytics;
