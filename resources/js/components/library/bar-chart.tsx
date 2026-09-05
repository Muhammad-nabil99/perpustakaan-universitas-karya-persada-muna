export type BarDatum = { label: string; value: number };

/**
 * Horizontal bar chart for the "Collection by Faculty / Department / Type /
 * Category" breakdowns. Pure CSS bars — no chart dependency.
 */
export function BarChart({ data }: { data: BarDatum[] }) {
    if (data.length === 0) {
        return <p className="py-6 text-center text-sm text-neutral-400">Belum ada data.</p>;
    }

    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="space-y-3">
            {data.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                    <span
                        className="w-32 shrink-0 truncate text-sm text-neutral-600 dark:text-neutral-300"
                        title={row.label}
                    >
                        {row.label}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                            className="h-2 rounded-full bg-sl-primary"
                            style={{ width: `${(row.value / max) * 100}%` }}
                        />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-medium text-neutral-500">
                        {row.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
