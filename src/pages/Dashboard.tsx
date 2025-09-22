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
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { dashboardAPI, classesAPI, studentsAPI } from '@/services/api';

// Types for dashboard data
interface DashboardData {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    totalExams: number;
  };
  performance: {
    totalResults: number;
    averagePercentage: number;
    highestPercentage: number;
    lowestPercentage: number;
    passedResults: number;
    excellentResults: number;
    goodResults: number;
    averageResults: number;
    failedResults: number;
    passPercentage: number;
  };
  classPerformance: Array<{
    className: string;
    totalStudents: number;
    averagePercentage: number;
    totalResults: number;
  }>;
  subjectPerformance: Array<{
    subjectName: string;
    averagePercentage: number;
    totalResults: number;
    highestPercentage: number;
    lowestPercentage: number;
  }>;
  topPerformers: Array<{
    studentName: string;
    rollNumber: string;
    className: string;
    averagePercentage: number;
    totalExams: number;
  }>;
  recentActivity: Array<{
    title: string;
    examType: string;
    scheduledDate: string;
    status: string;
    subjectName: string;
    className: string;
    totalResults: number;
    averagePercentage: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    count: number;
  }>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [timeRange, setTimeRange] = useState('current');
  const [viewMode, setViewMode] = useState<'individual' | 'class'>('class');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
        timeRange
      };

      const [statsResponse, classesResponse, studentsResponse] = await Promise.all([
        dashboardAPI.getStats(params),
        classesAPI.getAll(),
        studentsAPI.getAll({ limit: 100 })
      ]);

      setDashboardData(statsResponse.data);
      setClasses(classesResponse.data || []);
      setStudents(studentsResponse.students.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [selectedClass, selectedSubject, timeRange]);

  // Chart data preparation
  const classChartData = dashboardData?.classPerformance
    .filter(cls => selectedClass === 'all' || cls.className === selectedClass)
    .map(cls => ({
      class: cls.className,
      average: cls.averagePercentage,
      students: cls.totalStudents
    })) || [];

  const subjectChartData = dashboardData?.subjectPerformance.map(subject => ({
    subject: subject.subjectName,
    average: subject.averagePercentage,
    highest: subject.highestPercentage,
    lowest: subject.lowestPercentage
  })) || [];

  const individualChartData = dashboardData?.topPerformers
    .filter(student => selectedClass === 'all' || student.className === selectedClass)
    .map((student, index) => ({
      name: student.studentName,
      percentage: student.averagePercentage,
      rank: index + 1
    })) || [];

  const gradeDistributionData = dashboardData?.gradeDistribution.map(grade => ({
    grade: grade.grade,
    count: grade.count
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExportReport = () => {
    // Implement export functionality
    console.log('Exporting performance report...');
  };

  const handlePrintReport = () => {
    // Implement print functionality
    window.print();
  };

  // Clickable performance cards
  const performanceCards = [
    {
      title: 'Class Average',
      description: 'View detailed class performance breakdown',
      icon: BarChart3,
      color: 'primary',
      onClick: () => navigate('/dashboard/performance/class-averages'),
      stats: dashboardData?.performance.averagePercentage || 0,
      unit: '%',
      badge: 'Overview'
    },
    {
      title: 'Top Performers',
      description: 'See students with highest scores',
      icon: Award,
      color: 'success',
      onClick: () => navigate('/dashboard/performance/top-performers'),
      stats: dashboardData?.topPerformers[0]?.averagePercentage || 0,
      unit: '%',
      badge: 'Excellence'
    },
    {
      title: 'Total Students',
      description: 'Total number of students in system',
      icon: Users,
      color: 'accent',
      onClick: () => navigate('/dashboard/performance/class-performance'),
      stats: dashboardData?.overview.totalStudents || 0,
      unit: ' students',
      badge: 'Total'
    },
    {
      title: 'Subject Analysis',
      description: 'Performance analysis by subject',
      icon: BookOpen,
      color: 'warning',
      onClick: () => navigate('/dashboard/performance/subject-analysis'),
      stats: dashboardData?.subjectPerformance.length || 0,
      unit: ' subjects',
      badge: 'Analysis'
    }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No dashboard data available</p>
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Individual and class performance monitoring with graphical representation</h1>
          </div>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={handleExportReport} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handlePrintReport} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Performance Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>View Mode</Label>
              <Select value={viewMode} onValueChange={(value: 'individual' | 'class') => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class Performance</SelectItem>
                  <SelectItem value="individual">Individual Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {dashboardData?.subjectPerformance.map((subject) => (
                    <SelectItem key={subject.subjectName} value={subject.subjectName}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.slice(0, 10).map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Term</SelectItem>
                  <SelectItem value="monthly">Last Month</SelectItem>
                  <SelectItem value="quarterly">Last Quarter</SelectItem>
                  <SelectItem value="yearly">Academic Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Clickable Performance Overview Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {performanceCards.map((card) => (
          <Card 
            key={card.title} 
            className="cursor-pointer hover:shadow-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
            onClick={card.onClick}
          >
            <CardHeader 
              className="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <card.icon className={`h-4 w-4 ${
                  card.color === 'primary' ? 'text-primary' :
                  card.color === 'success' ? 'text-success' :
                  card.color === 'accent' ? 'text-accent' :
                  card.color === 'warning' ? 'text-warning' :
                  'text-primary'
                }`} />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {card.stats}
                <span className="text-sm text-muted-foreground ml-1">{card.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Class Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Class Performance Comparison
            </CardTitle>
            <CardDescription>
              Average percentage across different classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                class: {
                  label: "Class",
                },
                average: {
                  label: "Average %",
                },
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="class" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="average" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subject-wise Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Subject-wise Performance
            </CardTitle>
            <CardDescription>
              Average marks by subject for selected class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                subject: {
                  label: "Subject",
                },
                average: {
                  label: "Average %",
                },
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={subjectChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Individual Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Individual Student Performance
            </CardTitle>
            <CardDescription>
              Overall percentage and ranking of students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                name: {
                  label: "Student",
                },
                percentage: {
                  label: "Percentage %",
                },
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={individualChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="percentage" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Grade Distribution
            </CardTitle>
            <CardDescription>
              Distribution of grades in selected class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                grade: {
                  label: "Grade",
                },
                count: {
                  label: "Number of Students",
                },
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, count }) => `${grade}: ${count}`}
                    outerRadius={60}
                    innerRadius={20}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Student Details */}
      {viewMode === 'individual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Individual Student Performance Details
            </CardTitle>
            <CardDescription>
              Detailed performance breakdown for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topPerformers
                .filter(student => selectedClass === 'all' || student.className === selectedClass)
                .map((student, index) => (
                <Card key={student.studentName} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-lg">{student.studentName}</h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            Roll: {student.rollNumber}
                          </Badge>
                          <Badge className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                            Class: {student.className}
                          </Badge>
                          <Badge variant={student.averagePercentage >= 80 ? 'default' : 'secondary'}>
                            Grade: {student.averagePercentage >= 80 ? 'A+' : student.averagePercentage >= 70 ? 'A' : 'B+'}
                          </Badge>
                          <Badge variant="outline">
                            Rank: #{index + 1}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Exams: {student.totalExams}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {student.averagePercentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">Overall Performance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;