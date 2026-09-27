import React from "react";
import { PERIODS, PeriodKey } from "@/lib/types";

interface SharpInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: number | string;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  periodKey?: PeriodKey;
  onPeriodChange?: (period: PeriodKey) => void;
  helperText?: string;
  error?: string;
}

export const SharpInput: React.FC<SharpInputProps> = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  periodKey,
  onPeriodChange,
  helperText,
  error,
  placeholder = "0.00",
  ...inputProps
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </label>
        {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}
      </div>

      <div className="flex items-stretch border border-slate-300 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 bg-white transition-colors">
        {prefix && (
          <span className="inline-flex items-center px-3 bg-slate-50 border-r border-slate-200 text-xs font-semibold text-slate-600 select-none">
            {prefix}
          </span>
        )}

        <input
          type="number"
          step="any"
          value={value === 0 && placeholder ? "" : value}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === "" ? 0 : Number(val));
          }}
          placeholder={placeholder}
          className="flex-1 w-full px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
          style={{ borderRadius: "0px" }}
          {...inputProps}
        />

        {suffix && (
          <span className="inline-flex items-center px-3 bg-slate-50 border-l border-slate-200 text-xs font-semibold text-slate-600 select-none">
            {suffix}
          </span>
        )}

        {periodKey && onPeriodChange && (
          <select
            value={periodKey}
            onChange={(e) => onPeriodChange(e.target.value as PeriodKey)}
            className="border-l border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-hidden cursor-pointer"
            style={{ borderRadius: "0px" }}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <span className="text-[11px] font-medium text-rose-600">{error}</span>}
    </div>
  );
};
