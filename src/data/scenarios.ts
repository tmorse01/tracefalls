import type { ScenarioConfig } from '../types/trace';

export const SCENARIOS: ScenarioConfig[] = [
  { id: 'homepage',  label: 'Homepage Load',   requestCount: 200,  seed: 1001 },
  { id: 'checkout',  label: 'Checkout Flow',   requestCount: 500,  seed: 2002 },
  { id: 'upload',    label: 'File Upload',      requestCount: 800,  seed: 3003 },
  { id: 'api-spike', label: 'API Spike',        requestCount: 2000, seed: 4004 },
];

export function getScenario(id: string): ScenarioConfig {
  return SCENARIOS.find(s => s.id === id) ?? SCENARIOS[0];
}
