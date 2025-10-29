import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { teacherDashboardAPI } from '@/services/api';

interface Student {
  _id: string;
  rollNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  classId: {
    _id: string;
    name: string;
    displayName: string;
    level: number;
    section: string;
  };
  isActive: boolean;
}

interface Class {
  _id: string;
  name: string;
  displayName: string;
  level: number;
  section: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const TeacherStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20
      };

      if (selectedClass !== 'all') {
        params.classId = selectedClass;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await teacherDashboardAPI.getAssignedStudents(params);
      
      if (response.success) {
        setStudents(response.data.students || []);
        setClasses(response.data.classes || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, searchTerm, currentPage, toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClassFilter = (value: string) => {
    setSelectedClass(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const exportStudents = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  const getClassStats = () => {
    const stats: { [key: string]: number } = {};
    students.forEach(student => {
      const className = student.classId.displayName;
      stats[className] = (stats[className] || 0) + 1;
    });
    return stats;
  };

  const classStats = getClassStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground">
            View and manage students in your assigned classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportStudents}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadStudents} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Class Statistics */}
      {classes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {classes.map((cls) => (
            <Card key={cls._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {cls.displayName}
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classStats[cls.displayName] || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Students
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or roll number..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedClass} onValueChange={handleClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({pagination?.totalCount || 0})
          </CardTitle>
          <CardDescription>
            {selectedClass === 'all' 
              ? 'All students in your assigned classes'
              : `Students in ${classes.find(c => c._id === selectedClass)?.displayName || 'selected class'}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No students found</p>
              <p className="text-sm mt-2">
                {searchTerm || selectedClass !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No students are assigned to your classes yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{student.userId.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Roll: {student.rollNumber} • {student.classId.displayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.userId.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={student.isActive ? "default" : "secondary"}>
                        {student.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalCount)} of {pagination.totalCount} students
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudents;
