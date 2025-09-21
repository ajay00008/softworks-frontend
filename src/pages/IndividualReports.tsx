import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  ArrowLeft,
  Download,
  Search,
  Filter,
  BookOpen,
  Award,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { performanceAPI, studentsAPI } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const IndividualReports = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [individualReports, setIndividualReports] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const studentsData = await studentsAPI.getAll();
        setStudents(studentsData);
        
        // Mock data for individual reports
        const mockReports = studentsData.slice(0, 20).map((student, index) => ({
          id: student.userId,
          name: student.name,
          rollNumber: student.rollNumber,
          className: student.class?.[0]?.className || '11A',
          averagePercentage: Math.floor(Math.random() * 40) + 50,
          totalExams: Math.floor(Math.random() * 8) + 5,
          rank: index + 1,
          grade: Math.floor(Math.random() * 40) + 50 >= 80 ? 'A+' : 
                 Math.floor(Math.random() * 40) + 50 >= 70 ? 'A' : 
                 Math.floor(Math.random() * 40) + 50 >= 60 ? 'A-' : 
                 Math.floor(Math.random() * 40) + 50 >= 50 ? 'B+' : 'B',
          subjectPerformance: [
            { subject: 'Mathematics', percentage: Math.floor(Math.random() * 30) + 60, grade: 'A' },
            { subject: 'Physics', percentage: Math.floor(Math.random() * 30) + 60, grade: 'A-' },
            { subject: 'Chemistry', percentage: Math.floor(Math.random() * 30) + 60, grade: 'B+' },
            { subject: 'English', percentage: Math.floor(Math.random() * 30) + 60, grade: 'A' }
          ],
          attendance: Math.floor(Math.random() * 20) + 80,
          improvement: Math.floor(Math.random() * 10) - 5,
          lastExamDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: Math.random() > 0.8 ? 'Needs Attention' : Math.random() > 0.6 ? 'Good' : 'Excellent'
        }));
        
        setIndividualReports(mockReports);
      } catch (error) {
        console.error('Error loading individual reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredReports = individualReports.filter(report => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || report.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Needs Attention': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+') return 'text-green-600';
    if (grade === 'A') return 'text-blue-600';
    if (grade === 'A-') return 'text-indigo-600';
    if (grade === 'B+') return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Individual Reports</h1>
          <p className="text-muted-foreground">Loading individual student reports...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/performance')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Individual Reports</h1>
          </div>
          <p className="text-muted-foreground">
            Detailed individual student performance reports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export All Reports
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
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
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{report.name}</h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Roll: {report.rollNumber}</span>
                      <span>Class: {report.className}</span>
                      <span>Rank: #{report.rank}</span>
                      <span>Exams: {report.totalExams}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {report.averagePercentage}%
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Badge variant="outline" className={getGradeColor(report.grade)}>
                      {report.grade}
                    </Badge>
                    <div className={`flex items-center space-x-1 text-sm ${report.improvement > 0 ? 'text-success' : report.improvement < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      <TrendingUp className={`w-4 h-4 ${report.improvement < 0 ? 'rotate-180' : ''}`} />
                      <span>{report.improvement > 0 ? '+' : ''}{report.improvement}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Performance */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">Subject Performance</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {report.subjectPerformance.map((subject) => (
                    <div key={subject.subject} className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-primary">{subject.percentage}%</div>
                      <div className="text-xs text-muted-foreground">{subject.subject}</div>
                      <div className={`text-xs font-medium ${getGradeColor(subject.grade)}`}>
                        {subject.grade}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-primary">{report.attendance}%</div>
                    <div className="text-muted-foreground">Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-primary">{report.lastExamDate}</div>
                    <div className="text-muted-foreground">Last Exam</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-primary">{report.totalExams}</div>
                    <div className="text-muted-foreground">Total Exams</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-primary">#{report.rank}</div>
                    <div className="text-muted-foreground">Class Rank</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate(`/dashboard/performance/student-detail/${report.id}`)}
                >
                  View Detailed Report
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/dashboard/performance/student-print/${report.id}`)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Reports Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {filteredReports.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {Math.round(filteredReports.reduce((sum, report) => sum + report.averagePercentage, 0) / filteredReports.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Performance</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {filteredReports.filter(r => r.status === 'Excellent').length}
              </div>
              <div className="text-sm text-muted-foreground">Excellent Students</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {filteredReports.filter(r => r.status === 'Needs Attention').length}
              </div>
              <div className="text-sm text-muted-foreground">Need Attention</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualReports;
