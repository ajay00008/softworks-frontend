import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

// Mock data - replace with real API calls
const mockTeachers = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@school.com',
    subjects: ['Mathematics', 'Physics'],
    assignedClasses: ['11A', '11B'],
    permissions: {
      canCreateQuestions: true,
      canViewResults: true,
      canManageStudents: false,
      canAccessAnalytics: false
    },
    isActive: true
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@school.com',
    subjects: ['Chemistry', 'Biology'],
    assignedClasses: ['11A', '11C'],
    permissions: {
      canCreateQuestions: true,
      canViewResults: true,
      canManageStudents: true,
      canAccessAnalytics: false
    },
    isActive: true
  },
  {
    id: '3',
    name: 'Ms. Emily Davis',
    email: 'emily.davis@school.com',
    subjects: ['English', 'Literature'],
    assignedClasses: ['11B', '11C'],
    permissions: {
      canCreateQuestions: true,
      canViewResults: true,
      canManageStudents: false,
      canAccessAnalytics: true
    },
    isActive: true
  }
];

const mockClasses = ['11A', '11B', '11C', '12A', '12B'];
const mockSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Literature', 'History', 'Geography'];

const TeacherAssignment = () => {
  const [teachers, setTeachers] = useState(mockTeachers);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    selectedClasses: [] as string[],
    selectedSubjects: [] as string[],
    permissions: {
      canCreateQuestions: false,
      canViewResults: false,
      canManageStudents: false,
      canAccessAnalytics: false
    }
  });

  const handleEditAssignment = (teacher: any) => {
    setSelectedTeacher(teacher);
    setAssignmentForm({
      selectedClasses: teacher.assignedClasses || [],
      selectedSubjects: teacher.subjects || [],
      permissions: teacher.permissions || {
        canCreateQuestions: false,
        canViewResults: false,
        canManageStudents: false,
        canAccessAnalytics: false
      }
    });
    setShowAssignmentDialog(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedTeacher) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedTeachers = teachers.map(teacher => 
        teacher.id === selectedTeacher.id 
          ? {
              ...teacher,
              assignedClasses: assignmentForm.selectedClasses,
              subjects: assignmentForm.selectedSubjects,
              permissions: assignmentForm.permissions
            }
          : teacher
      );

      setTeachers(updatedTeachers);
      setShowAssignmentDialog(false);
      setSelectedTeacher(null);

      toast({
        title: "Assignment Updated",
        description: `Successfully updated assignments for ${selectedTeacher.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update teacher assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassToggle = (classId: string) => {
    setAssignmentForm(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    setAssignmentForm(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    setAssignmentForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission as keyof typeof prev.permissions]
      }
    }));
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPermissionBadge = (permission: boolean) => {
    return permission ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Allowed
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Restricted
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Teacher Assignment & Access Control</h1>
          </div>
          <p className="text-muted-foreground">
            Assign staff access and limitations for classes & subjects
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <div className="grid gap-4">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  {/* Teacher Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{teacher.name}</h3>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                    <Badge variant={teacher.isActive ? "default" : "destructive"}>
                      {teacher.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Assigned Classes */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assigned Classes:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.assignedClasses.map((classId) => (
                        <Badge key={classId} className="bg-blue-100 text-blue-800 border-blue-200">
                          {classId}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Subjects */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assigned Subjects:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} className="bg-green-100 text-green-800 border-green-200">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Access Permissions:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Create Questions</span>
                        {getPermissionBadge(teacher.permissions.canCreateQuestions)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Results</span>
                        {getPermissionBadge(teacher.permissions.canViewResults)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Manage Students</span>
                        {getPermissionBadge(teacher.permissions.canManageStudents)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Access Analytics</span>
                        {getPermissionBadge(teacher.permissions.canAccessAnalytics)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAssignment(teacher)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Assignment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Edit Teacher Assignment
            </DialogTitle>
            <DialogDescription>
              Assign classes, subjects, and permissions for {selectedTeacher?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Class Assignment */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Assign Classes
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {mockClasses.map((classId) => (
                  <div key={classId} className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${classId}`}
                      checked={assignmentForm.selectedClasses.includes(classId)}
                      onCheckedChange={() => handleClassToggle(classId)}
                    />
                    <Label htmlFor={`class-${classId}`} className="text-sm">
                      {classId}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Assignment */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Assign Subjects
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {mockSubjects.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject}`}
                      checked={assignmentForm.selectedSubjects.includes(subject)}
                      onCheckedChange={() => handleSubjectToggle(subject)}
                    />
                    <Label htmlFor={`subject-${subject}`} className="text-sm">
                      {subject}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Access Permissions
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Create Questions</Label>
                    <p className="text-xs text-muted-foreground">Allow teacher to create and manage questions</p>
                  </div>
                  <Checkbox
                    checked={assignmentForm.permissions.canCreateQuestions}
                    onCheckedChange={() => handlePermissionToggle('canCreateQuestions')}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">View Results</Label>
                    <p className="text-xs text-muted-foreground">Allow teacher to view student results</p>
                  </div>
                  <Checkbox
                    checked={assignmentForm.permissions.canViewResults}
                    onCheckedChange={() => handlePermissionToggle('canViewResults')}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Manage Students</Label>
                    <p className="text-xs text-muted-foreground">Allow teacher to manage student data</p>
                  </div>
                  <Checkbox
                    checked={assignmentForm.permissions.canManageStudents}
                    onCheckedChange={() => handlePermissionToggle('canManageStudents')}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Access Analytics</Label>
                    <p className="text-xs text-muted-foreground">Allow teacher to view performance analytics</p>
                  </div>
                  <Checkbox
                    checked={assignmentForm.permissions.canAccessAnalytics}
                    onCheckedChange={() => handlePermissionToggle('canAccessAnalytics')}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowAssignmentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAssignment}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Assignment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAssignment;

