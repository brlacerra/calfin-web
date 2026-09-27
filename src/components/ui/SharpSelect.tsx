import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SharpSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  helperText?: string;
}

export const SharpSelect: React.FC<SharpSelectProps> = ({
  label,
  options,
  value,
  onChange,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </label>
        {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}
      </div>

      <div className="border border-slate-300 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 bg-white">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm font-medium text-slate-900 bg-white focus:outline-hidden cursor-pointer"
          style={{ borderRadius: "0px" }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
