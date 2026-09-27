"use client";

import React, { useState, useEffect } from "react";
import { SharpCard } from "@/components/ui/SharpCard";
import { SharpInput } from "@/components/ui/SharpInput";
import { SharpButton } from "@/components/ui/SharpButton";
import { FormulaBox } from "@/components/ui/FormulaBox";
import { CalculationResult, VplAnalysis } from "@/lib/types";
import { calcVpl } from "@/lib/financialEngine";
import { formatMoney, formatNumber } from "@/lib/formatters";
import { Calculator, CheckCircle2, XCircle, RotateCcw, Sparkles } from "lucide-react";

interface VplModuleProps {
  onResultChange: (res: CalculationResult | null) => void;
}

export const VplModule: React.FC<VplModuleProps> = ({ onResultChange }) => {
  const [investimento, setInvestimento] = useState<number>(50000);
  const [taxa, setTaxa] = useState<number>(10);
  const [n, setN] = useState<number>(5);
  const [fluxosRaw, setFluxosRaw] = useState<string>("15000, 18000, 20000, 22000, 25000");

  const [temVr, setTemVr] = useState<boolean>(false);
  const [vr, setVr] = useState<number>(8000);
  const [periodoVr, setPeriodoVr] = useState<number>(5);

  const [analysis, setAnalysis] = useState<VplAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const parseFluxos = (raw: string): number[] => {
    return raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => Number(x.replace(/\s+/g, "")));
  };

  const executeCalculation = () => {
    try {
      setErrorMsg("");
      const fluxos = parseFluxos(fluxosRaw);

      if (fluxos.some(isNaN)) {
        throw new Error("Fluxos de caixa contêm valores não numéricos inválidos.");
      }

      if (fluxos.length !== n) {
        throw new Error(
          `Foram informados ${fluxos.length} fluxo(s), mas o número de períodos n é ${n}. Preencha ${n} valores separados por vírgula.`
        );
      }

      const res = calcVpl({
        investimentoInicial: investimento,
        taxaPercent: taxa,
        n,
        fluxos,
        temVr,
        vr: temVr ? vr : undefined,
        periodoVr: temVr ? periodoVr : undefined,
      });

      setAnalysis(res);

      onResultChange({
        title: "Valor Presente Líquido (VPL)",
        primaryValue: res.vplFormatted,
        primaryRaw: res.vpl,
        formattedText: `VPL = ${res.vplFormatted} | ${
          res.vpl >= 0 ? "Projeto Viável (Aceitar)" : "Projeto Inviável (Recusar)"
        }`,
        formulaUsed: "VPL = -I_0 + Σ [FC_j / (1 + i)^j] + [VR / (1 + i)^k]",
        details: [
          { label: "Investimento Inicial", value: formatMoney(investimento) },
          { label: "Total Descontado", value: formatMoney(res.totalDescontado) },
          {
            label: "Parecer",
            value: res.parecer === "aceitar" ? "ACEITAR PROJETO" : "RECUSAR PROJETO",
          },
        ],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro no cálculo de VPL.";
      setErrorMsg(msg);
      setAnalysis(null);
      onResultChange(null);
    }
  };

  useEffect(() => {
    executeCalculation();
  }, [investimento, taxa, n, fluxosRaw, temVr, vr, periodoVr]);

  const applyPresetUniform = () => {
    setInvestimento(60000);
    setTaxa(12);
    setN(4);
    setFluxosRaw("22000, 22000, 22000, 22000");
    setTemVr(false);
  };

  const applyPresetExpansion = () => {
    setInvestimento(100000);
    setTaxa(10);
    setN(5);
    setFluxosRaw("25000, 30000, 35000, 40000, 45000");
    setTemVr(true);
    setVr(15000);
    setPeriodoVr(5);
  };

  const handleReset = () => {
    setInvestimento(50000);
    setTaxa(10);
    setN(5);
    setFluxosRaw("15000, 18000, 20000, 22000, 25000");
    setTemVr(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <SharpCard highlightGold>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              VPL - Valor Presente Líquido (Engenharia Econômica)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Análise de viabilidade econômico-financeira de fluxos de caixa descontados e valor residual.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SharpButton
              variant="outline-gold"
              size="sm"
              onClick={applyPresetUniform}
              icon={<Sparkles className="w-3 h-3 text-amber-600" />}
            >
              Preset Anuidade
            </SharpButton>
            <SharpButton
              variant="outline-gold"
              size="sm"
              onClick={applyPresetExpansion}
              icon={<Sparkles className="w-3 h-3 text-amber-600" />}
            >
              Preset Expansão
            </SharpButton>
            <SharpButton
              variant="secondary"
              size="sm"
              onClick={handleReset}
              icon={<RotateCcw className="w-3 h-3 text-slate-500" />}
            >
              Redefinir
            </SharpButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <SharpInput
            label="Investimento Inicial (I₀)"
            prefix="R$"
            value={investimento}
            onChange={setInvestimento}
            placeholder="50000.00"
          />

          <SharpInput
            label="Taxa de Desconto / TMA (i %)"
            suffix="%"
            value={taxa}
            onChange={setTaxa}
            placeholder="10.0"
            helperText="Taxa Mínima de Atratividade por período"
          />

          <SharpInput
            label="Número de Períodos (n)"
            value={n}
            onChange={(val) => {
              const newN = Math.max(1, Math.floor(val));
              setN(newN);
              // auto adjust template if needed
              const parts = parseFluxos(fluxosRaw);
              if (parts.length < newN) {
                const diff = newN - parts.length;
                const last = parts.length ? parts[parts.length - 1] : 10000;
                const updated = [...parts, ...Array(diff).fill(last)];
                setFluxosRaw(updated.join(", "));
              }
            }}
            placeholder="5"
          />
        </div>

        {/* Cash Flows input textarea */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Fluxos de Caixa Líquidos (separados por vírgula)
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {parseFluxos(fluxosRaw).length} de {n} preenchidos
            </span>
          </div>
          <textarea
            rows={2}
            value={fluxosRaw}
            onChange={(e) => setFluxosRaw(e.target.value)}
            placeholder="Ex: 15000, 18000, 20000, 22000, 25000"
            className="w-full px-3 py-2 text-sm font-mono border border-slate-300 focus:border-amber-500 focus:outline-hidden bg-white text-slate-900"
            style={{ borderRadius: "0px" }}
          />
          <span className="text-[11px] text-slate-400">
            Informe exatamente {n} valores positivos (entradas) ou negativos (saídas), separados por vírgula.
          </span>
        </div>

        {/* Residual Value Row */}
        <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={temVr}
              onChange={(e) => setTemVr(e.target.checked)}
              className="w-4 h-4 accent-amber-600 cursor-pointer"
            />
            <span>Considerar Valor Residual (VR ao fim do projeto)</span>
          </label>

          {temVr && (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SharpInput
                label="Valor Residual (VR)"
                prefix="R$"
                value={vr}
                onChange={setVr}
                placeholder="8000.00"
              />
              <SharpInput
                label="Período de Ocorrência do VR"
                value={periodoVr}
                onChange={setPeriodoVr}
                placeholder="5"
              />
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
            Calcular VPL
          </SharpButton>
        </div>
      </SharpCard>

      {/* Analysis Output & Decision Verdict */}
      {analysis && (
        <SharpCard>
          <div className="flex flex-col gap-6">
            {/* Recommendation Banner */}
            <div
              className={`p-4 border flex items-center justify-between gap-4 ${
                analysis.parecer === "aceitar"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : analysis.parecer === "recusar"
                  ? "bg-rose-50 border-rose-300 text-rose-900"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                {analysis.parecer === "aceitar" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    {analysis.parecer === "aceitar"
                      ? "PROJETO ECONOMICAMENTE VIÁVEL — RECOMENDAÇÃO: ACEITAR"
                      : "PROJETO ECONOMICAMENTE INVIÁVEL — RECOMENDAÇÃO: RECUSAR"}
                  </h3>
                  <p className="text-xs mt-0.5 opacity-90">{analysis.parecerTexto}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                  VPL Calculado
                </span>
                <span className="text-xl font-extrabold font-mono">{analysis.vplFormatted}</span>
              </div>
            </div>

            {/* Financial Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Investimento Inicial
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {formatMoney(analysis.investimentoInicial)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Soma dos Fluxos Descontados
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {formatMoney(analysis.totalDescontado)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Payback Simples
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {analysis.paybackSimples !== null
                    ? `${formatNumber(analysis.paybackSimples, 2)} períodos`
                    : "Não recupera"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Payback Descontado
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {analysis.paybackDescontado !== null
                    ? `${formatNumber(analysis.paybackDescontado, 2)} períodos`
                    : "Não recupera"}
                </span>
              </div>
            </div>

            {/* Cash Flow Table */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Demonstrativo de Desconto de Fluxos de Caixa (DFC)
              </h4>
              <div className="overflow-x-auto border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5 text-center border-r border-slate-200">Período (j)</th>
                      <th className="p-2.5 text-right border-r border-slate-200">Fluxo Nominal (FC)</th>
                      <th className="p-2.5 text-right border-r border-slate-200 bg-amber-50 text-amber-900">
                        Fluxo Descontado (PV)
                      </th>
                      <th className="p-2.5 text-right">Saldo Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr className="bg-slate-50 text-slate-500">
                      <td className="p-2 text-center border-r border-slate-200 font-bold">0</td>
                      <td className="p-2 text-right border-r border-slate-200 text-rose-700">
                        -{formatMoney(investimento)}
                      </td>
                      <td className="p-2 text-right border-r border-slate-200 text-rose-700">
                        -{formatMoney(investimento)}
                      </td>
                      <td className="p-2 text-right text-rose-700">-{formatMoney(investimento)}</td>
                    </tr>
                    {analysis.fluxosTabela.map((row) => (
                      <tr key={row.periodo} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2 text-center border-r border-slate-200 font-semibold">
                          {row.periodo}
                        </td>
                        <td className="p-2 text-right border-r border-slate-200">
                          {formatMoney(row.fluxo)}
                        </td>
                        <td className="p-2 text-right border-r border-slate-200 bg-amber-50/50 text-amber-900 font-semibold">
                          {formatMoney(row.descontado)}
                        </td>
                        <td
                          className={`p-2 text-right font-semibold ${
                            row.acumulado >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {formatMoney(row.acumulado)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <FormulaBox
              formula="VPL = -I_0 + Σ [ FC_j / (1 + TMA)^j ] + [ VR / (1 + TMA)^k ]"
              description="Um VPL positivo indica que o projeto remunera o capital acima da Taxa Mínima de Atratividade (TMA), gerando riqueza líquida para a empresa."
            />
          </div>
        </SharpCard>
      )}
    </div>
  );
};
