"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { X, Code2, PlusCircle, ArrowRight, Settings, Repeat, ArrowLeftRight, GitBranch, Split, GitCommit, Link as LinkIcon, Undo2, Zap } from "lucide-react";

/* ─── NODE PALETTE ITEMS ───────────────────────────────────────── */
const PALETTE_NODES = [
  { id: "init", label: "Initialize Variables", icon: <Settings className="h-4 w-4" /> },
  { id: "base", label: "Base Case", icon: <GitCommit className="h-4 w-4" /> },
  { id: "loop", label: "While / For Loop", icon: <Repeat className="h-4 w-4" /> },
  { id: "condition", label: "Check Condition", icon: <Split className="h-4 w-4" /> },
  { id: "edge", label: "Handle Edge Case", icon: <GitBranch className="h-4 w-4" /> },
  { id: "return", label: "Return Result", icon: <ArrowRight className="h-4 w-4" /> },
  { id: "calc", label: "Calculate Mid", icon: <PlusCircle className="h-4 w-4" /> },
  { id: "compare", label: "Compare Values", icon: <ArrowLeftRight className="h-4 w-4" /> },
];

/* ─── CUSTOM NODE COMPONENT ────────────────────────────────────── */
interface LogicNodeData {
  label: string;
  icon?: React.ReactNode;
  isConnecting?: boolean;
}

