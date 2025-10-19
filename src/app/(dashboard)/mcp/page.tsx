// src/app/(dashboard)/mcp/page.tsx
'use client'

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Server, Trash2, Loader2 } from "lucide-react";
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
import { McpServer, getMcpServers, deleteMcpServer } from '@/services/firestore';
import { useToast } from "@/hooks/use-toast";
import { McpServerForm } from './mcp-server-form';

export default function McpConfigurationPage() {
    const [servers, setServers] = React.useState<McpServer[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const { toast } = useToast();

    const fetchServers = React.useCallback(async () => {
        setLoading(true);
        const mcpServers = await getMcpServers();
        setServers(mcpServers);
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchServers();
    }, [fetchServers]);

    const handleDeleteServer = async (id: string) => {
        try {
            await deleteMcpServer(id);
            toast({
                title: "Server Deleted",
                description: "The MCP server configuration has been successfully deleted.",
            });
            fetchServers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete server configuration.",
                variant: "destructive",
            });
            console.error("Failed to delete server:", error);
        }
    }
    
    const handleFormClose = () => {
        setIsFormOpen(false);
        fetchServers();
    }

    return (
        <>
            <McpServerForm open={isFormOpen} onOpenChange={setIsFormOpen} onClose={handleFormClose} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Server /> MCP Server Configuration</h1>
                    <p className="text-muted-foreground">
                        Manage connection details for external MCP-compliant services.
                    </p>
                    </div>
                    <Button onClick={() => setIsFormOpen(true)}><PlusCircle className="mr-2"/> Add Server</Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Configured Servers</CardTitle>
                        <CardDescription>List of MCP servers available for agent integration.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : servers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No MCP servers configured yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    servers.map(server => (
                                        <TableRow key={server.id}>
                                            <TableCell className="font-medium">{server.name}</TableCell>
                                            <TableCell>{server.url}</TableCell>
                                            <TableCell className="text-muted-foreground">{server.description}</TableCell>
                                            <TableCell className="text-right">
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
                                                                This action cannot be undone. This will permanently delete the server configuration.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteServer(server.id)}>Delete</AlertDialogAction>
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
