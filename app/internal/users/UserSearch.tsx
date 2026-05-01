"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import { Search, X } from "lucide-react";

export default function UserSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleClear() {
    setValue("");
    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Buscar por nombre, email o rol..."
        className={`input w-full pl-8 pr-8 transition-opacity ${isPending ? "opacity-60" : ""}`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 transition hover:text-white"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
