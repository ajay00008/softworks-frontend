import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ViewButton } from '@/components/ui/view-button';
import { ViewTabs } from '@/components/ui/view-tabs';
import { studentsAPI, classesAPI, Student, ClassMapping } from '@/services/api';
import { Pagination } from '@/components/ui/pagination';
import { Plus, Users, Edit, Trash2, UserPlus, AlertCircle, ExternalLink } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassMapping[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rollNumber: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    parentsPhone: '',
    parentsEmail: '',
    address: '',
    whatsappNumber: ''
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    name: '',
    rollNumber: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    parentsPhone: '',
    parentsEmail: '',
    address: '',
    whatsappNumber: ''
  });

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  };

  const validateDate = (date: string) => {
    if (!date) return true; // Optional field
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value && value.length < 8) {
          error = 'Password must be at least 8 characters long';
        }
        break;
      case 'name':
        if (value && value.length < 2) {
          error = 'Name must be at least 2 characters long';
        }
        break;
      case 'rollNumber':
        if (value && value.length < 1) {
          error = 'Roll number is required';
        }
        break;
      case 'parentsPhone':
        if (value && !validatePhone(value)) {
          error = 'Please enter a valid phone number (numbers, spaces, hyphens, parentheses, and + allowed)';
        }
        break;
      case 'parentsEmail':
        if (value && !validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'whatsappNumber':
        if (value && !validatePhone(value)) {
          error = 'Please enter a valid WhatsApp number (numbers, spaces, hyphens, parentheses, and + allowed)';
        }
        break;
      case 'dateOfBirth':
        if (value && !validateDate(value)) {
          error = 'Please enter a valid date in YYYY-MM-DD format';
        }
        break;
    }
    
    return error;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate the field
    const error = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const errors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      name: validateField('name', formData.name),
      rollNumber: validateField('rollNumber', formData.rollNumber),
      fatherName: validateField('fatherName', formData.fatherName),
      motherName: validateField('motherName', formData.motherName),
      dateOfBirth: validateField('dateOfBirth', formData.dateOfBirth),
      parentsPhone: validateField('parentsPhone', formData.parentsPhone),
      parentsEmail: validateField('parentsEmail', formData.parentsEmail),
      address: validateField('address', formData.address),
      whatsappNumber: validateField('whatsappNumber', formData.whatsappNumber)
    };
    
    setFormErrors(errors);
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    return !hasErrors;
  };

  const loadStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      // Debug log
      // Debug log
      setStudents(response.students || []);
    } catch (error) {
      // Debug log
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await classesAPI.getAll();
      setClasses(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (student: Student) => {
    // Debug log
    setEditStudent(student);
    setFormData({
      email: student.email || '',
      password: '',
      name: student.name || '',
      rollNumber: student.rollNumber || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      dateOfBirth: student.dateOfBirth || '',
      parentsPhone: student.parentsPhone || '',
      parentsEmail: student.parentsEmail || '',
      address: student.address || '',
      whatsappNumber: student.whatsappNumber || ''
    });
    // Fix: Handle different class structure
    const classId = student.class?.id || student.class?.[0]?.id || '';
    setSelectedClassId(classId);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        classId: selectedClassId,
      };

      if (editStudent) {
        const updatedStudent = await studentsAPI.update(editStudent.id, {
          ...payload,
          isActive: editStudent.isActive,
        });

        setStudents(students.map(s =>
          s.id === editStudent.id ? { ...s, ...updatedStudent } : s
        ));

        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        const newStudent = await studentsAPI.create({
          ...payload,
          isActive: true,
        });
setStudents([...students, newStudent]);

        toast({
          title: "Success",
          description: "Student created successfully",
        });
      }

      resetForm();
      setEditStudent(null);
      setShowCreateForm(false);

    } catch (error) {
      toast({
        title: "Error",
        description: editStudent ? "Failed to update student" : "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      await studentsAPI.delete(studentToDelete.id);
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      rollNumber: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      parentsPhone: '',
      parentsEmail: '',
      address: '',
      whatsappNumber: ''
    });
    setFormErrors({
      email: '',
      password: '',
      name: '',
      rollNumber: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      parentsPhone: '',
      parentsEmail: '',
      address: '',
      whatsappNumber: ''
    });
    setSelectedClassId('');
  };

  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateClick = () => {
    if (classes.length === 0) {
      toast({
        title: "No Classes Available",
        description: "Please create classes first before adding students. Go to Class & Subject Management to create classes.",
        variant: "destructive",
      });
      return;
    }
    resetForm();
    setEditStudent(null);
    setShowCreateForm(true);
  };

  // Helper function to get class name
  const getClassName = (student: Student) => {
    if (student.class?.name) return student.class.name;
    if (student.class?.displayName) return student.class.displayName;
    if (student.class?.[0]?.name) return student.class[0].name;
    return 'N/A';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Student Management</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage student information and enrollment
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Student
        </Button>
      </div>

      {/* No Classes Warning */}
      {classes.length === 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  No Classes Available
                </h3>
                <p className="text-orange-700 dark:text-orange-300 mb-4">
                  You need to create classes before you can add students. Please go to Class & Subject Management to create classes first.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30"
                    onClick={() => {
                      // Navigate to class management - you can update this to use your router
                      window.location.href = '/dashboard/class-subject-management';
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go to Class Management
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30"
                    onClick={() => {
                      // Refresh classes
                      loadClasses();
                    }}
                  >
                    Refresh Classes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-primary" />
              {editStudent ? "Edit Student" : "Create New Student"}
            </CardTitle>
            <CardDescription>
              {editStudent
                ? "Update the student details below"
                : "Enter the student details below to create a new enrollment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* email + password */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    required
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                {!editStudent && (
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      required
                      className={formErrors.password ? 'border-red-500' : ''}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-500">{formErrors.password}</p>
                    )}
                  </div>
                )}
              </div>

              {/* name + roll + class */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    required
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Roll Number *</Label>
                  <Input
                    value={formData.rollNumber}
                    onChange={(e) => handleFieldChange('rollNumber', e.target.value)}
                    required
                    className={formErrors.rollNumber ? 'border-red-500' : ''}
                  />
                  {formErrors.rollNumber && (
                    <p className="text-sm text-red-500">{formErrors.rollNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={classes.length === 0}
                  >
                    <option value="">
                      {classes.length === 0 ? "No classes available" : "Select a class"}
                    </option>
                    {classes?.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {classes.length === 0 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Please create classes first in Class & Subject Management
                    </p>
                  )}
                </div>
              </div>

              {/* father + mother + DOB */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Father's Name</Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mother's Name</Label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                    className={formErrors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-sm text-red-500">{formErrors.dateOfBirth}</p>
                  )}
                </div>
              </div>

              {/* parents contact */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Parents Phone</Label>
                  <Input
                    value={formData.parentsPhone}
                    onChange={(e) => handleFieldChange('parentsPhone', e.target.value)}
                    className={formErrors.parentsPhone ? 'border-red-500' : ''}
                    placeholder="e.g., +1234567890 or (123) 456-7890"
                  />
                  {formErrors.parentsPhone && (
                    <p className="text-sm text-red-500">{formErrors.parentsPhone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Parents Email</Label>
                  <Input
                    type="email"
                    value={formData.parentsEmail}
                    onChange={(e) => handleFieldChange('parentsEmail', e.target.value)}
                    className={formErrors.parentsEmail ? 'border-red-500' : ''}
                  />
                  {formErrors.parentsEmail && (
                    <p className="text-sm text-red-500">{formErrors.parentsEmail}</p>
                  )}
                </div>
              </div>

              {/* whatsapp + address */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    value={formData.whatsappNumber}
                    onChange={(e) => handleFieldChange('whatsappNumber', e.target.value)}
                    className={formErrors.whatsappNumber ? 'border-red-500' : ''}
                    placeholder="e.g., +1234567890 or (123) 456-7890"
                  />
                  {formErrors.whatsappNumber && (
                    <p className="text-sm text-red-500">{formErrors.whatsappNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className={formErrors.address ? 'border-red-500' : ''}
                  />
                  {formErrors.address && (
                    <p className="text-sm text-red-500">{formErrors.address}</p>
                  )}
                </div>
              </div>

              {/* actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditStudent(null);
                    setShowCreateForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? (editStudent ? "Updating..." : "Creating...")
                    : (editStudent ? "Update Student" : "Create Student")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Enrolled Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {filteredStudents.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedStudents.map((student) => (
                <Card key={student.id} className="border-l-4 border-l-primary bg-card/50 dark:bg-card/80 dark:border-primary/50 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="space-y-3 flex-1">
                        {/* Student Header */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base sm:text-lg break-words">{student.name || 'Unknown Student'}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30 text-xs">
                              Roll: {student.rollNumber || 'N/A'}
                            </Badge>
                            <Badge className="bg-secondary/10 text-secondary-foreground border-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:border-secondary/30 text-xs">
                              Class: {getClassName(student)}
                            </Badge>
                            <Badge variant={student.isActive ? "default" : "destructive"} className="text-xs">
                              {student.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Student Details */}
                        <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                          <p className="break-all"><strong>Email:</strong> {student.email || 'N/A'}</p>
                          <p><strong>Class:</strong> {getClassName(student)}</p>
                          {student.fatherName && <p><strong>Father:</strong> {student.fatherName}</p>}
                          {student.motherName && <p><strong>Mother:</strong> {student.motherName}</p>}
                          {student.whatsappNumber && <p><strong>Phone:</strong> {student.whatsappNumber}</p>}
                          <p><strong>Enrolled:</strong> {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        
                        {/* Address */}
                        {student.address && (
                          <p className="text-sm text-muted-foreground break-words">
                            <strong>Address:</strong> {student.address}
                          </p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 lg:flex-col lg:gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditClick(student)}
                          className="w-full sm:w-auto hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(student)}
                          className="text-destructive hover:text-destructive hover:bg-red-50 w-full sm:w-auto"
                        >
                          <Trash2 className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-2 border-red-200 bg-white dark:bg-gray-900 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Delete Student
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    This action cannot be undone
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {studentToDelete.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {studentToDelete.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Roll No: {studentToDelete.rollNumber} | Class: {getClassName(studentToDelete)}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                        Warning
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Are you sure you want to delete this student? This will permanently remove 
                        the student and all their enrollment data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteCancel}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-6 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Student
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pagination */}
      {filteredStudents.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredStudents.length}
          />
        </div>
      )}
    </div>
  );
};

export default Students;
