"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { submitLead } from "@/lib/leads/actions";
import type { LeadFormState, LeadType } from "@/lib/leads/schema";

type Field = "message" | "preferredDate" | "rego" | "tradeIn" | "company" | "reason";

type Props = {
  type: LeadType;
  submitLabel?: string;
  /** Optional fields to show, in addition to name, email and phone. */
  fields?: Field[];
  /** Choices for the "reason" field. */
  reasons?: string[];
  messageLabel?: string;
  messagePlaceholder?: string;
  tradeInLabel?: string;
  successTitle?: string;
  successMessage?: string;
};

const initial: LeadFormState = { status: "idle" };

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3.5 text-base text-ink placeholder:text-ink/40 transition-colors focus:border-ink focus:outline-none aria-invalid:border-red-600";
const label = "mb-2 block text-sm font-medium uppercase tracking-[0.12em] text-ink/60";

/** Enquiry form for the light pages. Submits through the `submitLead` server action (CRM or server log). */
export function LeadForm({
  type,
  submitLabel = "Send enquiry",
  fields = ["message"],
  reasons = [],
  messageLabel = "Message",
  messagePlaceholder = "How can we help?",
  tradeInLabel = "Your car (year, make, model, km)",
  successTitle = "Thank you",
  successMessage = "Thank you for your enquiry. A member of our team will be in contact with you shortly.",
}: Props) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const id = useId();
  const has = (f: Field) => fields.includes(f);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl bg-ink/5 p-8">
        <p className="font-classic text-3xl">{successTitle}</p>
        <p className="mt-3 text-lg leading-relaxed text-ink/70">{successMessage}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="type" value={type} />
      {/* Spam trap: hidden from people, so only bots fill it in. */}
      <div className="hidden" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {has("reason") && reasons.length > 0 && (
        <div>
          <label htmlFor={`${id}-reason`} className={label}>Enquiry about</label>
          <select id={`${id}-reason`} name="reason" defaultValue="" className={field}>
            <option value="">General enquiry</option>
            {reasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      <Text id={`${id}-name`} name="name" label="Name" autoComplete="name" error={err.name} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Text id={`${id}-email`} name="email" label="Email" type="email" autoComplete="email" error={err.email} required />
        <Text id={`${id}-phone`} name="phone" label="Phone" type="tel" autoComplete="tel" error={err.phone} required />
      </div>

      {has("company") && <Text id={`${id}-company`} name="company" label="Company" autoComplete="organization" error={err.company} />}
      {has("rego") && <Text id={`${id}-rego`} name="rego" label="Vehicle rego" error={err.rego} />}
      {has("tradeIn") && <Text id={`${id}-tradeIn`} name="tradeIn" label={tradeInLabel} error={err.tradeIn} />}
      {has("preferredDate") && <Text id={`${id}-date`} name="preferredDate" label="Preferred date" type="date" error={err.preferredDate} />}
      {has("message") && (
        <div>
          <label htmlFor={`${id}-message`} className={label}>{messageLabel}</label>
          <textarea id={`${id}-message`} name="message" rows={4} placeholder={messagePlaceholder} className={`${field} resize-y`} />
        </div>
      )}

      {state.status === "error" && (
        <p role="alert" className="text-base text-red-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-ink/85 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending…" : submitLabel} <span aria-hidden>→</span>
      </button>
      <p className="text-sm text-ink/55">
        By submitting you agree to our{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}

function Text({
  id,
  name,
  label: text,
  error,
  type = "text",
  ...rest
}: { id: string; name: string; label: string; error?: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className={label}>{text}</label>
      <input
        id={id}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={field}
        {...rest}
      />
      {error && <p id={`${id}-err`} className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  );
}
