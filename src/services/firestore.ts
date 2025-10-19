// src/services/firestore.ts
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, serverTimestamp, orderBy } from 'firebase/firestore';
import type { LucideIcon } from 'lucide-react';
import { namedIcons } from '@/contexts/agent-context';

export type User = {
  id: string;
  name: string;
  email: string;
  role: "Platform Admin" | "MSP Admin" | "MSP Engineer" | "Client User";
  avatar: string;
  tenantId?: string;
  customer?: string;
};

export type Tenant = {
  id:string;
  name: string;
  users: User[];
  customers: { id: string; name: string }[];
};

export type Tool = {
  id: string;
  name: string;
  description: string;
};

// This is the shape of the data stored in Firestore
export type AgentDocument = {
  name: string;
  description: string;
  type: "LLM-Powered" | "Custom";
  icon: string;
  model?: string;
  prompt?: string;
  tools?: Tool[];
}

// This is the client-side representation, which includes the ID and status
export type Agent = AgentDocument & {
  id: string;
  status: "Active" | "Idle" | "Training";
};


// This is the shape of the data stored in Firestore for a workflow
export type WorkflowDocument = {
    name: string;
    description: string;
    type: "Sequential" | "Parallel";
    status: "Idle" | "Running" | "Completed";
    agentIds: string[];
}

// Client-side representation of a workflow step
export type WorkflowStep = {
    name: string;
    icon: LucideIcon;
};

// Client-side representation of a workflow
export type Workflow = Omit<WorkflowDocument, 'agentIds'> & {
    id: string;
    icon: LucideIcon;
    steps: WorkflowStep[];
}

// Represents a single execution of a workflow
export type WorkflowRun = {
    id: string;
    workflowId: string;
    startTime: number;
    endTime?: number;
    status: "Running" | "Completed" | "Failed";
    logs: {
        timestamp: number;
        message: string;
    }[];
}


export type McpServer = {
    id: string;
    name: string;
    url: string;
    description: string;
}


export async function getTenants(tenantId?: string): Promise<Tenant[]> {
    if (tenantId) {
        const tenantRef = doc(db, 'tenants', tenantId);
        const tenantSnap = await getDoc(tenantRef);
        if (!tenantSnap.exists()) return [];

        const tenantData = { id: tenantSnap.id, ...tenantSnap.data() } as Omit<Tenant, 'users'> & { users: string[] };
        const users: User[] = [];
        if (tenantData.users && tenantData.users.length > 0) {
            const userDocs = await getDocs(query(collection(db, "users"), where("__name__", "in", tenantData.users)));
            userDocs.forEach(userDoc => {
                if(userDoc.exists()){
                    users.push({ id: userDoc.id, ...userDoc.data(), tenantId: tenantData.id } as User);
                }
            });
        }
        return [{...tenantData, users}];
    }


  const tenantsCol = collection(db, 'tenants');
  const tenantSnapshot = await getDocs(tenantsCol);
  const tenantsList = tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Omit<Tenant, 'users'> & { users: string[] }));

  const tenantsWithUsers: Tenant[] = await Promise.all(
    tenantsList.map(async (tenantData) => {
        const users: User[] = [];
        if (tenantData.users && tenantData.users.length > 0) {
            const userDocs = await getDocs(query(collection(db, "users"), where("__name__", "in", tenantData.users)));
            userDocs.forEach(userDoc => {
                 if(userDoc.exists()){
                    users.push({ id: userDoc.id, ...userDoc.data(), tenantId: tenantData.id } as User);
                }
            });
        }
        return { ...tenantData, users };
    })
  );

  return tenantsWithUsers;
}

export async function getUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
}

export async function getPlatformAdmins(): Promise<User[]> {
    const adminsCol = collection(db, 'platformAdmins');
    const adminSnapshot = await getDocs(adminsCol);
    const adminList = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return adminList;
}

export async function addTenant(tenant: Omit<Tenant, 'id' | 'users' | 'customers'> & {customerNames: string[]}) {
    const { name, customerNames } = tenant;
    const customers = customerNames.map(name => ({id: name.toLowerCase().replace(/ /g, '-'), name}));
    await addDoc(collection(db, 'tenants'), { name, customers, users: [] });
}

