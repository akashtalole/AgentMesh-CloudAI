// src/app/(dashboard)/workflows/workflow-form.tsx
"use client"

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Agent } from "@/contexts/agent-context";
import { WorkflowDocument } from "@/services/firestore";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Workflow name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  type: z.enum(["Sequential", "Parallel"]),
  agentIds: z.array(z.string()).min(1, "Please select at least one agent."),
});

type WorkflowFormValues = z.infer<typeof formSchema>;

interface WorkflowFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: Agent[];
  onAddWorkflow: (workflow: Omit<WorkflowDocument, 'status'> & { agentIds: string[] }) => void;
  onClose: () => void;
}

export function WorkflowForm({ open, onOpenChange, agents, onAddWorkflow, onClose }: WorkflowFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "Sequential",
      agentIds: [],
    },
  });

  function onSubmit(values: WorkflowFormValues) {
    setIsLoading(true);
    onAddWorkflow(values);
    setIsLoading(false);
    onClose();
    form.reset();
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        form.reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Build a new automated workflow by selecting and organizing agents.
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
                    <FormLabel>Workflow Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Daily Security Scan" {...field} />
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
                      <Textarea placeholder="Describe what this workflow does..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Workflow Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select workflow type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Sequential">Sequential</SelectItem>
                                <SelectItem value="Parallel">Parallel</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              <FormField
                control={form.control}
                name="agentIds"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Agents / Steps</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn("w-full justify-between h-auto min-h-10")}
                                >
                                    <div className="flex gap-1 flex-wrap">
                                    {field.value?.length > 0 ? field.value.map(agentId => (
                                        <Badge variant="secondary" key={agentId}>{agents.find(a => a.id === agentId)?.name || agentId}</Badge>
                                    )) : <span className="text-muted-foreground">Select agents...</span>}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[600px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search agents..." />
                                    <CommandList>
                                        <CommandEmpty>No agent found.</CommandEmpty>
                                        <CommandGroup>
                                            {agents.map((agent) => (
                                            <CommandItem
                                                value={agent.name}
                                                key={agent.id}
                                                onSelect={() => {
                                                    const currentValues = field.value || [];
                                                    const newValue = currentValues.includes(agent.id)
                                                        ? currentValues.filter(id => id !== agent.id)
                                                        : [...currentValues, agent.id];
                                                    form.setValue("agentIds", newValue);
                                                }}
                                            >
                                                <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value?.includes(agent.id)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <agent.icon className="h-4 w-4 text-muted-foreground" />
                                                    <span>{agent.name}</span>
                                                </div>
                                            </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Workflow
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
