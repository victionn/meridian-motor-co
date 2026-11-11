"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Sort dropdown that updates the `sort` URL param (and resets to page 1) as soon as it changes. */
export function SortSelect({ value, options }: { value: string; options: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-ink/65">Sort by:</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === options[0].value) next.delete("sort");
          else next.set("sort", e.target.value);
          next.delete("page");
          const qs = next.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="rounded-xl border border-ink/25 bg-white py-2.5 pl-3 pr-8 font-medium text-ink focus:border-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