export async function addUser(user: Omit<User, 'id' | 'avatar'>) {
    const newUser: Partial<Omit<User, 'id' | 'avatar'>> = { ...user };
    
    (newUser as User).avatar = `https://i.pravatar.cc/150?u=${user.email}`;

    const collectionName = user.role === 'Platform Admin' ? 'platformAdmins' : 'users';
    
    Object.keys(newUser).forEach(key => newUser[key as keyof typeof newUser] === undefined && delete newUser[key as keyof typeof newUser]);

    const userRef = await addDoc(collection(db, collectionName), newUser);
    
    if (user.tenantId && collectionName === 'users') {
        const tenantRef = doc(db, 'tenants', user.tenantId);
        const tenantSnap = await getDoc(tenantRef);
        if (tenantSnap.exists()) {
            const tenantData = tenantSnap.data();
            const users = tenantData.users || [];
            await updateDoc(tenantRef, {
                users: [...users, userRef.id]
            });
        }
    }
}

export async function updateUser(userId: string, user: Partial<Omit<User, 'id' | 'avatar'>>) {
    const collectionName = user.role === 'Platform Admin' ? 'platformAdmins' : 'users';
    const userRef = doc(db, collectionName, userId);
    
    const userUpdate: Partial<Omit<User, 'id' | 'avatar'>> = { ...user };
    Object.keys(userUpdate).forEach(key => userUpdate[key as keyof typeof userUpdate] === undefined && delete userUpdate[key as keyof typeof userUpdate]);
    
    await updateDoc(userRef, userUpdate);
}

export async function deleteUser(userId: string, role: User['role'], tenantId?: string) {
    const collectionName = role === 'Platform Admin' ? 'platformAdmins' : 'users';
    
    if (tenantId && collectionName === 'users') {
        const tenantRef = doc(db, 'tenants', tenantId);
        const tenantSnap = await getDoc(tenantRef);
        if (tenantSnap.exists()) {
            const tenantData = tenantSnap.data();
            const users = tenantData.users?.filter((id: string) => id !== userId) || [];
            await updateDoc(tenantRef, { users });
        }
    }
    await deleteDoc(doc(db, collectionName, userId));
}

export async function checkUserExistsInRole(email: string | null, role: 'Platform Admin' | 'MSP Staff'): Promise<boolean> {
    if (!email) return false;

    if (role === 'Platform Admin') {
        const q = query(collection(db, "platformAdmins"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } else {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    }
}

export async function getUserProfile(email: string | null): Promise<User | null> {
    if (!email) return null;

    let q = query(collection(db, "platformAdmins"), where("email", "==", email));
    let querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
    }

    q = query(collection(db, "users"), where("email", "==", email));
    querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
    }

    return null;
}

export async function getAgents(): Promise<Agent[]> {
    const agentsCol = collection(db, 'agents');
    const agentSnapshot = await getDocs(agentsCol);
    // Add a status property to each agent for client-side use
    const agentList = agentSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        status: ['Active', 'Idle'][Math.floor(Math.random() * 2)] // Randomly assign status for now
    } as Agent));
    return agentList;
}

export async function addAgent(agent: AgentDocument): Promise<string> {
    const docRef = await addDoc(collection(db, 'agents'), agent);
    return docRef.id;
}

export async function updateAgent(id: string, agent: AgentDocument): Promise<void> {
    const agentRef = doc(db, 'agents', id);
    await updateDoc(agentRef, agent);
}

export async function deleteAgent(id: string): Promise<void> {
    await deleteDoc(doc(db, 'agents', id));
}


