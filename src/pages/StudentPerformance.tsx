import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  TrendingUp, 
  TrendingDown,
  Award,
  AlertTriangle,
  BookOpen,
  BarChart3,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { studentsAPI, classesAPI, subjectsAPI } from '@/services/api';

// Types for student performance data
interface StudentPerformanceData {
  studentId: string;
  studentName: string;
  className: string;
  rollNumber: string;
  overallPerformance: {
    averageScore: number;
    totalExams: number;
    passRate: number;
    rank: number;
    totalStudents: number;
  };
  subjectPerformance: Array<{
    subjectName: string;
    subjectId: string;
    averageScore: number;
    totalExams: number;
    passRate: number;
    gradeDistribution: {
      excellent: number;
      veryGood: number;
      good: number;
      average: number;
      belowAverage: number;
      poor: number;
      fail: number;
    };
    recentScores: Array<{
      examName: string;
      score: number;
      date: string;
      grade: string;
    }>;
  }>;
  performanceTrend: Array<{
    month: string;
    averageScore: number;
    examsTaken: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const StudentPerformance = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [studentData, setStudentData] = useState<StudentPerformanceData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Color scheme for grade distribution
  const gradeColors = {
    excellent: '#10B981', // Green
    veryGood: '#34D399', // Light Green
    good: '#FBBF24',     // Yellow
    average: '#F59E0B',  // Orange
    belowAverage: '#F97316', // Dark Orange
    poor: '#EF4444',    // Red
    fail: '#DC2626'     // Dark Red
  };

  const gradeLabels = {
    excellent: 'Excellent (95-100)',
    veryGood: 'Very Good (90-95)',
    good: 'Good (80-90)',
    average: 'Average (70-80)',
    belowAverage: 'Below Average (60-70)',
    poor: 'Poor (50-60)',
    fail: 'Fail (<50)'
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass, searchTerm]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentPerformance(selectedStudent);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockStudents = [
        {
          id: 'student-1',
          name: 'John Doe',
          className: 'Class 10A',
          rollNumber: '10A001',
          averageScore: 85.5
        },
        {
          id: 'student-2',
          name: 'Jane Smith',
          className: 'Class 10A',
          rollNumber: '10A002',
          averageScore: 92.3
        },
        {
          id: 'student-3',
          name: 'Mike Johnson',
          className: 'Class 10B',
          rollNumber: '10B001',
          averageScore: 78.2
        }
      ];
      
      setStudents(mockStudents);
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentPerformance = async (studentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      const mockStudentData: StudentPerformanceData = {
        studentId: studentId,
        studentName: 'John Doe',
        className: 'Class 10A',
        rollNumber: '10A001',
        overallPerformance: {
          averageScore: 85.5,
          totalExams: 12,
          passRate: 100,
          rank: 3,
          totalStudents: 50
        },
        subjectPerformance: [
          {
            subjectName: 'Mathematics',
            subjectId: 'math',
            averageScore: 88.5,
            totalExams: 4,
            passRate: 100,
            gradeDistribution: {
              excellent: 2,
              veryGood: 2,
              good: 0,
              average: 0,
              belowAverage: 0,
              poor: 0,
              fail: 0
            },
            recentScores: [
              { examName: 'Unit Test 1', score: 92, date: '2024-01-15', grade: 'A+' },
              { examName: 'Mid Term', score: 85, date: '2024-02-20', grade: 'A' },
              { examName: 'Unit Test 2', score: 90, date: '2024-03-10', grade: 'A+' },
              { examName: 'Final Exam', score: 87, date: '2024-04-15', grade: 'A' }
            ]
          },
          {
            subjectName: 'Physics',
            subjectId: 'physics',
            averageScore: 82.0,
            totalExams: 4,
            passRate: 100,
            gradeDistribution: {
              excellent: 1,
              veryGood: 2,
              good: 1,
              average: 0,
              belowAverage: 0,
              poor: 0,
              fail: 0
            },
            recentScores: [
              { examName: 'Unit Test 1', score: 85, date: '2024-01-15', grade: 'A' },
              { examName: 'Mid Term', score: 78, date: '2024-02-20', grade: 'B+' },
              { examName: 'Unit Test 2', score: 88, date: '2024-03-10', grade: 'A' },
              { examName: 'Final Exam', score: 77, date: '2024-04-15', grade: 'B+' }
            ]
          }
        ],
        performanceTrend: [
          { month: 'Jan', averageScore: 82, examsTaken: 3 },
          { month: 'Feb', averageScore: 85, examsTaken: 2 },
          { month: 'Mar', averageScore: 88, examsTaken: 3 },
          { month: 'Apr', averageScore: 87, examsTaken: 4 }
        ],
        strengths: ['Mathematics', 'Problem Solving', 'Analytical Thinking'],
        weaknesses: ['Physics Concepts', 'Time Management'],
        recommendations: [
          'Focus more on physics practical applications',
          'Practice time management during exams',
          'Consider additional physics tutoring'
        ]
      };
      
      setStudentData(mockStudentData);
    } catch (err) {
      console.error('Error loading student performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load student performance');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 95) return gradeColors.excellent;
    if (score >= 90) return gradeColors.veryGood;
    if (score >= 80) return gradeColors.good;
    if (score >= 70) return gradeColors.average;
    if (score >= 60) return gradeColors.belowAverage;
    if (score >= 50) return gradeColors.poor;
    return gradeColors.fail;
  };

