export type TrendPoint = { label: string; value: number };

/**
 * A lightweight inline-SVG line/area chart for daily views. No chart library
 * dependency. Scales automatically to the data's max value.
 */
export function TrendChart({ points }: { points: TrendPoint[] }) {
    const width = 640;
    const height = 240;
    const padX = 40;
    const padY = 20;
    const max = Math.max(100, ...points.map((p) => p.value));
    const rounded = Math.ceil(max / 200) * 200;

    const stepX =
        points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;
    const yFor = (v: number) => height - padY - (v / rounded) * (height - padY * 2);
    const xFor = (i: number) => padX + i * stepX;

    const line = points.map((p, i) => `${xFor(i)},${yFor(p.value)}`).join(' ');
    const area = `${padX},${height - padY} ${line} ${xFor(points.length - 1)},${height - padY}`;

    const gridCount = 5;
    const gridValues = Array.from(
        { length: gridCount + 1 },
        (_, i) => (rounded / gridCount) * i,
    );

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full">
            <defs>
                <linearGradient id="libTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#005bbf" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#005bbf" stopOpacity="0" />
                </linearGradient>
            </defs>

            {gridValues.map((g) => (
                <g key={g}>
                    <line
                        x1={padX}
                        x2={width - padX}
                        y1={yFor(g)}
                        y2={yFor(g)}
                        className="stroke-neutral-200 dark:stroke-neutral-700"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                    />
                    <text
                        x={padX - 8}
                        y={yFor(g) + 4}
                        textAnchor="end"
                        className="fill-neutral-400 text-[10px]"
                    >
                        {g.toLocaleString('id-ID')}
                    </text>
                </g>
            ))}

            {points.length > 1 && <polygon points={area} fill="url(#libTrendFill)" />}
            <polyline
                points={line}
                fill="none"
                stroke="#005bbf"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {points.map((p, i) => (
                <g key={p.label + i}>
                    <circle cx={xFor(i)} cy={yFor(p.value)} r={4} fill="#005bbf" />
                    <text
                        x={xFor(i)}
                        y={height - 2}
                        textAnchor="middle"
                        className="fill-neutral-500 text-[11px]"
                    >
                        {p.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}
