import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { CityForecast, ForecastDay } from '../types';
import { CITIES_7DAY_FORECAST } from '../data/mockWeatherForecast';
import { CloudSun, Sun, CloudRain, CloudLightning, Wind, Droplets, Thermometer, Compass } from 'lucide-react';

interface WeatherTrendChartProps {
  initialCityId?: string;
  selectedCityId?: string;
  onCityChange?: (cityId: string) => void;
}

export const WeatherTrendChart: React.FC<WeatherTrendChartProps> = ({
  initialCityId = 'nyc',
  selectedCityId: propSelectedCityId,
  onCityChange,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>(propSelectedCityId || initialCityId);
  const [unitMode, setUnitMode] = useState<'auto' | 'F' | 'C'>('auto');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (propSelectedCityId && propSelectedCityId !== selectedCityId) {
      setSelectedCityId(propSelectedCityId);
      setHoveredDayIndex(null);
    }
  }, [propSelectedCityId]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 480,
    height: 165,
  });

  const activeCity = useMemo(() => {
    return CITIES_7DAY_FORECAST.find((c) => c.id === selectedCityId) || CITIES_7DAY_FORECAST[0];
  }, [selectedCityId]);

  // Handle unit conversions
  const activeUnit = useMemo(() => {
    if (unitMode === 'F') return '°F';
    if (unitMode === 'C') return '°C';
    return activeCity.unit;
  }, [unitMode, activeCity.unit]);

  const convertTemp = (temp: number, nativeUnit: '°F' | '°C', targetUnit: '°F' | '°C') => {
    if (nativeUnit === targetUnit) return Math.round(temp);
    if (nativeUnit === '°F' && targetUnit === '°C') {
      return Math.round(((temp - 32) * 5) / 9);
    }
    return Math.round((temp * 9) / 5 + 32);
  };

  const chartData = useMemo(() => {
    return activeCity.forecast.map((day) => ({
      ...day,
      displayHigh: convertTemp(day.high, activeCity.unit, activeUnit),
      displayLow: convertTemp(day.low, activeCity.unit, activeUnit),
    }));
  }, [activeCity, activeUnit]);

  // Responsive width measuring
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: 165,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate D3 scales, paths, and positions
  const margin = { top: 24, right: 24, bottom: 34, left: 24 };
  const innerWidth = Math.max(dimensions.width - margin.left - margin.right, 100);
  const innerHeight = Math.max(dimensions.height - margin.top - margin.bottom, 60);

  const {
    highPoints,
    lowPoints,
    highPath,
    lowPath,
    areaPath,
    xScale,
    yScale,
    allTempsMin,
    allTempsMax,
  } = useMemo(() => {
    const days = chartData.map((d) => d.day);
    const xScale = d3.scalePoint<string>()
      .domain(days)
      .range([0, innerWidth])
      .padding(0.15);

    const minLow: number = d3.min(chartData, (d: { displayLow: number }) => d.displayLow) ?? 40;
    const maxHigh: number = d3.max(chartData, (d: { displayHigh: number }) => d.displayHigh) ?? 90;
    const tempPadding = Math.max(Math.round((maxHigh - minLow) * 0.25), 3);

    const yScale = d3.scaleLinear()
      .domain([minLow - tempPadding, maxHigh + tempPadding])
      .range([innerHeight, 0]);

    // High Line
    const highLineGenerator = d3.line<(typeof chartData)[0]>()
      .x((d) => xScale(d.day) ?? 0)
      .y((d) => yScale(d.displayHigh))
      .curve(d3.curveMonotoneX);

    // Low Line
    const lowLineGenerator = d3.line<(typeof chartData)[0]>()
      .x((d) => xScale(d.day) ?? 0)
      .y((d) => yScale(d.displayLow))
      .curve(d3.curveMonotoneX);

    // Area between High and Low
    const areaGenerator = d3.area<(typeof chartData)[0]>()
      .x((d) => xScale(d.day) ?? 0)
      .y0((d) => yScale(d.displayLow))
      .y1((d) => yScale(d.displayHigh))
      .curve(d3.curveMonotoneX);

    const highPoints = chartData.map((d) => ({
      x: xScale(d.day) ?? 0,
      y: yScale(d.displayHigh),
      val: d.displayHigh,
      day: d.day,
      date: d.date,
      data: d,
    }));

    const lowPoints = chartData.map((d) => ({
      x: xScale(d.day) ?? 0,
      y: yScale(d.displayLow),
      val: d.displayLow,
      day: d.day,
      date: d.date,
      data: d,
    }));

    return {
      highPoints,
      lowPoints,
      highPath: highLineGenerator(chartData) || '',
      lowPath: lowLineGenerator(chartData) || '',
      areaPath: areaGenerator(chartData) || '',
      xScale,
      yScale,
      allTempsMin: minLow,
      allTempsMax: maxHigh,
    };
  }, [chartData, innerWidth, innerHeight]);

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    setHoveredDayIndex(null);
    onCityChange?.(cityId);
  };

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('thunder') || c.includes('storm')) {
      return <CloudLightning className="w-3 h-3 text-amber-600" />;
    }
    if (c.includes('rain') || c.includes('shower')) {
      return <CloudRain className="w-3 h-3 text-sky-600" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <CloudSun className="w-3 h-3 text-stone-500" />;
    }
    if (c.includes('breez') || c.includes('wind')) {
      return <Wind className="w-3 h-3 text-teal-600" />;
    }
    return <Sun className="w-3 h-3 text-amber-500" />;
  };

  const hoveredDay = hoveredDayIndex !== null ? chartData[hoveredDayIndex] : null;

  return (
    <div className="bg-stone-50/90 border border-stone-200 p-2.5 sm:p-3 rounded-xs flex flex-col justify-between">
      {/* Widget Header: Title + City Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-1.5">
          <CloudSun className="w-3.5 h-3.5 text-[#FD8B18]" />
          <span className="font-cinzel font-bold text-[11px] text-[#00204A] uppercase tracking-wider">
            7-Day Temperature Trend
          </span>
          <span className="text-[10px] text-stone-500 font-dateline hidden sm:inline">
            (D3 Forecast Model)
          </span>
        </div>

        {/* City and Unit Controls */}
        <div className="flex items-center gap-1 text-[10px] font-dateline">
          {/* City Selection Pills */}
          <div className="flex bg-stone-200/80 p-0.5 rounded border border-stone-300">
            {CITIES_7DAY_FORECAST.map((c) => {
              const isSelected = c.id === selectedCityId;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCitySelect(c.id)}
                  className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                    isSelected
                      ? 'bg-[#00204A] text-white shadow-2xs'
                      : 'text-stone-700 hover:text-[#00204A] hover:bg-stone-100'
                  }`}
                  title={`${c.city}, ${c.country}`}
                >
                  {c.id === 'nyc' ? 'NYC' : c.id === 'dhk' ? 'Dhaka' : c.id === 'wdc' ? 'D.C.' : 'London'}
                </button>
              );
            })}
          </div>

          {/* Unit Toggle */}
          <button
            onClick={() => setUnitMode((m) => (m === 'auto' ? (activeUnit === '°F' ? 'C' : 'F') : m === 'F' ? 'C' : 'F'))}
            className="px-1.5 py-0.5 bg-white hover:bg-stone-100 border border-stone-300 rounded font-bold text-stone-700 text-[10px] transition-colors"
            title="Switch Temperature Unit"
          >
            {activeUnit}
          </button>
        </div>
      </div>

      {/* City Snapshot Sub-header */}
      <div className="flex items-center justify-between text-[11px] font-dateline pt-1.5 pb-1 text-stone-600">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#00204A]">
            {activeCity.city}, {activeCity.country}
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-[10px] text-stone-700">
            Now: <strong>{convertTemp(activeCity.currentTemp, activeCity.unit, activeUnit)}{activeUnit}</strong> ({activeCity.currentCondition})
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1 text-[#E5000C]">
            <span className="w-2 h-0.5 bg-[#E5000C] inline-block rounded-full" />
            High
          </span>
          <span className="flex items-center gap-1 text-[#00204A]">
            <span className="w-2 h-0.5 bg-[#00204A] inline-block rounded-full" />
            Low
          </span>
        </div>
      </div>

      {/* SVG D3 Chart Container */}
      <div 
        ref={containerRef} 
        className="relative w-full h-[165px] select-none touch-none"
        onMouseLeave={() => setHoveredDayIndex(null)}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible"
        >
          <defs>
            {/* Shaded Area Gradient between curves */}
            <linearGradient id="weatherBandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FD8B18" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#00204A" stopOpacity="0.05" />
            </linearGradient>

            {/* High line subtle glow */}
            <linearGradient id="highLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E5000C" />
              <stop offset="50%" stopColor="#FD8B18" />
              <stop offset="100%" stopColor="#E5000C" />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Horizontal Reference Gridlines */}
            {[0.2, 0.5, 0.8].map((factor, i) => {
              const yPos = innerHeight * factor;
              return (
                <line
                  key={i}
                  x1={0}
                  x2={innerWidth}
                  y1={yPos}
                  y2={yPos}
                  stroke="#e7e5e4"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
              );
            })}

            {/* Vertical Guide Pillars for each day */}
            {chartData.map((d, i) => {
              const xPos = xScale(d.day) ?? 0;
              const isHovered = hoveredDayIndex === i;
              return (
                <g key={d.day}>
                  <line
                    x1={xPos}
                    x2={xPos}
                    y1={0}
                    y2={innerHeight}
                    stroke={isHovered ? '#00204A' : '#f5f5f4'}
                    strokeWidth={isHovered ? 1.5 : 1}
                    strokeDasharray={isHovered ? '2 2' : undefined}
                    opacity={isHovered ? 0.7 : 0.8}
                  />
                </g>
              );
            })}

            {/* D3 Temperature Shaded Area Band */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#weatherBandGrad)"
                className="transition-all duration-300"
              />
            )}

            {/* Low Temperature Line (Cool Navy) */}
            {lowPath && (
              <path
                d={lowPath}
                fill="none"
                stroke="#00204A"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
                className="transition-all duration-300"
              />
            )}

            {/* High Temperature Line (Warm Crimson / Amber) */}
            {highPath && (
              <path
                d={highPath}
                fill="none"
                stroke="url(#highLineGrad)"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {/* Low Temp Nodes & Labels */}
            {lowPoints.map((pt, i) => {
              const isHovered = hoveredDayIndex === i;
              return (
                <g key={`low-${pt.day}`} className="transition-all duration-200">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 4.5 : 3}
                    fill="#00204A"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y + 11}
                    textAnchor="middle"
                    className="font-dateline text-[9px] font-semibold fill-stone-600 select-none pointer-events-none"
                  >
                    {pt.val}°
                  </text>
                </g>
              );
            })}

            {/* High Temp Nodes & Labels */}
            {highPoints.map((pt, i) => {
              const isHovered = hoveredDayIndex === i;
              return (
                <g key={`high-${pt.day}`} className="transition-all duration-200">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3.5}
                    fill="#E5000C"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 7}
                    textAnchor="middle"
                    className="font-headline text-[10px] font-bold fill-stone-900 select-none pointer-events-none"
                  >
                    {pt.val}°
                  </text>
                </g>
              );
            })}

            {/* X-Axis: Days & Dates */}
            {chartData.map((d, i) => {
              const xPos = xScale(d.day) ?? 0;
              const isHovered = hoveredDayIndex === i;
              return (
                <g 
                  key={`axis-${d.day}`}
                  transform={`translate(${xPos}, ${innerHeight + 18})`}
                  className="cursor-pointer"
                  onClick={() => setHoveredDayIndex(i)}
                >
                  <text
                    textAnchor="middle"
                    y={-4}
                    className={`font-dateline text-[10px] font-bold uppercase select-none ${
                      isHovered ? 'fill-[#00204A]' : 'fill-stone-800'
                    }`}
                  >
                    {d.day}
                  </text>
                  <text
                    textAnchor="middle"
                    y={7}
                    className="font-dateline text-[8.5px] fill-stone-400 select-none"
                  >
                    {d.date.split(' ')[1]}
                  </text>
                </g>
              );
            })}

            {/* Interactive Invisible Overlay Columns for Hovering */}
            {chartData.map((d, i) => {
              const xPos = xScale(d.day) ?? 0;
              const stepWidth = innerWidth / (chartData.length || 1);
              return (
                <rect
                  key={`hover-zone-${i}`}
                  x={xPos - stepWidth / 2}
                  y={-margin.top}
                  width={stepWidth}
                  height={dimensions.height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDayIndex(i)}
                  onTouchStart={() => setHoveredDayIndex(i)}
                />
              );
            })}
          </g>
        </svg>

        {/* Hover Detail Tooltip Callout */}
        {hoveredDay && hoveredDayIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-[#00204A] text-white px-2.5 py-1.5 rounded-sm shadow-md text-[10px] font-dateline border border-[#FD8B18]/50 min-w-[130px] transition-all duration-150"
            style={{
              left: Math.min(
                Math.max(margin.left + (xScale(hoveredDay.day) ?? 0) - 65, 8),
                dimensions.width - 145
              ),
              top: 6,
            }}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-0.5 mb-1">
              <span className="font-bold text-[#FD8B18]">
                {hoveredDay.day}, {hoveredDay.date}
              </span>
              <div className="flex items-center gap-1">
                {getWeatherIcon(hoveredDay.condition)}
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] mb-0.5">
              <span className="text-stone-300">{hoveredDay.condition}</span>
              <span className="font-bold">
                {hoveredDay.displayHigh}° / {hoveredDay.displayLow}°
              </span>
            </div>

            <div className="flex items-center justify-between text-[8.5px] text-stone-300 pt-0.5 border-t border-white/10">
              <span className="flex items-center gap-0.5">
                <Droplets className="w-2.5 h-2.5 text-sky-400" />
                Rain: {hoveredDay.precipitationChance}%
              </span>
              <span>Hum: {hoveredDay.humidity}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Micro Footer: Meteorological Synopsis note */}
      <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between text-[9px] font-dateline text-stone-500">
        <span>
          7-Day Range: <strong className="text-stone-700">{allTempsMin}{activeUnit}</strong> to <strong className="text-stone-700">{allTempsMax}{activeUnit}</strong>
        </span>
        <span className="text-stone-400">
          Source: Provat Barta Meteorological Bureau
        </span>
      </div>
    </div>
  );
};
