import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Users,
  BookOpen,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  GraduationCap,
  Brain,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

interface PerformanceData {
  subjectPerformance: {
    subjectId: string;
    subjectName: string;
    averageMarks: number;
    totalStudents: number;
    passPercentage: number;
    gradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  }[];
  classSummary: {
    classId: string;
    className: string;
    totalStudents: number;
    averageMarks: number;
    passPercentage: number;
    gradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  }[];
  individualPerformance: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    totalMarks: number;
    rank: number;
    grade: string;
    improvement: number;
  }[];
  failureAnalysis: {
    subjectId: string;
    subjectName: string;
    failureCount: number;
    failurePercentage: number;
    commonMistakes: string[];
  }[];
  trends: {
    date: string;
    averageMarks: number;
    passPercentage: number;
  }[];
}

const PerformanceAnalytics = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPerformanceData();
  }, [selectedClass, selectedSubject, selectedTimeRange]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: PerformanceData = {
        subjectPerformance: [
          {
            subjectId: 'math-1',
            subjectName: 'Mathematics',
            averageMarks: 78.5,
            totalStudents: 30,
            passPercentage: 86.7,
            gradeDistribution: { A: 8, B: 12, C: 6, D: 3, F: 1 }
          },
          {
            subjectId: 'physics-1',
            subjectName: 'Physics',
            averageMarks: 72.3,
            totalStudents: 28,
            passPercentage: 82.1,
            gradeDistribution: { A: 6, B: 10, C: 8, D: 3, F: 1 }
          },
          {
            subjectId: 'chemistry-1',
            subjectName: 'Chemistry',
            averageMarks: 75.8,
            totalStudents: 32,
            passPercentage: 84.4,
            gradeDistribution: { A: 7, B: 11, C: 9, D: 4, F: 1 }
          }
        ],
        classSummary: [
          {
            classId: 'class-11a',
            className: 'Class 11A',
            totalStudents: 30,
            averageMarks: 75.5,
            passPercentage: 83.3,
            gradeDistribution: { A: 7, B: 11, C: 8, D: 3, F: 1 }
          },
          {
            classId: 'class-11b',
            className: 'Class 11B',
            totalStudents: 28,
            averageMarks: 73.2,
            passPercentage: 82.1,
            gradeDistribution: { A: 6, B: 10, C: 8, D: 3, F: 1 }
          }
        ],
        individualPerformance: [
          {
            studentId: 'student-1',
            studentName: 'John Doe',
            rollNumber: '001',
            totalMarks: 95,
            rank: 1,
            grade: 'A+',
            improvement: 12
          },
          {
            studentId: 'student-2',
            studentName: 'Jane Smith',
            rollNumber: '002',
            totalMarks: 88,
            rank: 2,
            grade: 'A',
            improvement: 8
          },
          {
            studentId: 'student-3',
            studentName: 'Mike Johnson',
            rollNumber: '003',
            totalMarks: 82,
            rank: 3,
            grade: 'B+',
            improvement: -2
          }
        ],
        failureAnalysis: [
          {
            subjectId: 'math-1',
            subjectName: 'Mathematics',
            failureCount: 4,
            failurePercentage: 13.3,
            commonMistakes: ['Algebraic manipulation', 'Trigonometric identities', 'Calculus applications']
          },
          {
            subjectId: 'physics-1',
            subjectName: 'Physics',
            failureCount: 5,
            failurePercentage: 17.9,
            commonMistakes: ['Vector calculations', 'Kinematic equations', 'Force analysis']
          }
        ],
        trends: [
          { date: '2024-01-01', averageMarks: 72.5, passPercentage: 78.3 },
          { date: '2024-01-08', averageMarks: 74.2, passPercentage: 81.2 },
          { date: '2024-01-15', averageMarks: 75.8, passPercentage: 83.7 },
          { date: '2024-01-22', averageMarks: 76.3, passPercentage: 84.1 }
        ]
      };
      
      setPerformanceData(mockData);
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-orange-600 bg-orange-100';
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600';
    if (improvement < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading performance analytics...</p>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Detailed performance insights and analytics for your classes
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadPerformanceData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="class-11a">Class 11A</SelectItem>
            <SelectItem value="class-11b">Class 11B</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="math-1">Mathematics</SelectItem>
            <SelectItem value="physics-1">Physics</SelectItem>
            <SelectItem value="chemistry-1">Chemistry</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75.8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.3%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Percentage</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83.7%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Subject-wise Performance
          </CardTitle>
          <CardDescription>
            Performance breakdown by subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.subjectPerformance.map((subject) => (
              <div key={subject.subjectId} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">{subject.subjectName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {subject.totalStudents} students
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {subject.averageMarks}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Marks</div>
                    <div className="text-sm font-medium text-green-600">
                      {subject.passPercentage}% Pass Rate
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="text-center">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground">Grade {grade}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Class Summary
          </CardTitle>
          <CardDescription>
            Performance overview by class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.classSummary.map((classData) => (
              <div key={classData.classId} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">{classData.className}</h4>
                    <p className="text-sm text-muted-foreground">
                      {classData.totalStudents} students
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {classData.averageMarks}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Marks</div>
                    <div className="text-sm font-medium text-green-600">
                      {classData.passPercentage}% Pass Rate
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(classData.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="text-center">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground">Grade {grade}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Individual Performance
          </CardTitle>
          <CardDescription>
            Top performing students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.individualPerformance.map((student, index) => (
              <div key={student.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {student.rank}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">{student.studentName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Roll: {student.rollNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {student.totalMarks}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Marks</div>
                  </div>
                  <Badge className={getGradeColor(student.grade)}>
                    {student.grade}
                  </Badge>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getImprovementColor(student.improvement)}`}>
                      {student.improvement > 0 ? '+' : ''}{student.improvement}%
                    </div>
                    <div className="text-xs text-muted-foreground">Improvement</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Failure Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Failure Analysis
          </CardTitle>
          <CardDescription>
            Common mistakes and failure patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.failureAnalysis.map((analysis) => (
              <div key={analysis.subjectId} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">{analysis.subjectName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {analysis.failureCount} students failed ({analysis.failurePercentage}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {analysis.failurePercentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">Failure Rate</div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Common Mistakes:</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.commonMistakes.map((mistake, index) => (
                      <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                        {mistake}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Trends
          </CardTitle>
          <CardDescription>
            Performance trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <LineChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Performance trends chart</p>
              <p className="text-sm">Visual representation of performance over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
