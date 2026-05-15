"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { X, Code2 } from "lucide-react";

/* ─── Custom Node for Better UX ────────────────────────────────── */
const CustomLogicNode = ({ data }: { data: any }) => {
  return (
    <div className="px-5 py-3 bg-card border-2 border-[#A79277]/30 hover:border-[#A79277] shadow-sm rounded-xl min-w-[220px] text-center transition-colors cursor-grab active:cursor-grabbing">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-5 !h-5 !bg-[#FFF2E1] !border-2 !border-[#A79277] transition-transform hover:scale-125" 
      />
      <div className="font-medium text-sm text-foreground">
        {data.label}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-5 !h-5 !bg-[#FFF2E1] !border-2 !border-[#A79277] transition-transform hover:scale-125" 
      />
    </div>
  );
};

const nodeTypes = { custom: CustomLogicNode };

const initialNodes = [
  { id: "1", type: "custom", position: { x: 50, y: 50 }, data: { label: "Function: binarySearch" } },
  { id: "2", type: "custom", position: { x: 450, y: 50 }, data: { label: "Initialize variables / pointers" } },
  { id: "3", type: "custom", position: { x: 450, y: 150 }, data: { label: "Base case for recursion" } },
  { id: "4", type: "custom", position: { x: 450, y: 250 }, data: { label: "While / For loop" } },
  { id: "5", type: "custom", position: { x: 450, y: 350 }, data: { label: "Check condition" } },
  { id: "6", type: "custom", position: { x: 450, y: 450 }, data: { label: "Handle edge case" } },
  { id: "7", type: "custom", position: { x: 450, y: 550 }, data: { label: "Return result" } },
];

const initialEdges: Edge[] = [];

interface LogicForgeCanvasProps {
  onClose: () => void;
  onConvert: () => void;
}

export function LogicForgeCanvas({ onClose, onConvert }: LogicForgeCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="bg-primary/20 text-primary p-1 rounded-md">
              <Code2 className="h-5 w-5" />
            </span>
            LogicForge Canvas
          </h2>
          <p className="text-sm text-muted-foreground">Drag and connect nodes to visually build your algorithm&apos;s logic.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-zinc-50 dark:bg-zinc-950 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          snapToGrid={true}
          snapGrid={[20, 20]}
          connectionRadius={40} // Makes it much easier to connect handles from further away
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={{ 
            type: 'smoothstep', 
            style: { strokeWidth: 3, stroke: '#A79277' },
            animated: true
          }}
          className="bg-zinc-50 dark:bg-zinc-950"
        >
          <Controls />
          <Background color="#ccc" gap={16} />
        </ReactFlow>
      </div>

      <div className="p-6 border-t bg-card flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
        <Button onClick={onConvert} size="lg" className="w-full max-w-md py-8 text-xl rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:scale-105 transition-all font-semibold">
          <Code2 className="mr-3 h-6 w-6" />
          Convert Logic to Code Skeleton
        </Button>
      </div>
    </div>
  );
}
