import React from "react";
import { BookOpen } from "lucide-react";

interface FormulaBoxProps {
  title?: string;
  formula: string;
  description?: string;
}

export const FormulaBox: React.FC<FormulaBoxProps> = ({
  title = "Fórmula Aplicada",
  formula,
  description,
}) => {
  return (
    <div
      className="p-3.5 bg-slate-50 border border-slate-200 border-l-2 border-l-amber-500 text-xs text-slate-700"
      style={{ borderRadius: "0px" }}
    >
      <div className="flex items-center gap-1.5 text-amber-800 font-semibold mb-1 text-[11px] uppercase tracking-wider">
        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
        <span>{title}</span>
      </div>
      <div className="font-mono text-slate-900 bg-white px-3 py-2 border border-slate-200 my-1 font-semibold select-all">
        {formula}
      </div>
      {description && <p className="text-[11px] text-slate-500 mt-1">{description}</p>}
    </div>
  );
};
