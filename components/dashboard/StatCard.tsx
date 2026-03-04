type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
      {helper ? (
        <p className="mt-1 text-xs text-gray-500">{helper}</p>
      ) : null}
    </article>
  );
}

