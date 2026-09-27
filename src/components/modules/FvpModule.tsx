"use client";

import React, { useState, useEffect } from "react";
import { SharpCard } from "@/components/ui/SharpCard";
import { SharpInput } from "@/components/ui/SharpInput";
import { SharpButton } from "@/components/ui/SharpButton";
import { FormulaBox } from "@/components/ui/FormulaBox";
import { CalculationResult } from "@/lib/types";
import { calcFvp } from "@/lib/financialEngine";
import { Calculator, RotateCcw } from "lucide-react";

interface FvpModuleProps {
  onResultChange: (res: CalculationResult | null) => void;
}

export const FvpModule: React.FC<FvpModuleProps> = ({ onResultChange }) => {
  const [n, setN] = useState<number>(24);
  const [iPercent, setIPercent] = useState<number>(1.5);
  const [vp, setVp] = useState<number>(50000);
  const [mult, setMult] = useState<number>(1);

  const [localResult, setLocalResult] = useState<CalculationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const executeCalculation = () => {
    try {
      setErrorMsg("");
      const res = calcFvp({ n, iPercent, vp, mult });
      setLocalResult(res);
      onResultChange(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro no cálculo FVP.";
      setErrorMsg(msg);
      setLocalResult(null);
      onResultChange(null);
    }
  };

  useEffect(() => {
    executeCalculation();
  }, [n, iPercent, vp, mult]);

  const handleReset = () => {
    setN(24);
    setIPercent(1.5);
    setVp(50000);
    setMult(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <SharpCard highlightGold>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              FVP - Fator de Valor Presente (Sistema Francês / Tabela Price)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cálculo do coeficiente de financiamento e prestação constante uniforme (PMT).
            </p>
          </div>
          <SharpButton
            variant="secondary"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="w-3 h-3 text-slate-500" />}
          >
            Redefinir
          </SharpButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <SharpInput
            label="Nº de Parcelas (n)"
            value={n}
            onChange={(val) => setN(Math.max(1, Math.floor(val)))}
            placeholder="24"
          />

          <SharpInput
            label="Taxa Periódica (i %)"
            suffix="%"
            value={iPercent}
            onChange={setIPercent}
            placeholder="1.5"
            helperText="Taxa efetiva por período de amortização"
          />

          <SharpInput
            label="Valor Presente (VP)"
            prefix="R$"
            value={vp}
            onChange={setVp}
            placeholder="50000.00"
          />

          <SharpInput
            label="Multiplicar por (mult)"
            value={mult}
            onChange={setMult}
            placeholder="1"
            helperText="Fator multiplicador do FVP"
          />
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <SharpButton
            variant="primary"
            onClick={executeCalculation}
            icon={<Calculator className="w-4 h-4" />}
          >
            Calcular FVP & PMT
          </SharpButton>
        </div>
      </SharpCard>

      {localResult && (
        <SharpCard>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resultado • {localResult.title}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                {localResult.primaryValue}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {localResult.details?.map((det, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    {det.label}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                    {det.value}
                  </span>
                </div>
              ))}
            </div>

            <FormulaBox
              formula={localResult.formulaUsed}
              description="O inverso do FVP representa o coeficiente de financiamento que multiplicado pelo VP fornece o valor da prestação Price."
            />
          </div>
        </SharpCard>
      )}
    </div>
  );
};
