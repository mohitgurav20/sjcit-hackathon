"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  
  return (
    <Button onClick={() => router.refresh()} className="bg-[#A79277] hover:bg-[#8B7A65] text-white">
      <RefreshCw className="mr-2 h-4 w-4" />
      Refresh Data
    </Button>
  );
}
