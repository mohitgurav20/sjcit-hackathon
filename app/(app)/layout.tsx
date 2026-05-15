import { Sidebar } from "@/components/sidebar";
import { BackgroundMesh } from "@/components/BackgroundMesh";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[#FDF9F1] selection:bg-[#A79277] selection:text-white relative">
      <BackgroundMesh />
      <Sidebar />
      <main className="flex-1 ml-64 p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
