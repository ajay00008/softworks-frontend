import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  ArrowLeft,
  Download,
  Search,
  Filter,
  Users,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { performanceAPI, subjectsAPI } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SubjectAnalysis = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subjectAnalysis, setSubjectAnalysis] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('11');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use mock data instead of API calls
        const mockSubjects = [
          { id: '1', name: 'Mathematics', code: 'MATH', level: [11, 12] },
          { id: '2', name: 'Physics', code: 'PHY', level: [11, 12] },
          { id: '3', name: 'Chemistry', code: 'CHEM', level: [11, 12] },
          { id: '4', name: 'English', code: 'ENG', level: [11, 12] },
          { id: '5', name: 'Biology', code: 'BIO', level: [11, 12] },
          { id: '6', name: 'Computer Science', code: 'CS', level: [11, 12] }
        ];
        setSubjects(mockSubjects);
        
        // Comprehensive mock data for subject analysis
        const mockAnalysis = [
          {
            subjectId: '1',
            subjectName: 'Mathematics',
            subjectCode: 'MATH',
            totalExams: 8,
            averagePercentage: 76.5,
            passRate: 82.3,
            excellentStudents: 12,
            goodStudents: 18,
            averageStudents: 15,
            needsImprovement: 8,
            highestScore: 98,
            lowestScore: 32,
            classPerformance: [
              { className: '11A', average: 78.5, students: 28 },
              { className: '11B', average: 76.2, students: 26 },
              { className: '11C', average: 72.8, students: 24 },
              { className: '12A', average: 82.1, students: 30 },
              { className: '12B', average: 79.4, students: 27 }
            ],
            difficulty: 'High',
            improvement: 3.2
          },
          {
            subjectId: '2',
            subjectName: 'Physics',
            subjectCode: 'PHY',
            totalExams: 7,
            averagePercentage: 81.2,
            passRate: 87.5,
            excellentStudents: 15,
            goodStudents: 20,
            averageStudents: 12,
            needsImprovement: 5,
            highestScore: 99,
            lowestScore: 45,
            classPerformance: [
              { className: '11A', average: 82.3, students: 28 },
              { className: '11B', average: 80.1, students: 26 },
              { className: '11C', average: 77.5, students: 24 },
              { className: '12A', average: 84.6, students: 30 },
              { className: '12B', average: 82.7, students: 27 }
            ],
            difficulty: 'High',
            improvement: 2.8
          },
          {
            subjectId: '3',
            subjectName: 'Chemistry',
            subjectCode: 'CHEM',
            totalExams: 6,
            averagePercentage: 84.7,
            passRate: 91.2,
            excellentStudents: 18,
            goodStudents: 22,
            averageStudents: 10,
            needsImprovement: 3,
            highestScore: 97,
            lowestScore: 55,
            classPerformance: [
              { className: '11A', average: 85.7, students: 28 },
              { className: '11B', average: 83.4, students: 26 },
              { className: '11C', average: 80.1, students: 24 },
              { className: '12A', average: 87.3, students: 30 },
              { className: '12B', average: 85.2, students: 27 }
            ],
            difficulty: 'Medium',
            improvement: 4.1
          },
          {
            subjectId: '4',
            subjectName: 'English',
            subjectCode: 'ENG',
            totalExams: 9,
            averagePercentage: 88.3,
            passRate: 94.6,
            excellentStudents: 22,
            goodStudents: 25,
            averageStudents: 8,
            needsImprovement: 2,
            highestScore: 98,
            lowestScore: 62,
            classPerformance: [
              { className: '11A', average: 88.2, students: 28 },
              { className: '11B', average: 86.8, students: 26 },
              { className: '11C', average: 84.3, students: 24 },
              { className: '12A', average: 89.8, students: 30 },
              { className: '12B', average: 87.9, students: 27 }
            ],
            difficulty: 'Low',
            improvement: 1.5
          },
          {
            subjectId: '5',
            subjectName: 'Biology',
            subjectCode: 'BIO',
            totalExams: 5,
            averagePercentage: 79.8,
            passRate: 85.4,
            excellentStudents: 14,
            goodStudents: 19,
            averageStudents: 13,
            needsImprovement: 6,
            highestScore: 96,
            lowestScore: 48,
            classPerformance: [
              { className: '11A', average: 81.2, students: 28 },
              { className: '11B', average: 79.5, students: 26 },
              { className: '11C', average: 76.8, students: 24 },
              { className: '12A', average: 83.1, students: 30 },
              { className: '12B', average: 80.9, students: 27 }
            ],
            difficulty: 'Medium',
            improvement: 2.3
          },
          {
            subjectId: '6',
            subjectName: 'Computer Science',
            subjectCode: 'CS',
            totalExams: 4,
            averagePercentage: 85.6,
            passRate: 92.1,
            excellentStudents: 16,
            goodStudents: 21,
            averageStudents: 9,
            needsImprovement: 4,
            highestScore: 99,
            lowestScore: 58,
            classPerformance: [
              { className: '11A', average: 86.8, students: 28 },
              { className: '11B', average: 84.2, students: 26 },
              { className: '11C', average: 81.5, students: 24 },
              { className: '12A', average: 88.9, students: 30 },
              { className: '12B', average: 86.3, students: 27 }
            ],
            difficulty: 'Medium',
            improvement: 3.7
          }
        ];
        
        setSubjectAnalysis(mockAnalysis);
      } catch (error) {
        console.error('Error loading subject analysis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedLevel]);

  const filteredAnalysis = subjectAnalysis.filter(subject =>
    subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-primary';
    if (percentage >= 40) return 'text-warning';
    return 'text-destructive';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Subject Analysis</h1>
          <p className="text-muted-foreground">Loading subject performance data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded"></div>
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
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Subject Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Performance analysis by subject
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
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
              <label className="text-sm font-medium">Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">Level 11</SelectItem>
                  <SelectItem value="12">Level 12</SelectItem>
                  <SelectItem value="10">Level 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Analysis Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAnalysis.map((subject) => (
          <Card key={subject.subjectId} className="hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{subject.subjectName}</CardTitle>
                  <CardDescription>
                    {subject.subjectCode} • {subject.totalExams} exams
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getDifficultyColor(subject.difficulty)}>
                    {subject.difficulty}
                  </Badge>
                  <div className={`text-2xl font-bold ${getPerformanceColor(subject.averagePercentage)}`}>
                    {subject.averagePercentage}%
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{subject.passRate}%</div>
                  <div className="text-xs text-muted-foreground">Pass Rate</div>
                </div>
                <div className="text-center p-3 bg-success/5 rounded-lg">
                  <div className="text-2xl font-bold text-success">{subject.excellentStudents}</div>
                  <div className="text-xs text-muted-foreground">Excellent</div>
                </div>
              </div>

              {/* Score Range */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Score Range</div>
                <div className="flex justify-between text-sm">
                  <span>Highest: {subject.highestScore}%</span>
                  <span>Lowest: {subject.lowestScore}%</span>
                </div>
              </div>

              {/* Performance Distribution */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Performance Distribution</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Excellent (80%+)</span>
                    <span className="font-medium text-success">{subject.excellentStudents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Good (60-79%)</span>
                    <span className="font-medium text-primary">{subject.goodStudents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average (40-59%)</span>
                    <span className="font-medium text-warning">{subject.averageStudents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Needs Improvement (&lt;40%)</span>
                    <span className="font-medium text-destructive">{subject.needsImprovement}</span>
                  </div>
                </div>
              </div>

              {/* Class Performance */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Class Performance</div>
                <div className="space-y-1">
                  {subject.classPerformance.map((cls) => (
                    <div key={cls.className} className="flex justify-between text-sm">
                      <span>{cls.className}</span>
                      <span className="font-medium">{cls.average}% ({cls.students} students)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Indicator */}
              <div className="flex items-center justify-between text-sm">
                <span>Improvement</span>
                <div className={`flex items-center space-x-1 ${subject.improvement > 0 ? 'text-success' : subject.improvement < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <TrendingUp className={`w-4 h-4 ${subject.improvement < 0 ? 'rotate-180' : ''}`} />
                  <span>{subject.improvement > 0 ? '+' : ''}{subject.improvement}%</span>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                onClick={() => navigate(`/dashboard/performance/subject-detail/${subject.subjectId}`)}
              >
                View Detailed Analysis
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {filteredAnalysis.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Subjects</div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {Math.round(filteredAnalysis.reduce((sum, subject) => sum + subject.averagePercentage, 0) / filteredAnalysis.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Performance</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {Math.round(filteredAnalysis.reduce((sum, subject) => sum + subject.passRate, 0) / filteredAnalysis.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Pass Rate</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {filteredAnalysis.reduce((sum, subject) => sum + subject.excellentStudents, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Excellent Students</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectAnalysis;
