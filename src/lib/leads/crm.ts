import "server-only";
import type { Lead } from "./schema";

export interface CrmClient {
  submit(lead: Lead): Promise<void>;
}

/** Logs leads to the server console. Default for local dev. */
class LogCrm implements CrmClient {
  async submit(lead: Lead) {
    console.info("[lead]", JSON.stringify(lead));
  }
}

/**
 * HubSpot Forms API (no private token required). Create one HubSpot form
 * with matching internal field names and set HUBSPOT_PORTAL_ID / HUBSPOT_FORM_GUID.
 */
class HubSpotCrm implements CrmClient {
  constructor(
    private portalId: string,
    private formGuid: string,
  ) {}

  async submit(lead: Lead) {
    const [firstname, ...rest] = lead.name.split(" ");
    const fields: Record<string, string | undefined> = {
      firstname,
      lastname: rest.join(" ") || undefined,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      lead_type: lead.type,
      vehicle_stock_id: lead.vehicleId,
      vehicle_title: lead.vehicleTitle,
      preferred_date: lead.preferredDate,
      rego: lead.rego,
      trade_in: lead.tradeIn,
    };
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${this.portalId}/${this.formGuid}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: Object.entries(fields)
            .filter(([, v]) => v)
            .map(([name, value]) => ({ name, value })),
          context: { pageUri: lead.pageUrl },
        }),
      },
    );
    if (!res.ok) throw new Error(`HubSpot responded ${res.status}: ${await res.text()}`);
  }
}

export function getCrm(): CrmClient {
  const { CRM_PROVIDER, HUBSPOT_PORTAL_ID, HUBSPOT_FORM_GUID } = process.env;
  if (CRM_PROVIDER === "hubspot" && HUBSPOT_PORTAL_ID && HUBSPOT_FORM_GUID) {
    return new HubSpotCrm(HUBSPOT_PORTAL_ID, HUBSPOT_FORM_GUID);
  }
  return new LogCrm();
}
