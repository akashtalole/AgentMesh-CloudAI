// src/app/(dashboard)/tools/tool-form.tsx
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
import { addTool, updateTool, Tool } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Tool name must be at least 2 characters.",
  }).regex(/^[a-z_]+$/, { message: "Name must be in snake_case."}),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

type ToolFormValues = z.infer<typeof formSchema>;

interface ToolFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  tool?: Tool;
}

export function ToolForm({ open, onOpenChange, onClose, tool }: ToolFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const isEditing = !!tool;

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (open && tool) {
        form.reset({
            name: tool.name,
            description: tool.description,
        });
    } else if (open) {
        form.reset({
            name: "",
            description: ""
        });
    }
  }, [open, tool, form]);

  async function onSubmit(values: ToolFormValues) {
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateTool(tool.id, values);
        toast({
            title: "Tool Updated",
            description: "The tool has been updated successfully.",
        });
      } else {
        await addTool(values);
        toast({
            title: "Tool Added",
            description: "The new tool has been added successfully.",
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save tool:", error);
      toast({
        title: "Error",
        description: "Failed to save tool. Please try again.",
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
          <DialogTitle>{isEditing ? "Edit Tool" : "Add New Tool"}</DialogTitle>
          <DialogDescription>
            Enter the details for the agent tool.
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
                    <FormLabel>Tool Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., security_scanner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of what the tool does." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Tool"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
