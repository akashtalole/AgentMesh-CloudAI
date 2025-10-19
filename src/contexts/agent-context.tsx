// src/contexts/agent-context.tsx
'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Cpu,
  Wrench,
  ShieldCheck,
  Building2,
  Bot,
  DatabaseBackup
} from "lucide-react";
import { getAgents, addAgent as addAgentToDb, updateAgent as updateAgentInDb, deleteAgent as deleteAgentFromDb, seedDefaultAgents, Agent as AgentType, AgentDocument } from '@/services/firestore';

export type Tool = {
  id: string;
  name: string;
  description: string;
};

// Client-side agent type includes the icon
export type Agent = AgentType & {
  icon: LucideIcon;
  iconName: string;
};

export const namedIcons: Record<string, LucideIcon> = {
    "wrench": Wrench,
    "shield-check": ShieldCheck,
    "database-backup": DatabaseBackup,
    "cpu": Cpu,
    "building-2": Building2,
    "bot": Bot,
};

const getIcon = (iconName?: string): LucideIcon => {
    if (iconName && namedIcons[iconName]) {
        return namedIcons[iconName];
    }
    return Bot;
}


interface AgentContextType {
  agents: Agent[];
  addAgent: (agent: AgentDocument) => Promise<void>;
  updateAgent: (id: string, agent: AgentDocument) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  loading: boolean;
}

const AgentContext = React.createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAgents = React.useCallback(async () => {
    setLoading(true);
    let dbAgents = await getAgents();

    if (dbAgents.length === 0) {
      await seedDefaultAgents();
      dbAgents = await getAgents();
    }

    const agentsWithIcons = dbAgents.map(agent => ({
        ...agent,
        icon: getIcon(agent.icon),
        iconName: agent.icon || 'bot',
    }));
    setAgents(agentsWithIcons);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const addAgent = async (newAgentData: AgentDocument) => {
    const newAgentId = await addAgentToDb(newAgentData);
    const newAgent: Agent = {
        ...newAgentData,
        id: newAgentId,
        status: 'Active', // Default status for new agents
        icon: getIcon(newAgentData.icon),
        iconName: newAgentData.icon || 'bot',
    };
    setAgents(prev => [...prev, newAgent]);
  };
  
  const updateAgent = async (id: string, updatedAgentData: AgentDocument) => {
    await updateAgentInDb(id, updatedAgentData);
    setAgents(prev => prev.map(agent => 
      agent.id === id 
      ? { ...agent, ...updatedAgentData, icon: getIcon(updatedAgentData.icon), iconName: updatedAgentData.icon || 'bot' }
      : agent
    ));
  };
  
  const deleteAgent = async (id: string) => {
    await deleteAgentFromDb(id);
    setAgents(prev => prev.filter(agent => agent.id !== id));
  };


  return (
    <AgentContext.Provider value={{ agents, addAgent, updateAgent, deleteAgent, loading }}>
      {children}
    </AgentContext.Provider>
  );
}

export const useAgents = () => {
  const context = React.useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};
