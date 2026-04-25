import { InternalHeader } from "@/app/components/internal/InternalHeader";
import { updateUserRoleAction } from "./actions";
import { getCurrentProfile } from "@/data/auth";
import { canManageUsers } from "@/data/roles";
import { getProfiles } from "@/data/userService";
import { redirect } from "next/navigation";
import { isInternalUser } from "@/data/roles";

const profile = await getCurrentProfile();

if (!profile || !isInternalUser(profile.role)) {
  redirect("/login");
}
export const dynamic = "force-dynamic";

const roles = [
  "admin",
  "vendedor",
  "minorista",
  "mayorista",
  "instalador",
  "distribuidor",
];

export default async function InternalUsersPage() {
  const profile = await getCurrentProfile();

  if (!profile || !canManageUsers(profile.role)) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-light">Acceso restringido</h1>

          <p className="mt-4 text-neutral-400">
            Esta sección está disponible solo para usuarios internos.
          </p>
        </div>
      </main>
    );
  }

  const profiles = await getProfiles();

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl space-y-10">
        <InternalHeader
          title="Gestión de usuarios"
          description="Administración de perfiles y roles del sistema."
        />

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-5 border-b border-white/10 px-6 py-4 text-sm text-neutral-400">
              <div>Email</div>
              <div>Nombre</div>
              <div>Activo</div>
              <div>Rol</div>
              <div>Acción</div>
            </div>

            {profiles.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-5 items-center border-b border-white/10 px-6 py-4 text-sm last:border-b-0"
              >
                <div className="text-white">
                  {user.email || "Sin email"}
                </div>

                <div className="text-neutral-300">
                  {user.full_name || "Sin nombre"}
                </div>

                <div className="text-neutral-300">
                  {user.is_active ? "Sí" : "No"}
                </div>

                <form action={updateUserRoleAction} className="contents">
                  <input type="hidden" name="id" value={user.id} />

                  <div>
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white outline-none"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-4 py-2 text-xs text-neutral-300 hover:border-white/30"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            ))}

            {profiles.length === 0 && (
              <div className="px-6 py-10 text-sm text-neutral-500">
                No hay usuarios cargados.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}