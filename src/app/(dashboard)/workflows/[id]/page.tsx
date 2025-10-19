// src/app/(dashboard)/workflows/[id]/page.tsx
'use client'

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowHistory } from './workflow-history';
import { Workflow, getWorkflow } from '@/services/firestore';

export default function WorkflowDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [workflow, setWorkflow] = React.useState<Workflow | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!id) return;
        const fetchWorkflow = async () => {
            setLoading(true);
            const wf = await getWorkflow(id);
            setWorkflow(wf);
            setLoading(false);
        }
        fetchWorkflow();
    }, [id]);

    if (loading || !workflow) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <workflow.icon className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>
                        <Badge variant={workflow.status === 'Running' ? 'default' : 'secondary'}>{workflow.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">{workflow.description}</p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Workflow Steps</CardTitle>
                    <CardDescription>Execution order: {workflow.type}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        {workflow.steps.map((step, index) => (
                        <div key={step.name} className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <step.icon className="h-5 w-5 text-muted-foreground" />
                                <span>{step.name}</span>
                            </div>
                            {index < workflow.steps.length - 1 && workflow.type === "Sequential" && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <WorkflowHistory workflowId={workflow.id} workflowStatus={workflow.status} />
            
        </div>
    );
}
