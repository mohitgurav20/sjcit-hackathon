"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, isToday, isYesterday, isAfter, subDays } from "date-fns";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  message_text: string;
  is_user: boolean;
  created_at: string;
}

interface ChatSession {
  id: string; // We'll use the timestamp of the first message as ID
  title: string;
  firstMessageDate: Date;
  lastMessageDate: Date;
  previewText: string;
}

interface GroupedSessions {
  today: ChatSession[];
  yesterday: ChatSession[];
  previous7Days: ChatSession[];
  older: ChatSession[];
}

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

// Simple heuristic keyword extractor for titles
function generateSmartTitle(messages: ChatMessage[]): string {
  const allText = messages.map(m => m.message_text).join(" ").toLowerCase();
  
  const topics = [
    { key: "binary search", title: "Binary Search Practice" },
    { key: "two pointer", title: "Two-Pointer Technique" },
    { key: "recursion", title: "Recursion Discussion" },
    { key: "base case", title: "Recursion Base Case" },
    { key: "react", title: "React Architecture" },
    { key: "mongodb", title: "MongoDB Queries" },
    { key: "sql", title: "SQL Optimization" },
    { key: "dynamic programming", title: "Dynamic Programming" },
    { key: "graph", title: "Graph Algorithms" },
    { key: "sorting", title: "Sorting Algorithms" },
    { key: "loop", title: "Loop Logic" },
  ];

  for (const topic of topics) {
    if (allText.includes(topic.key)) {
      return topic.title;
    }
  }

  // Fallback to the first user message if no keywords found
  const firstUserMsg = messages.find(m => m.is_user);
  if (firstUserMsg && firstUserMsg.message_text.length > 5) {
    const text = firstUserMsg.message_text;
    return text.substring(0, 30) + (text.length > 30 ? "..." : "");
  }

  return "PairMentor Session";
}

export function PreviousChats() {
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({
    today: [],
    yesterday: [],
    previous7Days: [],
    older: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      try {
        const { data, error } = await supabase
          .from("chat_history")
          .select("*")
          .eq("user_id", DEMO_USER_ID)
          .order("created_at", { ascending: true })
          .limit(300);

        if (error) throw error;
        
        const messages: ChatMessage[] = data || [];
        
        // Group into sessions based on 60 min inactivity gap
        const sessions: ChatSession[] = [];
        let currentSessionMessages: ChatMessage[] = [];
        
        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          
          if (currentSessionMessages.length === 0) {
            currentSessionMessages.push(msg);
            continue;
          }
          
          const lastMsg = currentSessionMessages[currentSessionMessages.length - 1];
          const timeDiffMinutes = (new Date(msg.created_at).getTime() - new Date(lastMsg.created_at).getTime()) / (1000 * 60);
          
          if (timeDiffMinutes > 60) {
            // Close out current session
            if (currentSessionMessages.length > 0) {
              sessions.push(createSessionObject(currentSessionMessages));
            }
            currentSessionMessages = [msg];
          } else {
            currentSessionMessages.push(msg);
          }
        }
        
        if (currentSessionMessages.length > 0) {
          sessions.push(createSessionObject(currentSessionMessages));
        }

        // Sort sessions newest first
        sessions.sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());
        
        // Only keep the last 15 to avoid cluttering sidebar
        const recentSessions = sessions.slice(0, 15);

        // Group by date
        const grouped: GroupedSessions = { today: [], yesterday: [], previous7Days: [], older: [] };
        const sevenDaysAgo = subDays(new Date(), 7);

        recentSessions.forEach(session => {
          if (isToday(session.lastMessageDate)) {
            grouped.today.push(session);
          } else if (isYesterday(session.lastMessageDate)) {
            grouped.yesterday.push(session);
          } else if (isAfter(session.lastMessageDate, sevenDaysAgo)) {
            grouped.previous7Days.push(session);
          } else {
            grouped.older.push(session);
          }
        });

        setGroupedSessions(grouped);
      } catch (err) {
        console.error("Failed to load previous chats:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadChats();
  }, []);

  function createSessionObject(messages: ChatMessage[]): ChatSession {
    const title = generateSmartTitle(messages);
    const lastMsg = messages[messages.length - 1];
    let previewText = lastMsg.message_text.substring(0, 40);
    if (lastMsg.message_text.length > 40) previewText += "...";
    
    return {
      id: new Date(messages[0].created_at).getTime().toString(), // Use start time as unique session ID
      title,
      firstMessageDate: new Date(messages[0].created_at),
      lastMessageDate: new Date(lastMsg.created_at),
      previewText
    };
  }

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-8 w-full bg-zinc-100 rounded animate-pulse"></div>
          <div className="h-8 w-full bg-zinc-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const renderGroup = (label: string, sessions: ChatSession[]) => {
    if (sessions.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-3">{label}</h4>
        <div className="space-y-0.5">
          {sessions.map(session => (
            <Link 
              key={session.id}
              href={`/pairmentor?sessionStart=${session.id}`}
              className="group flex flex-col px-3 py-2 text-sm text-zinc-700 rounded-md hover:bg-[#FFF2E1] hover:text-[#8C7A61] transition-all"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 opacity-50 flex-shrink-0 group-hover:text-[#8C7A61]" />
                <span className="truncate font-medium">{session.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      {renderGroup("Today", groupedSessions.today)}
      {renderGroup("Yesterday", groupedSessions.yesterday)}
      {renderGroup("Previous 7 Days", groupedSessions.previous7Days)}
      {renderGroup("Older", groupedSessions.older)}
      
      {groupedSessions.today.length === 0 && 
       groupedSessions.yesterday.length === 0 && 
       groupedSessions.previous7Days.length === 0 && 
       groupedSessions.older.length === 0 && (
        <div className="px-3 py-4 text-xs text-zinc-400 italic">
          No previous sessions found.
        </div>
      )}
    </div>
  );
}
