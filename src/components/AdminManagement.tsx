import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { adminsAPI, User } from '@/services/api';
import { Plus, Edit, Trash2, Shield, Crown, Search } from 'lucide-react';

const AdminManagement = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
    isActive: true
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await adminsAPI.getAll();
      setAdmins(response?.admins || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admins",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await adminsAPI.update(editingAdmin._id, formData);
        toast({
          title: "Success",
          description: "Admin updated successfully",
        });
      } else {
        const response = await adminsAPI.create(formData);
        toast({
          title: "Success",
          description: "Admin created successfully",
        });
        }
      setIsDialogOpen(false);
      setEditingAdmin(null);
      setFormData({ name: '', email: '', password: '', role: 'ADMIN', isActive: true });
      loadAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save admin",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (admin: User) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email,
      password: '', // Don't show existing password
      role: (admin.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN') as 'ADMIN' | 'SUPER_ADMIN',
      isActive: admin.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminsAPI.delete(id);
      toast({
        title: "Success",
        description: "Admin deleted successfully",
      });
      loadAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete admin",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', role: 'ADMIN', isActive: true });
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    return role === 'SUPER_ADMIN' ? Crown : Shield;
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'SUPER_ADMIN' ? 'default' : 'secondary';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
          <p className="text-muted-foreground">Loading admins...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
          <p className="text-muted-foreground">Manage system administrators and their permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </DialogTitle>
              <DialogDescription>
                {editingAdmin ? 'Update admin information' : 'Create a new admin account'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter admin name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              {!editingAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'ADMIN' | 'SUPER_ADMIN') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active Status</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAdmin ? 'Update' : 'Create'} Admin
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admins List */}
      <Card>
        <CardHeader>
          <CardTitle>System Administrators</CardTitle>
          <CardDescription>
            {filteredAdmins.length} admin{filteredAdmins.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => {
                const RoleIcon = getRoleIcon(admin.role || 'admin');
                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(admin.role || 'admin')} className="flex items-center gap-1 w-fit">
                        <RoleIcon className="w-3 h-3" />
                        {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.isActive ? "default" : "destructive"}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(admin)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {admin.role !== 'SUPER_ADMIN' && admin.isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the admin account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(admin._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
