import React, { useState } from 'react';
import { 
  BarChart, Bar, 
  AreaChart, Area, 
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export type ChartType = 'bar' | 'area' | 'pie' | 'line';

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface FinancialChartProps {
  data: ChartData[];
  type: ChartType;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  dataKey?: string;
  showLegend?: boolean;
  noWrapper?: boolean;
  pieOuterRadius?: number;
  pieInnerRadius?: number;
  pieCenterLabel?: string;
}

const FinancialChart: React.FC<FinancialChartProps> = ({
  data,
  type,
  title,
  xAxisLabel,
  yAxisLabel,
  height = 300,
  dataKey = 'value',
  showLegend = true,
  noWrapper = false,
  pieOuterRadius = 80,
  pieInnerRadius = 0,
  pieCenterLabel,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Colors based on theme
  const colors = {
    text: isDark ? '#a0a0a0' : '#64748b',
    grid: isDark ? '#2e2e2e' : '#e2e8f0',
    tooltip: {
      background: isDark ? '#1e1e1e' : '#ffffff',
      text: isDark ? '#f5f5f5' : '#333333',
      border: isDark ? '#2e2e2e' : '#e2e8f0',
    }
  };
  
  // Default chart colors
  const defaultColors = [
    '#0ea5e9', '#64748b', '#0369a1', '#38bdf8', '#075985',
    '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#f43f5e',
  ];
  
  // Pre-defined color mapping
  const colorMapping: Record<string, string> = {
    'primary': isDark ? '#38bdf8' : '#0ea5e9', // Blue
    'emerald': isDark ? '#34d399' : '#10b981', // Green
    'rose': isDark ? '#fb7185' : '#f43f5e',    // Red
    'amber': isDark ? '#fbbf24' : '#f59e0b',   // Amber
    'purple': isDark ? '#a78bfa' : '#8b5cf6',  // Purple
    'pink': isDark ? '#f472b6' : '#ec4899',    // Pink
  };
  
  // Handle bar/segment hover
  const handleMouseEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };
  
  const handleMouseLeave = () => {
    setActiveIndex(null);
  };
  
  // Format currency value
  const formatCurrency = (value: number) => {
    if (value >= 10000000) { // ≥ 1 crore
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) { // ≥ 1 lakh
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toLocaleString('en-IN')}`;
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 shadow-lg rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center text-sm mt-1">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              <span style={{ color: isDark ? 'white' : 'black' }}>
                {formatCurrency(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Get color for data item
  const getItemColor = (entry: ChartData, index: number) => {
    if (entry.color && colorMapping[entry.color]) {
      return colorMapping[entry.color];
    }
    
    return entry.color || defaultColors[index % defaultColors.length];
  };
  
  // Generate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={data}
              margin={isSmallScreen ? { top: 8, right: 2, left: -18, bottom: 12 } : { top: 10, right: 10, left: 10, bottom: 5 }}
              barGap={8}
              barSize={36}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: colors.text, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, fill: colors.text } : undefined}
              />
              <YAxis 
                tick={{ fill: colors.text, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
                tickFormatter={(value) => formatCurrency(value)}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: colors.text } : undefined}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              {showLegend && <Legend wrapperStyle={{ color: colors.text }} />}
              <ReferenceLine y={0} stroke={colors.grid} />
              <Bar 
                dataKey={dataKey} 
                animationDuration={1500}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getItemColor(entry, index)}
                    fillOpacity={activeIndex === index ? 1 : 0.8}
                    stroke={activeIndex === index ? (isDark ? '#fff' : '#000') : 'none'}
                    strokeWidth={activeIndex === index ? 1 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart 
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: colors.text, fontSize: 12 }} 
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, fill: colors.text } : undefined}
              />
              <YAxis 
                tick={{ fill: colors.text, fontSize: 12 }} 
                tickFormatter={(value) => formatCurrency(value)}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: colors.text } : undefined}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ color: colors.text }} />}
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                fill={defaultColors[0]} 
                stroke={defaultColors[0]} 
                fillOpacity={0.6} 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        const resolvedPieRadius = isSmallScreen ? Math.min(pieOuterRadius, 72) : pieOuterRadius;
        const resolvedInnerRadius = isSmallScreen ? Math.min(pieInnerRadius, 42) : pieInnerRadius;
        const pieTotal = data.reduce((sum, item) => sum + item.value, 0);
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={resolvedInnerRadius}
                outerRadius={resolvedPieRadius}
                fill="#8884d8"
                dataKey={dataKey}
                labelLine={false}
                label={false}
                animationDuration={1500}
                paddingAngle={pieInnerRadius > 0 && data.length > 1 ? 2 : 0}
                cornerRadius={pieInnerRadius > 0 ? 6 : 0}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ filter: pieInnerRadius > 0 ? 'drop-shadow(0 10px 12px rgba(2, 6, 23, 0.18))' : undefined }}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getItemColor(entry, index)}
                    fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.66}
                    stroke={isDark ? '#0f172a' : '#fff'}
                    strokeWidth={pieInnerRadius > 0 ? 3 : 1}
                    style={{ transition: 'fill-opacity 180ms ease' }}
                  />
                ))}
              </Pie>
              {pieCenterLabel && pieInnerRadius > 0 && (
                <>
                  <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill={colors.text} fontSize={isSmallScreen ? 10 : 12} fontWeight={600}>
                    {pieCenterLabel}
                  </text>
                  <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill={isDark ? '#f8fafc' : '#0f172a'} fontSize={isSmallScreen ? 14 : 18} fontWeight={800}>
                    {formatCurrency(pieTotal)}
                  </text>
                </>
              )}
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend 
                layout={isSmallScreen ? 'horizontal' : 'vertical'}
                verticalAlign={isSmallScreen ? 'bottom' : 'middle'}
                align={isSmallScreen ? 'center' : 'right'}
                wrapperStyle={{ 
                  color: colors.text, 
                  fontSize: 12,
                  paddingLeft: isSmallScreen ? 0 : 16,
                  paddingTop: isSmallScreen ? 8 : 0,
                }} 
              />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        // Adjust margins for better mobile display
        const chartMargins = isSmallScreen 
          ? { top: 5, right: 5, left: 0, bottom: 20 } 
          : { top: 10, right: 20, left: 10, bottom: 15 };
        
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart 
              data={data}
              margin={chartMargins}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={!isSmallScreen} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: colors.text, fontSize: isSmallScreen ? 10 : 12 }}
                tickMargin={isSmallScreen ? 5 : 0}
                angle={isSmallScreen ? -45 : 0}
                height={isSmallScreen ? 60 : 30}
                label={!isSmallScreen && xAxisLabel ? { 
                  value: xAxisLabel, 
                  position: 'insideBottom', 
                  offset: -5, 
                  fill: colors.text 
                } : undefined}
              />
              <YAxis 
                tick={{ fill: colors.text, fontSize: isSmallScreen ? 10 : 12 }}
                width={isSmallScreen ? 60 : 40}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `₹${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
                  } else if (value >= 1000) {
                    return `₹${(value / 1000).toFixed(0)}K`;
                  }
                  return `₹${value}`;
                }}
                label={!isSmallScreen && yAxisLabel ? { 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: colors.text, 
                  offset: 0 
                } : undefined}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                wrapperStyle={{ zIndex: 1000 }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              {showLegend && <Legend wrapperStyle={{ color: colors.text }} />}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={defaultColors[0]} 
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 1 }} 
                animationDuration={1500}
                dot={{ fill: defaultColors[0], strokeWidth: 1, r: isSmallScreen ? 2 : 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  // Render with or without wrapper
  const chartContent = (
    <>
      {title && (
        <h3 className={`mb-2 font-medium text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h3>
      )}
      {renderChart()}
    </>
  );
  
  if (noWrapper) {
    return chartContent;
  }
  
  return (
    <motion.div 
      className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'} min-w-0 overflow-hidden rounded-[1.25rem] border p-3 shadow-md sm:rounded-xl sm:p-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {chartContent}
    </motion.div>
  );
};

export default FinancialChart; 
