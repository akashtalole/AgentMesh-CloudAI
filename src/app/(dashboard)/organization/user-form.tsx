// src/app/(dashboard)/organization/user-form.tsx
"use client"

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { addUser, updateUser, User, Tenant } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["Platform Admin", "MSP Admin", "MSP Engineer", "Client User"], {
    required_error: "Please select a role.",
  }),
  tenantId: z.string().optional(),
  customer: z.string().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  tenants: Tenant[];
  onClose: () => void;
}

export function UserForm({ open, onOpenChange, user, tenants, onClose }: UserFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const isEditing = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const selectedRole = form.watch("role");
  const selectedTenantId = form.watch("tenantId");
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  React.useEffect(() => {
    if (open) {
        if (user) {
        form.reset({
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            customer: user.customer || "all",
        });
        } else {
        form.reset({
            name: "",
            email: "",
            role: undefined,
            tenantId: undefined,
            customer: "all",
        });
        }
    }
  }, [user, form, open]);
  
  async function onSubmit(values: UserFormValues) {
    setIsLoading(true);
    const submissionValues = { ...values };
    if (submissionValues.customer === "all") {
        submissionValues.customer = undefined;
    }

    try {
      if (isEditing) {
        await updateUser(user.id, submissionValues);
        toast({
          title: "User Updated",
          description: "The user's details have been updated successfully.",
        });
      } else {
        await addUser(submissionValues);
        toast({
          title: "User Created",
          description: "The new user has been created successfully.",
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save user:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} user. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        form.reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the user's details below." : "Fill in the details to create a new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Platform Admin">Platform Admin</SelectItem>
                        <SelectItem value="MSP Admin">MSP Admin</SelectItem>
                        <SelectItem value="MSP Engineer">MSP Engineer</SelectItem>
                        <SelectItem value="Client User">Client User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedRole !== 'Platform Admin' && (
                <>
                  <FormField
                    control={form.control}
                    name="tenantId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenant (MSP)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to a tenant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tenants.map(tenant => (
                                <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedTenant && (selectedRole === 'Client User' || selectedRole === 'MSP Engineer') && (
                     <FormField
                        control={form.control}
                        name="customer"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Customer Scope</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Assign to a customer" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="all">All Customers</SelectItem>
                                {selectedTenant.customers?.map(customer => (
                                    <SelectItem key={customer.id} value={customer.name}>{customer.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormDescription>
                                Scope this user's access to a specific customer within the tenant.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
