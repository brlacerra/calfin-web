"use client";

import React, { useState, useEffect } from "react";
import { SharpCard } from "@/components/ui/SharpCard";
import { SharpInput } from "@/components/ui/SharpInput";
import { SharpSelect } from "@/components/ui/SharpSelect";
import { SharpButton } from "@/components/ui/SharpButton";
import { FormulaBox } from "@/components/ui/FormulaBox";
import { CalculationResult, SacRow } from "@/lib/types";
import { calcSac, generateSacSchedule, SacOp } from "@/lib/financialEngine";
import { formatMoney } from "@/lib/formatters";
import { Calculator, Download, Table as TableIcon, RotateCcw } from "lucide-react";

interface SacModuleProps {
  onResultChange: (res: CalculationResult | null) => void;
}

const OP_OPTIONS = [
  { value: "pmt", label: "Calcular Prestação Específica (PMT_t)" },
  { value: "amort", label: "Calcular Amortização Constante (A)" },
  { value: "j", label: "Calcular Juros da Prestação (J_t)" },
  { value: "sd", label: "Calcular Saldo Devedor Remanescente (SD_t)" },
];

export const SacModule: React.FC<SacModuleProps> = ({ onResultChange }) => {
  const [op, setOp] = useState<SacOp>("pmt");
  const [vp, setVp] = useState<number>(120000);
  const [n, setN] = useState<number>(12);
  const [i, setI] = useState<number>(1.2);
  const [t, setT] = useState<number>(1);

  const [localResult, setLocalResult] = useState<CalculationResult | null>(null);
  const [schedule, setSchedule] = useState<SacRow[]>([]);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const executeCalculation = () => {
    try {
      setErrorMsg("");
      const res = calcSac({
        op,
        vp,
        n,
        i,
        t,
      });
      setLocalResult(res);
      onResultChange(res);

      const table = generateSacSchedule(vp, n, i);
      setSchedule(table);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro no cálculo SAC.";
      setErrorMsg(msg);
      setLocalResult(null);
      onResultChange(null);
    }
  };

  useEffect(() => {
    executeCalculation();
  }, [op, vp, n, i, t]);

  const handleReset = () => {
    setVp(120000);
    setN(12);
    setI(1.2);
    setT(1);
  };

  const exportCsv = () => {
    if (!schedule.length) return;
    const headers = "Parcela;Saldo Devedor Inicial;Amortizacao;Juros;Prestacao PMT;Saldo Devedor Final\n";
    const rows = schedule
      .map(
        (r) =>
          `${r.periodo};${r.saldoDevedorInicial.toFixed(2)};${r.amortizacao.toFixed(2)};${r.juros.toFixed(2)};${r.prestacao.toFixed(2)};${r.saldoDevedorFinal.toFixed(2)}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `planilha_sac_${vp}_${n}meses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalJuros = schedule.reduce((acc, row) => acc + row.juros, 0);
  const totalPago = schedule.reduce((acc, row) => acc + row.prestacao, 0);

  return (
    <div className="flex flex-col gap-6">
      <SharpCard highlightGold>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              SAC - Sistema de Amortização Constante
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Amortização fixa em todas as parcelas ($A = VP / n$). Prestações e juros decrescentes.
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
            onChange={(val) => setOp(val as SacOp)}
            helperText="Escolha a métrica da prestação t ou amortização geral"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <SharpInput
            label="Valor Financiado (VP)"
            prefix="R$"
            value={vp}
            onChange={setVp}
            placeholder="120000.00"
          />

          <SharpInput
            label="Nº de Parcelas (n)"
            value={n}
            onChange={(val) => setN(Math.max(1, Math.floor(val)))}
            placeholder="12"
          />

          <SharpInput
            label="Taxa de Juros (i %)"
            suffix="%"
            value={i}
            onChange={setI}
            placeholder="1.2"
            helperText="Taxa ao mês"
          />

          <SharpInput
            label="Nº da Prestação (t)"
            value={t}
            onChange={(val) => setT(Math.min(n, Math.max(1, Math.floor(val))))}
            placeholder="1"
            helperText={`Entre 1 e ${n}`}
          />
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <SharpButton
            variant="secondary"
            size="sm"
            onClick={() => setShowTable(!showTable)}
            icon={<TableIcon className="w-3.5 h-3.5" />}
          >
            {showTable ? "Ocultar Planilha Completa" : "Ver Planilha SAC Completa"}
          </SharpButton>

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
              description="No SAC, o saldo devedor decresce uniformemente à razão de (VP/n) por período."
            />
          </div>
        </SharpCard>
      )}

      {/* Complete Amortization Schedule Table */}
      {showTable && schedule.length > 0 && (
        <SharpCard>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Planilha Completa de Evolução SAC
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total de Juros: <strong className="text-amber-700">{formatMoney(totalJuros)}</strong> | 
                Custo Efetivo Total Pago: <strong className="text-slate-900">{formatMoney(totalPago)}</strong>
              </p>
            </div>
            <SharpButton
              variant="outline-gold"
              size="sm"
              onClick={exportCsv}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Exportar CSV
            </SharpButton>
          </div>

          <div className="overflow-x-auto max-h-96 border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-300 z-10">
                <tr>
                  <th className="p-2.5 text-center border-r border-slate-200">nº (t)</th>
                  <th className="p-2.5 text-right border-r border-slate-200">Saldo Inicial</th>
                  <th className="p-2.5 text-right border-r border-slate-200 bg-amber-50/70 text-amber-900">Amortização</th>
                  <th className="p-2.5 text-right border-r border-slate-200">Juros</th>
                  <th className="p-2.5 text-right border-r border-slate-200 font-extrabold text-slate-900">Prestação (PMT)</th>
                  <th className="p-2.5 text-right">Saldo Devedor Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {schedule.map((row) => {
                  const isCurrent = row.periodo === t;
                  return (
                    <tr
                      key={row.periodo}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrent ? "bg-amber-100/60 font-bold text-amber-900" : ""
                      }`}
                    >
                      <td className="p-2 text-center border-r border-slate-200 font-semibold">
                        {row.periodo}
                      </td>
                      <td className="p-2 text-right border-r border-slate-200 text-slate-600">
                        {formatMoney(row.saldoDevedorInicial)}
                      </td>
                      <td className="p-2 text-right border-r border-slate-200 bg-amber-50/40 text-amber-900 font-semibold">
                        {formatMoney(row.amortizacao)}
                      </td>
                      <td className="p-2 text-right border-r border-slate-200 text-rose-700">
                        {formatMoney(row.juros)}
                      </td>
                      <td className="p-2 text-right border-r border-slate-200 font-bold text-slate-900">
                        {formatMoney(row.prestacao)}
                      </td>
                      <td className="p-2 text-right text-slate-600">
                        {formatMoney(row.saldoDevedorFinal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SharpCard>
      )}
    </div>
  );
};
