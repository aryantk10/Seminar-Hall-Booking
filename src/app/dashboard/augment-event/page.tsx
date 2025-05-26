import EventAugmentorForm from "@/components/ai/EventAugmentorForm";

export default function AugmentEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Event Augmentor</h1>
        <p className="text-muted-foreground">
          Leverage AI to get suggestions for related or complementary events.
        </p>
      </div>
      <EventAugmentorForm />
    </div>
  );
}
