/**
 * Tech Stacks Data Model
 * 
 * Contains the full definition for 6 industry tech stacks,
 * each with nodes, edges, DSA concepts, and simulated mastery levels.
 * In production, mastery levels come from Supabase user profiles.
 */

import { supabase } from "./supabase";

export type MasteryLevel = "strong" | "average" | "weak";

export interface TechNode {
  id: string;
  label: string;
  mastery: MasteryLevel;
  dsaConcepts: string[];
  description: string;
}

export interface TechEdge {
  source: string;
  target: string;
}

export interface TechStack {
  id: string;
  name: string;
  icon: string;
  description: string;
  nodes: TechNode[];
  edges: TechEdge[];
}

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  strong: "#10b981",
  average: "#f59e0b",
  weak: "#ef4444",
};

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  strong: "Strong",
  average: "In Progress",
  weak: "Not Started",
};

// ─── MERN Stack ───────────────────────────────────────────────────
const mernStack: TechStack = {
  id: "mern",
  name: "MERN Stack",
  icon: "🟢",
  description: "MongoDB, Express.js, React, Node.js — the classic JavaScript fullstack.",
  nodes: [
    { id: "mern-center", label: "MERN Stack", mastery: "average", dsaConcepts: [], description: "Full JavaScript stack" },
    { id: "mern-mongo", label: "MongoDB", mastery: "average", dsaConcepts: ["B-Trees", "Hashing", "Document Indexing"], description: "NoSQL document database" },
    { id: "mern-express", label: "Express.js", mastery: "strong", dsaConcepts: ["Middleware Chains", "Queue Patterns", "Routing Graphs"], description: "Minimal Node.js web framework" },
    { id: "mern-react", label: "React", mastery: "strong", dsaConcepts: ["Virtual DOM (Tree Diffing)", "Recursion", "State Machines"], description: "Component-based UI library" },
    { id: "mern-node", label: "Node.js", mastery: "average", dsaConcepts: ["Event Loop (Queue)", "Async Patterns", "Streams"], description: "Server-side JavaScript runtime" },
    { id: "mern-mongoose", label: "Mongoose", mastery: "weak", dsaConcepts: ["Schema Validation", "Graph Relationships"], description: "MongoDB ODM for Node.js" },
    { id: "mern-redux", label: "Redux", mastery: "weak", dsaConcepts: ["State Machines", "Immutable Data Structures"], description: "Predictable state management" },
    { id: "mern-jwt", label: "JWT Auth", mastery: "average", dsaConcepts: ["Hashing (SHA-256)", "Encryption"], description: "Token-based authentication" },
  ],
  edges: [
    { source: "mern-center", target: "mern-mongo" },
    { source: "mern-center", target: "mern-express" },
    { source: "mern-center", target: "mern-react" },
    { source: "mern-center", target: "mern-node" },
    { source: "mern-mongo", target: "mern-mongoose" },
    { source: "mern-react", target: "mern-redux" },
    { source: "mern-express", target: "mern-jwt" },
  ],
};

// ─── Next.js Fullstack ────────────────────────────────────────────
const nextjsStack: TechStack = {
  id: "nextjs",
  name: "Next.js Fullstack",
  icon: "▲",
  description: "Next.js, React Server Components, Vercel, Prisma — modern fullstack.",
  nodes: [
    { id: "next-center", label: "Next.js Fullstack", mastery: "strong", dsaConcepts: [], description: "React meta-framework" },
    { id: "next-rsc", label: "React Server Components", mastery: "average", dsaConcepts: ["Tree Traversal", "Streaming Algorithms"], description: "Server-rendered React components" },
    { id: "next-prisma", label: "Prisma ORM", mastery: "weak", dsaConcepts: ["Relational Algebra", "B-Tree Indexes"], description: "Type-safe database client" },
    { id: "next-tailwind", label: "Tailwind CSS", mastery: "strong", dsaConcepts: ["Utility-First Patterns"], description: "Utility-first CSS framework" },
    { id: "next-vercel", label: "Vercel Deploy", mastery: "strong", dsaConcepts: ["CDN Edge Caching", "Load Balancing"], description: "Deployment & edge network" },
    { id: "next-auth", label: "NextAuth.js", mastery: "average", dsaConcepts: ["OAuth Flows", "Session Graphs"], description: "Authentication for Next.js" },
    { id: "next-trpc", label: "tRPC", mastery: "weak", dsaConcepts: ["RPC Patterns", "Type Inference Trees"], description: "End-to-end typesafe APIs" },
    { id: "next-postgres", label: "PostgreSQL", mastery: "average", dsaConcepts: ["B+ Trees", "Hash Joins", "Query Plans"], description: "Relational database" },
  ],
  edges: [
    { source: "next-center", target: "next-rsc" },
    { source: "next-center", target: "next-prisma" },
    { source: "next-center", target: "next-tailwind" },
    { source: "next-center", target: "next-vercel" },
    { source: "next-center", target: "next-auth" },
    { source: "next-prisma", target: "next-trpc" },
    { source: "next-prisma", target: "next-postgres" },
  ],
};

