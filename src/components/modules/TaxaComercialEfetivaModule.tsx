"use client";

import React, { useState, useEffect } from "react";
import { SharpCard } from "@/components/ui/SharpCard";
import { SharpInput } from "@/components/ui/SharpInput";
import { SharpSelect } from "@/components/ui/SharpSelect";
import { SharpButton } from "@/components/ui/SharpButton";
import { FormulaBox } from "@/components/ui/FormulaBox";
import { PeriodKey, CalculationResult } from "@/lib/types";
import { calcTec, TecOp } from "@/lib/financialEngine";
import { Calculator, RotateCcw } from "lucide-react";

interface TaxaComercialEfetivaModuleProps {
  onResultChange: (res: CalculationResult | null) => void;
}

const OP_OPTIONS = [
  {
    value: "js_ef",
    label: "Desconto Comercial → Taxa Efetiva Real (Juros Simples)",
  },
  {
    value: "js_dc",
    label: "Taxa Efetiva → Taxa de Desconto Comercial (Juros Simples)",
  },
  {
    value: "jc_ef",
    label: "Taxa Nominal Anual → Taxa Efetiva por Período (Composta)",
  },
];

export const TaxaComercialEfetivaModule: React.FC<TaxaComercialEfetivaModuleProps> = ({
  onResultChange,
}) => {
  const [op, setOp] = useState<TecOp>("js_ef");
  const [ic, setIc] = useState<number>(3.5);
  const [i, setI] = useState<number>(3.627);
  const [ik, setIk] = useState<number>(18);
  const [k, setK] = useState<number>(12);
  const [n, setN] = useState<number>(3);

  const [icPeriod, setIcPeriod] = useState<PeriodKey>("monthly");
  const [iPeriod, setIPeriod] = useState<PeriodKey>("monthly");
  const [nPeriod, setNPeriod] = useState<PeriodKey>("monthly");

  const [localResult, setLocalResult] = useState<CalculationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const executeCalculation = () => {
    try {
      setErrorMsg("");
      const res = calcTec({
        op,
        ic,
        i,
        ik,
        k,
        n,
        icPeriod,
        iPeriod,
        nPeriod,
      });
      setLocalResult(res);
      onResultChange(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro no cálculo.";
      setErrorMsg(msg);
      setLocalResult(null);
      onResultChange(null);
    }
  };

  useEffect(() => {
    executeCalculation();
  }, [op, ic, i, ik, k, n, icPeriod, iPeriod, nPeriod]);

  const handleReset = () => {
    setIc(3.5);
    setI(3.627);
    setIk(18);
    setK(12);
    setN(3);
  };

  return (
    <div className="flex flex-col gap-6">
      <SharpCard highlightGold>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Taxa Comercial vs Taxa Efetiva
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identificação da taxa de custo efetivo real (CET) frente à taxa aparente de desconto.
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

        <div className="mb-6">
          <SharpSelect
            label="Relação de Taxas"
            options={OP_OPTIONS}
            value={op}
            onChange={(val) => setOp(val as TecOp)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {op === "js_ef" && (
            <>
              <SharpInput
                label="Taxa Comercial de Desconto (ic %)"
                suffix="%"
                value={ic}
                onChange={setIc}
                periodKey={icPeriod}
                onPeriodChange={setIcPeriod}
                placeholder="3.5"
              />
              <SharpInput
                label="Prazo de Antecipação (n)"
                value={n}
                onChange={setN}
                periodKey={nPeriod}
                onPeriodChange={setNPeriod}
                placeholder="3"
              />
            </>
          )}

          {op === "js_dc" && (
            <>
              <SharpInput
                label="Taxa Efetiva de Juros (i %)"
                suffix="%"
                value={i}
                onChange={setI}
                periodKey={iPeriod}
                onPeriodChange={setIPeriod}
                placeholder="3.627"
              />
              <SharpInput
                label="Prazo da Operação (n)"
                value={n}
                onChange={setN}
                periodKey={nPeriod}
                onPeriodChange={setNPeriod}
                placeholder="3"
              />
            </>
          )}

          {op === "jc_ef" && (
            <>
              <SharpInput
                label="Taxa Nominal Anunciada (ik %)"
                suffix="%"
                value={ik}
                onChange={setIk}
                placeholder="18.0"
              />
              <SharpInput
                label="Número de Capitalizações no Período (k)"
                value={k}
                onChange={setK}
                placeholder="12"
                helperText="Ex: 12 para capitalizações mensais em 1 ano"
              />
            </>
          )}
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
            Calcular
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
              description="A taxa efetiva real sempre é superior à taxa comercial de desconto para um mesmo período e valor nominal."
            />
          </div>
        </SharpCard>
      )}
    </div>
  );
};
