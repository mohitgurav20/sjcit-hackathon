"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Settings, Save, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function ProfileClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    semester: "",
    target_role: "",
    learning_style: "",
  });

  const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", DEMO_USER_ID)
          .single();

        if (data) {
          setProfile({
            name: data.name || "",
            semester: data.semester?.toString() || "",
            target_role: data.target_role || "",
            learning_style: data.learning_style || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          semester: parseInt(profile.semester) || null,
          target_role: profile.target_role,
          learning_style: profile.learning_style,
        })
        .eq("user_id", DEMO_USER_ID);

      if (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      } else {
        // Optional: show a success toast here
      }
    } catch (err) {
      console.error("Exception updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "JD";
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A79277]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 flex items-center gap-4 drop-shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-white/60 backdrop-blur-md flex items-center justify-center shadow-sm border border-[#A79277]/20">
            <Settings className="h-6 w-6 text-[#A79277]" />
          </div>
          Profile Settings
        </h1>
        <p className="text-[#6B5A47] mt-3 font-medium text-lg ml-16">Manage your account settings and preferences.</p>
      </div>

      <Card className="bg-white/60 backdrop-blur-xl border border-[#A79277]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
        <CardHeader className="pb-6 border-b border-[#A79277]/10 bg-gradient-to-r from-[#FFF2E1]/80 to-white/80 px-8 py-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-zinc-900">
            <User className="h-6 w-6 text-[#A79277]" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-[#6B5A47] font-medium text-base mt-1">
            Update your personal details here.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-8 bg-white/50 p-6 rounded-2xl border border-[#A79277]/10 shadow-sm">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-[#A79277]/20">
              <AvatarImage src="" />
              <AvatarFallback className="text-3xl font-black bg-gradient-to-br from-[#FFF2E1] to-[#fde1c3] text-[#A79277]">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <h3 className="font-bold text-zinc-900 text-lg">Profile Picture</h3>
              <p className="text-sm font-medium text-zinc-500">A picture helps people recognize you and lets you know when you're signed in.</p>
              <Button variant="outline" className="mt-2 border-[#A79277]/30 text-[#8C7A61] hover:bg-[#FFF2E1] hover:text-[#A79277] hover:border-[#A79277] rounded-xl font-bold tracking-wide">
                <Upload className="mr-2 h-4 w-4" />
                Change Avatar
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid gap-3">
              <label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-[#A79277]">Full Name</label>
              <Input 
                id="name" 
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="h-12 bg-white/70 border-[#A79277]/20 focus-visible:ring-[#A79277]/50 rounded-xl font-medium text-zinc-900 shadow-sm"
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="semester" className="text-sm font-bold uppercase tracking-widest text-[#A79277]">Semester</label>
              <Input 
                id="semester" 
                type="number"
                value={profile.semester}
                onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                className="h-12 bg-white/70 border-[#A79277]/20 focus-visible:ring-[#A79277]/50 rounded-xl font-medium text-zinc-900 shadow-sm"
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="target_role" className="text-sm font-bold uppercase tracking-widest text-[#A79277]">Target Role</label>
              <Input 
                id="target_role" 
                value={profile.target_role}
                onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
                className="h-12 bg-white/70 border-[#A79277]/20 focus-visible:ring-[#A79277]/50 rounded-xl font-medium text-zinc-900 shadow-sm"
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="learning_style" className="text-sm font-bold uppercase tracking-widest text-[#A79277]">Learning Style</label>
              <Input 
                id="learning_style" 
                value={profile.learning_style}
                onChange={(e) => setProfile({ ...profile, learning_style: e.target.value })}
                className="h-12 bg-white/70 border-[#A79277]/20 focus-visible:ring-[#A79277]/50 rounded-xl font-medium text-zinc-900 shadow-sm"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-[#A79277]/10 flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-8 bg-gradient-to-r from-[#8C7A61] to-[#A79277] hover:opacity-90 text-white rounded-xl shadow-[0_8px_20px_rgba(167,146,119,0.3)] font-black tracking-widest uppercase border-none hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
