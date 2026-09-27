"use client";

import React, { useState, useEffect } from "react";
import { SharpCard } from "@/components/ui/SharpCard";
import { SharpInput } from "@/components/ui/SharpInput";
import { SharpSelect } from "@/components/ui/SharpSelect";
import { SharpButton } from "@/components/ui/SharpButton";
import { FormulaBox } from "@/components/ui/FormulaBox";
import { PeriodKey, CalculationResult, PERIODS } from "@/lib/types";
import { calcJurosSimples, JurosSimplesOp } from "@/lib/financialEngine";
import { Calculator, RotateCcw } from "lucide-react";

interface JurosSimplesModuleProps {
  onResultChange: (res: CalculationResult | null) => void;
}

const OP_OPTIONS = [
  { value: "vp", label: "Calcular Capital Inicial (VP)" },
  { value: "vf", label: "Calcular Montante Final (VF)" },
  { value: "j", label: "Calcular Juros Totais (J)" },
  { value: "i", label: "Calcular Taxa de Juros (i)" },
  { value: "n", label: "Calcular Período de Tempo (n)" },
];

export const JurosSimplesModule: React.FC<JurosSimplesModuleProps> = ({ onResultChange }) => {
  const [op, setOp] = useState<JurosSimplesOp>("vf");
  const [vp, setVp] = useState<number>(10000);
  const [vf, setVf] = useState<number>(12400);
  const [i, setI] = useState<number>(2);
  const [n, setN] = useState<number>(12);

  const [iPeriod, setIPeriod] = useState<PeriodKey>("monthly");
  const [nPeriod, setNPeriod] = useState<PeriodKey>("monthly");
  const [outPeriod, setOutPeriod] = useState<PeriodKey>("monthly");

  const [localResult, setLocalResult] = useState<CalculationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const executeCalculation = () => {
    try {
      setErrorMsg("");
      const res = calcJurosSimples({
        op,
        vp,
        vf,
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
  }, [op, vp, vf, i, n, iPeriod, nPeriod, outPeriod]);

  const handleReset = () => {
    setVp(10000);
    setVf(12400);
    setI(2);
    setN(12);
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
              Regime de Juros Simples (Capitalização Linear)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              No regime simples, os juros são gerados estritamente sobre o principal (VP).
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

        {/* Operation Selector */}
        <div className="mb-6">
          <SharpSelect
            label="Operação Desejada"
            options={OP_OPTIONS}
            value={op}
            onChange={(val) => setOp(val as JurosSimplesOp)}
            helperText="Escolha a variável que deseja encontrar"
          />
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* VF needed when finding VP, i, n */}
          {(op === "vp" || op === "i" || op === "n") && (
            <SharpInput
              label="Montante Final (VF)"
              prefix="R$"
              value={vf}
              onChange={setVf}
              placeholder="Ex: 12400.00"
            />
          )}

          {/* VP needed when finding VF, J, i, n */}
          {(op === "vf" || op === "j" || op === "i" || op === "n") && (
            <SharpInput
              label="Capital Inicial (VP)"
              prefix="R$"
              value={vp}
              onChange={setVp}
              placeholder="Ex: 10000.00"
            />
          )}

          {/* Taxa i needed when finding VP, VF, J, n */}
          {op !== "i" && (
            <SharpInput
              label="Taxa de Juros (i)"
              suffix="%"
              value={i}
              onChange={setI}
              periodKey={iPeriod}
              onPeriodChange={setIPeriod}
              placeholder="Ex: 2.0"
              helperText="Valor percentual e seu período de incidência"
            />
          )}

          {/* Tempo n needed when finding VP, VF, J, i */}
          {op !== "n" && (
            <SharpInput
              label="Tempo Decorrido (n)"
              value={n}
              onChange={setN}
              periodKey={nPeriod}
              onPeriodChange={setNPeriod}
              placeholder="Ex: 12"
              helperText="Número de períodos e sua unidade de medida"
            />
          )}

          {/* Output Period for i or n */}
          {(op === "i" || op === "n") && (
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

        {/* Calculate button for explicit action */}
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

      {/* Result Card & Details */}
      {localResult && (
        <SharpCard>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Relatório de Saída • {localResult.title}
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
              description="Ajuste de proporcionalidade linear aplicado aos períodos selecionados de taxa e tempo."
            />
          </div>
        </SharpCard>
      )}
    </div>
  );
};
