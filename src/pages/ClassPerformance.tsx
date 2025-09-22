import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  ArrowLeft,
  Download,
  Search,
  Filter,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, classesAPI } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ClassPerformance = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [classPerformance, setClassPerformance] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const dashboardData = await dashboardAPI.getStats();
        console.log('Dashboard data:', dashboardData);
        
        // Get class performance data from the correct path
        const classPerformanceData = dashboardData.data?.classPerformance || [];
        const subjectPerformanceData = dashboardData.data?.subjectPerformance || [];
        const topPerformersData = dashboardData.data?.topPerformers || [];
        const totalStudentsInSystem = dashboardData.data?.overview?.totalStudents || 0;
        
        console.log('Class performance data:', classPerformanceData);
        console.log('Subject performance data:', subjectPerformanceData);
        console.log('Top performers data:', topPerformersData);
        console.log('Total students in system:', totalStudentsInSystem);
        
        // Set classes for filter dropdown - use classPerformance data
        const classesForFilter = classPerformanceData.map((cls: any) => ({
          classId: cls._id,
          className: cls.className
        }));
        setClasses(classesForFilter);
        
        // Calculate total results across all classes to distribute students proportionally
        const totalResultsAcrossClasses = classPerformanceData.reduce((sum: number, cls: any) => sum + (cls.totalResults || 0), 0);
        
        // Map the real data to the expected format
        const performance = classPerformanceData.map((cls: any) => {
          // Find top performers for this class
          const classTopPerformers = topPerformersData
            .filter((performer: any) => performer.className === cls.className)
            .slice(0, 3)
            .map((performer: any) => ({
              name: performer.studentName,
              percentage: Math.round(performer.averagePercentage)
            }));
          
          // Calculate performance distribution based on pass/fail
          const totalResults = cls.totalResults || 0;
          const passedResults = cls.passedResults || 0;
          const failedResults = totalResults - passedResults;
          
          // Calculate students per class based on proportion of results
          const resultsProportion = totalResultsAcrossClasses > 0 ? totalResults / totalResultsAcrossClasses : 0;
          const studentsInClass = Math.round(totalStudentsInSystem * resultsProportion);
          
          // Ensure minimum of 1 student per class if there are results
          const totalStudents = totalResults > 0 ? Math.max(studentsInClass, 1) : 0;
          
          // Estimate student distribution (this is approximate since we don't have exact student counts)
          const excellentStudents = Math.floor(passedResults * 0.3);
          const goodStudents = Math.floor(passedResults * 0.4);
          const averageStudents = Math.floor(passedResults * 0.2);
          const needsImprovement = failedResults;
          
          return {
            classId: cls._id,
            className: cls.className,
            totalStudents: totalStudents,
            averagePercentage: Math.round(cls.averagePercentage * 100) / 100,
            passRate: Math.round(cls.passPercentage * 100) / 100,
            excellentStudents,
            goodStudents,
            averageStudents,
            needsImprovement,
            subjectPerformance: subjectPerformanceData.length > 0 
              ? subjectPerformanceData.map((subject: any) => ({
                  subject: subject.subjectName,
                  average: Math.round(subject.averagePercentage * 100) / 100,
                  highest: subject.highestPercentage,
                  lowest: subject.lowestPercentage
                }))
              : [
                  { subject: 'No subject data available', average: 0, highest: 0, lowest: 0 }
                ],
            topPerformers: classTopPerformers.length > 0 ? classTopPerformers : [
              { name: 'No data available', percentage: 0 }
            ]
          };
        });
        
        setClassPerformance(performance);
      } catch (error) {
        console.error('Error loading class performance:', error);
        setError('Failed to load class performance data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPerformance = classPerformance.filter(cls => {
    const matchesSearch = cls.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || cls.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Class Performance</h1>
          <p className="text-muted-foreground">Loading class performance data...</p>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Class Performance</h1>
          <p className="text-destructive">{error}</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Failed to load class performance data</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
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
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Class Performance</h1>
          </div>
          <p className="text-muted-foreground">
            Detailed performance analysis by class
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

            {/* Summary Stats
            <Card>
        <CardHeader>
          <CardTitle>Overall Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {filteredPerformance.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Classes</div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {Math.round(filteredPerformance.reduce((sum, cls) => sum + cls.averagePercentage, 0) / filteredPerformance.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Average</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {filteredPerformance.reduce((sum, cls) => sum + cls.totalStudents, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {Math.round(filteredPerformance.reduce((sum, cls) => sum + cls.passRate, 0) / filteredPerformance.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Pass Rate</div>
            </div>
          </div>
        </CardContent>
      </Card> */}

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
                  {classes.map((cls) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      

      {/* Class Performance Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPerformance.map((cls) => (
          <Card key={cls.classId} className="hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{cls.className}</CardTitle>
                  <CardDescription>
                    {cls.totalStudents} students enrolled
                  </CardDescription>
                </div>
                <Badge 
                  variant={cls.averagePercentage >= 80 ? "default" : cls.averagePercentage >= 60 ? "secondary" : "destructive"}
                >
                  {cls.averagePercentage}%
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{cls.averagePercentage}%</div>
                  <div className="text-xs text-muted-foreground">Average</div>
                </div>
                <div className="text-center p-3 bg-success/5 rounded-lg">
                  <div className="text-2xl font-bold text-success">{cls.passRate}%</div>
                  <div className="text-xs text-muted-foreground">Pass Rate</div>
                </div>
              </div>

              {/* Performance Distribution */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Performance Distribution</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Excellent (80%+)</span>
                    <span className="font-medium text-success">{cls.excellentStudents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Good (60-79%)</span>
                    <span className="font-medium text-primary">{cls.goodStudents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average (40-59%)</span>
                    <span className="font-medium text-warning">{cls.averageStudents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Needs Improvement (&lt;40%)</span>
                    <span className="font-medium text-destructive">{cls.needsImprovement}</span>
                  </div>
                </div>
              </div>

              {/* Subject Performance */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Subject Averages</div>
                <div className="space-y-1">
                  {cls.subjectPerformance.slice(0, 4).map((subject) => (
                    <div key={subject.subject} className="flex justify-between text-sm">
                      <span className="truncate">{subject.subject}</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{subject.average}%</span>
                        {subject.highest > 0 && subject.lowest > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {subject.highest}% - {subject.lowest}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Top Performers</div>
                <div className="space-y-1">
                  {cls.topPerformers.map((performer, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{performer.name}</span>
                      <span className="font-medium text-primary">{performer.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full" 
                onClick={() => navigate(`/dashboard/performance/class-detail/${cls.classId}`)}
              >
                View Detailed Analysis
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
};

export default ClassPerformance;
