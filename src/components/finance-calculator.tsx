"use client";

import { useId, useState } from "react";
import { site } from "@/content/site";
import { calculateRepayments } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

const TERMS = [24, 36, 48, 60, 72, 84];
const BALLOONS = [0, 10, 20, 30];

/** Repayment estimator for the Finance page (light pages). Figures are indicative; see site.finance. */
export function FinanceCalculator({ defaultPrice = 80000 }: { defaultPrice?: number }) {
  const id = useId();
  const [price, setPrice] = useState(defaultPrice);
  const [depositPct, setDepositPct] = useState<number>(site.finance.defaultDepositPct);
  const [balloonPct, setBalloonPct] = useState(0);
  const [term, setTerm] = useState<number>(site.finance.defaultTermMonths);
  const [rate, setRate] = useState<number>(site.finance.comparisonRate);

  const deposit = (price * depositPct) / 100;
  const balloon = (price * balloonPct) / 100;
  const r = calculateRepayments({ price, deposit, balloon, annualRatePct: rate, termMonths: term });

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Money id={`${id}-price`} label="Vehicle price" value={price} onChange={setPrice} prefix="$" step={1000} />
          <Money id={`${id}-rate`} label="Interest rate" value={rate} onChange={setRate} suffix="% p.a." step={0.1} />
        </div>

        <label className="block">
          <span className="flex items-baseline justify-between text-sm font-medium uppercase tracking-[0.12em] text-ink/60">
            Deposit <span className="text-base normal-case tracking-normal text-ink">{depositPct}% · {formatCurrency(deposit)}</span>
          </span>
          <input type="range" min={0} max={50} value={depositPct} onChange={(e) => setDepositPct(Number(e.target.value))} className="mt-3 w-full accent-ink" />
        </label>

        <Choice label="Balloon" value={balloonPct} options={BALLOONS} onChange={setBalloonPct} format={(n) => (n ? `${n}%` : "None")} />
        <Choice label="Term" value={term} options={TERMS} onChange={setTerm} format={(n) => `${n / 12} years`} />
      </div>

      <div className="flex flex-col rounded-2xl bg-ink p-8 text-paper sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-paper/60">Estimated repayment</p>
        <p className="mt-4 font-classic text-6xl leading-none" aria-live="polite">
          {formatCurrency(r.weekly)}
          <span className="ml-2 font-sans text-lg text-paper/60">/week</span>
        </p>
        <p className="mt-3 text-lg text-paper/75">
          {formatCurrency(r.monthly)} a month over {term / 12} years at {rate}% p.a.
        </p>
        <dl className="mt-8 space-y-3 border-t border-paper/15 pt-6 text-base">
          {[
            ["Vehicle price", formatCurrency(price)],
            ["Deposit", formatCurrency(deposit)],
            ["Balloon", formatCurrency(balloon)],
            ["Amount financed", formatCurrency(r.principal)],
            ["Total interest", formatCurrency(r.totalInterest)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6">
              <dt className="text-paper/65">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-auto pt-8 text-sm leading-relaxed text-paper/55">{site.finance.disclaimer}</p>
      </div>
    </div>
  );
}

function Choice({ label, value, options, onChange, format }: { label: string; value: number; options: number[]; onChange: (n: number) => void; format: (n: number) => string }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium uppercase tracking-[0.12em] text-ink/60">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`rounded-full border px-4 py-2 text-base transition-colors ${value === n ? "border-cobalt bg-cobalt text-paper" : "border-ink/25 text-ink hover:border-ink"}`}
          >
            {format(n)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Money({ id, label, value, onChange, prefix, suffix, step }: { id: string; label: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string; step?: number }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium uppercase tracking-[0.12em] text-ink/60">{label}</label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-ink/50">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          step={step}
          min={0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`w-full rounded-xl border border-ink/20 bg-white py-3.5 text-lg text-ink focus:border-ink focus:outline-none ${prefix ? "pl-8" : "pl-4"} ${suffix ? "pr-20" : "pr-4"}`}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink/50">{suffix}</span>}
      </div>
    </div>
  );
}