const defaultAgents: AgentDocument[] = [
    { name: "Sentinel", description: "Executes structured patch management pipelines.", icon: 'wrench', type: "LLM-Powered", model: 'gemini-pro', prompt: 'You are a patch management expert.' },
    { name: "Validator", description: "Systematically verifies backup integrity across systems.", icon: 'database-backup', type: "LLM-Powered", model: 'gemini-pro', prompt: 'You are a data integrity specialist.' },
    { name: "Auditor", description: "Runs automated security audits and compliance checks.", icon: 'shield-check', type: "LLM-Powered", model: 'gemini-2.5-flash', prompt: 'You are a security compliance auditor.' },
    { name: "Optimizer", description: "Analyzes cloud spend and suggests cost-saving measures.", icon: 'cpu', type: "LLM-Powered", model: 'gemini-2.5-flash', prompt: 'You are a cloud cost optimization expert.' },
    { name: "Gatekeeper", description: "Manages access control and identity verification.", icon: 'building-2', type: "Custom", prompt: 'You handle identity and access management.' },
];

export async function seedDefaultAgents() {
    const agentsCol = collection(db, 'agents');
    const snapshot = await getDocs(agentsCol);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        defaultAgents.forEach(agent => {
            const docRef = doc(collection(db, 'agents'));
            batch.set(docRef, agent);
        });
        await batch.commit();
    }
}

export async function getMcpServers(): Promise<McpServer[]> {
    const serversCol = collection(db, 'mcpServers');
    const serverSnapshot = await getDocs(serversCol);
    return serverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as McpServer));
}

export async function addMcpServer(server: Omit<McpServer, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'mcpServers'), server);
    return docRef.id;
}

export async function deleteMcpServer(id: string): Promise<void> {
    await deleteDoc(doc(db, 'mcpServers', id));
}

// --- Tool Functions ---

export async function getTools(): Promise<Tool[]> {
    const toolsCol = collection(db, 'tools');
    const toolSnapshot = await getDocs(toolsCol);
    return toolSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool));
}

export async function addTool(tool: Omit<Tool, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'tools'), tool);
    return docRef.id;
}

export async function updateTool(id: string, tool: Partial<Omit<Tool, 'id'>>): Promise<void> {
    const toolRef = doc(db, 'tools', id);
    await updateDoc(toolRef, tool);
}

export async function deleteTool(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tools', id));
}

const defaultTools: Omit<Tool, 'id'>[] = [
  { name: "cloud_provisioning_tool", description: "Provisions and manages cloud resources on AWS, Azure, and GCP." },
  { name: "cost_optimization_tool", description: "Analyzes cloud spend and suggests cost-saving measures." },
  { name: "security_scanner", description: "Scans for vulnerabilities and compliance issues." },
  { name: "ad_management_tool", description: "Manages Active Directory users, groups, and permissions." },
  { name: "network_config_tool", description: "Configures network devices like routers and firewalls." },
  { name: "backup_integrity_checker", description: "Verifies the integrity of system backups." },
  { name: "mcp_integration_tool", description: "Integrates with external services via Model Context Protocol (MCP)." },
];

export async function seedDefaultTools() {
    const toolsCol = collection(db, 'tools');
    const snapshot = await getDocs(toolsCol);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        defaultTools.forEach(tool => {
            const docRef = doc(collection(db, 'tools'));
            batch.set(docRef, tool);
        });
        await batch.commit();
    }
}


// --- Workflow Functions ---

export async function addWorkflow(workflowData: Omit<WorkflowDocument, 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'workflows'), {
        ...workflowData,
        status: "Idle"
    });
    return docRef.id;
}

