"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { augmentEventContext, AugmentEventContextInput, AugmentEventContextOutput } from "@/ai/flows/augment-event-context";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Lightbulb, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  eventDetails: z.string().min(20, {
    message: "Event details must be at least 20 characters.",
  }).max(1000, { message: "Event details cannot exceed 1000 characters." }),
  previousEvents: z.string().max(1000, { message: "Previous events cannot exceed 1000 characters." }).optional(),
});

export default function EventAugmentorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AugmentEventContextOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventDetails: "",
      previousEvents: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAiResponse(null);
    try {
      const input: AugmentEventContextInput = {
        eventDetails: values.eventDetails,
        previousEvents: values.previousEvents || undefined,
      };
      const response = await augmentEventContext(input);
      setAiResponse(response);
      toast({
        title: "AI Analysis Complete",
        description: "Suggestions generated successfully.",
      });
    } catch (error) {
      console.error("AI Event Augmentor error:", error);
      toast({
        title: "AI Analysis Failed",
        description: "Could not generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-primary" /> AI Event Augmentor
          </CardTitle>
          <CardDescription>
            Provide details about your event, and our AI will suggest related or augmenting events to enhance your planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="eventDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event: topic, date, time, intended audience, etc."
                        className="resize-none"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more details you provide, the better the suggestions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="previousEvents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous or Related Events (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any previous similar events, or other events happening around the same time that might be relevant."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      This helps the AI understand context and avoid redundancy.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-4 w-4" />
                )}
                Get AI Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
             <ListChecks className="mr-2 h-6 w-6 text-primary" /> AI Suggestions
          </CardTitle>
          <CardDescription>
            Based on your input, here are some ideas from our AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && aiResponse === null && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Generating suggestions...</p>
            </div>
          )}
          {!isLoading && !aiResponse && (
            <p className="text-center text-muted-foreground py-10">
              Submit your event details to see AI-powered suggestions here.
            </p>
          )}
          {aiResponse && (
            <>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Summary</h3>
                <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{aiResponse.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Related Events</h3>
                {aiResponse.relatedEvents.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
                    {aiResponse.relatedEvents.map((event, index) => (
                      <li key={`related-${index}`}>{event}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific related events found.</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Suggested Augmenting Events</h3>
                {aiResponse.suggestedEvents.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
                    {aiResponse.suggestedEvents.map((event, index) => (
                      <li key={`suggested-${index}`}>{event}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific augmenting events suggested.</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
