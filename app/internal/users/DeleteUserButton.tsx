"use client";

import { deleteUserAction } from "./actions";

export default function DeleteUserButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  async function handleDelete() {
    if (!confirm(`¿Eliminar a ${email}? Esta acción no se puede deshacer.`)) return;
    await deleteUserAction(userId);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="border border-red-800/30 px-3 py-1 text-xs text-red-500 transition hover:border-red-600/50 hover:text-red-300"
    >
      Eliminar
    </button>
  );
}