// ─── Spring Boot + PostgreSQL ─────────────────────────────────────
const springStack: TechStack = {
  id: "spring",
  name: "Spring Boot + PostgreSQL",
  icon: "🍃",
  description: "Java Spring Boot, JPA/Hibernate, PostgreSQL — enterprise Java backend.",
  nodes: [
    { id: "spring-center", label: "Spring Boot", mastery: "weak", dsaConcepts: [], description: "Java enterprise framework" },
    { id: "spring-jpa", label: "JPA / Hibernate", mastery: "weak", dsaConcepts: ["Object-Relational Mapping", "Lazy Loading Trees"], description: "ORM for Java" },
    { id: "spring-pg", label: "PostgreSQL", mastery: "average", dsaConcepts: ["B+ Trees", "Hash Joins", "MVCC"], description: "Advanced relational DB" },
    { id: "spring-security", label: "Spring Security", mastery: "weak", dsaConcepts: ["Filter Chains", "Role-Based Access Graphs"], description: "Authentication & authorization" },
    { id: "spring-rest", label: "REST APIs", mastery: "average", dsaConcepts: ["HTTP State Machines", "Pagination Patterns"], description: "RESTful web services" },
    { id: "spring-maven", label: "Maven / Gradle", mastery: "weak", dsaConcepts: ["Dependency Graphs (DAG)", "Topological Sort"], description: "Build automation" },
    { id: "spring-docker", label: "Docker", mastery: "average", dsaConcepts: ["Layered File Systems", "Process Isolation"], description: "Containerization" },
  ],
  edges: [
    { source: "spring-center", target: "spring-jpa" },
    { source: "spring-center", target: "spring-security" },
    { source: "spring-center", target: "spring-rest" },
    { source: "spring-center", target: "spring-maven" },
    { source: "spring-jpa", target: "spring-pg" },
    { source: "spring-center", target: "spring-docker" },
  ],
};

// ─── Django + React ───────────────────────────────────────────────
const djangoStack: TechStack = {
  id: "django",
  name: "Django + React",
  icon: "🐍",
  description: "Python Django REST Framework + React frontend — rapid fullstack.",
  nodes: [
    { id: "django-center", label: "Django + React", mastery: "average", dsaConcepts: [], description: "Python + JS fullstack" },
    { id: "django-drf", label: "Django REST Framework", mastery: "average", dsaConcepts: ["Serialization", "Middleware Chains"], description: "RESTful API toolkit for Django" },
    { id: "django-models", label: "Django Models", mastery: "strong", dsaConcepts: ["Relational Algebra", "Migration DAGs"], description: "ORM & database layer" },
    { id: "django-react", label: "React Frontend", mastery: "strong", dsaConcepts: ["Virtual DOM Trees", "Reconciliation"], description: "Component-based UI" },
    { id: "django-celery", label: "Celery", mastery: "weak", dsaConcepts: ["Task Queues", "Priority Queues", "Worker Pools"], description: "Async task processing" },
    { id: "django-redis", label: "Redis", mastery: "weak", dsaConcepts: ["Hash Tables", "Pub/Sub Patterns", "LRU Cache"], description: "In-memory data store" },
    { id: "django-pg", label: "PostgreSQL", mastery: "average", dsaConcepts: ["B+ Trees", "Hash Joins"], description: "Relational database" },
  ],
  edges: [
    { source: "django-center", target: "django-drf" },
    { source: "django-center", target: "django-models" },
    { source: "django-center", target: "django-react" },
    { source: "django-drf", target: "django-celery" },
    { source: "django-celery", target: "django-redis" },
    { source: "django-models", target: "django-pg" },
  ],
};

// ─── MEAN Stack ───────────────────────────────────────────────────
const meanStack: TechStack = {
  id: "mean",
  name: "MEAN Stack",
  icon: "🔷",
  description: "MongoDB, Express, Angular, Node.js — TypeScript-first fullstack.",
  nodes: [
    { id: "mean-center", label: "MEAN Stack", mastery: "weak", dsaConcepts: [], description: "TypeScript fullstack" },
    { id: "mean-angular", label: "Angular", mastery: "weak", dsaConcepts: ["Dependency Injection Graphs", "Change Detection Trees", "RxJS Streams"], description: "Enterprise frontend framework" },
    { id: "mean-express", label: "Express.js", mastery: "strong", dsaConcepts: ["Middleware Chains", "Routing Tries"], description: "Minimal web framework" },
    { id: "mean-mongo", label: "MongoDB", mastery: "average", dsaConcepts: ["B-Trees", "Aggregation Pipelines"], description: "NoSQL database" },
    { id: "mean-node", label: "Node.js", mastery: "average", dsaConcepts: ["Event Loop", "Async Queues"], description: "JavaScript runtime" },
    { id: "mean-rxjs", label: "RxJS", mastery: "weak", dsaConcepts: ["Observable Streams", "Backpressure", "Operators as Pipelines"], description: "Reactive programming" },
    { id: "mean-ts", label: "TypeScript", mastery: "average", dsaConcepts: ["Type Systems", "Generics & Type Trees"], description: "Typed JavaScript superset" },
  ],
  edges: [
    { source: "mean-center", target: "mean-angular" },
    { source: "mean-center", target: "mean-express" },
    { source: "mean-center", target: "mean-mongo" },
    { source: "mean-center", target: "mean-node" },
    { source: "mean-angular", target: "mean-rxjs" },
    { source: "mean-angular", target: "mean-ts" },
  ],
};

