"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MASTERY_COLORS, MASTERY_LABELS, type MasteryLevel, type TechStack } from "@/lib/tech-stacks-data";

/* ─── Mini Node ──────────────────────────────────────────────────── */

interface MiniNodeData {
  label: string;
  mastery: MasteryLevel;
  isCenter: boolean;
  [key: string]: unknown;
}

function MiniMindmapNode({ data }: { data: MiniNodeData }) {
  const color = MASTERY_COLORS[data.mastery];
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <div
        className={`
          flex items-center gap-1.5 rounded-lg border shadow-sm px-3 py-1.5
          ${data.isCenter ? "bg-[#FFF2E1] border-[#A79277] px-4 py-2" : "bg-white/90"}
        `}
        style={{ borderColor: data.isCenter ? "#A79277" : color }}
      >
        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className={`font-semibold whitespace-nowrap ${data.isCenter ? "text-xs text-[#2D3748]" : "text-[10px] text-[#718096]"}`}>
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
    </div>
  );
}

const nodeTypes = { miniNode: MiniMindmapNode };

/* ─── Build the overview graph ──────────────────────────────────── */

function buildOverviewGraph(stacks: TechStack[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Center node
  nodes.push({
    id: "center",
    type: "miniNode",
    position: { x: 250, y: 140 },
    data: { label: "My Tech Skills", mastery: "average" as MasteryLevel, isCenter: true },
  });

  // Compute dominant mastery for each stack
  const radius = 160;

  stacks.forEach((stack, i) => {
    const nonCenter = stack.nodes.filter((n) => !n.id.endsWith("-center"));
    const counts = { strong: 0, average: 0, weak: 0 };
    nonCenter.forEach((n) => counts[n.mastery]++);

    let dominant: MasteryLevel = "weak";
    if (counts.strong >= counts.average && counts.strong >= counts.weak) dominant = "strong";
    else if (counts.average >= counts.weak) dominant = "average";

    const angle = (2 * Math.PI * i) / stacks.length - Math.PI / 2;
    nodes.push({
      id: stack.id,
      type: "miniNode",
      position: {
        x: 250 + radius * Math.cos(angle),
        y: 140 + radius * Math.sin(angle),
      },
      data: { label: `${stack.icon} ${stack.name}`, mastery: dominant, isCenter: false },
    });

    edges.push({
      id: `center-${stack.id}`,
      source: "center",
      target: stack.id,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#A79277", strokeWidth: 1.5, opacity: 0.4 },
    });
  });

  return { nodes, edges };
}

/* ─── Component ─────────────────────────────────────────────────── */

export function OverallProgressMindmap({ stacks }: { stacks: TechStack[] }) {
  const { nodes, edges } = useMemo(() => buildOverviewGraph(stacks), [stacks]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF2E1]/20 to-white/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#A79277" gap={20} size={1} style={{ opacity: 0.08 }} />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 flex gap-3 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#A79277]/15 shadow-sm">
        {(["strong", "average", "weak"] as MasteryLevel[]).map((level) => (
          <div key={level} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: MASTERY_COLORS[level] }} />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#718096]">{MASTERY_LABELS[level]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
