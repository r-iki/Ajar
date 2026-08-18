"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter, Link } from "@/i18n/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  ExternalLink,
  ChevronDown,
  Share2,
  Briefcase,
  Code,
  Shield,
  LogOut,
  Key,
  Monitor,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";

export default function SettingsClient({ session }: { session: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const activeTab = searchParams.get("tab") || "profile";

  // Form States
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
    phone: "",
    location: "",
    position: "",
    skills: "",
    languages: "",
    availabilityStatus: "No",
    bio: "",
    username: "",
    socialGithub: "",
    socialLinkedin: ""
  });

  // Initialize data on mount
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        phone: (session.user as any).phone || "",
        location: (session.user as any).location || "",
        position: (session.user as any).position || "",
        skills: (session.user as any).skills || "",
        languages: (session.user as any).languages || "",
        availabilityStatus: (session.user as any).availabilityStatus || "No",
        bio: (session.user as any).bio || "",
        username: (session.user as any).username || "",
        socialGithub: (session.user as any).socialGithub || "",
        socialLinkedin: (session.user as any).socialLinkedin || "",
      });
    }
  }, [session]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await authClient.updateUser({
        name: formData.name,
        image: formData.image,
        phone: formData.phone,
        location: formData.location,
        position: formData.position,
        skills: formData.skills,
        languages: formData.languages,
        availabilityStatus: formData.availabilityStatus,
        bio: formData.bio,
        username: formData.username,
        socialGithub: formData.socialGithub,
        socialLinkedin: formData.socialLinkedin,
      } as any);
      toast.success(tCommon("success"));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profilePicHint"));
      return;
    }

    setUploadingImage(true);
    try {
      const res = await fetch("/api/r2/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || tCommon("error"));
      }

      const { url, publicUrl } = await res.json();

      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(tCommon("error"));
      }

      setFormData(prev => ({ ...prev, image: publicUrl }));
      toast.success(tCommon("success"));
    } catch (error: any) {
      toast.error(error.message || tCommon("error"));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Calculate completeness
  const fieldsToCheck = ['name', 'phone', 'location', 'position', 'skills', 'languages', 'bio'];
  const fieldsFilled = fieldsToCheck.filter(field => formData[field as keyof typeof formData]).length + (formData.image ? 1 : 0);
  const fieldsTotal = fieldsToCheck.length + 1;
  const completeness = Math.round((fieldsFilled / fieldsTotal) * 100);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
      {/* Profile Completeness Card */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm backdrop-blur-sm relative overflow-hidden group">
         <div className="relative size-24 md:size-32">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
               <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
               <circle cx="18" cy="18" r="16" fill="none" className={completeness === 100 ? "stroke-emerald-500" : "stroke-primary"} strokeWidth="3" strokeDasharray={`${completeness}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className={cn("text-xl font-black", completeness === 100 ? "text-emerald-500" : "text-primary")}>{completeness}%</span>
            </div>
         </div>

         <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-2xl font-black text-foreground">{t("profileCompleteness")}</h2>
            <div className="space-y-2">
               <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <span>Progress</span>
                  <span className={completeness === 100 ? "text-emerald-500" : "text-primary"}>{completeness}%</span>
               </div>
               <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", completeness === 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${completeness}%` }} />
               </div>
               <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">
                  <span>{fieldsFilled}/{fieldsTotal} fields</span>
                  <span>{fieldsTotal - fieldsFilled} remaining</span>
               </div>
            </div>
         </div>

         <Link href={`/profile/${formData.username || session.user.id}`} target="_blank" className="px-6 py-3 border border-border bg-background rounded-2xl text-[10px] font-black text-foreground uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-3 shadow-xs">
            {t("viewProfile")} <ExternalLink size={14} />
         </Link>
      </div>

      <form onSubmit={handleUpdateProfile}>
        {/* Detail Profile Form */}
        {activeTab === "profile" && (
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-8 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <User size={18} />
                </div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-widest">{t("detailProfile")}</h2>
            </div>

            <div className="flex flex-col items-center gap-6">
                <div className="size-48 rounded-full border-4 border-border overflow-hidden bg-muted flex items-center justify-center group relative shadow-xl">
                  {formData.image ? (
                    <img src={formData.image} alt={formData.name} className="size-full object-cover" />
                  ) : (
                    <User className="size-20 text-muted-foreground/40" />
                  )}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity",
                      uploadingImage ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                      </div>
                    ) : (
                      <Camera className="text-white size-8" />
                    )}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("profilePic")}</p>
                  <p className="text-[10px] text-muted-foreground font-medium text-center">{t("profilePicHint")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("fullName")}</label>
                  <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                      />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("username")}</label>
                  <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                      <input 
                        type="text" 
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full bg-background border border-border rounded-2xl pl-10 pr-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                      />
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <span>{t("publicProfileUrl")}</span>
                    <Link href={`/profile/${formData.username || session.user.id}`} target="_blank" className="text-primary hover:underline font-bold">
                      /{locale}/profile/{formData.username || 'username'}
                    </Link>
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("emailAddress")}</label>
                  <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        type="email" 
                        value={formData.email}
                        className="w-full bg-muted/50 border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground outline-hidden transition-all opacity-60 cursor-not-allowed"
                        readOnly
                      />
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground">{t("emailFixedHint")}</p>
                </div>
            </div>
          </div>
        )}

        {/* Personal Data Form */}
        {activeTab === "personal" && (
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-8 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <User size={18} />
                </div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-widest">{t("personalData")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("phoneNumber")}</label>
                  <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        type="tel" 
                        placeholder="+62 812..."
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                      />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("locationCity")}</label>
                  <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Jakarta, Indonesia"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                      />
                  </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("biographyLabel")}</label>
                <textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl p-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-2xs"
                  placeholder="Tell us a little bit about yourself..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("skillsLabel")}</label>
                  <div className="relative">
                      <Code className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="React, TypeScript, Node.js"
                        value={formData.skills}
                        onChange={(e) => handleInputChange("skills", e.target.value)}
                        className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                      />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("languagesLabel")}</label>
                  <div className="relative">
                      <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Indonesian, English"
                        value={formData.languages}
                        onChange={(e) => handleInputChange("languages", e.target.value)}
                        className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                      />
                  </div>
                </div>
            </div>

            {/* Position Checkboxes */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("positionTitle")}</label>
                <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="e.g. Frontend Developer"
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("availabilityLabel")}</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <select 
                    value={formData.availabilityStatus}
                    onChange={(e) => handleInputChange("availabilityStatus", e.target.value)}
                    className="w-full bg-background border border-border rounded-2xl pl-11 pr-10 py-4 text-xs font-bold text-foreground appearance-none outline-hidden focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-2xs"
                  >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>
          </div>
        )}

        {/* Social Media Form */}
        {activeTab === "social" && (
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-8 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Share2 size={18} />
                </div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-widest">{t("socialMedia")}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">GitHub Profile URL</label>
                  <input 
                    type="url" 
                    placeholder="https://github.com/username"
                    value={formData.socialGithub}
                    onChange={(e) => handleInputChange("socialGithub", e.target.value)}
                    className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LinkedIn Profile URL</label>
                  <input 
                    type="url" 
                    placeholder="https://linkedin.com/in/username"
                    value={formData.socialLinkedin}
                    onChange={(e) => handleInputChange("socialLinkedin", e.target.value)}
                    className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                  />
                </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-8 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Shield size={18} />
                </div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-widest">{t("security")}</h2>
            </div>

            {/* Change Password Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Key size={14} /> {t("changePassword")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("currentPassword")}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("newPassword")}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                  />
                </div>
              </div>
              <button
                type="button"
                className="px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                {t("savePassword")}
              </button>
            </div>

            <div className="h-px bg-border" />

            {/* Active Sessions */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Monitor size={14} /> Active Sessions
              </h3>
              <div className="p-5 rounded-2xl border border-border bg-muted/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                    <Monitor size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground">Current Session</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active right now</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest rounded-full">Active</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Danger Zone */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} /> Danger Zone
              </h3>
              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-foreground">Sign Out All Devices</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Terminate all active sessions except current</span>
                </div>
                <button
                  type="button"
                  onClick={() => authClient.signOut()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {["profile", "personal", "social"].includes(activeTab) && (
          <div className="mt-8 flex">
            <button 
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full md:w-auto px-10 py-4 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
                {loading ? tCommon("saving") : t("updateData")}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