// ─── DevOps / Cloud Stack ─────────────────────────────────────────
const devopsStack: TechStack = {
  id: "devops",
  name: "DevOps / Cloud Stack",
  icon: "☁️",
  description: "Docker, Kubernetes, AWS, Terraform, CI/CD — cloud-native infrastructure.",
  nodes: [
    { id: "devops-center", label: "DevOps / Cloud", mastery: "weak", dsaConcepts: [], description: "Cloud infrastructure" },
    { id: "devops-docker", label: "Docker", mastery: "average", dsaConcepts: ["Layered File Systems", "Process Trees"], description: "Container engine" },
    { id: "devops-k8s", label: "Kubernetes", mastery: "weak", dsaConcepts: ["Distributed Hash Tables", "Consensus Algorithms (Raft)"], description: "Container orchestration" },
    { id: "devops-aws", label: "AWS", mastery: "average", dsaConcepts: ["Distributed Systems", "Consistent Hashing"], description: "Cloud services platform" },
    { id: "devops-terraform", label: "Terraform", mastery: "weak", dsaConcepts: ["DAG Execution", "Graph Traversal"], description: "Infrastructure as Code" },
    { id: "devops-cicd", label: "CI/CD Pipelines", mastery: "average", dsaConcepts: ["Pipeline DAGs", "Queue-Based Processing"], description: "Continuous integration & delivery" },
    { id: "devops-monitor", label: "Monitoring", mastery: "weak", dsaConcepts: ["Time-Series Data", "Sliding Window"], description: "Prometheus, Grafana, etc." },
    { id: "devops-nginx", label: "Nginx / Load Balancers", mastery: "weak", dsaConcepts: ["Round Robin", "Weighted Graphs", "Reverse Proxy Chains"], description: "Traffic management" },
  ],
  edges: [
    { source: "devops-center", target: "devops-docker" },
    { source: "devops-center", target: "devops-k8s" },
    { source: "devops-center", target: "devops-aws" },
    { source: "devops-center", target: "devops-terraform" },
    { source: "devops-center", target: "devops-cicd" },
    { source: "devops-k8s", target: "devops-monitor" },
    { source: "devops-aws", target: "devops-nginx" },
  ],
};

export const ALL_TECH_STACKS: TechStack[] = [
  mernStack,
  nextjsStack,
  springStack,
  djangoStack,
  meanStack,
  devopsStack,
];

/**
 * Fetch dynamic tech stack mastery data from Supabase.
 * Merges it with the base layout (ALL_TECH_STACKS).
 */
export async function getTechStacksData(): Promise<TechStack[]> {
  try {
    const { data: masteryData, error } = await supabase
      .from("tech_stack_mastery")
      .select("stack_name, node_name, mastery_level")
      // Hardcoded dummy user for demonstration
      .eq("user_id", "00000000-0000-0000-0000-000000000000");

    console.log("🔥 REAL Tech Stack Mastery from Supabase:", masteryData);

    if (error) {
      console.error("Supabase error fetching tech stacks:", error);
    }

    const dynamicStacks: TechStack[] = JSON.parse(JSON.stringify(ALL_TECH_STACKS));

    for (const stack of dynamicStacks) {
      for (const node of stack.nodes) {
        const matchingRecord = (masteryData || []).find(
          (m) => m.stack_name === stack.name && m.node_name === node.label
        );
        if (matchingRecord) {
          node.mastery = matchingRecord.mastery_level as MasteryLevel;
        } else {
          // If no record exists, default to 'weak'
          if (!node.id.endsWith("-center")) {
             node.mastery = "weak";
          }
        }
      }
    }

    return dynamicStacks;
  } catch (err) {
    console.error("Error fetching tech stacks from Supabase:", err);
    return ALL_TECH_STACKS;
  }
}

/**
 * Compute overall mastery stats for the progress overview mindmap
 */
export function computeOverallProgress(stacks: TechStack[] = ALL_TECH_STACKS): { strong: number; average: number; weak: number; total: number } {
  let strong = 0, average = 0, weak = 0;
  for (const stack of stacks) {
    for (const node of stack.nodes) {
      if (node.id.endsWith("-center")) continue; // skip center hub nodes
      if (node.mastery === "strong") strong++;
      else if (node.mastery === "average") average++;
      else weak++;
    }
  }
  return { strong, average, weak, total: strong + average + weak };
}
