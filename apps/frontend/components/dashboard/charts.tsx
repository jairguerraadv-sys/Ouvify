"use client";

import { useMemo, type CSSProperties } from "react";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
}

// Gráfico de barras simples (sem dependência externa)
export function BarChart({
  data,
  title,
  height = 200,
  showValues = true,
  horizontal = false,
}: BarChartProps) {
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.value), 1),
    [data],
  );

  const defaultColors = [
    "bg-primary-500",
    "bg-secondary-500",
    "bg-success-500",
    "bg-warning-500",
    "bg-error-500",
    "bg-info-500",
    "bg-secondary-500",
    "bg-primary-500",
  ];

  if (horizontal) {
    return (
      <div className="w-full">
        {title && (
          <h4 className="text-sm font-medium text-text-secondary mb-4">
            {title}
          </h4>
        )}
        <div className="space-y-3">
          {data.map((item, index) => {
            const barStyle = {
              width: `${(item.value / maxValue) * 100}%`,
            } as CSSProperties;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-20 truncate">
                  {item.label}
                </span>
                <div className="flex-1 h-6 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color || defaultColors[index % defaultColors.length]} rounded-full transition-all duration-500 ease-out`}
                    style={barStyle}
                  />
                </div>
                {showValues && (
                  <span className="text-sm font-medium text-text-secondary w-12 text-right">
                    {item.value}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const containerStyle = { height } as CSSProperties;

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-sm font-medium text-text-secondary mb-4">
          {title}
        </h4>
      )}
      <div
        className="flex items-end justify-between gap-2"
        style={containerStyle}
      >
        {data.map((item, index) => {
          const columnStyle = {
            height: `${(item.value / maxValue) * 100}%`,
            minHeight: item.value > 0 ? "4px" : "0",
          } as CSSProperties;

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center gap-2"
            >
              {showValues && (
                <span className="text-xs font-medium text-text-secondary">
                  {item.value}
                </span>
              )}
              <div
                className={`w-full ${item.color || defaultColors[index % defaultColors.length]} rounded-t transition-all duration-500 ease-out`}
                style={columnStyle}
              />
              <span className="text-xs text-text-tertiary truncate max-w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: ChartData[];
  title?: string;
  size?: number;
  showLegend?: boolean;
}

// Gráfico de rosca (donut) em SVG puro
export function DonutChart({
  data,
  title,
  size = 160,
  showLegend = true,
}: DonutChartProps) {
  const total = useMemo(
    () => data.reduce((acc, d) => acc + d.value, 0),
    [data],
  );

  const segments = useMemo(() => {
    const defaultColors = [
      "hsl(var(--primary))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "hsl(var(--error))",
      "hsl(var(--secondary))",
      "hsl(var(--accent))",
    ];

    const { segments: calculatedSegments } = data.reduce(
      (acc, item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const angle = (percentage / 100) * 360;
        const startAngle = acc.currentAngle;
        const endAngle = startAngle + angle;

        acc.segments.push({
          ...item,
          percentage,
          startAngle,
          endAngle,
          color: item.color || defaultColors[index % defaultColors.length],
        });

        acc.currentAngle = endAngle;
        return acc;
      },
      {
        currentAngle: -90,
        segments: [] as Array<
          (typeof data)[0] & {
            percentage: number;
            startAngle: number;
            endAngle: number;
            color: string;
          }
        >,
      },
    );

    return calculatedSegments;
  }, [data, total]);

  const getArcPath = (
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number,
  ) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = Math.cos(startRad) * outerRadius;
    const y1 = Math.sin(startRad) * outerRadius;
    const x2 = Math.cos(endRad) * outerRadius;
    const y2 = Math.sin(endRad) * outerRadius;
    const x3 = Math.cos(endRad) * innerRadius;
    const y3 = Math.sin(endRad) * innerRadius;
    const x4 = Math.cos(startRad) * innerRadius;
    const y4 = Math.sin(startRad) * innerRadius;

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const outerRadius = size / 2 - 5;
  const innerRadius = outerRadius * 0.6;

  return (
    <div className="flex flex-col items-center gap-4">
      {title && (
        <h4 className="text-sm font-medium text-text-secondary">{title}</h4>
      )}

      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        >
          {segments.map((segment, index) => (
            <path
              key={`${segment.label}-${index}`}
              d={getArcPath(
                segment.startAngle,
                segment.endAngle,
                innerRadius,
                outerRadius,
              )}
              fill={segment.color}
              className="transition-all duration-500 ease-out hover:opacity-80"
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-2xl font-bold text-text-primary">
              {total}
            </span>
            <span className="block text-xs text-text-tertiary">Total</span>
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3">
          {segments.map((segment, index) => {
            const legendDotStyle = {
              backgroundColor: segment.color,
            } as CSSProperties;
            return (
              <div
                key={`${segment.label}-legend-${index}`}
                className="flex items-center gap-1.5"
              >
                <div className="w-3 h-3 rounded-full" style={legendDotStyle} />
                <span className="text-xs text-text-secondary">
                  {segment.label} ({segment.value})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  title?: string;
  height?: number;
  color?: string;
}

// Gráfico de linha simples em SVG
export function LineChart({
  data,
  title,
  height = 150,
  color = "hsl(var(--primary))",
}: LineChartProps) {
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.value), 1),
    [data],
  );
  const minValue = useMemo(
    () => Math.min(...data.map((d) => d.value), 0),
    [data],
  );
  const range = maxValue - minValue || 1;

  const width = 300;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = useMemo(() => {
    return data.map((item, index) => ({
      x: padding.left + (index / (data.length - 1 || 1)) * chartWidth,
      y:
        padding.top +
        chartHeight -
        ((item.value - minValue) / range) * chartHeight,
      ...item,
    }));
  }, [data, chartWidth, chartHeight, padding, minValue, range]);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-sm font-medium text-text-secondary mb-4">
          {title}
        </h4>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <path d={areaPath} fill={color} fillOpacity={0.1} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill="hsl(var(--background))"
              stroke={color}
              strokeWidth={2}
            />
            <text
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px] fill-text-tertiary"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  description?: string;
}

// Card de estatística simples
export function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  description,
}: StatCardProps) {
  const trendColor = {
    up: "text-success",
    down: "text-error",
    neutral: "text-text-tertiary",
  };

  const trendIcon = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <div className="bg-background rounded-xl p-5 shadow-sm border border-border-light hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-tertiary font-medium">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {change && (
            <p
              className={`text-xs mt-1 ${trend ? trendColor[trend] : "text-text-tertiary"}`}
            >
              {trend && trendIcon[trend]} {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-text-tertiary mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-background-secondary rounded-lg">{icon}</div>
        )}
      </div>
    </div>
  );
}
