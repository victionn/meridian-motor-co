"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { site } from "@/content/site";
import { calculateRepayments } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

const TERMS = [24, 36, 48, 60, 72, 84];
const BALLOONS = [0, 10, 20, 30];

/**
 * Compact repayment estimator for a car's page, sized for the summary column. The price is the car's own; the buyer
 * sets deposit, term and balloon. Same maths and indicative rate as the Finance page calculator (site.finance).
 */
export function CarFinance({ price }: { price: number }) {
  const id = useId();
  const [depositPct, setDepositPct] = useState<number>(site.finance.defaultDepositPct);
  const [term, setTerm] = useState<number>(site.finance.defaultTermMonths);
  const [balloonPct, setBalloonPct] = useState(0);
  const rate = site.finance.comparisonRate;

  const deposit = (price * depositPct) / 100;
  const r = calculateRepayments({ price, deposit, balloon: (price * balloonPct) / 100, annualRatePct: rate, termMonths: term });

  return (
    <section aria-labelledby={`${id}-title`} className="mt-5 rounded-2xl border border-ink/15 p-5 xl:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={`${id}-title`} className="text-sm font-medium uppercase tracking-[0.16em] text-ink/60">
          Finance this car
        </h2>
        <span className="text-sm text-ink/50">{rate}% p.a.</span>
      </div>

      <p className="mt-3 text-[2rem] font-bold leading-none tracking-tight xl:text-[2.4rem]" aria-live="polite">
        {formatCurrency(r.weekly)}
        <span className="ml-1.5 text-base font-medium tracking-normal text-ink/55">/week</span>
      </p>
      <p className="mt-2 text-[0.95rem] text-ink/65">
        {formatCurrency(r.monthly)}/month · {formatCurrency(r.principal)} financed
      </p>

      <label htmlFor={`${id}-deposit`} className="mt-6 flex items-baseline justify-between text-xs font-medium uppercase tracking-[0.14em] text-ink/60">
        Deposit
        <span className="text-[0.95rem] normal-case tracking-normal text-ink">
          {formatCurrency(deposit)} <span className="text-ink/50">({depositPct}%)</span>
        </span>
      </label>
      <input
        id={`${id}-deposit`}
        type="range"
        min={0}
        max={50}
        step={5}
        value={depositPct}
        onChange={(e) => setDepositPct(Number(e.target.value))}
        className="mt-2 w-full accent-cobalt"
      />

      <Segmented label="Term" value={term} options={TERMS} onChange={setTerm} format={(n) => `${n / 12} yr`} />
      <Segmented label="Balloon" value={balloonPct} options={BALLOONS} onChange={setBalloonPct} format={(n) => (n ? `${n}%` : "None")} />

      <p className="mt-5 text-xs leading-relaxed text-ink/50">{site.finance.disclaimer}</p>
      <Link
        href="/finance"
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-cobalt-deep transition-colors hover:text-cobalt"
      >
        Get pre-approved <span aria-hidden>→</span>
      </Link>
    </section>
  );
}

/** A row of equal buttons, one selected: fits six choices across the narrow column. */
function Segmented({ label, value, options, onChange, format }: { label: string; value: number; options: number[]; onChange: (n: number) => void; format: (n: number) => string }) {
  return (
    <fieldset className="mt-5">
      <legend className="text-xs font-medium uppercase tracking-[0.14em] text-ink/60">{label}</legend>
      <div className="mt-2 flex overflow-hidden rounded-lg border border-ink/20">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`flex-1 border-l border-ink/20 py-2 text-[0.85rem] transition-colors first:border-l-0 ${
              value === n ? "bg-cobalt font-medium text-paper" : "text-ink hover:bg-ink/5"
            }`}
          >
            {format(n)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
