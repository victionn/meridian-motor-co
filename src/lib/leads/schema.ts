import { z } from "zod";

export const LEAD_TYPES = ["enquiry", "test-drive", "finance", "valuation", "service", "contact"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

const phone = z
  .string()
  .trim()
  .regex(/^[0-9+()\s-]{8,20}$/, "Enter a valid phone number");

export const LeadSchema = z.object({
  type: z.enum(LEAD_TYPES),
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email"),
  phone,
  message: z.string().trim().max(2000).optional(),

  // Context — all optional, depend on the form.
  vehicleId: z.string().max(40).optional(),
  vehicleTitle: z.string().max(200).optional(),
  preferredDate: z.string().max(40).optional(),
  rego: z.string().trim().max(12).optional(),
  tradeIn: z.string().trim().max(200).optional(),
  pageUrl: z.string().max(500).optional(),

  // Honeypot — real users never fill this.
  company: z.string().max(0).optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

export type LeadFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<keyof Lead, string>> };
