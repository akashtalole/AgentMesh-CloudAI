import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Aws,
  Azure,
  Gcp,
  Git,
  Server,
  Splunk,
  Siren,
  Ticket,
  Building,
} from "lucide-react";
import type { LucideIcon } from 'lucide-react';
import Image from "next/image";

type Integration = {
  name: string;
  category: string;
  description: string;
  icon: string | LucideIcon;
  connected: boolean;
};

const integrations: Integration[] = [
  // Cloud Providers
  { name: "AWS", category: "Cloud", description: "Amazon Web Services", icon: "aws", connected: true },
  { name: "Azure", category: "Cloud", description: "Microsoft Azure", icon: "azure", connected: true },
  { name: "Google Cloud", category: "Cloud", description: "Google Cloud Platform", icon: "gcp", connected: false },
  // Directory Services
  { name: "Active Directory", category: "Identity", description: "On-premise directory service", icon: Building, connected: true },
  { name: "Azure AD", category: "Identity", description: "Cloud identity and access management", icon: Building, connected: true },
  // ITSM
  { name: "ServiceNow", category: "ITSM", description: "IT Service Management platform", icon: Ticket, connected: true },
  { name: "Jira", category: "ITSM", description: "Project and issue tracking", icon: "jira", connected: false },
  // Security
  { name: "CrowdStrike", category: "Security", description: "Endpoint security platform", icon: Siren, connected: true },
  { name: "SentinelOne", category: "Security", description: "AI-powered endpoint protection", icon: Siren, connected: false },
  { name: "Splunk", category: "Security", description: "SIEM and log management", icon: "splunk", connected: true },
  // VCS
  { name: "GitHub", category: "VCS", description: "Version control and collaboration", icon: "github", connected: true },
  // Custom Integration
  { name: "SuperOps", category: "MSP", description: "Unified PSA-RMM Platform", icon: "superops", connected: true },
];

const SvgIcon = ({ iconName, ...props }: { iconName: string, [key: string]: any }) => {
    const icons: {[key: string]: string} = {
        aws: "https://cdn.worldvectorlogo.com/logos/aws-2.svg",
        azure: "https://cdn.worldvectorlogo.com/logos/azure-1.svg",
        gcp: "https://cdn.worldvectorlogo.com/logos/google-cloud-1.svg",
        jira: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
        splunk: "https://cdn.worldvectorlogo.com/logos/splunk.svg",
        github: "https://cdn.worldvectorlogo.com/logos/github-icon-1.svg",
        superops: "https://www.superops.ai/images/superops-logo.svg",
    };
    if (!icons[iconName]) return null;
    return <Image src={icons[iconName]} alt={`${iconName} logo`} width={24} height={24} {...props} />;
};


export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations Hub</h1>
        <p className="text-muted-foreground">
          Connect AgentMesh to your existing tools and platforms.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         {typeof integration.icon === 'string' ? (
                            <SvgIcon iconName={integration.icon} className="h-6 w-6" />
                        ) : (
                            <integration.icon className="h-6 w-6 text-muted-foreground" />
                        )}
                        <CardTitle>{integration.name}</CardTitle>
                    </div>
                    <Switch checked={integration.connected} aria-label={`Toggle ${integration.name} integration`} />
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground h-10">
                {integration.description}
              </p>
              <Badge variant="outline" className="mt-4">{integration.category}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
