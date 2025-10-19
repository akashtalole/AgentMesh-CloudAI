# AgentMesh CloudAI

Welcome to AgentMesh CloudAI, a powerful, platform for building and orchestrating agentic AI for IT and cloud management. This application provides a visual interface to create, manage, and deploy AI agents that can automate complex IT workflows, optimize cloud costs, and enhance security compliance.

## Key Features

- **Visual Agent Builder**: An intuitive interface to create, configure, and deploy custom AI agents. Define their properties, select their underlying AI models (e.g., Gemini), assign specialized tools, and give them specific instructions.
- **Workflow Orchestration**: Chain multiple agents together into sequential or parallel workflows to automate complex processes like patch management, security audits, or cost analysis.
- **Live Workflow Monitoring**: A real-time dashboard to view the status and execution history of each workflow, with detailed logs persisted in the database.
- **Multi-Tenant Architecture**: Built from the ground up for Managed Service Providers (MSPs), with a clear separation between tenants, users, and customers.
- **Tool & Integration Hub**: A centralized system to create, manage, and configure the tools your agents can use. The Agent Builder dynamically populates with available tools from the database.
- **Role-Based Access Control**: Manage user permissions with distinct roles like Platform Admin, MSP Admin, and Client User.
- **Genkit-Powered AI**: Leverages Google's Genkit to seamlessly integrate with powerful generative AI models for complex reasoning and task execution.
- **Database-Driven**: All agents, workflows, tools, and organizational data are persisted in Firestore, creating a robust and scalable backend.
- **Modern UI**: Built with Next.js, ShadCN UI, and Tailwind CSS for a responsive, clean, and modern user experience.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Google Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Generative AI**: [Google Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: Firebase App Hosting (configured in `apphosting.yaml`)

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- An active Google Firebase project.

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <repository-name>
npm install
```

### 2. Firebase Configuration

This project requires a Firebase project to run. The configuration is stored in `src/lib/firebase.ts`.

1.  Navigate to your Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2.  Go to **Project Settings** > **General**.
3.  Under "Your apps", select the "Web" platform (`</>`).
4.  Copy the `firebaseConfig` object.
5.  Paste your configuration into the `firebaseConfig` object in `src/lib/firebase.ts`.

**Important**: You must also enable **Firestore Database** and **Firebase Authentication** (with the Email/Password provider) in your Firebase project console.

### 3. Environment Variables

While most of the Firebase configuration is in `src/lib/firebase.ts`, API keys for Genkit services should be stored in an environment file.

Create a `.env.local` file in the root of the project and add your Google AI API key:

```
GEMINI_API_KEY=your_google_ai_api_key_here
```

### 4. Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### Seeding the Database

On the first run, the application will automatically seed your Firestore database with default agents, tools, and workflows to get you started. This happens when you first visit the "Agents," "Tools," and "Workflows" pages.
