"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Users, ShieldCheck, GraduationCap, Loader2, ChevronDown } from "lucide-react";
import { setUserRole } from "@/actions/admin-users";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
};

const ROLES = [
  { value: "student", label: "Student", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  { value: "instructor", label: "Instructor", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "admin", label: "Admin", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
];

function RoleDropdown({ user, disabled }: { user: User; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(user.role);
  const [isPending, startTransition] = useTransition();

  const currentRoleMeta = ROLES.find(r => r.value === currentRole) || ROLES[0];

  const handleRoleChange = (newRole: string) => {
    if (newRole === currentRole) { setOpen(false); return; }
    setOpen(false);
    startTransition(async () => {
      try {
        await setUserRole(user.id, newRole as any);
        setCurrentRole(newRole);
        toast.success(`Role ${user.name} diubah ke ${newRole}`);
      } catch (err: any) {
        toast.error(err.message || "Gagal mengubah role");
      }
    });
  };

  if (disabled) {
    return (
      <span className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border", currentRoleMeta.color)}>
        {currentRoleMeta.label} (You)
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all hover:opacity-80 active:scale-95",
          currentRoleMeta.color
        )}
      >
        {isPending ? <Loader2 className="size-3 animate-spin" /> : null}
        {currentRoleMeta.label}
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {ROLES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => handleRoleChange(r.value)}
              className={cn(
                "w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all hover:bg-muted flex items-center gap-2",
                r.value === currentRole && "bg-muted"
              )}
            >
              {r.value === "admin" && <ShieldCheck className="size-3 text-rose-500" />}
              {r.value === "instructor" && <GraduationCap className="size-3 text-blue-500" />}
              {r.value === "student" && <Users className="size-3 text-slate-500" />}
              {r.label}
              {r.value === currentRole && <span className="ml-auto text-[8px] text-muted-foreground">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminUsersTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-2xl border bg-card px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
        />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="rounded-2xl border bg-card px-4 py-2.5 text-xs font-bold outline-hidden"
        >
          <option value="">Semua Role</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
        <span className="self-center text-xs text-muted-foreground font-bold whitespace-nowrap">
          {filtered.length} pengguna
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pengguna</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bergabung</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {user.image ? (
                          <Image src={user.image} alt={user.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-black text-muted-foreground">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-black text-foreground">{user.name}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                  </td>
                  <td className="p-5">
                    <p className="text-xs text-muted-foreground font-medium">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="p-5 text-right">
                    <RoleDropdown user={user} disabled={user.id === currentUserId} />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-16 text-center">
                    <div className="mx-auto size-14 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Users className="size-7 text-muted-foreground/30" />
                    </div>
                    <p className="font-black text-foreground">Tidak ada pengguna ditemukan</p>
                    <p className="text-xs text-muted-foreground mt-1">Coba ubah filter pencarian</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
