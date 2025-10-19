// src/app/(dashboard)/organization/tenant-form.tsx
"use client"

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Loader2, PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { addTenant, Tenant } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Tenant name must be at least 2 characters.",
  }),
  customerNames: z.array(z.string().min(1, { message: "Customer name cannot be empty."})).min(1, { message: "At least one customer is required." }),
});

type TenantFormValues = z.infer<typeof formSchema>;

interface TenantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function TenantForm({ open, onOpenChange, onClose }: TenantFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      customerNames: [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "customerNames"
  });

  async function onSubmit(values: TenantFormValues) {
    setIsLoading(true);
    try {
      await addTenant(values);
      toast({
        title: "Tenant Created",
        description: "The new tenant has been created successfully.",
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error("Failed to create tenant:", error);
      toast({
        title: "Error",
        description: "Failed to create tenant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        form.reset({
            name: "",
            customerNames: [""]
        });
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Create a new MSP tenant and specify their initial customers.
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
                    <FormLabel>Tenant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MSP One" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Customers</FormLabel>
                <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`customerNames.${index}`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <Input placeholder={`Customer ${index + 1} Name`} {...field} />
                                        </FormControl>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                 <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append("")}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
                </Button>
              </div>

            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Tenant
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
