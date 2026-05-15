"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TechStack, TechNode, MASTERY_COLORS, MASTERY_LABELS, MasteryLevel } from "@/lib/tech-stacks-data";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── Custom Node Component ──────────────────────────────────────── */

interface CustomNodeData {
  label: string;
  mastery: MasteryLevel;
  isCenter: boolean;
  techNode: TechNode;
  [key: string]: unknown;
}

function TechMindmapNode({ data }: { data: CustomNodeData }) {
  const color = MASTERY_COLORS[data.mastery];
  const isCenter = data.isCenter;

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <div
        className={`
          flex items-center gap-2 rounded-xl border-2 shadow-lg backdrop-blur-sm
          transition-all duration-300 cursor-pointer
          hover:scale-110 hover:shadow-xl
          ${isCenter 
            ? "px-6 py-4 bg-gradient-to-br from-[#A79277]/20 to-[#FFF2E1]/80 border-[#A79277]" 
            : "px-4 py-3 bg-white/90 dark:bg-zinc-900/90"
          }
        `}
        style={{ borderColor: isCenter ? "#A79277" : color }}
      >
        {/* Mastery dot */}
        <div
          className="h-3 w-3 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <span className={`font-semibold text-sm whitespace-nowrap ${isCenter ? "text-base text-[#2D3748]" : "text-[#2D3748] dark:text-zinc-100"}`}>
          {data.label}
        </span>
      </div>
      {/* Glow ring on hover */}
      <div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10 blur-md"
        style={{ backgroundColor: color }}
      />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
    </div>
  );
}

const nodeTypes = { techNode: TechMindmapNode };

/* ─── Layout helpers ─────────────────────────────────────────────── */

function buildRadialLayout(stack: TechStack): { nodes: Node[]; edges: Edge[] } {
  const centerNode = stack.nodes.find((n) => n.id.endsWith("-center"))!;
  const childNodes = stack.nodes.filter((n) => !n.id.endsWith("-center"));

  // Separate first-level children (connected directly to center)
  const firstLevelIds = new Set(
    stack.edges.filter((e) => e.source === centerNode.id).map((e) => e.target)
  );
  const firstLevel = childNodes.filter((n) => firstLevelIds.has(n.id));
  const secondLevel = childNodes.filter((n) => !firstLevelIds.has(n.id));

  const nodes: Node[] = [];

  // Center
  nodes.push({
    id: centerNode.id,
    type: "techNode",
    position: { x: 400, y: 250 },
    data: { label: centerNode.label, mastery: centerNode.mastery, isCenter: true, techNode: centerNode },
  });

  // First ring
  const radius1 = 220;
  firstLevel.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / firstLevel.length - Math.PI / 2;
    nodes.push({
      id: node.id,
      type: "techNode",
      position: {
        x: 400 + radius1 * Math.cos(angle),
        y: 250 + radius1 * Math.sin(angle),
      },
      data: { label: node.label, mastery: node.mastery, isCenter: false, techNode: node },
    });
  });

  // Second ring (children of first-level nodes)
  const radius2 = 400;
  // Group second-level nodes by their parent
  const parentMap: Record<string, TechNode[]> = {};
  for (const sn of secondLevel) {
    const parentEdge = stack.edges.find((e) => e.target === sn.id);
    if (parentEdge) {
      if (!parentMap[parentEdge.source]) parentMap[parentEdge.source] = [];
      parentMap[parentEdge.source].push(sn);
    }
  }

  Object.entries(parentMap).forEach(([parentId, children]) => {
    const parentNode = nodes.find((n) => n.id === parentId);
    if (!parentNode) return;
    const parentAngle = Math.atan2(parentNode.position.y - 250, parentNode.position.x - 400);

    children.forEach((child, i) => {
      const spread = Math.PI / 6;
      const offset = (i - (children.length - 1) / 2) * spread;
      const angle = parentAngle + offset;
      nodes.push({
        id: child.id,
        type: "techNode",
        position: {
          x: 400 + radius2 * Math.cos(angle),
          y: 250 + radius2 * Math.sin(angle),
        },
        data: { label: child.label, mastery: child.mastery, isCenter: false, techNode: child },
      });
    });
  });

  const edges: Edge[] = stack.edges.map((e) => ({
    id: `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: true,
    style: { stroke: "#A79277", strokeWidth: 2, opacity: 0.5 },
  }));

  return { nodes, edges };
}

/* ─── Main Mindmap Component ─────────────────────────────────────── */

interface TechStackMindmapProps {
  stack: TechStack;
}

export function TechStackMindmap({ stack }: TechStackMindmapProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => buildRadialLayout(stack), [stack]);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const router = useRouter();

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = node.data as CustomNodeData;
    if (data.techNode) {
      router.push(`/pairmentor?topic=${encodeURIComponent(data.techNode.label)}&stack=${encodeURIComponent(stack.name)}&autoStart=true`);
    }
  }, [router, stack.name]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#A79277]/20 bg-gradient-to-br from-[#FFF2E1]/30 to-white/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        className="tech-mindmap-flow"
      >
        <Background color="#A79277" gap={24} size={1} style={{ opacity: 0.15 }} />
        <Controls
          className="!bg-white/80 !border-[#A79277]/20 !rounded-xl !shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as CustomNodeData;
            return MASTERY_COLORS[data.mastery] || "#A79277";
          }}
          className="!bg-[#FFF2E1]/60 !border-[#A79277]/20 !rounded-xl"
          maskColor="rgba(167, 146, 119, 0.1)"
        />
      </ReactFlow>

      {/* Node Detail Slide-in (Removed in favor of direct navigation) */}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#A79277]/20 shadow-sm">
        {(["strong", "average", "weak"] as MasteryLevel[]).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MASTERY_COLORS[level] }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#718096]">{MASTERY_LABELS[level]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