const CustomLogicNode = ({ data, selected }: { data: LogicNodeData; selected?: boolean }) => {
  return (
    <div className={`group relative px-6 py-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-2 transition-all duration-300 rounded-xl min-w-[220px] 
      ${selected ? 'border-[#A79277] shadow-[0_0_20px_rgba(167,146,119,0.4)] scale-105' : 'border-[#A79277]/30 hover:border-[#A79277]/70 shadow-[0_4px_20px_rgba(167,146,119,0.1)]'}
      ${data.isConnecting ? 'ring-4 ring-[#A79277]/40 animate-pulse' : ''}
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className={`!w-6 !h-6 !bg-[#FFF2E1] !border-[3px] !border-[#A79277] transition-all duration-300 hover:scale-150 hover:shadow-[0_0_15px_rgba(167,146,119,0.6)] z-20 ${data.isConnecting ? 'scale-125 bg-green-100 border-green-500' : ''}`}
      />
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${selected ? 'bg-[#A79277] text-white' : 'bg-[#FFF2E1] text-[#A79277]'}`}>
          {data.icon || <Settings className="h-4 w-4" />}
        </div>
        <div className="font-bold text-sm text-[#5C4A3A] dark:text-zinc-200">
          {data.label}
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`!w-6 !h-6 !bg-[#FFF2E1] !border-[3px] !border-[#A79277] transition-all duration-300 hover:scale-150 hover:shadow-[0_0_15px_rgba(167,146,119,0.6)] z-20 ${data.isConnecting ? 'scale-125 bg-green-100 border-green-500' : ''}`}
      />
      
      {/* Hover / Connect glow */}
      <div className={`absolute -inset-1 rounded-xl transition-opacity duration-300 -z-10 blur-md ${selected || data.isConnecting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} bg-gradient-to-r from-[#A79277]/30 to-[#FFF2E1]/30`} />
    </div>
  );
};

const nodeTypes = { custom: CustomLogicNode };

/* ─── SIDEBAR COMPONENT ────────────────────────────────────────── */
const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/label", label);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-72 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-[#A79277]/20 p-5 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-10">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#A79277] mb-6 flex items-center gap-2">
        <Code2 className="h-4 w-4" />
        Logic Palette
      </h3>
      <p className="text-xs text-[#8C7A61] mb-6 leading-relaxed font-medium">
        Drag and drop these blocks onto the canvas to map out your algorithm visually.
      </p>
      
      <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-20">
        {PALETTE_NODES.map((node) => (
          <div
            key={node.id}
            className="flex items-center gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-[#A79277]/20 rounded-xl cursor-grab active:cursor-grabbing hover:border-[#A79277] hover:shadow-md transition-all group"
            onDragStart={(event) => onDragStart(event, "custom", node.label)}
            draggable
          >
            <div className="p-1.5 rounded-md bg-[#FFF2E1] text-[#A79277] group-hover:scale-110 transition-transform">
              {node.icon}
            </div>
            <span className="text-sm font-bold text-[#5C4A3A] dark:text-zinc-200">{node.label}</span>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(167, 146, 119, 0.2); border-radius: 4px; }
      `}</style>
    </aside>
  );
};

/* ─── CANVAS CONTENT (Inner) ───────────────────────────────────── */
function LogicForgeInner({ onClose, onConvert }: LogicForgeCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition, fitView } = useReactFlow();

  // Connection & Undo State
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [edgeHistory, setEdgeHistory] = useState<Edge[][]>([[]]);

  // Update history when edges are added/removed (only if they actually changed length to avoid drag updates)
  useEffect(() => {
    if (edges.length !== edgeHistory[edgeHistory.length - 1]?.length) {
      setEdgeHistory(prev => [...prev, edges]);
    }
  }, [edges.length]); // Intentionally using length for basic history

  const handleUndo = () => {
    if (edgeHistory.length > 1) {
      const newHistory = [...edgeHistory];
      newHistory.pop(); // remove current state
      const previousEdges = newHistory[newHistory.length - 1];
      setEdgeHistory(newHistory);
      setEdges(previousEdges);
    }
  };

  // Sync isConnecting state to nodes for visual glow
  useEffect(() => {
    setNodes((nds) => nds.map(n => ({
      ...n,
      data: { ...n.data, isConnecting: n.id === connectingNodeId }
    })));
  }, [connectingNodeId, setNodes]);

  const defaultEdgeOptions = {
    type: "smoothstep",
    animated: true,
    style: { strokeWidth: 3.5, stroke: "#A79277" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#A79277" },
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow/type");
      const label = event.dataTransfer.getData("application/reactflow/label");

      if (typeof type === "undefined" || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const paletteNode = PALETTE_NODES.find(n => n.label === label);
      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { label, icon: paletteNode?.icon },
      };

      setNodes((nds) => {
        // Auto-select newly dropped node for quick suggestions
        const newNodes = nds.map(n => ({ ...n, selected: false }));
        return newNodes.concat({ ...newNode, selected: true });
      });
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
    },
    [screenToFlowPosition, setNodes, fitView]
  );

  // Click-to-connect logic
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setConnectingNodeId((prev) => {
      if (prev && prev !== node.id) {
        // We have a start node and clicked a target node -> Connect!
        setEdges((eds) => addEdge({
          source: prev,
          target: node.id,
          ...defaultEdgeOptions
        }, eds));
        return null; // Reset connection state
      }
      return node.id; // Start connection from this node
    });
  }, [setEdges]);

  const onPaneClick = useCallback(() => {
    setConnectingNodeId(null);
  }, []);

  // Bulk connect selected nodes
  const handleConnectSelected = () => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length === 2) {
      // Connect first to second based on Y position (top to bottom)
      const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
      setEdges((eds) => addEdge({
        source: sorted[0].id,
        target: sorted[1].id,
        ...defaultEdgeOptions
      }, eds));
      // Deselect
      setNodes(nds => nds.map(n => ({ ...n, selected: false })));
      setConnectingNodeId(null);
    }
  };

  // Quick Add Node and Auto Connect
  const handleQuickAdd = (paletteId: string) => {
    const selectedNode = nodes.find(n => n.selected);
    if (!selectedNode) return;

    const paletteNode = PALETTE_NODES.find(n => n.id === paletteId);
    if (!paletteNode) return;

    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: "custom",
      position: { x: selectedNode.position.x, y: selectedNode.position.y + 150 },
      data: { label: paletteNode.label, icon: paletteNode.icon },
      selected: true, // auto select the new one to chain them
    };

    setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNode));
    setEdges(eds => addEdge({ source: selectedNode.id, target: newNode.id, ...defaultEdgeOptions }, eds));
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
  };

  const handleConvert = () => {
    // Topological sort / graph traversal
    const incomingEdges = new Set(edges.map(e => e.target));
    let currentNodes = nodes.filter(n => !incomingEdges.has(n.id));
    if (currentNodes.length === 0 && nodes.length > 0) currentNodes = [nodes[0]];

    const steps: string[] = [];
    const visited = new Set<string>();

    while (currentNodes.length > 0) {
      const node = currentNodes.shift()!;
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      steps.push(node.data.label as string);

      const outEdges = edges.filter(e => e.source === node.id);
      const children = outEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as Node[];
      children.sort((a, b) => a.position.x - b.position.x);
      currentNodes.push(...children);
    }

    let generatedCode = `function generatedAlgorithm(params: any): any {\n`;
    if (steps.length === 0) {
      generatedCode += `  // Start dragging nodes onto the canvas to build your logic!\n`;
    } else {
      steps.forEach((step, index) => {
        generatedCode += `  // Step ${index + 1}: ${step}\n`;
        const labelLower = step.toLowerCase();
        if (labelLower.includes("initialize")) generatedCode += `  let result = null;\n\n`;
        else if (labelLower.includes("loop")) generatedCode += `  while (/* condition */) {\n    // loop body\n  }\n\n`;
        else if (labelLower.includes("condition") || labelLower.includes("edge case")) generatedCode += `  if (/* condition */) {\n    \n  }\n\n`;
        else if (labelLower.includes("return")) generatedCode += `  return result;\n`;
        else generatedCode += `  \n`;
      });
    }
    generatedCode += `}`;
    onConvert(generatedCode);
  };

  const selectedCount = nodes.filter(n => n.selected).length;

  return (
    <div className="flex w-full h-[calc(100%-80px)]">
      <Sidebar />
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          snapToGrid={true}
          snapGrid={[20, 20]}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={50}
          defaultEdgeOptions={defaultEdgeOptions}
          className="bg-[#FFF2E1]/40"
        >
          <Controls className="!bg-white/80 !border-[#A79277]/20 !rounded-xl !shadow-lg" />
          <Background color="#A79277" gap={24} size={1.5} style={{ opacity: 0.15 }} />
          <MiniMap 
            nodeColor="#A79277" 
            maskColor="rgba(253, 249, 241, 0.7)" 
            className="!bg-white/80 !border-[#A79277]/20 !rounded-xl !shadow-lg" 
          />
        </ReactFlow>

        {/* Toolbar: Undo & Status */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {connectingNodeId && (
            <div className="bg-[#FFF2E1] border border-[#A79277] text-[#A79277] px-4 py-2 rounded-full text-sm font-bold shadow-md animate-pulse flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Click another node to connect!
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={handleUndo} 
            disabled={edgeHistory.length <= 1}
            className="bg-white/80 backdrop-blur-md border-[#A79277]/30 text-[#8C7A61] hover:bg-[#FFF2E1] shadow-sm rounded-xl"
          >
            <Undo2 className="h-4 w-4 mr-2" /> Undo Connection
          </Button>
        </div>

        {/* Floating Actions Panel (Connect / Quick Suggestions) */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
          {selectedCount === 2 && (
            <Button onClick={handleConnectSelected} className="bg-[#5C4A3A] hover:bg-[#3D3126] text-white rounded-full px-6 py-5 shadow-xl animate-in slide-in-from-bottom-4 fade-in font-bold">
              <LinkIcon className="h-5 w-5 mr-2" />
              Connect Selected Nodes
            </Button>
          )}

          {selectedCount === 1 && !connectingNodeId && (
            <div className="bg-white/95 backdrop-blur-md border border-[#A79277]/30 p-2 rounded-2xl shadow-[0_8px_30px_rgba(167,146,119,0.2)] flex gap-2 animate-in slide-in-from-bottom-4 fade-in">
              <span className="text-xs font-bold text-[#8C7A61] self-center px-3 uppercase tracking-wider">Quick Connect:</span>
              <Button size="sm" variant="ghost" onClick={() => handleQuickAdd("condition")} className="hover:bg-[#FFF2E1] text-[#5C4A3A] rounded-xl text-xs font-bold">
                <Split className="h-3.5 w-3.5 mr-1.5 text-[#A79277]" /> Condition
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleQuickAdd("loop")} className="hover:bg-[#FFF2E1] text-[#5C4A3A] rounded-xl text-xs font-bold">
                <Repeat className="h-3.5 w-3.5 mr-1.5 text-[#A79277]" /> Loop
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleQuickAdd("return")} className="hover:bg-[#FFF2E1] text-[#5C4A3A] rounded-xl text-xs font-bold">
                <ArrowRight className="h-3.5 w-3.5 mr-1.5 text-[#A79277]" /> Return
              </Button>
            </div>
          )}
        </div>

        {/* Floating Convert Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
          <Button 
            onClick={handleConvert} 
            size="lg" 
            className="w-full py-7 text-lg rounded-2xl bg-[#A79277] hover:bg-[#8C7A61] text-white shadow-[0_8px_30px_rgba(167,146,119,0.3)] hover:shadow-[0_12px_40px_rgba(167,146,119,0.4)] hover:-translate-y-1 transition-all duration-300 font-bold border border-[#A79277]/50"
          >
            <Code2 className="mr-3 h-6 w-6" />
            Convert Logic to Code Skeleton
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN EXPORT (Wrapped in Provider) ────────────────────────── */
interface LogicForgeCanvasProps {
  onClose: () => void;
  onConvert: (code: string) => void;
}

export function LogicForgeCanvas({ onClose, onConvert }: LogicForgeCanvasProps) {
  return (
    <div className="absolute inset-0 z-50 bg-[#FFF2E1]/95 backdrop-blur-md flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#A79277]/20 bg-white/60 shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A79277] to-[#8C7A61] flex items-center justify-center shadow-md">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">LogicForge Canvas</h2>
            <p className="text-xs text-[#8C7A61] font-medium mt-0.5">Visually architect your solution before writing code.</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="rounded-xl border-[#A79277]/20 text-[#8C7A61] hover:bg-[#A79277]/10 font-bold transition-colors"
        >
          <X className="h-5 w-5 mr-2" /> Close Canvas
        </Button>
      </div>

      <ReactFlowProvider>
        <LogicForgeInner onClose={onClose} onConvert={onConvert} />
      </ReactFlowProvider>
    </div>
  );
}
