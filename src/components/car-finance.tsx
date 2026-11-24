"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { site } from "@/content/site";
import { calculateRepayments } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

const TERMS = [24, 36, 48, 60, 72, 84];
const BALLOONS = [0, 10, 20, 30];

/**
 * A car's price with a "Finance" dropdown beside it: the button shows the weekly repayment at the default deposit and
 * term, and opens a compact estimator worked out from the car's own price (deposit, term, balloon). Same maths and
 * indicative rate as the Finance page calculator (site.finance). `children` is the server-rendered price.
 */
export function PriceWithFinance({ price, children }: { price: number; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [depositPct, setDepositPct] = useState<number>(site.finance.defaultDepositPct);
  const [term, setTerm] = useState<number>(site.finance.defaultTermMonths);
  const [balloonPct, setBalloonPct] = useState(0);
  const rate = site.finance.comparisonRate;

  const deposit = (price * depositPct) / 100;
  const r = calculateRepayments({ price, deposit, balloon: (price * balloonPct) / 100, annualRatePct: rate, termMonths: term });

  return (
    <div className="mt-5 border-b border-ink/15 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        {children}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition-colors xl:text-base ${
            open ? "border-cobalt bg-cobalt text-paper" : "border-cobalt/40 text-cobalt-deep hover:border-cobalt hover:bg-cobalt/5"
          }`}
        >
          <span className="font-medium uppercase tracking-[0.14em]">Finance</span>
          <span className={open ? "text-paper/85" : "text-ink/70"}>{formatCurrency(r.weekly)}/wk</span>
          <svg aria-hidden viewBox="0 0 16 16" className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3.5 6l4.5 4.5L12.5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Opens by animating the row height from 0 to its content (grid-rows 0fr → 1fr). */}
      <div
        id={`${id}-panel`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className="mt-5 rounded-2xl bg-ink/[0.04] p-5 xl:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[2rem] font-bold leading-none tracking-tight xl:text-[2.4rem]" aria-live="polite">
                {formatCurrency(r.weekly)}
                <span className="ml-1.5 text-base font-medium tracking-normal text-ink/55">/week</span>
              </p>
              <span className="text-sm text-ink/50">{rate}% p.a.</span>
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

/** A row of equal buttons, one selected: fits six choices across the narrow column. */
function Segmented({ label, value, options, onChange, format }: { label: string; value: number; options: number[]; onChange: (n: number) => void; format: (n: number) => string }) {
  return (
    <fieldset className="mt-5">
      <legend className="text-xs font-medium uppercase tracking-[0.14em] text-ink/60">{label}</legend>
      <div className="mt-2 flex overflow-hidden rounded-lg border border-ink/20 bg-paper">
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
