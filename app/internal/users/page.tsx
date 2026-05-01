import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { canManageUsers, isInternalUser } from "@/data/roles";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createUserAction,
  updateUserRoleAction,
  toggleUserActiveAction,
} from "./actions";
import DeleteUserButton from "./DeleteUserButton";
import UserSearch from "./UserSearch";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "vendedor", label: "Vendedor" },
  { value: "minorista", label: "Minorista" },
  { value: "mayorista", label: "Mayorista" },
  { value: "instalador", label: "Instalador" },
  { value: "distribuidor", label: "Distribuidor" },
];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const isAdmin = canManageUsers(profile.role);
  const { q } = await searchParams;
  const query = q?.toLowerCase().trim() ?? "";

  const { data: users } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role, is_active, created_at")
    .order("created_at", { ascending: false });

  const allUsers = users ?? [];

  const filteredUsers = query
    ? allUsers.filter(
        (u) =>
          u.email?.toLowerCase().includes(query) ||
          u.full_name?.toLowerCase().includes(query) ||
          u.role?.toLowerCase().includes(query)
      )
    : allUsers;

  const internalUsers = filteredUsers.filter((u) =>
    ["admin", "vendedor"].includes(u.role)
  );
  const customerUsers = filteredUsers.filter((u) =>
    !["admin", "vendedor"].includes(u.role)
  );

  return (
    <main className="space-y-10 px-1 py-8 text-white">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Administracion</p>
          <h1 className="mt-3 text-3xl font-light">Usuarios</h1>
          <p className="mt-2 text-sm text-neutral-500">Gestion de accesos, roles y estado de usuarios.</p>
        </div>
        <Suspense>
          <UserSearch />
        </Suspense>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total usuarios", value: allUsers.length },
          { label: "Internos", value: allUsers.filter((u) => ["admin", "vendedor"].includes(u.role)).length },
          { label: "Clientes", value: allUsers.filter((u) => !["admin", "vendedor"].includes(u.role)).length },
          { label: "Activos", value: allUsers.filter((u) => u.is_active).length },
        ].map((m) => (
          <div key={m.label} className="border border-white/[0.07] bg-white/[0.02] px-5 py-4">
            <p className="text-xs text-neutral-500">{m.label}</p>
            <p className="mt-1 text-2xl font-light">{m.value}</p>
          </div>
        ))}
      </div>

      {isAdmin && (
        <section className="border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="mb-5 text-sm uppercase tracking-[0.2em] text-neutral-500">Crear usuario</h2>
          <form action={createUserAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Nombre</label>
              <input name="fullName" className="input w-full" placeholder="Juan Garcia" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Email *</label>
              <input name="email" type="email" required className="input w-full" placeholder="usuario@email.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Contrasena *</label>
              <input name="password" type="password" required className="input w-full" placeholder="Minimo 8 caracteres" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Rol *</label>
              <select name="role" required className="input w-full">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button type="submit" className="w-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
                Crear usuario
              </button>
            </div>
          </form>
        </section>
      )}

      {query && filteredUsers.length === 0 && (
        <div className="border border-white/[0.07] bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-neutral-500">
            No se encontraron usuarios que coincidan con <span className="text-white">&quot;{q}&quot;</span>.
          </p>
        </div>
      )}

      {internalUsers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-500">Equipo interno ({internalUsers.length})</h2>
          <div className="space-y-2">
            {internalUsers.map((u) => (
              <UserRow key={u.id} user={u} isAdmin={isAdmin} currentUserId={profile.id} />
            ))}
          </div>
        </section>
      )}

      {customerUsers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-500">Clientes ({customerUsers.length})</h2>
          <div className="space-y-2">
            {customerUsers.map((u) => (
              <UserRow key={u.id} user={u} isAdmin={isAdmin} currentUserId={profile.id} />
            ))}
          </div>
        </section>
      )}

      {!query && filteredUsers.length === 0 && (
        <div className="border border-white/[0.07] p-6 text-sm text-neutral-600">
          No hay usuarios registrados.
        </div>
      )}
    </main>
  );
}

function UserRow({ user, isAdmin, currentUserId }: { user: any; isAdmin: boolean; currentUserId: string }) {
  const isSelf = user.id === currentUserId;
  const ROLE_BADGE: Record<string, string> = {
    admin: "badge badge-red",
    vendedor: "badge badge-blue",
    minorista: "badge badge-neutral",
    mayorista: "badge badge-gold",
    instalador: "badge badge-green",
    distribuidor: "badge badge-green",
  };

  return (
    <div className="flex flex-col gap-3 border border-white/[0.07] bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/[0.08] text-xs text-neutral-500">
          {(user.full_name || user.email || "?")[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm text-white">
            {user.full_name || <span className="text-neutral-500">Sin nombre</span>}
            {isSelf && <span className="ml-2 text-xs text-neutral-600">(vos)</span>}
          </p>
          <p className="text-xs text-neutral-600">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={user.is_active ? "badge badge-green" : "badge badge-neutral"}>
          {user.is_active ? "Activo" : "Inactivo"}
        </span>
        <span className={ROLE_BADGE[user.role] ?? "badge badge-neutral"}>{user.role}</span>

        {isAdmin && !isSelf && (
          <>
            <form action={updateUserRoleAction.bind(null, user.id)} className="flex gap-1">
              <select
                name="role"
                defaultValue={user.role}
                className="border border-white/[0.08] bg-transparent px-2 py-1 text-xs text-neutral-300 focus:border-[#d6b36a] focus:outline-none"
              >
                {[
                  { value: "admin", label: "Admin" },
                  { value: "vendedor", label: "Vendedor" },
                  { value: "minorista", label: "Minorista" },
                  { value: "mayorista", label: "Mayorista" },
                  { value: "instalador", label: "Instalador" },
                  { value: "distribuidor", label: "Distribuidor" },
                ].map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#0a0a0a]">{r.label}</option>
                ))}
              </select>
              <button type="submit" className="border border-white/[0.08] px-3 py-1 text-xs text-neutral-400 transition hover:border-white/20 hover:text-white">
                Cambiar
              </button>
            </form>

            <form action={toggleUserActiveAction.bind(null, user.id, user.is_active)}>
              <button
                type="submit"
                className={`border px-3 py-1 text-xs transition ${
                  user.is_active
                    ? "border-red-800/40 text-red-400 hover:border-red-600/60"
                    : "border-green-800/40 text-green-400 hover:border-green-600/60"
                }`}
              >
                {user.is_active ? "Desactivar" : "Activar"}
              </button>
            </form>

            <DeleteUserButton userId={user.id} email={user.email} />
          </>
        )}
      </div>
    </div>
  );
}