  const getGradeLabel = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C+';
    if (score >= 50) return 'C';
    return 'F';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  if (isLoading && !studentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/performance')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Performance
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Student Performance Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Detailed performance analysis for individual students
          </p>
        </div>
      </div>

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Select Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Student</Label>
              <Input
                id="search"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="class-select">Filter by Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Class 10A">Class 10A</SelectItem>
                  <SelectItem value="Class 10B">Class 10B</SelectItem>
                  <SelectItem value="Class 11A">Class 11A</SelectItem>
                  <SelectItem value="Class 11B">Class 11B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-select">Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.rollNumber}) - {student.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Performance Details */}
      {studentData && (
        <div className="space-y-6">
          {/* Overall Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Overall Performance - {studentData.studentName}
              </CardTitle>
              <CardDescription>
                {studentData.className} • Roll Number: {studentData.rollNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{studentData.overallPerformance.averageScore}%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{studentData.overallPerformance.passRate}%</div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">#{studentData.overallPerformance.rank}</div>
                  <div className="text-sm text-muted-foreground">Class Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{studentData.overallPerformance.totalExams}</div>
                  <div className="text-sm text-muted-foreground">Exams Taken</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studentData.performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="averageScore" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject-wise Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Subject-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {studentData.subjectPerformance.map((subject) => (
                  <Card key={subject.subjectId} className="border-l-4" style={{ borderLeftColor: getGradeColor(subject.averageScore) }}>
                    <CardHeader>
                      <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                      <CardDescription>
                        Average: {subject.averageScore}% • Pass Rate: {subject.passRate}% • Exams: {subject.totalExams}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Recent Scores */}
                        <div>
                          <div className="text-sm font-medium mb-2">Recent Exam Scores</div>
                          <div className="space-y-2">
                            {subject.recentScores.map((exam, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div>
                                  <div className="font-medium">{exam.examName}</div>
                                  <div className="text-sm text-muted-foreground">{exam.date}</div>
                                </div>
                                <div className="text-right">
                                  <div 
                                    className="font-bold"
                                    style={{ color: getGradeColor(exam.score) }}
                                  >
                                    {exam.score}%
                                  </div>
                                  <div className="text-sm text-muted-foreground">{exam.grade}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Grade Distribution */}
                        <div>
                          <div className="text-sm font-medium mb-2">Grade Distribution</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                              <div key={grade} className="flex items-center justify-between">
                                <span className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: gradeColors[grade as keyof typeof gradeColors] }}
                                  />
                                  {gradeLabels[grade as keyof typeof gradeLabels]}
                                </span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analysis & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentData.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentData.weaknesses.map((weakness, index) => (
                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Target className="w-5 h-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentData.recommendations.map((recommendation, index) => (
                    <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                      {recommendation}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* No Student Selected */}
      {!selectedStudent && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a student to view their performance analysis</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentPerformance;
