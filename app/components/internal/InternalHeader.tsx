import Link from "next/link";

type InternalHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

export function InternalHeader({
  title,
  description,
  backHref = "/internal/dashboard",
  backLabel = "← Volver al dashboard",
  actions,
}: InternalHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-4xl font-light text-white">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-neutral-400">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Link href={backHref} className="border border-white/10 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/30 hover:text-white">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
