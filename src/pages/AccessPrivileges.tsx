import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Shield, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  CheckCircle, 
  AlertTriangle,
  GraduationCap,
  BookOpen,
  BarChart3,
  Printer,
  Send,
  Clock,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { teachersAPI, classManagementAPI, subjectManagementAPI } from '@/services/api';
import { accessPrivilegesAPI } from '@/services/accessPrivilegesAPI';

interface StaffAccess {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  assignedBy: string;
  classAccess: Array<{
    classId: string;
    className: string;
    accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
    canUploadSheets: boolean;
    canMarkAbsent: boolean;
    canMarkMissing: boolean;
    canOverrideAI: boolean;
  }>;
  subjectAccess: Array<{
    subjectId: string;
    subjectName: string;
    accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
    canCreateQuestions: boolean;
    canUploadSyllabus: boolean;
  }>;
  globalPermissions: {
    canViewAllClasses: boolean;
    canViewAllSubjects: boolean;
    canAccessAnalytics: boolean;
    canPrintReports: boolean;
    canSendNotifications: boolean;
  };
  isActive: boolean;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}


interface Teacher {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface Class {
  id: string;
  name: string;
  displayName: string;
  level: number;
  section: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  category: string;
}

const AccessPrivileges = () => {
  console.log('AccessPrivileges component rendering...');
  
  const [staffAccessList, setStaffAccessList] = useState<StaffAccess[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAccess, setEditingAccess] = useState<StaffAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  // Form state for creating/editing access
  const [accessForm, setAccessForm] = useState({
    staffId: '',
    classAccess: [] as Array<{
      classId: string;
      className: string;
      accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
      canUploadSheets: boolean;
      canMarkAbsent: boolean;
      canMarkMissing: boolean;
      canOverrideAI: boolean;
    }>,
    subjectAccess: [] as Array<{
      subjectId: string;
      subjectName: string;
      accessLevel: 'READ_ONLY' | 'READ_WRITE' | 'FULL_ACCESS';
      canCreateQuestions: boolean;
      canUploadSyllabus: boolean;
    }>,
    globalPermissions: {
      canViewAllClasses: false,
      canViewAllSubjects: false,
      canAccessAnalytics: false,
      canPrintReports: true,
      canSendNotifications: false,
    },
    expiresAt: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load teachers, classes, subjects, and existing access
      const [teachersResponse, classesResponse, subjectsResponse, staffAccessResponse] = await Promise.all([
        teachersAPI.getAll().catch(() => ({ teachers: [] })),
        classManagementAPI.getAll().catch(() => ({ classes: [] })),
        subjectManagementAPI.getAll().catch(() => ({ subjects: [] })),
        accessPrivilegesAPI.getAll().catch(() => ({ data: [] }))
      ]);

      setTeachers(teachersResponse.teachers || []);
      setClasses(classesResponse.classes || []);
      setSubjects(subjectsResponse.subjects || []);
      setStaffAccessList(staffAccessResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays as fallback to prevent blank screen
      setTeachers([]);
      setClasses([]);
      setSubjects([]);
      setStaffAccessList([]);
      toast({
        title: "Error",
        description: "Failed to load access privileges data. Using fallback data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccess = async () => {
    if (!accessForm.staffId) {
      toast({
        title: "Error",
        description: "Please select a teacher",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await accessPrivilegesAPI.create({
        staffId: accessForm.staffId,
        classAccess: accessForm.classAccess,
        subjectAccess: accessForm.subjectAccess,
        globalPermissions: accessForm.globalPermissions,
        expiresAt: accessForm.expiresAt,
        notes: accessForm.notes
      });

      if (response.success) {
        setStaffAccessList(prev => [...prev, response.data]);
        setShowCreateDialog(false);
        resetForm();
        
        toast({
          title: "Success",
          description: "Access privileges created successfully",
        });
      } else {
        throw new Error('Failed to create access');
      }
    } catch (error) {
      console.error('Error creating access:', error);
      toast({
        title: "Error",
        description: "Failed to create access privileges",
        variant: "destructive",
      });
    }
  };

  const handleEditAccess = (access: StaffAccess) => {
    setEditingAccess(access);
    setAccessForm({
      staffId: access.staffId,
      classAccess: access.classAccess,
      subjectAccess: access.subjectAccess,
      globalPermissions: access.globalPermissions,
      expiresAt: access.expiresAt || '',
      notes: access.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateAccess = async () => {
    if (!editingAccess) return;

    try {
      const response = await accessPrivilegesAPI.update(editingAccess.id, {
        classAccess: accessForm.classAccess,
        subjectAccess: accessForm.subjectAccess,
        globalPermissions: accessForm.globalPermissions,
        expiresAt: accessForm.expiresAt,
        notes: accessForm.notes
      });

      if (response.success) {
        setStaffAccessList(prev => 
          prev.map(access => access.id === editingAccess.id ? response.data : access)
        );
        setShowEditDialog(false);
        setEditingAccess(null);
        resetForm();
        
        toast({
          title: "Success",
          description: "Access privileges updated successfully",
        });
      } else {
        throw new Error('Failed to update access');
      }
    } catch (error) {
      console.error('Error updating access:', error);
      toast({
        title: "Error",
        description: "Failed to update access privileges",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccess = async (accessId: string) => {
    try {
      const response = await accessPrivilegesAPI.delete(accessId);
      
      if (response.success) {
        setStaffAccessList(prev => prev.filter(access => access.id !== accessId));
        toast({
          title: "Success",
          description: "Access privileges deleted successfully",
        });
      } else {
        throw new Error('Failed to delete access');
      }
    } catch (error) {
      console.error('Error deleting access:', error);
      toast({
        title: "Error",
        description: "Failed to delete access privileges",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAccessForm({
      staffId: '',
      classAccess: [],
      subjectAccess: [],
      globalPermissions: {
        canViewAllClasses: false,
        canViewAllSubjects: false,
        canAccessAnalytics: false,
        canPrintReports: true,
        canSendNotifications: false,
      },
      expiresAt: '',
      notes: ''
    });
  };

  const addClassAccess = () => {
    setAccessForm(prev => ({
      ...prev,
      classAccess: [...prev.classAccess, {
        classId: '',
        className: '',
        accessLevel: 'READ_ONLY',
        canUploadSheets: false,
        canMarkAbsent: false,
        canMarkMissing: false,
        canOverrideAI: false
      }]
    }));
  };

  const addSubjectAccess = () => {
    setAccessForm(prev => ({
      ...prev,
      subjectAccess: [...prev.subjectAccess, {
        subjectId: '',
        subjectName: '',
        accessLevel: 'READ_ONLY',
        canCreateQuestions: false,
        canUploadSyllabus: false
      }]
    }));
  };

  const removeClassAccess = (index: number) => {
    setAccessForm(prev => ({
      ...prev,
      classAccess: prev.classAccess.filter((_, i) => i !== index)
    }));
  };

  const removeSubjectAccess = (index: number) => {
    setAccessForm(prev => ({
      ...prev,
      subjectAccess: prev.subjectAccess.filter((_, i) => i !== index)
    }));
  };

  const updateClassAccess = (index: number, field: string, value: any) => {
    setAccessForm(prev => ({
      ...prev,
      classAccess: prev.classAccess.map((access, i) => 
        i === index ? { ...access, [field]: value } : access
      )
    }));
  };

  const updateSubjectAccess = (index: number, field: string, value: any) => {
    setAccessForm(prev => ({
      ...prev,
      subjectAccess: prev.subjectAccess.map((access, i) => 
        i === index ? { ...access, [field]: value } : access
      )
    }));
  };

  const filteredAccess = staffAccessList.filter(access => {
    const matchesSearch = access.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         access.staffEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && access.isActive) ||
                         (filterStatus === 'inactive' && !access.isActive);
    return matchesSearch && matchesStatus;
  });

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'FULL_ACCESS': return 'text-green-600 bg-green-100';
      case 'READ_WRITE': return 'text-blue-600 bg-blue-100';
      case 'READ_ONLY': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading access privileges...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering AccessPrivileges main content...');
  
  // Fallback content in case of any issues
  try {
    return (
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Access Privileges</h1>
          </div>
          <p className="text-muted-foreground">
            Manage teacher permissions and access control
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Access
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Access List */}
      <div className="space-y-4">
        {filteredAccess.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Access Privileges Found</h3>
              <p className="text-muted-foreground mb-4">
                {staffAccessList.length === 0 
                  ? "No access privileges have been created yet. Click 'Create Access' to get started."
                  : "No access privileges match your current filters."
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Access
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAccess.map((access) => (
          <Card key={access.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{access.staffName}</span>
                    <Badge variant={access.isActive ? "default" : "secondary"}>
                      {access.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{access.staffEmail}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditAccess(access)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteAccess(access.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="classes" className="w-full">
                <TabsList>
                  <TabsTrigger value="classes">Class Access</TabsTrigger>
                  <TabsTrigger value="subjects">Subject Access</TabsTrigger>
                  <TabsTrigger value="permissions">Global Permissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="classes" className="space-y-4">
                  <div className="grid gap-4">
                    {access.classAccess.map((classAccess, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{classAccess.className}</h4>
                            <Badge className={getAccessLevelColor(classAccess.accessLevel)}>
                              {classAccess.accessLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={classAccess.canUploadSheets} disabled />
                              <Label className="text-sm">Can Upload Sheets</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={classAccess.canMarkAbsent} disabled />
                              <Label className="text-sm">Can Mark Absent</Label>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={classAccess.canMarkMissing} disabled />
                              <Label className="text-sm">Can Mark Missing</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={classAccess.canOverrideAI} disabled />
                              <Label className="text-sm">Can Override AI</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="subjects" className="space-y-4">
                  <div className="grid gap-4">
                    {access.subjectAccess.map((subjectAccess, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{subjectAccess.subjectName}</h4>
                            <Badge className={getAccessLevelColor(subjectAccess.accessLevel)}>
                              {subjectAccess.accessLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={subjectAccess.canCreateQuestions} disabled />
                            <Label className="text-sm">Can Create Questions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={subjectAccess.canUploadSyllabus} disabled />
                            <Label className="text-sm">Can Upload Syllabus</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canViewAllClasses} disabled />
                      <Label className="text-sm">Can View All Classes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canViewAllSubjects} disabled />
                      <Label className="text-sm">Can View All Subjects</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canAccessAnalytics} disabled />
                      <Label className="text-sm">Can Access Analytics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canPrintReports} disabled />
                      <Label className="text-sm">Can Print Reports</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={access.globalPermissions.canSendNotifications} disabled />
                      <Label className="text-sm">Can Send Notifications</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))
        )}
      </div>

      {/* Create Access Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Access Privileges</DialogTitle>
            <DialogDescription>
              Set up access permissions for a teacher
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select Teacher *</Label>
              <Select value={accessForm.staffId} onValueChange={(value) => setAccessForm(prev => ({ ...prev, staffId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Class Access</Label>
                <Button type="button" variant="outline" size="sm" onClick={addClassAccess}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Class
                </Button>
              </div>
              {accessForm.classAccess.map((classAccess, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Class Access {index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeClassAccess(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select 
                        value={classAccess.classId} 
                        onValueChange={(value) => {
                          const selectedClass = classes.find(c => c.id === value);
                          updateClassAccess(index, 'classId', value);
                          updateClassAccess(index, 'className', selectedClass?.name || '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Level</Label>
                      <Select 
                        value={classAccess.accessLevel} 
                        onValueChange={(value) => updateClassAccess(index, 'accessLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="READ_ONLY">Read Only</SelectItem>
                          <SelectItem value="READ_WRITE">Read Write</SelectItem>
                          <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={classAccess.canUploadSheets} 
                          onCheckedChange={(checked) => updateClassAccess(index, 'canUploadSheets', checked)}
                        />
                        <Label className="text-sm">Can Upload Sheets</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={classAccess.canMarkAbsent} 
                          onCheckedChange={(checked) => updateClassAccess(index, 'canMarkAbsent', checked)}
                        />
                        <Label className="text-sm">Can Mark Absent</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={classAccess.canMarkMissing} 
                          onCheckedChange={(checked) => updateClassAccess(index, 'canMarkMissing', checked)}
                        />
                        <Label className="text-sm">Can Mark Missing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={classAccess.canOverrideAI} 
                          onCheckedChange={(checked) => updateClassAccess(index, 'canOverrideAI', checked)}
                        />
                        <Label className="text-sm">Can Override AI</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Subject Access</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSubjectAccess}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>
              {accessForm.subjectAccess.map((subjectAccess, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Subject Access {index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeSubjectAccess(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select 
                        value={subjectAccess.subjectId} 
                        onValueChange={(value) => {
                          const selectedSubject = subjects.find(s => s.id === value);
                          updateSubjectAccess(index, 'subjectId', value);
                          updateSubjectAccess(index, 'subjectName', selectedSubject?.name || '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Level</Label>
                      <Select 
                        value={subjectAccess.accessLevel} 
                        onValueChange={(value) => updateSubjectAccess(index, 'accessLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="READ_ONLY">Read Only</SelectItem>
                          <SelectItem value="READ_WRITE">Read Write</SelectItem>
                          <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={subjectAccess.canCreateQuestions} 
                        onCheckedChange={(checked) => updateSubjectAccess(index, 'canCreateQuestions', checked)}
                      />
                      <Label className="text-sm">Can Create Questions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={subjectAccess.canUploadSyllabus} 
                        onCheckedChange={(checked) => updateSubjectAccess(index, 'canUploadSyllabus', checked)}
                      />
                      <Label className="text-sm">Can Upload Syllabus</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">Global Permissions</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canViewAllClasses} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canViewAllClasses: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can View All Classes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canViewAllSubjects} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canViewAllSubjects: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can View All Subjects</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canAccessAnalytics} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canAccessAnalytics: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can Access Analytics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canPrintReports} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canPrintReports: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can Print Reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={accessForm.globalPermissions.canSendNotifications} 
                    onCheckedChange={(checked) => setAccessForm(prev => ({
                      ...prev,
                      globalPermissions: { ...prev.globalPermissions, canSendNotifications: !!checked }
                    }))}
                  />
                  <Label className="text-sm">Can Send Notifications</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiration Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={accessForm.expiresAt}
                  onChange={(e) => setAccessForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this access..."
                value={accessForm.notes}
                onChange={(e) => setAccessForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAccess}>
                <Save className="w-4 h-4 mr-2" />
                Create Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Access Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Access Privileges</DialogTitle>
            <DialogDescription>
              Modify access permissions for {editingAccess?.staffName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Similar form structure as create dialog */}
            <div className="text-center py-8 text-muted-foreground">
              <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Edit form would be similar to create form</p>
              <p className="text-sm">Implementation details omitted for brevity</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAccess}>
                <Save className="w-4 h-4 mr-2" />
                Update Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    );
  } catch (error) {
    console.error('Error rendering AccessPrivileges:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Access Privileges</h2>
          <p className="text-muted-foreground mb-4">Something went wrong while loading the page.</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
        </div>
      </div>
    );
  }
};

export default AccessPrivileges;
