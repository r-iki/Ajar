import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllUsers } from "@/actions/admin-users";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { Users, ShieldCheck } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return notFound();

  const allUsers = await getAllUsers();

  return (
    <div className="space-y-8 pb-20">
      <header className="space-y-1">
        <div className="flex items-center gap-3 text-rose-500">
          <ShieldCheck className="size-5" />
          <span className="text-xs font-black uppercase tracking-widest">Admin Panel</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight">
          Manajemen Pengguna
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Kelola role pengguna — ubah antara Student, Instructor, atau Admin.
        </p>
      </header>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Student", color: "bg-slate-500/10 text-slate-500 border-slate-500/20", desc: "Pengguna biasa" },
          { label: "Instructor", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", desc: "Bisa membuat kursus" },
          { label: "Admin", color: "bg-rose-500/10 text-rose-500 border-rose-500/20", desc: "Akses penuh sistem" },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 shadow-xs">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${r.color}`}>
              {r.label}
            </span>
            <span className="text-xs text-muted-foreground font-medium">{r.desc}</span>
          </div>
        ))}
      </div>

      <AdminUsersTable users={allUsers as any} currentUserId={session.user.id} />
    </div>
  );
}
