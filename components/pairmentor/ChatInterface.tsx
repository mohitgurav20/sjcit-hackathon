"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Sparkles, BrainCircuit, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  technique?: "Socratic" | "Feynman" | "Deliberate Practice" | "Teach-Back";
}

interface ChatInterfaceProps {
  onTriggerCodeFocus: () => void;
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "ai",
    text: "I'm your AI Mentor. Let's tackle searching algorithms today. I'm listening... speak to me.",
    technique: "Socratic",
  }
];

export function ChatInterface({ onTriggerCodeFocus }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatExpanded]);

  const handleSubmit = (e?: React.FormEvent, simulatedText?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = simulatedText || input;
    if (!textToSubmit.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: textToSubmit };
    setMessages((prev) => [...prev, userMsg]);
    if (!simulatedText) setInput("");
    setIsChatExpanded(true); // Auto-expand chat if they type

    // Simulate AI thinking and then speaking
    setIsAiSpeaking(true);
    setTimeout(() => {
      let aiResponse: Message;
      const lowerInput = textToSubmit.toLowerCase();

      if (lowerInput.includes("binary") || lowerInput.includes("half")) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Exactly! That's binary search. Think of it like looking for a word in a dictionary: you open it to the middle, see if your word comes before or after, and then tear the book in half and throw away the wrong half. Explain that to me like I'm 12.",
          technique: "Feynman",
        };
      } else if (lowerInput.includes("dictionary") || lowerInput.includes("12")) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Perfect explanation! Now, let's put that into practice. Please **write the code** to implement this binary search approach in the editor. Initialize your left and right pointers first. Let me know if you need hints.",
          technique: "Deliberate Practice",
        };
        onTriggerCodeFocus();
      } else if (lowerInput.includes("done") || lowerInput.includes("finish")) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Great job! Now, I want you to **explain your code** line by line to me as if I were a junior developer. Why did you choose a while loop instead of recursion?",
          technique: "Teach-Back",
        };
        onTriggerCodeFocus();
      } else if (lowerInput.includes("help")) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "I'm here to help. To get us started, could you **write a function** skeleton for binary search? Just the parameters and return type.",
          technique: "Socratic",
        };
        onTriggerCodeFocus();
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Interesting approach. But what if the array is massive? Searching one by one (linear search) would be slow. How could we use the fact that the array is already sorted to our advantage? Remember, as engineers we always optimize for scale.",
          technique: "Socratic",
        };
      }
      setMessages((prev) => [...prev, aiResponse]);
      setIsAiSpeaking(false);
    }, 2000);
  };

  // Simulate picking up voice
  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive && !isAiSpeaking) {
      // Just a small visual effect when starting to listen
    }
  };

  return (
    <div className="flex h-full flex-col bg-background/50">
      
      {/* MASSIVE CENTRAL VOICE HUB */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background ambient glow based on state */}
        <div className={`absolute inset-0 bg-gradient-to-b from-primary/5 to-background transition-opacity duration-1000 ${isVoiceActive ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className="z-10 flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-8 border-4 border-primary/20 shadow-xl bg-card">
            <AvatarFallback className="bg-primary/5 text-primary">
              <BrainCircuit className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Mentor AI</h2>
          <p className="text-muted-foreground font-medium mb-12 flex items-center gap-2">
            Senior Engineer Mode
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          </p>

          {isVoiceActive ? (
            <div className="flex flex-col items-center">
              {/* Massive Listening/Speaking Animation */}
              <div className="relative flex items-center justify-center w-48 h-48 mb-8">
                <div className={`absolute inset-0 rounded-full border-2 border-primary/30 ${isAiSpeaking ? 'animate-ping duration-1000' : 'animate-pulse'}`}></div>
                <div className={`absolute inset-4 rounded-full border-2 border-primary/40 ${isAiSpeaking ? 'animate-ping duration-700' : 'animate-pulse delay-75'}`}></div>
                <div className={`absolute inset-8 rounded-full border-2 border-primary/50 ${isAiSpeaking ? 'animate-ping duration-500' : 'animate-pulse delay-150'}`}></div>
                <div className="absolute inset-12 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Mic className={`h-10 w-10 text-primary ${isAiSpeaking ? 'animate-bounce' : ''}`} />
                </div>
              </div>
              <p className="text-xl font-medium text-primary mb-8 animate-pulse">
                {isAiSpeaking ? "Mentor is speaking..." : "Listening... speak to me"}
              </p>
              
              <Button 
                variant="destructive" 
                size="lg" 
                onClick={toggleVoice}
                className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-red-500/20"
              >
                <MicOff className="mr-2 h-5 w-5" />
                End Voice Session
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Button 
                onClick={toggleVoice}
                className="rounded-full px-10 py-8 text-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
              >
                <Mic className="mr-3 h-6 w-6" />
                Start Voice Session
              </Button>
              <p className="text-muted-foreground mt-6 text-sm">Experience hands-free pair programming.</p>
            </div>
          )}
        </div>
      </div>

      {/* SECONDARY TEXT CHAT (Collapsible) */}
      <div className={`border-t bg-card flex flex-col transition-all duration-500 ease-in-out ${isChatExpanded ? 'h-1/2' : 'h-[72px]'}`}>
        
        {/* Toggle Bar */}
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsChatExpanded(!isChatExpanded)}
        >
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <MessageSquare className="h-4 w-4" />
            <span>Text Chat & History</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            {isChatExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {/* Chat History & Input */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-300 ${isChatExpanded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex-1 overflow-auto p-4 space-y-6 bg-gradient-to-b from-card to-muted/10">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8 mt-1 shrink-0 shadow-sm">
                  {msg.sender === "ai" ? (
                    <AvatarFallback className="bg-primary/10 text-primary border border-primary/20"><BrainCircuit className="h-4 w-4" /></AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-secondary text-secondary-foreground">U</AvatarFallback>
                  )}
                </Avatar>
                <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  {msg.technique && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mb-1 flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" />
                      {msg.technique}
                    </span>
                  )}
                  <div 
                    className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-white dark:bg-zinc-900 border border-border/50 text-foreground rounded-tl-sm"
                    }`}
                  >
                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                </div>
              </div>
            ))}
            {isAiSpeaking && (
              <div className="flex gap-3 max-w-[85%]">
                <Avatar className="h-8 w-8 mt-1 shrink-0 shadow-sm">
                   <AvatarFallback className="bg-primary/10 text-primary border border-primary/20"><BrainCircuit className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="p-3.5 rounded-2xl shadow-sm text-sm bg-white dark:bg-zinc-900 border border-border/50 text-muted-foreground italic flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                  <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce delay-75"></div>
                  <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <Input 
                placeholder={isVoiceActive ? "You can still type while Voice is active..." : "Type your message..."} 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 shadow-sm transition-all focus-visible:ring-primary" 
              />
              <Button type="submit" disabled={!input.trim()} size="icon" className="shrink-0 rounded-full h-10 w-10 bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4 text-primary-foreground" />
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
