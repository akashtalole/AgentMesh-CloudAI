// src/app/(dashboard)/tools/page.tsx
'use client'

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Wrench, Trash2, Edit, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Tool, getTools, deleteTool, seedDefaultTools } from '@/services/firestore';
import { useToast } from "@/hooks/use-toast";
import { ToolForm } from './tool-form';

export default function ToolsPage() {
    const [tools, setTools] = React.useState<Tool[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [selectedTool, setSelectedTool] = React.useState<Tool | undefined>(undefined);
    const { toast } = useToast();

    const fetchTools = React.useCallback(async () => {
        setLoading(true);
        let dbTools = await getTools();
        if (dbTools.length === 0) {
            await seedDefaultTools();
            dbTools = await getTools();
        }
        setTools(dbTools);
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchTools();
    }, [fetchTools]);
    
    const handleAddTool = () => {
        setSelectedTool(undefined);
        setIsFormOpen(true);
    };
    
    const handleEditTool = (tool: Tool) => {
        setSelectedTool(tool);
        setIsFormOpen(true);
    };

    const handleDeleteTool = async (id: string) => {
        try {
            await deleteTool(id);
            toast({
                title: "Tool Deleted",
                description: "The tool has been successfully deleted.",
            });
            fetchTools();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete tool.",
                variant: "destructive",
            });
            console.error("Failed to delete tool:", error);
        }
    }
    
    const handleFormClose = () => {
        setIsFormOpen(false);
        fetchTools();
    }

    return (
        <>
            <ToolForm 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                onClose={handleFormClose} 
                tool={selectedTool} 
            />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Wrench /> Tool Management</h1>
                    <p className="text-muted-foreground">
                        Create, manage, and configure tools for your AI agents.
                    </p>
                    </div>
                    <Button onClick={handleAddTool}><PlusCircle className="mr-2"/> Add Tool</Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Available Tools</CardTitle>
                        <CardDescription>List of tools available for agent integration.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : tools.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            No tools configured yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tools.map(tool => (
                                        <TableRow key={tool.id}>
                                            <TableCell className="font-medium">{tool.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{tool.description}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditTool(tool)}>
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
                                                                This action cannot be undone. This will permanently delete the tool.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteTool(tool.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
