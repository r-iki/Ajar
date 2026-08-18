"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Info, AlertTriangle, MoreVertical, Check } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotificationsClient({ session, locale }: { session: any, locale: string }) {
  const t = useTranslations("student");
  // Mock notifications for now
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: `${t("welcome")}, ${session?.user?.name || 'User'}!`,
      type: "welcome",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Kursus 'Next.js Masterclass' telah diperbarui.",
      type: "update",
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
           <Bell size={16} />
           <span className="text-xs font-black uppercase tracking-widest">{t("notifications")}</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">{t("notifications")}</h1>
        <p className="text-muted-foreground font-medium">{t("notifications")}</p>
      </header>

      {/* Unread Summary */}
      <div className="bg-card border border-border rounded-[2rem] p-6 flex items-center justify-between backdrop-blur-sm shadow-sm">
         <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border transition-all ${
               unreadCount > 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-muted text-muted-foreground border-border"
            }`}>
               <Bell size={24} />
            </div>
            <div className="flex flex-col">
               <span className="text-lg font-black text-foreground">
                  {unreadCount > 0 ? t("unreadNotifications", { count: unreadCount }) : t("noUnreadNotifications")}
               </span>
               <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("stayUpdated")}</span>
            </div>
         </div>
         {unreadCount > 0 && (
            <button 
               onClick={markAllAsRead}
               className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md shadow-primary/20"
            >
               <Check size={14} />
               {t("markAllRead")}
            </button>
         )}
      </div>

      {/* Notifications List */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 backdrop-blur-sm shadow-sm">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <h2 className="text-sm font-black text-foreground uppercase tracking-widest">{t("allNotifications")}</h2>
               <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                  {t("totalNotifications", { count: notifications.length })}
               </span>
            </div>
         </div>

         <div className="space-y-4">
            {notifications.map((n) => (
               <div key={n.id} className="relative group cursor-pointer" onClick={() => markAsRead(n.id)}>
                  <div className={`p-6 rounded-[2rem] border transition-all flex items-start gap-5 ${
                     n.isRead 
                     ? "bg-muted/20 border-border/50 opacity-60" 
                     : "bg-red-500/5 border-red-500/20 ring-1 ring-red-500/10 shadow-sm"
                  }`}>
                     <div className={`p-3 rounded-2xl transition-colors ${
                        n.isRead ? "bg-muted text-muted-foreground" : "bg-red-500/10 text-red-500"
                     }`}>
                        <Bell size={20} />
                     </div>
                     <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                           <p className={`text-sm font-bold ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                              {n.title}
                           </p>
                           {!n.isRead && (
                              <span className="px-2 py-0.5 bg-red-500 text-[8px] font-black text-white rounded-full uppercase tracking-widest animate-pulse">
                                 {t("newBadge")}
                              </span>
                           )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                           {new Date(n.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical size={16} />
                     </button>
                  </div>
                  {!n.isRead && (
                     <div className="absolute top-6 right-6 w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                  )}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
