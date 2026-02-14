
import { HistoricalYearData } from '../types';

/**
 * Calculates a simple moving average.
 */
export const calculateSMA = (data: number[], window: number): number[] => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data[i]); // Or null/undefined
      continue;
    }
    const slice = data.slice(i - window + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / window;
    result.push(avg);
  }
  return result;
};

/**
 * Detects anomalies in historical data.
 * Uses standard deviation to identify outliers.
 */
export const detectAnomalies = (data: number[]): { index: number; value: number }[] => {
  const n = data.length;
  if (n === 0) return [];
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const stdDev = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n);
  
  return data
    .map((value, index) => ({ value, index }))
    .filter(item => Math.abs(item.value - mean) > 1.5 * stdDev);
};

/**
 * Formats historical data for charts.
 */
export const formatHistoricalTrends = (yearlyData: HistoricalYearData[]) => {
  return yearlyData.map(d => ({
    year: d.year.toString(),
    temp: d.avgTemp,
    rain: d.totalRainfall,
    extremes: d.extremeEvents
  }));
};
