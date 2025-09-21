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
import { performanceAPI } from '@/services/api';

// Mock data for demonstration - replace with real API calls
const mockPerformanceData = {
  individual: [
    { studentId: '1', studentName: 'John Doe', rollNumber: '001', class: '11A', 
      subjects: [
        { name: 'Mathematics', marks: 85, total: 100, percentage: 85 },
        { name: 'Physics', marks: 78, total: 100, percentage: 78 },
        { name: 'Chemistry', marks: 92, total: 100, percentage: 92 },
        { name: 'English', marks: 88, total: 100, percentage: 88 }
      ],
      overallPercentage: 85.75,
      grade: 'A',
      rank: 3
    },
    { studentId: '2', studentName: 'Jane Smith', rollNumber: '002', class: '11A',
      subjects: [
        { name: 'Mathematics', marks: 92, total: 100, percentage: 92 },
        { name: 'Physics', marks: 88, total: 100, percentage: 88 },
        { name: 'Chemistry', marks: 85, total: 100, percentage: 85 },
        { name: 'English', marks: 90, total: 100, percentage: 90 }
      ],
      overallPercentage: 88.75,
      grade: 'A+',
      rank: 1
    },
    { studentId: '3', studentName: 'Mike Johnson', rollNumber: '003', class: '11A',
      subjects: [
        { name: 'Mathematics', marks: 75, total: 100, percentage: 75 },
        { name: 'Physics', marks: 82, total: 100, percentage: 82 },
        { name: 'Chemistry', marks: 78, total: 100, percentage: 78 },
        { name: 'English', marks: 85, total: 100, percentage: 85 }
      ],
      overallPercentage: 80.0,
      grade: 'A-',
      rank: 5
    }
  ],
  classPerformance: [
    { class: '11A', totalStudents: 30, averagePercentage: 82.5, 
      gradeDistribution: { 'A+': 5, 'A': 12, 'A-': 8, 'B+': 3, 'B': 2 },
      subjectAverages: [
        { subject: 'Mathematics', average: 78.5, highest: 95, lowest: 45 },
        { subject: 'Physics', average: 82.3, highest: 98, lowest: 52 },
        { subject: 'Chemistry', average: 85.7, highest: 96, lowest: 58 },
        { subject: 'English', average: 88.2, highest: 97, lowest: 65 }
      ]
    },
    { class: '11B', totalStudents: 28, averagePercentage: 79.8,
      gradeDistribution: { 'A+': 3, 'A': 10, 'A-': 9, 'B+': 4, 'B': 2 },
      subjectAverages: [
        { subject: 'Mathematics', average: 76.2, highest: 92, lowest: 42 },
        { subject: 'Physics', average: 80.1, highest: 95, lowest: 48 },
        { subject: 'Chemistry', average: 83.4, highest: 94, lowest: 55 },
        { subject: 'English', average: 86.8, highest: 96, lowest: 62 }
      ]
    }
  ]
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('11A');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [timeRange, setTimeRange] = useState('current');
  const [viewMode, setViewMode] = useState<'individual' | 'class'>('class');
  const [isLoading, setIsLoading] = useState(false);

  // Chart data preparation
  const classChartData = mockPerformanceData.classPerformance
    .filter(cls => selectedClass === 'all' || cls.class === selectedClass)
    .map(cls => ({
      class: cls.class,
      average: cls.averagePercentage,
      students: cls.totalStudents
    }));

  const subjectChartData = mockPerformanceData.classPerformance
    .find(cls => cls.class === selectedClass)
    ?.subjectAverages.map(subject => ({
      subject: subject.subject,
      average: subject.average,
      highest: subject.highest,
      lowest: subject.lowest
    })) || [];

  const individualChartData = mockPerformanceData.individual
    .filter(student => selectedClass === 'all' || student.class === selectedClass)
    .map(student => ({
      name: student.studentName,
      percentage: student.overallPercentage,
      rank: student.rank
    }));

  const gradeDistributionData = mockPerformanceData.classPerformance
    .find(cls => cls.class === selectedClass)
    ?.gradeDistribution ? Object.entries(
        mockPerformanceData.classPerformance.find(cls => cls.class === selectedClass)?.gradeDistribution || {}
      ).map(([grade, count]) => ({ grade, count })) : [];

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
    // {
    //   title: 'Class Average',
    //   description: 'View detailed class performance breakdown',
    //   icon: BarChart3,
    //   color: 'primary',
    //   onClick: () => navigate('/dashboard/performance/class-averages'),
    //   stats: mockPerformanceData.classPerformance.find(cls => cls.class === selectedClass)?.averagePercentage || 0,
    //   unit: '%',
    //   badge: 'Overview'
    // },
    {
      title: 'Top Performers',
      description: 'See students with highest scores',
      icon: Award,
      color: 'success',
      onClick: () => navigate('/dashboard/performance/top-performers'),
      stats: mockPerformanceData.individual.reduce((prev, current) => 
        prev.overallPercentage > current.overallPercentage ? prev : current
      ).overallPercentage,
      unit: '%',
      badge: 'Excellence'
    },
    {
      title: 'Class Performance',
      description: 'Detailed class-wise performance analysis',
      icon: Users,
      color: 'accent',
      onClick: () => navigate('/dashboard/performance/class-performance'),
      stats: mockPerformanceData.classPerformance.find(cls => cls.class === selectedClass)?.totalStudents || 0,
      unit: ' students',
      badge: 'Detailed'
    },
    {
      title: 'Subject Analysis',
      description: 'Performance analysis by subject',
      icon: BookOpen,
      color: 'warning',
      onClick: () => navigate('/dashboard/performance/subject-analysis'),
      stats: subjectChartData.length,
      unit: ' subjects',
      badge: 'Analysis'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Individual and class performance monitoring with graphical representation</h1>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handlePrintReport}>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                  <SelectItem value="11A">Class 11A</SelectItem>
                  <SelectItem value="11B">Class 11B</SelectItem>
                  <SelectItem value="11C">Class 11C</SelectItem>
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
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="english">English</SelectItem>
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
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="jane">Jane Smith</SelectItem>
                  <SelectItem value="mike">Mike Johnson</SelectItem>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-6 lg:grid-cols-2">
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
              className="h-[300px]"
            >
              <BarChart data={classChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="#8884d8" />
              </BarChart>
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
              className="h-[300px]"
            >
              <LineChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
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
              className="h-[300px]"
            >
              <BarChart data={individualChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="percentage" fill="#82ca9d" />
              </BarChart>
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
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, count }) => `${grade}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
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
              {mockPerformanceData.individual
                .filter(student => selectedClass === 'all' || student.class === selectedClass)
                .map((student) => (
                <Card key={student.studentId} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-lg">{student.studentName}</h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            Roll: {student.rollNumber}
                          </Badge>
                          <Badge className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                            Class: {student.class}
                          </Badge>
                          <Badge variant={student.grade === 'A+' ? 'default' : 'secondary'}>
                            Grade: {student.grade}
                          </Badge>
                          <Badge variant="outline">
                            Rank: #{student.rank}
                          </Badge>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 text-sm">
                          {student.subjects.map((subject) => (
                            <div key={subject.name} className="flex justify-between">
                              <span className="text-muted-foreground">{subject.name}:</span>
                              <span className="font-medium">{subject.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {student.overallPercentage}%
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