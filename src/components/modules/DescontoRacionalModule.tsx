"use client";

import React, { useState, useEffect } from "react";
import { SharpCard } from "@/components/ui/SharpCard";
import { SharpInput } from "@/components/ui/SharpInput";
import { SharpSelect } from "@/components/ui/SharpSelect";
import { SharpButton } from "@/components/ui/SharpButton";
import { FormulaBox } from "@/components/ui/FormulaBox";
import { PeriodKey, CalculationResult, PERIODS } from "@/lib/types";
import { calcDescontoRacional, DescontoRacionalOp } from "@/lib/financialEngine";
import { Calculator, RotateCcw } from "lucide-react";

interface DescontoRacionalModuleProps {
  onResultChange: (res: CalculationResult | null) => void;
}

const OP_OPTIONS = [
  { value: "a", label: "Calcular Valor Atual (A - Valor Efetivo)" },
  { value: "n", label: "Calcular Valor Nominal (N - Valor de Face)" },
  { value: "dr", label: "Calcular Desconto Racional (Dr)" },
  { value: "i", label: "Calcular Taxa Racional Efetiva (i)" },
  { value: "t", label: "Calcular Período de Antecipação (n)" },
];

export const DescontoRacionalModule: React.FC<DescontoRacionalModuleProps> = ({
  onResultChange,
}) => {
  const [op, setOp] = useState<DescontoRacionalOp>("a");
  const [nVal, setNVal] = useState<number>(20000);
  const [aVal, setAVal] = useState<number>(18119.53);
  const [i, setI] = useState<number>(2.5);
  const [n, setN] = useState<number>(4);

  const [iPeriod, setIPeriod] = useState<PeriodKey>("monthly");
  const [nPeriod, setNPeriod] = useState<PeriodKey>("monthly");
  const [outPeriod, setOutPeriod] = useState<PeriodKey>("monthly");

  const [localResult, setLocalResult] = useState<CalculationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const executeCalculation = () => {
    try {
      setErrorMsg("");
      const res = calcDescontoRacional({
        op,
        nVal,
        aVal,
        i,
        n,
        iPeriod,
        nPeriod,
        outPeriod,
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
  }, [op, nVal, aVal, i, n, iPeriod, nPeriod, outPeriod]);

  const handleReset = () => {
    setNVal(20000);
    setAVal(18119.53);
    setI(2.5);
    setN(4);
    setIPeriod("monthly");
    setNPeriod("monthly");
    setOutPeriod("monthly");
  };

  return (
    <div className="flex flex-col gap-6">
      <SharpCard highlightGold>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Desconto Racional Composto (Desconto "Por Dentro")
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              O abatimento é calculado sobre o valor real/atual (A), equivalente à capitalização composta inversa.
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
            label="Operação Desejada"
            options={OP_OPTIONS}
            value={op}
            onChange={(val) => setOp(val as DescontoRacionalOp)}
            helperText="Escolha a operação"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(op === "a" || op === "dr" || op === "i" || op === "t") && (
            <SharpInput
              label="Valor Nominal (N)"
              prefix="R$"
              value={nVal}
              onChange={setNVal}
              placeholder="Ex: 20000.00"
            />
          )}

          {(op === "n" || op === "i" || op === "t") && (
            <SharpInput
              label="Valor Atual (A)"
              prefix="R$"
              value={aVal}
              onChange={setAVal}
              placeholder="Ex: 18119.53"
            />
          )}

          {op !== "i" && (
            <SharpInput
              label="Taxa Efetiva de Desconto (i)"
              suffix="%"
              value={i}
              onChange={setI}
              periodKey={iPeriod}
              onPeriodChange={setIPeriod}
              placeholder="Ex: 2.5"
            />
          )}

          {op !== "t" && (
            <SharpInput
              label="Período de Antecipação (n)"
              value={n}
              onChange={setN}
              periodKey={nPeriod}
              onPeriodChange={setNPeriod}
              placeholder="Ex: 4"
            />
          )}

          {(op === "i" || op === "t") && (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                {op === "i" ? "Calcular Taxa Resultante em:" : "Calcular Tempo Resultante em:"}
              </label>
              <div className="border border-slate-300 bg-white">
                <select
                  value={outPeriod}
                  onChange={(e) => setOutPeriod(e.target.value as PeriodKey)}
                  className="w-full px-3 py-2 text-sm font-medium text-slate-900 bg-white focus:outline-hidden cursor-pointer"
                  style={{ borderRadius: "0px" }}
                >
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
            Recalcular
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
              description="Desconto racional justo: juros cobrados apenas sobre o capital efetivamente antecipado."
            />
          </div>
        </SharpCard>
      )}
    </div>
  );
};
