import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  TrendingUp, 
  Users, 
  ArrowLeft,
  Download,
  Search,
  Medal,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { performanceAPI } from '@/services/api';
import { Input } from '@/components/ui/input';

const TopPerformers = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data for top performers
        const mockPerformers = [
          {
            id: '1',
            name: 'John Doe',
            rollNumber: '001',
            className: '11A',
            averagePercentage: 95.5,
            totalExams: 8,
            rank: 1,
            subjects: [
              { name: 'Mathematics', percentage: 98 },
              { name: 'Physics', percentage: 94 },
              { name: 'Chemistry', percentage: 96 },
              { name: 'English', percentage: 94 }
            ],
            grade: 'A+',
            improvement: '+5.2%'
          },
          {
            id: '2',
            name: 'Jane Smith',
            rollNumber: '002',
            className: '11A',
            averagePercentage: 92.3,
            totalExams: 8,
            rank: 2,
            subjects: [
              { name: 'Mathematics', percentage: 95 },
              { name: 'Physics', percentage: 90 },
              { name: 'Chemistry', percentage: 92 },
              { name: 'English', percentage: 92 }
            ],
            grade: 'A+',
            improvement: '+3.1%'
          },
          {
            id: '3',
            name: 'Mike Johnson',
            rollNumber: '003',
            className: '11B',
            averagePercentage: 89.7,
            totalExams: 8,
            rank: 3,
            subjects: [
              { name: 'Mathematics', percentage: 92 },
              { name: 'Physics', percentage: 88 },
              { name: 'Chemistry', percentage: 90 },
              { name: 'English', percentage: 89 }
            ],
            grade: 'A+',
            improvement: '+2.8%'
          },
          {
            id: '4',
            name: 'Sarah Wilson',
            rollNumber: '004',
            className: '11A',
            averagePercentage: 87.2,
            totalExams: 8,
            rank: 4,
            subjects: [
              { name: 'Mathematics', percentage: 89 },
              { name: 'Physics', percentage: 85 },
              { name: 'Chemistry', percentage: 88 },
              { name: 'English', percentage: 87 }
            ],
            grade: 'A',
            improvement: '+1.5%'
          },
          {
            id: '5',
            name: 'David Brown',
            rollNumber: '005',
            className: '11B',
            averagePercentage: 85.8,
            totalExams: 8,
            rank: 5,
            subjects: [
              { name: 'Mathematics', percentage: 88 },
              { name: 'Physics', percentage: 83 },
              { name: 'Chemistry', percentage: 86 },
              { name: 'English', percentage: 86 }
            ],
            grade: 'A',
            improvement: '+0.9%'
          }
        ];
        
        setTopPerformers(mockPerformers);
      } catch (error) {
        console.error('Error loading top performers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPerformers = topPerformers.filter(performer =>
    performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Star className="w-4 h-4 text-muted-foreground" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-200";
    if (rank === 3) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-primary/10 text-primary border-primary/20";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Top Performers</h1>
          <p className="text-muted-foreground">Loading top performers data...</p>
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
            <Award className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Top Performers</h1>
          </div>
          <p className="text-muted-foreground">
            Students with highest academic performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, roll number, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Performers List */}
      <div className="space-y-4">
        {filteredPerformers.map((performer) => (
          <Card key={performer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(performer.rank)}
                    <Badge className={getRankBadgeColor(performer.rank)}>
                      #{performer.rank}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{performer.name}</h3>
                      <Badge variant="outline">{performer.grade}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Roll: {performer.rollNumber}</span>
                      <span>Class: {performer.className}</span>
                      <span>Exams: {performer.totalExams}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {performer.averagePercentage}%
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-success">
                    <TrendingUp className="w-4 h-4" />
                    <span>{performer.improvement}</span>
                  </div>
                </div>
              </div>

              {/* Subject Performance */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">Subject Performance</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {performer.subjects.map((subject) => (
                    <div key={subject.name} className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-primary">{subject.percentage}%</div>
                      <div className="text-xs text-muted-foreground">{subject.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/dashboard/performance/student-detail/${performer.id}`)}
                >
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {topPerformers.length}
              </div>
              <div className="text-sm text-muted-foreground">Top Performers</div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {Math.round(topPerformers.reduce((sum, p) => sum + p.averagePercentage, 0) / topPerformers.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {topPerformers.filter(p => p.grade === 'A+').length}
              </div>
              <div className="text-sm text-muted-foreground">A+ Students</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {topPerformers.reduce((sum, p) => sum + p.totalExams, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Exams</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopPerformers;
