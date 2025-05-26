'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {nextPlugin} from '@genkit-ai/next'; // Import the nextPlugin

export const ai = genkit({
  plugins: [
    googleAI(),
    nextPlugin(), // Add the nextPlugin here
  ],
  model: 'googleai/gemini-2.0-flash',
});
