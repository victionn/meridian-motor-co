"use server";

import { getCrm } from "./crm";
import { LeadSchema, type Lead, type LeadFormState } from "./schema";

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string" && v !== ""),
  );
  const parsed = LeadSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof Lead, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof Lead;
      fieldErrors[key] ??= issue.message;
    }
    // Honeypot tripped: pretend success so bots learn nothing.
    if (fieldErrors.company) return { status: "success" };
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  try {
    await getCrm().submit(parsed.data);
    return { status: "success" };
  } catch (err) {
    console.error("[lead] CRM submit failed", err);
    return { status: "error", message: "Something went wrong. Please call us or try again." };
  }
}
