export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <div className="text-sm font-medium text-slate-900">{title}</div>
      {description && <div className="mt-1 text-sm text-slate-600">{description}</div>}
    </div>
  );
}
