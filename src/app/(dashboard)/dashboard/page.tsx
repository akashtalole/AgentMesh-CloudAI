import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BotMessageSquare,
  Cpu,
  DollarSign,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { CloudCostForm } from "./components/cloud-cost-form";
import { automatedSecurityComplianceRemediation } from "@/ai/flows/automated-security-compliance-remediation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const overviewCards = [
  {
    title: "Active Agents",
    value: "12",
    icon: BotMessageSquare,
    change: "+2",
    description: "since last hour",
  },
  {
    title: "Workflows Running",
    value: "8",
    icon: Workflow,
    change: "+1",
    description: "newly triggered",
  },
  {
    title: "Security Alerts",
    value: "3",
    icon: ShieldCheck,
    variant: "destructive",
    description: "require attention",
  },
  {
    title: "Monthly Savings",
    value: "$2,450",
    icon: DollarSign,
    change: "+15%",
    description: "from last month",
  },
];

const recentActivities = [
    { id: 1, agent: "Sentinel", task: "Patch Management", status: "Completed", time: "2m ago" },
    { id: 2, agent: "Atlas", task: "Scale Down dev-cluster", status: "Completed", time: "15m ago" },
    { id: 3, agent: "Cipher", task: "Vulnerability Scan", status: "In Progress", time: "25m ago" },
    { id: 4, agent: "Sage", task: "Cost Analysis Report", status: "Completed", time: "1h ago" },
    { id: 5, agent: "Monitor", task: "System Health Check", status: "Succeeded", time: "2h ago" },
];

export default async function DashboardPage() {
  const securityReport = await automatedSecurityComplianceRemediation({
    enterpriseEnvironmentDescription: "Standard multi-cloud setup with AWS and Azure, running production web services and databases.",
    industryStandards: "SOC 2, HIPAA"
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to AgentMesh CloudAI. Here&apos;s your infrastructure at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.change && <span className="text-primary font-medium">{card.change} </span>}
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <CloudCostForm />
        </div>
        
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Recent Agent Activity</CardTitle>
                <CardDescription>An overview of the latest tasks performed by your agents.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentActivities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium">{activity.agent}</TableCell>
                                <TableCell>{activity.task}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        activity.status === "In Progress" ? "secondary" : 
                                        activity.status === "Completed" ? "default" : "outline"
                                    }>{activity.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{activity.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
