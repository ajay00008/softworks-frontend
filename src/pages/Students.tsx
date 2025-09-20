import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { studentsAPI, classesAPI, Student, ClassMapping } from '@/services/api';
import { Plus, Users, Edit, Trash2, UserPlus, Upload, FileText, Download, ChevronLeft, ChevronRight, CloudCog } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassMapping[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reload students when pagination or search changes
  useEffect(() => {
    if (!isLoading) {
      loadStudents();
    }
  }, [currentPage, searchTerm]);

  const loadStudents = async () => {
    try {
      const response = await studentsAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined
      });
      setStudents(response.students.data);
      // Update pagination info if available
      if (response.students.pagination) {
        setPagination({
          total: response.students.pagination.total,
          pages: response.students.pagination.pages,
          currentPage: response.students.pagination.page
        });
      }
    } catch (error) {
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
      const { data } = await classesAPI.getAll();
      // Ensure we have a valid classes array
      const classesArray = Array.isArray(data) ? data : [];

      setClasses(classesArray);
    } catch (error) { 
      console.error('Error loading classes:', error);
      // Set empty array on error to prevent undefined state
      setClasses([]);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (student: Student) => {
    setEditStudent(student);
    setFormData({
      email: student.email,
      password: '',
      name: student.name,
      rollNumber: student.rollNumber || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      dateOfBirth: student.dateOfBirth || '',
      parentsPhone: student.parentsPhone || '',
      parentsEmail: student.parentsEmail || '',
      address: student.address || '',
      whatsappNumber: student.whatsappNumber || ''
    });
    setSelectedClassId(student.class?.classId || '');
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', { formData, selectedClassId, editStudent });
    console.log('Form validation - required fields:', {
      email: !!formData.email,
      password: !!formData.password,
      name: !!formData.name,
      classId: !!selectedClassId
    });
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        classId: selectedClassId,
      };

      console.log('Payload to send:', payload);

      if (editStudent) {
        console.log('Updating student:', editStudent.id);
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
        console.log('Creating new student with payload:', payload);
        const newStudent = await studentsAPI.create({
          ...payload,
          isActive: true,
        });

        console.log('Created student:', newStudent);
        console.log('Current students before adding new one:', students);

        // Validate the new student has required properties
        if (newStudent && newStudent.id && newStudent.name && newStudent.email) {
          console.log('Adding new student to state...');
          setStudents([...students, newStudent]);
          console.log('Students state updated with new student');
        } else {
          console.error('New student missing required properties:', newStudent);
          // Still show success but don't add to state
          console.log('Student created but not added to state due to missing properties');
        }

        toast({
          title: "Success",
          description: "Student created successfully",
        });

        // Reload students to ensure fresh data
        setTimeout(() => {
          console.log('Reloading students after 1 second delay...');
          loadStudents();
        }, 1000);
      }

      resetForm();
      setEditStudent(null);
      setShowCreateForm(false);

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: editStudent ? "Failed to update student" : "Failed to create student",
        variant: "destructive",
      });

      setShowCreateForm(false);
      setEditStudent(null);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteStudent) return;

    try {
      await studentsAPI.delete(deleteStudent.id);
      setStudents(students.filter(s => s.id !== deleteStudent.id));
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      
      // Reload students to ensure fresh data
      await loadStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setDeleteStudent(null);
    }
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
    setSelectedClassId('');
  };

  // Server-side pagination - no need for frontend filtering/slicing
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  // Bulk upload handlers
  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await studentsAPI.bulkUpload(uploadedFile);

      // Handle the actual response format
      if (result.success && result.data) {
        const { totalRows, created, errors } = result.data;

        if (errors === 0) {
          toast({
            title: "Upload successful",
            description: `Successfully created ${created} out of ${totalRows} students.`,
          });
        } else {
          toast({
            title: "Upload completed with errors",
            description: `Created ${created} students, ${errors} errors occurred out of ${totalRows} total rows.`,
            variant: "destructive",
          });
        }
      } else {
        // Fallback for different response format
        toast({
          title: "Upload successful",
          description: result.message || "Students uploaded successfully.",
        });
      }

      // Reload students list
      await loadStudents();

      // Reset upload state
      setUploadedFile(null);

    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload students. Please check your file format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Fetch CSV content from the template file
      const response = await fetch('/templates/students.csv');

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      const csvContent = await response.text();

      // Create blob with proper CSV MIME type
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'students_bulk_upload_template.csv';

      // Add link to DOM, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      // Show success toast
      toast({
        title: "Template Downloaded",
        description: "CSV template has been downloaded successfully. You can now fill it with your student data.",
      });

    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the template. Please try again.",
        variant: "destructive",
      });
    }
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage student information and enrollment
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditStudent(null);
            setShowCreateForm(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Student
        </Button>
      </div>

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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {!editStudent && (
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              {/* name + roll + class */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.classId} value={cls.classId}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* father + mother + DOB */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Father's Name</Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mother's Name</Label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              {/* parents contact */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Parents Phone</Label>
                  <Input
                    value={formData.parentsPhone}
                    onChange={(e) => setFormData({ ...formData, parentsPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parents Email</Label>
                  <Input
                    type="email"
                    value={formData.parentsEmail}
                    onChange={(e) => setFormData({ ...formData, parentsEmail: e.target.value })}
                  />
                </div>
              </div>

              {/* whatsapp + address */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
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



      {/* Students list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Enrolled Students ({pagination.total || students.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p>No students found</p>
          ) : (
            <>
              <div className="grid gap-4">
                {students.map((student) => (
                  <Card key={student.id} className="border-l-4 border-l-primary bg-card/50 dark:bg-card/80 dark:border-primary/50 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-4">
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            {student.rollNumber && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30">
                                Roll No: {student.rollNumber}
                              </Badge>
                            )}
                            {student.class?.name && (
                              <Badge className="bg-secondary/10 text-secondary-foreground border-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:border-secondary/30">
                                Class: {student.class.name}
                              </Badge>
                            )}
                            <Badge variant={student.isActive ? "default" : "destructive"}>
                              {student.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                            <p><strong>Email:</strong> {student.email}</p>
                            {student.fatherName && <p><strong>Father Name:</strong> {student.fatherName}</p>}
                            {student.motherName && <p><strong>Mother Name:</strong> {student.motherName}</p>}
                            {student.whatsappNumber && <p><strong>Phone:</strong> {student.whatsappNumber}</p>}
                            <p><strong>Enrolled:</strong> {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          {student.address && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Address:</strong> {student.address}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(student)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteStudent(student)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the student "{student.name}" and remove all their data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteStudent(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Student
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {(pagination.pages > 1 || students.length >= itemsPerPage) && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total || students.length)} of {pagination.total || students.length} students
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: pagination.pages || Math.ceil((pagination.total || students.length) / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 p-0 ${currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages || Math.ceil((pagination.total || students.length) / itemsPerPage)))}
                      disabled={currentPage === (pagination.pages || Math.ceil((pagination.total || students.length) / itemsPerPage))}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Upload Container */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-primary" />
            Bulk Upload Students
          </CardTitle>
          <CardDescription>
            Upload a CSV file to add multiple students at once. Download the template to see the required format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${dragActive
                  ? "border-primary bg-primary/10 dark:bg-primary/20"
                  : "border-primary/30 hover:border-primary/50 bg-background/50 dark:bg-background/20"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 dark:bg-primary/20">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {uploadedFile ? uploadedFile.name : "Drop your CSV file here"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile ? "File selected and ready to upload" : "or click to browse and select a file"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/50 hover:border-primary/50 hover:text-primary-foreground cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadedFile ? "Change File" : "Choose File"}
                      </span>
                    </Button>
                  </label>
                  <Button
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/50 hover:border-primary/50 hover:text-primary-foreground"
                    onClick={handleDownloadTemplate}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample
                  </Button>
                  {uploadedFile && (
                    <>
                      <Button
                        onClick={handleBulkUpload}
                        disabled={isUploading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Students
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setUploadedFile(null)}
                        disabled={isUploading}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                      >
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Instructions */}
            <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Required columns: name, email, password, rollNumber, classId</li>
                <li>• Optional columns: fatherName, motherName, dateOfBirth, parentsPhone, parentsEmail, address, whatsappNumber</li>
                <li>• Date format: YYYY-MM-DD (e.g., 2010-05-15)</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
