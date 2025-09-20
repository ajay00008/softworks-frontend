import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { teachersAPI, Teacher } from "@/services/api";
import {
  Plus,
  GraduationCap,
  Search,
  Edit,
  Trash2,
  UserCheck,
  Upload,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteTeacher, setDeleteTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  // Bulk upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    subjectIds: [] as string[],
    phone: "",
    address: "",
    qualification: "",
    experience: 0,
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reload teachers when pagination or search changes
  useEffect(() => {
    if (!isLoading) {
      loadTeachers();
    }
  }, [currentPage, searchTerm]);

  const loadTeachers = async () => {
    try {
      const response = await teachersAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined
      });
      setTeachers(response.teachers.data);
      
      // Update pagination info if available
        if (response.teachers.pagination) {
        setPagination({
          total: response.teachers.pagination.total,
          pages: response.teachers.pagination.pages,
          currentPage: response.teachers.pagination.page
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setFormData({
      email: teacher.email,
      password: "",
      name: teacher.name,
      subjectIds: teacher.subjectIds || [],
      phone: teacher.phone || "",
      address: teacher.address || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || 0 ,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Teacher form submitted!', { formData, editTeacher });
    setIsSubmitting(true);

    try {
      if (editTeacher) {
        // Update API
        console.log('Updating teacher:', editTeacher.id);
        const updatedTeacher = await teachersAPI.update(editTeacher.id, {
          ...formData,
          isActive: editTeacher.isActive,
        });

        setTeachers(
          teachers.map((t) =>
            t.id === editTeacher.id ? { ...t, ...updatedTeacher } : t
          )
        );

        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        // Create API
        console.log('Creating new teacher with formData:', formData);
        const newTeacher = await teachersAPI.create({
          ...formData,
          isActive: true,
          _id: "" as any,
          userId: null as any,
        } as any);

        console.log('Created teacher:', newTeacher);
        setTeachers([...teachers, newTeacher]);

        toast({
          title: "Success",
          description: "Teacher created successfully",
        });
        
        // Reload teachers to ensure fresh data
        setTimeout(() => {
          loadTeachers();
        }, 1000);
      }

      resetForm();
      setEditTeacher(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: editTeacher
          ? "Failed to update teacher"
          : "Failed to create teacher",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTeacher) return;
    
    try {
      await teachersAPI.delete(deleteTeacher.id);
      setTeachers(teachers.filter((t) => t.id !== deleteTeacher.id));
      toast({
        title: "Success",
        description: "Teacher removed successfully",
      });
      
      // Reload teachers to ensure fresh data
      await loadTeachers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove teacher",
        variant: "destructive",
      });
    } finally {
      setDeleteTeacher(null);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      subjectIds: [],
      phone: "",
      address: "",
      qualification: "",
      experience: 0,
    });
  };

  // Server-side pagination - no need for frontend filtering/slicing

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
      const result = await teachersAPI.bulkUpload(uploadedFile);
      
      // Handle the actual response format
      if (result.success && result.data) {
        const { totalRows, created, errors } = result.data;
        
        if (errors === 0) {
          toast({
            title: "Upload successful",
            description: `Successfully created ${created} out of ${totalRows} teachers.`,
          });
        } else {
          toast({
            title: "Upload completed with errors",
            description: `Created ${created} teachers, ${errors} errors occurred out of ${totalRows} total rows.`,
            variant: "destructive",
          });
        }
      } else {
        // Fallback for different response format
        toast({
          title: "Upload successful",
          description: result.message || "Teachers uploaded successfully.",
        });
      }

      // Reload teachers list
      await loadTeachers();
      
      // Reset upload state
      setUploadedFile(null);
      
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload teachers. Please check your file format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Fetch CSV content from the template file
      const response = await fetch('/templates/teachers.csv');
      
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
      link.download = 'teachers_bulk_upload_template.csv';
      
      // Add link to DOM, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      // Show success toast
      toast({
        title: "Template Downloaded",
        description: "CSV template has been downloaded successfully. You can now fill it with your teacher data.",
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
    return <p>Loading teachers...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Teacher Management</h1>
          </div>
          <p className="text-muted-foreground">Add and manage teaching staff</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditTeacher(null);
            setShowForm(true);
          }}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Teacher
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-accent" />
              {editTeacher ? "Edit Teacher" : "Create New Teacher"}
            </CardTitle>
            <CardDescription>
              {editTeacher
                ? "Update the teacher details"
                : "Enter teacher details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* name field */}
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Enter teacher's full name"
                />
              </div>

              {/* email + password */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                {!editTeacher && (
                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                )}
              </div>

              {/* phone + experience */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        // allow only digits
                        setFormData({ ...formData, experience: Number(value) });
                      }
                    }}
                  />
                </div>
              </div>

              {/* qualification */}
              <div>
                <Label>Qualification</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                />
              </div>

              {/* address */}
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              {/* actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditTeacher(null);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editTeacher
                      ? "Updating..."
                      : "Creating..."
                    : editTeacher
                    ? "Update Teacher"
                    : "Create Teacher"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teachers list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teaching Staff ({pagination.total || teachers.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p>No teachers found</p>
          ) : (
            <>
              <div className="grid gap-4">
                {teachers.map((teacher) => (
                <Card
                  key={teacher.id}
                  className="border-l-4 border-l-accent bg-card/50 dark:bg-card/80 dark:border-accent/50 hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold">{teacher.name}</h3>
                          {teacher.subjectIds?.length > 0 && (
                            <Badge className="bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30">
                              {teacher.subjectIds.join(", ")}
                            </Badge>
                          )}
                          <Badge
                            variant={
                              teacher.isActive ? "default" : "destructive"
                            }
                          >
                            {teacher.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Email:</strong> {teacher.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(teacher)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteTeacher(teacher)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the teacher "{teacher.name}" and remove all their data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteTeacher(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Teacher
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
              {(pagination.pages > 1 || teachers.length >= itemsPerPage) && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total || teachers.length)} of {pagination.total || teachers.length} teachers
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
                      {Array.from({ length: pagination.pages || Math.ceil((pagination.total || teachers.length) / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 p-0 ${
                            currentPage === page 
                              ? "bg-accent text-accent-foreground" 
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages || Math.ceil((pagination.total || teachers.length) / itemsPerPage)))}
                      disabled={currentPage === (pagination.pages || Math.ceil((pagination.total || teachers.length) / itemsPerPage))}
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
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-accent" />
            Bulk Upload Teachers
          </CardTitle>
          <CardDescription>
            Upload a CSV file to add multiple teachers at once. Download the template to see the required format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                dragActive 
                  ? "border-accent bg-accent/10 dark:bg-accent/20" 
                  : "border-accent/30 hover:border-accent/50 bg-background/50 dark:bg-background/20"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-accent/10 dark:bg-accent/20">
                  <FileText className="w-8 h-8 text-accent" />
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
                      className="border-accent/30 text-accent hover:bg-accent/50 hover:border-accent/50 hover:text-accent-foreground cursor-pointer"
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
                    className="border-accent/30 text-accent hover:bg-accent/50 hover:border-accent/50 hover:text-accent-foreground"
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
                        className="bg-accent hover:bg-accent/90"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Teachers
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
                <li>• Required columns: name, email, password</li>
                <li>• Optional columns: phone, address, qualification, experience, department</li>
                <li>• Experience should be a number (years of experience)</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Teachers;
