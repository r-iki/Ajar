"use client";

import { Link as LinkIcon, ExternalLink, MapPin, Globe, Briefcase, UserCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProfileSidebarProps {
  user: {
    name: string;
    image?: string | null;
    bio?: string | null;
    location?: string | null;
    languages?: string | null;
    availabilityStatus?: string | null;
    socialGithub?: string | null;
    socialLinkedin?: string | null;
    socialTwitter?: string | null;
    socialFacebook?: string | null;
  };
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  const t = useTranslations("profile");

  const isAvailable = !user.availabilityStatus?.toLowerCase().includes("not");

  return (
    <div className="flex flex-col gap-6 w-full md:w-80">
      {/* Top Card: Profile Info */}
      <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-sm">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              fill
              unoptimized
              className="rounded-full object-cover border-2 border-border p-1"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center border-2 border-border">
              <UserCircle className="w-20 h-20 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black text-foreground mb-2">{user.name}</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          {user.bio || t("noBio")}
        </p>

        {/* Social Links */}
        <div className="flex gap-3">
          {user.socialFacebook && (
            <a href={user.socialFacebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-muted-foreground" title="Facebook">
              <ExternalLink size={18} />
            </a>
          )}
          {user.socialTwitter && (
            <a href={user.socialTwitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-muted-foreground" title="Twitter">
              <ExternalLink size={18} />
            </a>
          )}
          {user.socialLinkedin && (
            <a href={user.socialLinkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-muted-foreground" title="LinkedIn">
              <LinkIcon size={18} />
            </a>
          )}
          {user.socialGithub && (
            <a href={user.socialGithub} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-muted-foreground" title="GitHub">
              <LinkIcon size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Bottom Card: Status/Location/Language */}
      <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
        {/* Status */}
        <div className="flex gap-4">
          <div className="p-3 bg-muted rounded-2xl h-fit">
            <Briefcase size={18} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-foreground">{t("status")}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t("availability")}</span>
            <div className={cn(
              "mt-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border w-fit",
              isAvailable 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-muted border-border text-muted-foreground"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", isAvailable ? "bg-emerald-500" : "bg-neutral-400")}></span>
              {user.availabilityStatus || (isAvailable ? t("openForWork") : t("notAvailable"))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex gap-4 border-t border-border/60 pt-5">
          <div className="p-3 bg-muted rounded-2xl h-fit">
            <MapPin size={18} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-foreground">{t("location")}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t("basedIn")}</span>
            <span className="text-sm text-foreground font-medium mt-0.5">{user.location || t("notSet")}</span>
          </div>
        </div>

        {/* Language */}
        <div className="flex gap-4 border-t border-border/60 pt-5">
          <div className="p-3 bg-muted rounded-2xl h-fit">
            <Globe size={18} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-foreground">{t("languages")}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t("spokenLanguages")}</span>
            <span className="text-sm text-foreground font-medium mt-0.5">{user.languages || t("notSet")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
