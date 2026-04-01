import { CreatePotForm } from "@/components/create-pot-form";

export default function CreatePage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Create Pot
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">Set the target, then ship the link.</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          The onchain pot stores the goal, recipient, and deadline. Postgres keeps the shareable page
          metadata durable for local development and Vercel deployments.
        </p>
      </div>

      <CreatePotForm />
    </div>
  );
}
