import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Award,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  BookOpen,
  GraduationCap,
  ArrowRight,
  School,
  User,
  BookOpenCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { dashboardAPI, classesAPI, studentsAPI, subjectsAPI } from '@/services/api';

// Types for performance data
interface PerformanceData {
  school: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    averagePerformance: number;
    passRate: number;
  };
  gradeDistribution: {
    excellent: number; // 95-100
    veryGood: number;  // 90-95
    good: number;      // 80-90
    average: number;   // 70-80
    belowAverage: number; // 60-70
    poor: number;      // 50-60
    fail: number;      // Below 50
  };
  classPerformance: Array<{
    className: string;
    classId: string;
    totalStudents: number;
    averageScore: number;
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
  }>;
  subjectPerformance: Array<{
    subjectName: string;
    subjectId: string;
    totalStudents: number;
    averageScore: number;
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
  }>;
  staffPerformance: Array<{
    teacherName: string;
    teacherId: string;
    subjects: string[];
    classes: string[];
    totalStudents: number;
    averageScore: number;
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
  }>;
}

const PerformanceAnalytics = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [selectedView, setSelectedView] = useState<'school' | 'class' | 'subject' | 'student' | 'staff'>('school');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
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
    loadPerformanceData();
  }, [selectedView, selectedClass, selectedSubject, selectedTeacher, timeRange]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This would be replaced with actual API calls
      const mockData: PerformanceData = {
        school: {
          totalStudents: 1200,
          totalTeachers: 45,
          totalClasses: 24,
          totalSubjects: 12,
          averagePerformance: 78.5,
          passRate: 85.2
        },
        gradeDistribution: {
          excellent: 150,
          veryGood: 200,
          good: 300,
          average: 250,
          belowAverage: 150,
          poor: 100,
          fail: 50
        },
        classPerformance: [
          {
            className: 'Class 10A',
            classId: 'class-10a',
            totalStudents: 50,
            averageScore: 82.5,
            passRate: 92.0,
            gradeDistribution: {
              excellent: 15,
              veryGood: 20,
              good: 10,
              average: 3,
              belowAverage: 2,
              poor: 0,
              fail: 0
            }
          },
          {
            className: 'Class 10B',
            classId: 'class-10b',
            totalStudents: 48,
            averageScore: 75.2,
            passRate: 85.4,
            gradeDistribution: {
              excellent: 8,
              veryGood: 15,
              good: 18,
              average: 5,
              belowAverage: 2,
              poor: 0,
              fail: 0
            }
          }
        ],
        subjectPerformance: [
          {
            subjectName: 'Mathematics',
            subjectId: 'math',
            totalStudents: 200,
            averageScore: 72.5,
            passRate: 78.0,
            gradeDistribution: {
              excellent: 25,
              veryGood: 30,
              good: 50,
              average: 40,
              belowAverage: 30,
              poor: 20,
              fail: 5
            }
          },
          {
            subjectName: 'Physics',
            subjectId: 'physics',
            totalStudents: 180,
            averageScore: 68.2,
            passRate: 72.5,
            gradeDistribution: {
              excellent: 20,
              veryGood: 25,
              good: 35,
              average: 45,
              belowAverage: 35,
              poor: 15,
              fail: 5
            }
          }
        ],
        staffPerformance: [
          {
            teacherName: 'Dr. Smith',
            teacherId: 'teacher-1',
            subjects: ['Mathematics', 'Physics'],
            classes: ['Class 10A', 'Class 10B'],
            totalStudents: 98,
            averageScore: 78.5,
            passRate: 88.8,
            gradeDistribution: {
              excellent: 25,
              veryGood: 30,
              good: 25,
              average: 12,
              belowAverage: 4,
              poor: 2,
              fail: 0
            }
          }
        ]
      };
      
      setPerformanceData(mockData);
    } catch (err) {
      console.error('Error loading performance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderGradeDistributionChart = (data: any) => {
    const chartData = Object.entries(data).map(([key, value]) => ({
      name: gradeLabels[key as keyof typeof gradeLabels],
      value: value as number,
      color: gradeColors[key as keyof typeof gradeColors]
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderPerformanceBarChart = (data: any[], title: string, dataKey: string) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey={dataKey} fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading performance analytics...</p>
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
          <Button onClick={loadPerformanceData}>Try Again</Button>
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
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Performance Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Comprehensive performance analysis with graphical representations
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="view-select">View Type</Label>
              <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School Overview</SelectItem>
                  <SelectItem value="class">Class-wise</SelectItem>
                  <SelectItem value="subject">Subject-wise</SelectItem>
                  <SelectItem value="student">Student-wise</SelectItem>
                  <SelectItem value="staff">Staff Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time-range">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="current">Current Academic Year</SelectItem>
                  <SelectItem value="last">Last Academic Year</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedView === 'class' && (
              <div className="space-y-2">
                <Label htmlFor="class-select">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {performanceData?.classPerformance.map((cls) => (
                      <SelectItem key={cls.classId} value={cls.classId}>
                        {cls.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedView === 'subject' && (
              <div className="space-y-2">
                <Label htmlFor="subject-select">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {performanceData?.subjectPerformance.map((subject) => (
                      <SelectItem key={subject.subjectId} value={subject.subjectId}>
                        {subject.subjectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedView === 'staff' && (
              <div className="space-y-2">
                <Label htmlFor="teacher-select">Teacher</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {performanceData?.staffPerformance.map((teacher) => (
                      <SelectItem key={teacher.teacherId} value={teacher.teacherId}>
                        {teacher.teacherName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* School Overview */}
      {selectedView === 'school' && performanceData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* School Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <School className="w-5 h-5 mr-2" />
                School Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{performanceData.school.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{performanceData.school.totalTeachers}</div>
                  <div className="text-sm text-muted-foreground">Total Teachers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{performanceData.school.averagePerformance}%</div>
                  <div className="text-sm text-muted-foreground">Average Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{performanceData.school.passRate}%</div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Grade Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderGradeDistributionChart(performanceData.gradeDistribution)}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Class-wise Performance */}
      {selectedView === 'class' && performanceData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Class-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {performanceData.classPerformance.map((cls) => (
                  <Card key={cls.classId} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{cls.className}</CardTitle>
                      <CardDescription>
                        {cls.totalStudents} students • Average: {cls.averageScore}% • Pass Rate: {cls.passRate}%
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Average Score</div>
                            <div className="text-2xl font-bold text-primary">{cls.averageScore}%</div>
                          </div>
                          <div>
                            <div className="font-medium">Pass Rate</div>
                            <div className="text-2xl font-bold text-green-600">{cls.passRate}%</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Grade Distribution</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(cls.gradeDistribution).map(([grade, count]) => (
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
        </div>
      )}

      {/* Subject-wise Performance */}
      {selectedView === 'subject' && performanceData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Subject-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {performanceData.subjectPerformance.map((subject) => (
                  <Card key={subject.subjectId} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                      <CardDescription>
                        {subject.totalStudents} students • Average: {subject.averageScore}% • Pass Rate: {subject.passRate}%
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Average Score</div>
                            <div className="text-2xl font-bold text-primary">{subject.averageScore}%</div>
                          </div>
                          <div>
                            <div className="font-medium">Pass Rate</div>
                            <div className="text-2xl font-bold text-green-600">{subject.passRate}%</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Grade Distribution</div>
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
        </div>
      )}

      {/* Staff Performance */}
      {selectedView === 'staff' && performanceData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Staff Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {performanceData.staffPerformance.map((teacher) => (
                  <Card key={teacher.teacherId} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{teacher.teacherName}</CardTitle>
                      <CardDescription>
                        Subjects: {teacher.subjects.join(', ')} • Classes: {teacher.classes.join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Average Score</div>
                            <div className="text-2xl font-bold text-primary">{teacher.averageScore}%</div>
                          </div>
                          <div>
                            <div className="font-medium">Pass Rate</div>
                            <div className="text-2xl font-bold text-green-600">{teacher.passRate}%</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Student Performance Distribution</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(teacher.gradeDistribution).map(([grade, count]) => (
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
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalytics;
