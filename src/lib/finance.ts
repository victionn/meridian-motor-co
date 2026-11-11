export type RepaymentInput = {
  price: number;
  deposit: number;
  balloon?: number;
  annualRatePct: number;
  termMonths: number;
};

export type RepaymentResult = {
  principal: number;
  monthly: number;
  weekly: number;
  totalRepaid: number;
  totalInterest: number;
};

/** Standard amortising loan with optional balloon (residual) at end of term. */
export function calculateRepayments({
  price,
  deposit,
  balloon = 0,
  annualRatePct,
  termMonths,
}: RepaymentInput): RepaymentResult {
  const principal = Math.max(price - deposit, 0);
  const n = Math.max(Math.round(termMonths), 1);
  const r = annualRatePct / 100 / 12;
  const b = Math.min(Math.max(balloon, 0), principal);

  const monthly =
    r === 0
      ? (principal - b) / n
      : ((principal - b / Math.pow(1 + r, n)) * r) / (1 - Math.pow(1 + r, -n));

  const totalRepaid = monthly * n + b;
  return {
    principal,
    monthly,
    weekly: (monthly * 12) / 52,
    totalRepaid,
    totalInterest: totalRepaid - principal,
  };
}
