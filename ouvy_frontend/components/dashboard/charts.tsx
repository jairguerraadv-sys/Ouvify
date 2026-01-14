'use client';

import { useMemo } from 'react';

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

/**
 * Gráfico de barras simples (sem dependência de biblioteca externa)
 */
export function BarChart({ 
  data, 
  title, 
  height = 200, 
  showValues = true,
  horizontal = false 
}: BarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  
  const defaultColors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-success',
    'bg-warning',
    'bg-error',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  if (horizontal) {
    return (
      <div className="w-full">
        {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20 truncate">{item.label}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color || defaultColors[index % defaultColors.length]} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              {showValues && (
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, index) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            {showValues && (
              <span className="text-xs font-medium text-gray-600">{item.value}</span>
            )}
            <div
              className={`w-full ${item.color || defaultColors[index % defaultColors.length]} rounded-t transition-all duration-500 ease-out`}
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: item.value > 0 ? '4px' : '0'
              }}
            />
            <span className="text-xs text-gray-500 truncate max-w-full">{item.label}</span>
          </div>
        ))}
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

/**
 * Gráfico de rosca (donut) em SVG puro
 */
export function DonutChart({ 
  data, 
  title, 
  size = 160, 
  showLegend = true 
}: DonutChartProps) {
  const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data]);
  
  const defaultColors = [
    '#6366f1', // primary
    '#22c55e', // success
    '#f59e0b', // warning
    '#ef4444', // error
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  // Calcular segmentos do gráfico
  const segments = useMemo(() => {
    let currentAngle = -90; // Começar no topo
    return data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      return {
        ...item,
        percentage,
        startAngle,
        endAngle: currentAngle,
        color: item.color || defaultColors[index % defaultColors.length]
      };
    });
  }, [data, total, defaultColors]);

  // Função para calcular coordenadas do arco
  const getArcPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
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
      {title && <h4 className="text-sm font-medium text-gray-700">{title}</h4>}
      
      <div className="relative">
        <svg width={size} height={size} viewBox={`${-size/2} ${-size/2} ${size} ${size}`}>
          {segments.map((segment, index) => (
            <path
              key={index}
              d={getArcPath(segment.startAngle, segment.endAngle, innerRadius, outerRadius)}
              fill={segment.color}
              className="transition-all duration-500 ease-out hover:opacity-80"
            />
          ))}
        </svg>
        
        {/* Centro com total */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-800">{total}</span>
            <span className="block text-xs text-gray-500">Total</span>
          </div>
        </div>
      </div>
      
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-xs text-gray-600">
                {segment.label} ({segment.value})
              </span>
            </div>
          ))}
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

/**
 * Gráfico de linha simples em SVG
 */
export function LineChart({ 
  data, 
  title, 
  height = 150,
  color = '#6366f1' 
}: LineChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const minValue = useMemo(() => Math.min(...data.map(d => d.value), 0), [data]);
  const range = maxValue - minValue || 1;

  const width = 300;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calcular pontos
  const points = useMemo(() => {
    return data.map((item, index) => ({
      x: padding.left + (index / (data.length - 1 || 1)) * chartWidth,
      y: padding.top + chartHeight - ((item.value - minValue) / range) * chartHeight,
      ...item
    }));
  }, [data, chartWidth, chartHeight, padding, minValue, range]);

  // Criar path da linha
  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  // Criar path da área preenchida
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Área preenchida */}
        <path
          d={areaPath}
          fill={color}
          fillOpacity={0.1}
        />
        
        {/* Linha */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Pontos */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill="white"
              stroke={color}
              strokeWidth={2}
            />
            {/* Labels */}
            <text
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px] fill-gray-500"
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
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
}

/**
 * Card de estatística com animação
 */
export function StatCard({ title, value, change, trend, icon, description }: StatCardProps) {
  const trendColor = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-gray-500'
  };

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${trend ? trendColor[trend] : 'text-gray-500'}`}>
              {trend && trendIcon[trend]} {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-400 mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-gray-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
