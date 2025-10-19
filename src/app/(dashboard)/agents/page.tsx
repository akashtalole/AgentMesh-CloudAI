// src/app/(dashboard)/agents/page.tsx
'use client'

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Code, Bot, PlusCircle, Trash2, X, Cpu, Workflow, Building2, Loader2, LucideIcon, Wrench, ShieldCheck, DatabaseBackup, Edit, Badge } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAgents, namedIcons } from "@/contexts/agent-context";
import { Agent, AgentDocument } from "@/services/firestore";
import { getTools, Tool, seedDefaultTools } from "@/services/firestore";


export default function AgentBuilderPage() {
  const { toast } = useToast();
  const { agents, addAgent, updateAgent, deleteAgent, loading } = useAgents();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState<string | null>(null);
  
  const [availableTools, setAvailableTools] = React.useState<Tool[]>([]);

  const [agentName, setAgentName] = React.useState("");
  const [agentDescription, setAgentDescription] = React.useState("");
  const [agentModel, setAgentModel] = React.useState("gemini-2.5-flash");
  const [agentType, setAgentType] = React.useState<Agent['type']>("LLM-Powered");
  const [agentIcon, setAgentIcon] = React.useState<string>("cpu");
  const [agentInstruction, setAgentInstruction] = React.useState("");
  const [agentTools, setAgentTools] = React.useState<Tool[]>([]);

  const [isToolDialogOpen, setIsToolDialogOpen] = React.useState(false);
  const [selectedTools, setSelectedTools] = React.useState<Tool[]>([]);

  React.useEffect(() => {
    const fetchTools = async () => {
      let tools = await getTools();
      if (tools.length === 0) {
        await seedDefaultTools();
        tools = await getTools();
      }
      setAvailableTools(tools);
    };
    fetchTools();
  }, []);
  
  const resetForm = () => {
    setAgentName("");
    setAgentDescription("");
    setAgentModel("gemini-2.5-flash");
    setAgentType("LLM-Powered");
    setAgentIcon("cpu");
    setAgentInstruction("");
    setAgentTools([]);
    setIsEditing(null);
  };

  const handleEditClick = (agent: Agent) => {
    setIsEditing(agent.id);
    setAgentName(agent.name);
    setAgentDescription(agent.description);
    setAgentModel(agent.model || "gemini-2.5-flash");
    setAgentType(agent.type);
    setAgentIcon(agent.iconName || "cpu");
    setAgentInstruction(agent.prompt || "");
    setAgentTools(agent.tools || []);
  };
  
  const handleDeleteClick = async (agentId: string) => {
    try {
        await deleteAgent(agentId);
        toast({
            title: "Agent Deleted",
            description: "The agent has been successfully deleted.",
        });
    } catch(error) {
       toast({
            title: `Error Deleting Agent`,
            description: "There was a problem deleting the agent from the database.",
            variant: "destructive"
        });
    }
  };

  const handleRemoveTool = (toolId: string) => {
    setAgentTools(agentTools.filter(tool => tool.id !== toolId));
  };
  
  const handleAddTools = () => {
    setAgentTools(currentTools => {
        const newTools = selectedTools.filter(st => !currentTools.some(ct => ct.id === st.id));
        return [...currentTools, ...newTools];
    });
    setIsToolDialogOpen(false);
    setSelectedTools([]);
  };

  const handleSaveAgent = async () => {
    if (!agentName || !agentModel || !agentType || !agentInstruction || !agentDescription) {
        toast({
            title: "Missing Information",
            description: "Please fill out all agent details before creating.",
            variant: "destructive"
        });
        return;
    }
    setIsProcessing(true);
    const agentData: AgentDocument = {
      name: agentName,
      description: agentDescription,
      type: agentType,
      icon: agentIcon,
      model: agentModel,
      prompt: agentInstruction,
      tools: agentTools,
    }
    
    try {
      if (isEditing) {
        await updateAgent(isEditing, agentData);
         toast({
            title: "Agent Updated",
            description: `Agent "${agentName}" has been successfully updated.`,
        });
      } else {
        await addAgent(agentData);
        toast({
            title: "Agent Deployed",
            description: `Agent "${agentName}" has been successfully created and deployed.`,
        });
      }
      resetForm();
    } catch(error) {
       toast({
            title: `Error ${isEditing ? 'Updating' : 'Creating'} Agent`,
            description: "There was a problem saving the agent to the database.",
            variant: "destructive"
        });
    } finally {
        setIsProcessing(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Builder</h1>
          <p className="text-muted-foreground">
            Create, configure, and manage your custom AI agents.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              {isEditing ? `Editing: ${agentName}` : 'Visual Agent Builder'}
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Update the properties of this agent.' : 'Use this interface to define the properties of a new agent.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input id="agent-name" placeholder="e.g., CostOptimizerAgent" value={agentName} onChange={e => setAgentName(e.target.value)} />
              </div>
               <div>
                <Label htmlFor="agent-description">Description</Label>
                <Input id="agent-description" placeholder="A brief description of what this agent does." value={agentDescription} onChange={e => setAgentDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="agent-icon">Icon</Label>
                    <Select value={agentIcon} onValueChange={setAgentIcon}>
                        <SelectTrigger id="agent-icon">
                            <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(namedIcons).map(([key, Icon]) => (
                                <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <span>{key}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select value={agentType} onValueChange={(value) => setAgentType(value as Agent['type'])}>
                    <SelectTrigger id="agent-type">
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LLM-Powered">LLM-Powered</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
               <div>
                <Label htmlFor="agent-model">AI Model</Label>
                <Select value={agentModel} onValueChange={setAgentModel}>
                <SelectTrigger id="agent-model">
                    <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="agent-instruction">Instruction / Prompt</Label>
                <Textarea
                  id="agent-instruction"
                  placeholder="You are an expert... Your goal is to..."
                  className="h-32"
                  value={agentInstruction}
                  onChange={e => setAgentInstruction(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label>Tools Integration</Label>
                  <p className="text-sm text-muted-foreground">
                      Select pre-built tools for your agent to use.
                  </p>
              </div>
              <Card className="bg-muted/50 h-full">
                  <CardContent className="p-4 space-y-3 flex flex-col h-full">
                      {agentTools.length > 0 ? (
                        <div className="flex-1 space-y-2">
                          {agentTools.map(tool => (
                              <div key={tool.id} className="flex items-center justify-between p-2 rounded-md bg-background text-sm">
                                  <span className="flex items-center gap-2"><Code className="h-4 w-4" /> {tool.name}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTool(tool.id)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-1 items-center justify-center h-24 text-sm text-muted-foreground">
                            No tools added yet.
                        </div>
                      )}
                      <Button variant="outline" className="w-full mt-auto" onClick={() => { setSelectedTools(agentTools); setIsToolDialogOpen(true); }}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Tool
                      </Button>
                  </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between">
            <Button onClick={handleSaveAgent} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create & Deploy Agent"}
            </Button>
             {isEditing && (
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-4">
            <CardTitle>Agent Directory</CardTitle>
            <CardDescription>Manage and monitor your fleet of intelligent AI agents.</CardDescription>
             {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => <Card key={i}><CardHeader><Loader2 className="h-6 w-6 animate-spin" /></CardHeader><CardContent><div className="h-20" /></CardContent></Card>)}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                          <CardTitle className="flex items-center gap-2">
                            <agent.icon className="h-5 w-5 text-primary" />
                            {agent.name}
                          </CardTitle>
                          <CardDescription>{agent.description}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'}>{agent.status}</Badge>
                           <div className="flex">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(agent)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the agent.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteClick(agent.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                           </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto">
                       <div className="text-xs text-muted-foreground">Tools: <span className="font-semibold text-foreground">{agent.tools?.map(t => t.name).join(', ') || 'None'}</span></div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Type: <span className="font-semibold text-foreground">{agent.type}</span></span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </div>

      </div>

      <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Tools to Agent</DialogTitle>
                <DialogDescription>
                    Select the tools this agent will have access to.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                {availableTools.map(tool => (
                    <div key={tool.id} className="flex items-start space-x-3">
                        <Checkbox 
                            id={tool.id}
                            checked={selectedTools.some(st => st.id === tool.id)}
                            onCheckedChange={(checked) => {
                                setSelectedTools(prev => 
                                    checked
                                    ? [...prev, tool]
                                    : prev.filter(t => t.id !== tool.id)
                                )
                            }}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor={tool.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {tool.name}
                            </label>
                            <p className="text-sm text-muted-foreground">
                                {tool.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsToolDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTools}>Add Selected</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
