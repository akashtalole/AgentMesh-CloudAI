// src/app/(dashboard)/workflows/page.tsx
'use client'

import * as React from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Play,
  Loader2,
  PlusCircle,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WorkflowForm } from './workflow-form';
import { useAgents } from '@/contexts/agent-context';
import { addWorkflow, getWorkflows, updateWorkflowStatus, createWorkflowRun, updateWorkflowRun, Workflow, WorkflowDocument, WorkflowStep, Agent, seedDefaultWorkflows } from '@/services/firestore';
import { namedIcons } from '@/contexts/agent-context';


export default function WorkflowsPage() {
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const { agents, loading: agentsLoading } = useAgents();

  const fetchWorkflows = React.useCallback(async () => {
    setLoading(true);
    let dbWorkflows = await getWorkflows(agents);

    if (dbWorkflows.length === 0) {
        await seedDefaultWorkflows();
        dbWorkflows = await getWorkflows(agents);
    }
    
    setWorkflows(dbWorkflows);
    setLoading(false);
  }, [agents]);

  React.useEffect(() => {
    if (!agentsLoading) {
      fetchWorkflows();
    }
  }, [agentsLoading, fetchWorkflows]);


  const handleAddWorkflow = async (newWorkflowData: Omit<WorkflowDocument, 'status'> & { agentIds: string[] }) => {
    await addWorkflow(newWorkflowData);
    fetchWorkflows();
  };
  
  const handleRunWorkflow = async (e: React.MouseEvent, workflowId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setWorkflows(prev => 
        prev.map(wf => 
            wf.id === workflowId ? {...wf, status: 'Running'} : wf
        )
    );
    await updateWorkflowStatus(workflowId, 'Running');
    const runId = await createWorkflowRun(workflowId);

    // Simulate workflow execution
    setTimeout(async () => {
       await updateWorkflowRun(runId, {
            logs: [{ timestamp: Date.now(), message: "Starting pre-patch validation..." }]
        });
    }, 1000);
    
    setTimeout(async () => {
       await updateWorkflowRun(runId, {
            logs: [
                { timestamp: Date.now() - 2000, message: "Starting pre-patch validation..." },
                { timestamp: Date.now(), message: "Pre-patch validation successful." }
            ]
        });
    }, 3000);
    
    setTimeout(async () => {
        await updateWorkflowStatus(workflowId, 'Completed');
        await updateWorkflowRun(runId, { status: 'Completed', endTime: Date.now(),
            logs: [
                 { timestamp: Date.now() - 4000, message: "Starting pre-patch validation..." },
                 { timestamp: Date.now() - 2000, message: "Pre-patch validation successful." },
                 { timestamp: Date.now(), message: "Workflow completed successfully." }
            ]
        });
        fetchWorkflows();
    }, 5000);
  }


  return (
    <div className="space-y-6">
       <WorkflowForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        agents={agents}
        onAddWorkflow={handleAddWorkflow}
        onClose={() => setIsFormOpen(false)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflow Management</h1>
          <p className="text-muted-foreground">
            Orchestrate and monitor your automated IT processes.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Workflow
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {loading || agentsLoading ? (
           <p>Loading workflows...</p>
        ) : workflows.length === 0 ? (
          <p className="text-muted-foreground">No workflows defined yet.</p>
        ) : (
          workflows.map((workflow) => (
              <Link key={workflow.id} href={`/workflows/${workflow.id}`} className="flex">
                  <Card className="flex flex-col w-full hover:border-primary transition-colors">
                      <CardHeader>
                      <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                          <workflow.icon className="h-6 w-6 text-primary" />
                          <div className="grid gap-1">
                              <CardTitle>{workflow.name}</CardTitle>
                              <CardDescription>{workflow.description}</CardDescription>
                          </div>
                          </div>
                          <Badge variant={workflow.status === 'Running' ? 'default' : 'secondary'}>{workflow.status}</Badge>
                      </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                      <div className="text-sm font-medium">Steps ({workflow.type})</div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          {workflow.steps.map((step, index) => (
                          <div key={step.name} className="flex items-center gap-2">
                              <div className="flex items-center gap-2 rounded-full border bg-card p-2">
                              <step.icon className="h-4 w-4 text-primary" />
                              <span className="text-foreground">{step.name}</span>
                              </div>
                              {index < workflow.steps.length - 1 && workflow.type === "Sequential" && (
                              <ArrowRight className="h-4 w-4" />
                              )}
                          </div>
                          ))}
                      </div>
                      </CardContent>
                      <CardFooter>
                      <Button 
                          className="w-full" 
                          disabled={workflow.status === 'Running'} 
                          onClick={(e) => handleRunWorkflow(e, workflow.id)}
                      >
                          {workflow.status === 'Running' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                              <Play className="mr-2 h-4 w-4" />
                          )}
                          {workflow.status === 'Running' ? 'Executing...' : workflow.status === 'Completed' ? 'Run Again' : 'Run Workflow'}
                      </Button>
                      </CardFooter>
                  </Card>
              </Link>
          ))
        )}
      </div>
    </div>
  );
}
