import { CityForecast, WeatherAlert } from '../types';
import { CITIES_7DAY_FORECAST } from '../data/mockWeatherForecast';

export interface WeatherThresholdConfig {
  heatThresholdC: number; // e.g. 34°C (93.2°F)
  coldThresholdC: number; // e.g. 0°C (32°F)
  rainThresholdPct: number; // e.g. 70%
}

export const DEFAULT_THRESHOLDS: WeatherThresholdConfig = {
  heatThresholdC: 34,
  coldThresholdC: 0,
  rainThresholdPct: 70,
};

// Simulated scenarios to let users test how the system reacts to extreme meteorological spikes
export type SimulationPreset = 'none' | 'nyc_heatwave' | 'london_freeze' | 'monsoon_surge';

export function evaluateRegionalWeatherAlerts(
  cities: CityForecast[] = CITIES_7DAY_FORECAST,
  thresholds: WeatherThresholdConfig = DEFAULT_THRESHOLDS,
  simulation: SimulationPreset = 'none'
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // Deep clone or adapt cities with simulation presets if requested
  const evaluatedCities: CityForecast[] = cities.map((c) => {
    const clone = { ...c, forecast: c.forecast.map((f) => ({ ...f })) };

    if (simulation === 'nyc_heatwave' && clone.id === 'nyc') {
      clone.currentTemp = 99; // °F
      clone.currentCondition = 'Extreme Heat Wave & Smog';
      clone.forecast[0] = {
        ...clone.forecast[0],
        high: 101,
        condition: 'Dangerous Heatwave',
        humidity: 68,
      };
      clone.forecast[1] = {
        ...clone.forecast[1],
        high: 99,
        condition: 'Excessive Heat',
        humidity: 62,
      };
    } else if (simulation === 'london_freeze' && clone.id === 'lon') {
      clone.currentTemp = -3; // °C
      clone.currentCondition = 'Severe Frost & Freezing Fog';
      clone.forecast[0] = {
        ...clone.forecast[0],
        high: 1,
        low: -4,
        condition: 'Black Ice & Sleet',
        humidity: 88,
      };
      clone.forecast[1] = {
        ...clone.forecast[1],
        high: 0,
        low: -5,
        condition: 'Sub-Zero Freeze',
        humidity: 90,
      };
    } else if (simulation === 'monsoon_surge' && clone.id === 'dhk') {
      clone.currentTemp = 35; // °C
      clone.currentCondition = 'Monsoon Cloudburst & Gale';
      clone.forecast[1] = {
        ...clone.forecast[1],
        high: 36,
        precipitationChance: 95,
        humidity: 94,
        condition: 'Torrential Cloudburst',
      };
    }

    return clone;
  });

  // Evaluate each regional station
  for (const city of evaluatedCities) {
    // Check current temperature in Celsius
    const currentInC =
      city.unit === '°F' ? Math.round(((city.currentTemp - 32) * 5) / 9) : city.currentTemp;

    // Check Current Temp Extreme Heat
    if (currentInC >= thresholds.heatThresholdC) {
      const currentInF =
        city.unit === '°F' ? city.currentTemp : Math.round((city.currentTemp * 9) / 5 + 32);
      alerts.push({
        id: `alert-curr-heat-${city.id}`,
        cityId: city.id,
        cityName: city.city,
        country: city.country,
        type: 'heat',
        severity: currentInC >= 36 ? 'warning' : 'advisory',
        headline: `Excessive Heat Advisory: ${city.city} Hits ${currentInC}°C (${currentInF}°F)`,
        triggerCondition: `Current temperature ${city.currentTemp}${city.unit} exceeds regional threshold of ${thresholds.heatThresholdC}°C`,
        metricValue: `${currentInC}°C / ${currentInF}°F`,
        thresholdCrossed: `Heat threshold ≥ ${thresholds.heatThresholdC}°C (93.2°F)`,
        effectiveDate: 'Active Now • Current Readings',
        description: `Meteorological monitors indicate ambient air temperatures in ${city.city} have reached critical levels. High solar radiation and thermal retention create dangerous outdoor conditions.`,
        safetyAdvice: [
          'Suspend non-essential outdoor labor between 11:30 AM and 4:30 PM.',
          'Increase oral fluid intake; avoid caffeinated or high-sugar dehydrating beverages.',
          'Check on elderly neighbors, outdoor commuters, and pets frequently.',
          'Monitor civic power load warnings due to air conditioning surges.',
        ],
        issuedBy:
          city.country === 'USA'
            ? 'National Weather Service (NWS) Heat Health Watch'
            : city.country === 'Bangladesh'
            ? 'Bangladesh Meteorological Department (BMD) Dhaka Division'
            : 'UK Met Office Public Weather Service',
        urgency: 'Immediate',
      });
    }

    // Check Current Temp Extreme Freeze
    if (currentInC <= thresholds.coldThresholdC) {
      const currentInF =
        city.unit === '°F' ? city.currentTemp : Math.round((city.currentTemp * 9) / 5 + 32);
      alerts.push({
        id: `alert-curr-cold-${city.id}`,
        cityId: city.id,
        cityName: city.city,
        country: city.country,
        type: 'freeze',
        severity: currentInC <= -2 ? 'warning' : 'advisory',
        headline: `Hard Freeze Warning: Sub-Zero Temperatures in ${city.city}`,
        triggerCondition: `Current temperature ${city.currentTemp}${city.unit} plummeted below freezing threshold of ${thresholds.coldThresholdC}°C (32°F)`,
        metricValue: `${currentInC}°C / ${currentInF}°F`,
        thresholdCrossed: `Freeze threshold ≤ ${thresholds.coldThresholdC}°C (32°F)`,
        effectiveDate: 'Active Now • Overnight Frost Watch',
        description: `Rapid arctic air displacement has driven temperatures below freezing point, posing serious risks of black ice on road arteries and pipeline frost fractures.`,
        safetyAdvice: [
          'Wrap external water pipelines and close foundation ventilation gates.',
          'Exercise extreme caution on highway bridges and elevated transit viaducts.',
          'Bring sensitive horticultural crops and domestic animals indoors.',
        ],
        issuedBy:
          city.country === 'UK'
            ? 'UK Met Office Cold Weather Alert Service'
            : 'National Weather Service Regional Bureau',
        urgency: 'Immediate',
      });
    }

    // Scan the 7-day forecast days for extreme peaks
    city.forecast.forEach((day, idx) => {
      const dayHighInC =
        city.unit === '°F' ? Math.round(((day.high - 32) * 5) / 9) : day.high;
      const dayLowInC =
        city.unit === '°F' ? Math.round(((day.low - 32) * 5) / 9) : day.low;

      // Extreme Heat Forecast Check
      if (dayHighInC >= thresholds.heatThresholdC) {
        const dayHighInF =
          city.unit === '°F' ? day.high : Math.round((day.high * 9) / 5 + 32);
        // Avoid duplicate if same city already has active current heat alert
        const alreadyHasHeatAlert = alerts.some(
          (a) => a.cityId === city.id && a.type === 'heat' && a.urgency === 'Immediate'
        );

        if (!alreadyHasHeatAlert || idx > 1) {
          alerts.push({
            id: `alert-forecast-heat-${city.id}-${day.day}`,
            cityId: city.id,
            cityName: city.city,
            country: city.country,
            type: 'heat',
            severity: dayHighInC >= 35 ? 'warning' : 'watch',
            headline: `${day.day} Heatwave Alert: ${dayHighInC}°C (${dayHighInF}°F) Expected in ${city.city}`,
            triggerCondition: `Projected high of ${dayHighInC}°C (${dayHighInF}°F) on ${day.day} (${day.date}) with ${day.humidity}% relative humidity.`,
            metricValue: `${dayHighInC}°C / ${dayHighInF}°F (Humidity: ${day.humidity}%)`,
            thresholdCrossed: `Exceeds regional extreme heat threshold (≥ ${thresholds.heatThresholdC}°C)`,
            effectiveDate: `${day.day}, ${day.date} • Peak Afternoon Window`,
            description: `A tropical continental thermal ridge will bring intense surface heating over ${city.city}. Combined with ${day.humidity}% atmospheric humidity, the perceived heat index is anticipated to exceed 42°C (108°F).`,
            safetyAdvice: [
              'Hydrate consistently and reschedule strenuous open-air sporting events.',
              'Ensure commercial and residential cooling systems are operating nominally.',
              'High risk of heat exhaustion for transit operators and construction personnel.',
            ],
            issuedBy:
              city.country === 'Bangladesh'
                ? 'BMD Early Warning Center, Agargaon'
                : 'National Weather Service Climate Prediction Center',
            urgency: idx <= 1 ? 'Expected' : 'Future Watch',
          });
        }
      }

      // Extreme Cold Forecast Check
      if (dayLowInC <= thresholds.coldThresholdC) {
        const dayLowInF =
          city.unit === '°F' ? day.low : Math.round((day.low * 9) / 5 + 32);
        alerts.push({
          id: `alert-forecast-cold-${city.id}-${day.day}`,
          cityId: city.id,
          cityName: city.city,
          country: city.country,
          type: 'freeze',
          severity: 'advisory',
          headline: `Frost & Cold Snap Advisory for ${city.city}: Low of ${dayLowInC}°C (${dayLowInF}°F)`,
          triggerCondition: `Nighttime nadir projected to hit ${dayLowInC}°C (${dayLowInF}°F) on ${day.day} (${day.date}).`,
          metricValue: `${dayLowInC}°C / ${dayLowInF}°F`,
          thresholdCrossed: `Drops to or below freezing threshold (≤ ${thresholds.coldThresholdC}°C)`,
          effectiveDate: `${day.day}, ${day.date} • Midnight to Dawn`,
          description: `Clear nighttime radiational cooling will drop surface temperatures down to frost threshold. Risk of treacherous black ice on elevated expressways.`,
          safetyAdvice: [
            'Commuters should anticipate delays on highway interchanges and rail points.',
            'Winterize vulnerable exterior utility lines.',
          ],
          issuedBy: 'Regional Meteorological Hydrology Directorate',
          urgency: idx <= 1 ? 'Expected' : 'Future Watch',
        });
      }

      // Extreme Monsoon / Torrential Precipitation Check
      if (day.precipitationChance >= thresholds.rainThresholdPct) {
        alerts.push({
          id: `alert-forecast-rain-${city.id}-${day.day}`,
          cityId: city.id,
          cityName: city.city,
          country: city.country,
          type: 'monsoon',
          severity: day.precipitationChance >= 80 ? 'warning' : 'watch',
          headline: `Monsoon Torrent & Flood Watch: ${day.precipitationChance}% Rain Risk in ${city.city}`,
          triggerCondition: `${day.precipitationChance}% precipitation probability with ${day.condition} and ${day.humidity}% saturation.`,
          metricValue: `${day.precipitationChance}% Probability (${day.condition})`,
          thresholdCrossed: `Exceeds heavy precipitation threshold (≥ ${thresholds.rainThresholdPct}%)`,
          effectiveDate: `${day.day}, ${day.date} • Sustained Downpour`,
          description: `Deep monsoon trough activity over ${city.city} is forecast to trigger intense cloudbursts. Waterlogging expected in urban thoroughfares and low-lying riverbank catchments.`,
          safetyAdvice: [
            'Avoid urban underpasses and unpaved riverbank embankments.',
            'Keep battery-backed radios and emergency lighting operational.',
            'Boil all municipal drinking water if drainage water contamination is suspected.',
            'Emergency contact: Disaster Management Control Room (Hotline 1090).',
          ],
          issuedBy:
            city.country === 'Bangladesh'
              ? 'Flood Forecasting and Warning Centre (FFWC) & BMD'
              : 'National Weather Service Hydrological Outlook',
          urgency: idx <= 1 ? 'Expected' : 'Future Watch',
        });
      }
    });
  }

  return alerts;
}
