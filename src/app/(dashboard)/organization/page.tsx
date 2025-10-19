// src/app/(dashboard)/organization/page.tsx
'use client'

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTenants, getPlatformAdmins, Tenant, User } from "@/services/firestore";
import { PlusCircle, Users, Trash2, Edit } from "lucide-react";
import { UserForm } from './user-form';
import { TenantForm } from './tenant-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteUser } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';

export default function OrganizationPage() {
  const { profile } = useAuth();
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [platformAdmins, setPlatformAdmins] = React.useState<User[]>([]);
  const [isUserFormOpen, setIsUserFormOpen] = React.useState(false);
  const [isTenantFormOpen, setIsTenantFormOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | undefined>(undefined);
  const { toast } = useToast();

  const isPlatformAdmin = profile?.role === 'Platform Admin';

  const fetchData = React.useCallback(async () => {
      if (!profile) return;
      
      const tenantsPromise = isPlatformAdmin ? getTenants() : getTenants(profile.tenantId);
      const adminsPromise = isPlatformAdmin ? getPlatformAdmins() : Promise.resolve([]);

      const [tenantsData, adminsData] = await Promise.all([tenantsPromise, adminsPromise]);
      setTenants(tenantsData);
      setPlatformAdmins(adminsData);
  }, [profile, isPlatformAdmin]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsUserFormOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = async (userId: string, role: User['role'], tenantId?: string) => {
      try {
        await deleteUser(userId, role, tenantId);
        toast({
            title: "User Deleted",
            description: "The user has been successfully deleted.",
        })
        fetchData();
      } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete user.",
            variant: "destructive",
        })
        console.error("Failed to delete user:", error);
      }
  }

  const handleFormClose = () => {
    setIsUserFormOpen(false);
    setIsTenantFormOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <UserForm open={isUserFormOpen} onOpenChange={setIsUserFormOpen} user={selectedUser} tenants={tenants} onClose={handleFormClose}/>
      <TenantForm open={isTenantFormOpen} onOpenChange={setIsTenantFormOpen} onClose={handleFormClose} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Users /> Organization & Users</h1>
          <p className="text-muted-foreground">
            Manage tenants, users, and roles across your multi-tenant environment.
          </p>
        </div>
        <div className="flex gap-2">
          {isPlatformAdmin && <Button onClick={() => setIsTenantFormOpen(true)}><PlusCircle className="mr-2"/> Add Tenant</Button>}
          <Button onClick={handleAddUser} variant="outline"><PlusCircle className="mr-2"/> Add User</Button>
        </div>
      </div>

      <div className="space-y-8">
        {tenants.map(tenant => (
            <Card key={tenant.id}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{tenant.name}</CardTitle>
                            <CardDescription>
                                {tenant.customers?.map(c => c.name).join(", ")}
                            </CardDescription>
                        </div>
                         {isPlatformAdmin && <Button variant="outline">Manage Tenant</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Scope</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenant.users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-muted-foreground text-sm">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            user.role === 'MSP Admin' ? 'default' :
                                            user.role === 'MSP Engineer' ? 'secondary' : 'outline'
                                        }>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>{user.customer || "All Customers"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the user.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.role, user.tenantId)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        ))}
         {isPlatformAdmin && <Card>
            <CardHeader>
                <CardTitle>Platform Administrators</CardTitle>
                <CardDescription>Users with full access to the AgentMesh platform.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {platformAdmins.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-muted-foreground text-sm">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the user.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.role)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
            </CardContent>
        </Card>}
      </div>

    </div>
  );
}
