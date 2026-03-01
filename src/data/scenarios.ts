import { ScenarioConfig } from '../types/trace';

export const scenarios: Record<string, ScenarioConfig> = {
    homepage: {
        id: 'homepage',
        name: 'Homepage Load',
        seed: 12345,
        baseCount: 200,
    },
    checkout: {
        id: 'checkout',
        name: 'Checkout Flow',
        seed: 54321,
        baseCount: 500,
    },
    upload: {
        id: 'upload',
        name: 'Large Upload',
        seed: 98765,
        baseCount: 800,
    },
    'api-spike': {
        id: 'api-spike',
        name: 'API Spike (2k requests)',
        seed: 424242,
        baseCount: 2000,
    },
};

export const defaultScenario = scenarios.homepage;
