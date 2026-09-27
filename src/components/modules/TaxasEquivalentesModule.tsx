"use client";

import React, { useState, useEffect } from "react";
import { SharpCard } from "@/components/ui/SharpCard";
import { SharpInput } from "@/components/ui/SharpInput";
import { SharpSelect } from "@/components/ui/SharpSelect";
import { SharpButton } from "@/components/ui/SharpButton";
import { FormulaBox } from "@/components/ui/FormulaBox";
import { PeriodKey, CalculationResult, PERIODS } from "@/lib/types";
import { calcTaxasEquivalentes, TaxasEquivalentesOp } from "@/lib/financialEngine";
import { Calculator, RotateCcw } from "lucide-react";

interface TaxasEquivalentesModuleProps {
  onResultChange: (res: CalculationResult | null) => void;
}

const OP_OPTIONS = [
  { value: "eq_comp", label: "Equivalência de Taxa Composta Geral (Período A → Período B)" },
  { value: "mm", label: "Maior para Menor Composta (ex: Anual para Mensal via n)" },
  { value: "mM", label: "Menor para Maior Composta (ex: Mensal para Anual via n)" },
  { value: "ef", label: "Taxa Efetiva a partir da Taxa Nominal (i = ik / k)" },
  { value: "js_ef", label: "Taxa Efetiva no Juros Simples (a partir de taxa comercial ic)" },
  { value: "js_dc", label: "Taxa de Desconto Comercial Simples (a partir de taxa efetiva i)" },
];

export const TaxasEquivalentesModule: React.FC<TaxasEquivalentesModuleProps> = ({
  onResultChange,
}) => {
  const [op, setOp] = useState<TaxasEquivalentesOp>("eq_comp");
  const [ic, setIc] = useState<number>(12); // Taxa conhecida %
  const [i, setI] = useState<number>(10);
  const [ik, setIk] = useState<number>(18); // Taxa nominal %
  const [k, setK] = useState<number>(12); // Subperíodos
  const [n, setN] = useState<number>(12);

  const [icPeriod, setIcPeriod] = useState<PeriodKey>("yearly");
  const [iPeriod, setIPeriod] = useState<PeriodKey>("monthly");
  const [nPeriod, setNPeriod] = useState<PeriodKey>("monthly");
  const [outPeriod, setOutPeriod] = useState<PeriodKey>("monthly");

  const [localResult, setLocalResult] = useState<CalculationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const executeCalculation = () => {
    try {
      setErrorMsg("");
      const res = calcTaxasEquivalentes({
        op,
        ic,
        i,
        ik,
        k,
        n,
        icPeriod,
        iPeriod,
        nPeriod,
        outPeriod,
      });
      setLocalResult(res);
      onResultChange(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro no cálculo de taxa.";
      setErrorMsg(msg);
      setLocalResult(null);
      onResultChange(null);
    }
  };

  useEffect(() => {
    executeCalculation();
  }, [op, ic, i, ik, k, n, icPeriod, iPeriod, nPeriod, outPeriod]);

  const handleReset = () => {
    setIc(12);
    setI(10);
    setIk(18);
    setK(12);
    setN(12);
    setIcPeriod("yearly");
    setOutPeriod("monthly");
  };

  return (
    <div className="flex flex-col gap-6">
      <SharpCard highlightGold>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Taxas Equivalentes & Proporcionais
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Conversão entre diferentes periodicidades no regime composto e juros simples.
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
            label="Tipo de Conversão de Taxa"
            options={OP_OPTIONS}
            value={op}
            onChange={(val) => setOp(val as TaxasEquivalentesOp)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {op === "eq_comp" && (
            <>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Taxa Conhecida (ic %) e Período de Origem
                </label>
                <div className="flex items-stretch border border-slate-300 bg-white">
                  <input
                    type="number"
                    step="any"
                    value={ic}
                    onChange={(e) => setIc(Number(e.target.value))}
                    className="flex-1 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-hidden"
                    style={{ borderRadius: "0px" }}
                  />
                  <span className="px-2 py-2 text-xs bg-slate-50 border-l border-slate-200 text-slate-600">
                    %
                  </span>
                  <select
                    value={icPeriod}
                    onChange={(e) => setIcPeriod(e.target.value as PeriodKey)}
                    className="border-l border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
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

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Converter Para Período de Destino:
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
            </>
          )}

          {(op === "mm" || op === "mM") && (
            <>
              <SharpInput
                label="Taxa Conhecida (ic %)"
                suffix="%"
                value={ic}
                onChange={setIc}
                placeholder="12.0"
              />
              <SharpInput
                label="Fator de Períodos (n)"
                value={n}
                onChange={setN}
                placeholder="12"
                helperText="Quantidade de subperíodos na conversão"
              />
            </>
          )}

          {op === "ef" && (
            <>
              <SharpInput
                label="Taxa Nominal Anunciada (ik %)"
                suffix="%"
                value={ik}
                onChange={setIk}
                placeholder="18.0"
              />
              <SharpInput
                label="Períodos de Capitalização (k)"
                value={k}
                onChange={setK}
                placeholder="12"
                helperText="Ex: 12 para capitalização mensal ao ano"
              />
            </>
          )}

          {op === "js_ef" && (
            <>
              <SharpInput
                label="Taxa Comercial Conhecida (ic %)"
                suffix="%"
                value={ic}
                onChange={setIc}
                periodKey={icPeriod}
                onPeriodChange={setIcPeriod}
                placeholder="3.0"
              />
              <SharpInput
                label="Tempo de Antecipação (n)"
                value={n}
                onChange={setN}
                periodKey={nPeriod}
                onPeriodChange={setNPeriod}
                placeholder="2"
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
                placeholder="3.0"
              />
              <SharpInput
                label="Tempo Decorrido (n)"
                value={n}
                onChange={setN}
                periodKey={nPeriod}
                onPeriodChange={setNPeriod}
                placeholder="2"
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
            Calcular Taxa
          </SharpButton>
        </div>
      </SharpCard>

      {localResult && (
        <SharpCard>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resultado de Equivalência • {localResult.title}
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

            <FormulaBox formula={localResult.formulaUsed} />
          </div>
        </SharpCard>
      )}
    </div>
  );
};
