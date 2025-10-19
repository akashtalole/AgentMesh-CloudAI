// src/app/(dashboard)/workflows/[id]/workflow-history.tsx
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getWorkflowRuns, WorkflowRun } from '@/services/firestore';

const getIcon = (status: WorkflowRun['status']) => {
    switch (status) {
        case "Completed":
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "Failed":
            return <AlertCircle className="h-4 w-4 text-destructive" />;
        case "Running":
             return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
        default:
            return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
}

export function WorkflowHistory({ workflowId, workflowStatus }: { workflowId: string, workflowStatus: string }) {
    const [runs, setRuns] = React.useState<WorkflowRun[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchRuns = React.useCallback(async () => {
        // Only set loading true on initial fetch
        if (runs.length === 0) {
            setLoading(true);
        }
        const fetchedRuns = await getWorkflowRuns(workflowId);
        setRuns(fetchedRuns);
        setLoading(false);
    }, [workflowId, runs.length]);

    React.useEffect(() => {
        fetchRuns(); // Initial fetch
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowId]); // Only re-run if workflowId changes

    React.useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (workflowStatus === 'Running') {
            interval = setInterval(() => {
                fetchRuns();
            }, 2000); // Poll for updates if running
        } else if (interval) {
            clearInterval(interval);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [workflowStatus, fetchRuns]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>Live logs and history for this workflow from the database.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-2 h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : runs.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No execution history found.
                        </div>
                    ) : (
                        runs.map((run) => (
                            <div key={run.id}>
                                <div className="flex items-start gap-3 font-semibold">
                                    <span className="text-muted-foreground shrink-0 mt-0.5">{getIcon(run.status)}</span>
                                    <span className="text-muted-foreground shrink-0">
                                        [{new Date(run.startTime).toLocaleString()}]
                                    </span>
                                    <p className="flex-1">Run {run.id.substring(0, 5)}... - Status: {run.status}</p>
                                </div>
                                <div className="pl-8 pt-1 space-y-1">
                                {run.logs.map((log, logIndex) => (
                                    <div key={logIndex} className="flex items-start gap-3">
                                        <span className="text-muted-foreground shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                        <p className="flex-1">{log.message}</p>
                                    </div>
                                ))}
                                {run.status === 'Running' && (
                                     <div className="flex items-start gap-3">
                                        <span className="text-muted-foreground shrink-0 mt-0.5"><Loader2 className="h-4 w-4 animate-spin"/></span>
                                        <p className="flex-1">Awaiting next log entry...</p>
                                    </div>
                                )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
