import React, { useState } from 'react';
import { MarketIndex, WeatherReport } from '../types';
import { TrendingUp, TrendingDown, ArrowRightLeft, DollarSign } from 'lucide-react';
import { WeatherTrendChart } from './WeatherTrendChart';
import { WeatherAlertSection } from './WeatherAlertSection';

interface MarketAndWeatherWidgetProps {
  markets: MarketIndex[];
  weather?: WeatherReport[];
}

export const MarketAndWeatherWidget: React.FC<MarketAndWeatherWidgetProps> = ({
  markets,
}) => {
  const [usdAmount, setUsdAmount] = useState<string>('100');
  const [chartCityId, setChartCityId] = useState<string>('dhk'); // Defaults to Dhaka where active alerts exist or user can switch
  const rate = 121.40; // 1 USD = 121.40 BDT

  const convertedBdt = (parseFloat(usdAmount || '0') * rate).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });

  return (
    <aside className="border border-stone-300 bg-white p-4 rounded-xs mb-8 shadow-2xs">
      {/* Financial Quotations Header */}
      <div className="border-b-2 border-[#00204A] pb-1.5 mb-3 flex items-center justify-between">
        <h4 className="font-cinzel font-bold text-xs uppercase tracking-widest text-[#00204A] flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
          <span>Market Quotations & Exchange</span>
        </h4>
        <span className="text-[10px] font-dateline text-stone-500 uppercase">
          15-Min Delayed
        </span>
      </div>

      {/* Market Ticker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        {markets.map((m) => (
          <div
            key={m.symbol}
            className="p-2 border border-stone-200 rounded-xs bg-stone-50 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-dateline font-bold text-stone-700 uppercase">
                {m.symbol}
              </span>
              {m.isPositive ? (
                <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 text-[#E5000C]" />
              )}
            </div>
            <div className="font-headline font-bold text-sm text-stone-900 leading-tight mt-0.5">
              {m.value}
            </div>
            <div
              className={`text-[10px] font-dateline font-medium ${
                m.isPositive ? 'text-emerald-700' : 'text-[#E5000C]'
              }`}
            >
              {m.change}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Weather Alert Section (Triggered when Regional Temperatures/Conditions hit Extreme Thresholds) */}
      <WeatherAlertSection
        onSelectCityInChart={(cityId) => setChartCityId(cityId)}
        activeChartCityId={chartCityId}
      />

      {/* Two Column Mini-Tool: Currency Converter & D3 7-Day Weather Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 border-t border-stone-200 pt-3 items-stretch">
        {/* Currency Converter */}
        <div className="lg:col-span-4 bg-stone-50/70 border border-stone-200 p-2.5 rounded-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-dateline font-bold text-[#00204A] uppercase mb-2">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-[#E5000C]" />
                Diaspora Remittance Calculator
              </span>
              <span className="text-[10px] text-stone-500">1 USD = ৳121.40</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-xs border border-stone-300 rounded bg-white text-stone-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#00204A]"
                  placeholder="USD"
                />
              </div>
              <span className="text-stone-400 font-bold text-xs">=</span>
              <div className="flex-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded text-right">
                <span className="text-xs font-headline font-bold text-[#00204A]">
                  ৳{convertedBdt} <span className="text-[10px] font-dateline text-stone-600">BDT</span>
                </span>
              </div>
            </div>

            {/* Quick Diaspora presets */}
            <div className="flex items-center justify-between gap-1 text-[9px] font-dateline text-stone-500 pt-1">
              <span>Quick:</span>
              <div className="flex gap-1">
                {['50', '100', '250', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setUsdAmount(amt)}
                    className={`px-1.5 py-0.5 rounded border ${
                      usdAmount === amt 
                        ? 'bg-[#00204A] text-white border-[#00204A]' 
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[9px] font-dateline text-stone-400 pt-2 border-t border-stone-200/80 mt-2">
            Mid-market interbank benchmark rate. Real-time remittance quotes provided by partner banks.
          </div>
        </div>

        {/* 7-Day Temperature Forecast Trend Visualized with D3 */}
        <div className="lg:col-span-8">
          <WeatherTrendChart
            initialCityId="dhk"
            selectedCityId={chartCityId}
            onCityChange={(cityId) => setChartCityId(cityId)}
          />
        </div>
      </div>
    </aside>
  );
};