export async function getWorkflows(allAgents: (Agent & {icon: LucideIcon})[]): Promise<Workflow[]> {
    const workflowsCol = collection(db, 'workflows');
    const workflowSnapshot = await getDocs(workflowsCol);
    const workflowList = workflowSnapshot.docs.map(doc => {
        const data = doc.data() as WorkflowDocument;
        const steps: WorkflowStep[] = data.agentIds.map(agentId => {
            const agent = allAgents.find(a => a.id === agentId);
            return {
                name: agent?.name || 'Unknown Agent',
                icon: agent?.icon || namedIcons['bot']
            }
        });

        // Use the first agent's icon as the workflow icon, or a default
        const icon = steps.length > 0 ? steps[0].icon : namedIcons['wrench'];

        return {
            id: doc.id,
            ...data,
            steps,
            icon,
        } as Workflow;
    });
    return workflowList;
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
    const workflowRef = doc(db, 'workflows', id);
    const workflowSnap = await getDoc(workflowRef);

    if (!workflowSnap.exists()) {
        return null;
    }

    const data = workflowSnap.data() as WorkflowDocument;

    // This part requires fetching agent details to build the steps
    // For simplicity, we'll assume agent details are passed or fetched separately
    // In a real app, you might fetch agents based on agentIds
    const steps: WorkflowStep[] = await Promise.all(data.agentIds.map(async (agentId) => {
        const agentDoc = await getDoc(doc(db, 'agents', agentId));
        if (agentDoc.exists()) {
            const agentData = agentDoc.data() as AgentDocument;
            return { name: agentData.name, icon: namedIcons[agentData.icon] || namedIcons['bot'] };
        }
        return { name: 'Unknown Agent', icon: namedIcons['bot'] };
    }));
    
    const icon = steps.length > 0 ? steps[0].icon : namedIcons['wrench'];

    return {
        id: workflowSnap.id,
        ...data,
        steps,
        icon
    };
}


export async function updateWorkflowStatus(workflowId: string, status: WorkflowDocument['status']): Promise<void> {
    const workflowRef = doc(db, 'workflows', workflowId);
    await updateDoc(workflowRef, { status });
}

export async function createWorkflowRun(workflowId: string): Promise<string> {
    const runData = {
        workflowId,
        startTime: Date.now(),
        status: "Running",
        logs: [{ timestamp: Date.now(), message: "Workflow run initiated." }]
    };
    const runRef = await addDoc(collection(db, 'workflowRuns'), runData);
    return runRef.id;
}

export async function getWorkflowRuns(workflowId: string): Promise<WorkflowRun[]> {
    const q = query(
        collection(db, 'workflowRuns'),
        where("workflowId", "==", workflowId)
    );
    const runsSnapshot = await getDocs(q);
    const runs = runsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkflowRun));

    // Sort in application code to avoid needing a composite index
    return runs.sort((a, b) => b.startTime - a.startTime);
}

export async function updateWorkflowRun(runId: string, data: Partial<Omit<WorkflowRun, 'id' | 'workflowId'>>): Promise<void> {
    const runRef = doc(db, 'workflowRuns', runId);
    await updateDoc(runRef, data);
}

const getDefaultWorkflowDocuments = (agents: Agent[]): Omit<WorkflowDocument, 'status'>[] => {
    const agentMap = new Map(agents.map(a => [a.name, a.id]));

    return [
        { 
            name: "Automated Patch Management", 
            description: "Sequentially runs Sentinel to patch and Validator to check.",
            type: "Sequential",
            agentIds: [agentMap.get("Sentinel"), agentMap.get("Validator")].filter(Boolean) as string[],
        },
        { 
            name: "Cloud Security Audit",
            description: "Runs a parallel security audit and access check.",
            type: "Parallel",
            agentIds: [agentMap.get("Auditor"), agentMap.get("Gatekeeper")].filter(Boolean) as string[],
        },
        {
            name: "Cost Optimization & Reporting",
            description: "Finds and reports on cloud cost-saving opportunities.",
            type: "Sequential",
            agentIds: [agentMap.get("Optimizer")].filter(Boolean) as string[],
        }
    ];
}


export async function seedDefaultWorkflows() {
    const workflowsCol = collection(db, 'workflows');
    const snapshot = await getDocs(workflowsCol);

    if (!snapshot.empty) {
        return; // Don't seed if workflows already exist
    }

    // Ensure agents are seeded and fetched before creating workflows
    await seedDefaultAgents(); 
    const agents = await getAgents();
    if (agents.length === 0) {
        console.error("No agents found to seed workflows.");
        return;
    }
    
    const defaultWorkflows = getDefaultWorkflowDocuments(agents);
    
    const batch = writeBatch(db);
    defaultWorkflows.forEach(workflow => {
        if (workflow.agentIds.length > 0) { // Only add workflow if agents were found
            const docRef = doc(collection(db, 'workflows'));
            batch.set(docRef, { ...workflow, status: 'Idle' });
        }
    });
    await batch.commit();
}
