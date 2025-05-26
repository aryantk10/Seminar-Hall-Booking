// use server'

/**
 * @fileOverview AI tool to analyze event details and suggest related or augmenting events.
 *
 * - augmentEventContext - Analyzes event details and suggests related/augmenting events.
 * - AugmentEventContextInput - Input type for augmentEventContext function.
 * - AugmentEventContextOutput - Return type for augmentEventContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AugmentEventContextInputSchema = z.object({
  eventDetails: z.string().describe('Details of the event, including topic, date, time, and intended audience.'),
  previousEvents: z.string().optional().describe('Optional list of previous events or bookings.'),
});
export type AugmentEventContextInput = z.infer<typeof AugmentEventContextInputSchema>;

const AugmentEventContextOutputSchema = z.object({
  relatedEvents: z.array(z.string()).describe('List of related events that might be of interest.'),
  suggestedEvents: z.array(z.string()).describe('List of suggested events to augment the existing event.'),
  summary: z.string().describe('A summary of the analysis and suggestions.'),
});
export type AugmentEventContextOutput = z.infer<typeof AugmentEventContextOutputSchema>;

export async function augmentEventContext(input: AugmentEventContextInput): Promise<AugmentEventContextOutput> {
  return augmentEventContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'augmentEventContextPrompt',
  input: {schema: AugmentEventContextInputSchema},
  output: {schema: AugmentEventContextOutputSchema},
  prompt: `You are an AI assistant designed to analyze event details and suggest related or augmenting events.

  Analyze the following event details and provide a list of related events and suggested events to augment the existing event.

  Event Details: {{{eventDetails}}}

  Previous Events: {{{previousEvents}}}

  Consider the topic, date, time, and intended audience when making your suggestions.

  Output the related events and suggested events in a JSON format.
  Also provide a summary of the analysis and suggestions.
  `,
});

const augmentEventContextFlow = ai.defineFlow(
  {
    name: 'augmentEventContextFlow',
    inputSchema: AugmentEventContextInputSchema,
    outputSchema: AugmentEventContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
