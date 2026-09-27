"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Activity, RefreshCw } from "lucide-react";
import { CalculationResult } from "@/lib/types";

interface MarketRates {
  selic: number;
  cdi: number;
  ipca: number;
  dolar: number;
  dolarPct: number;
  source: "live" | "fallback";
  updatedAt: string;
}

interface VisorDisplayProps {
  activeModuleTitle: string;
  activeOpLabel?: string;
  result: CalculationResult | null;
  onClear?: () => void;
}

export const VisorDisplay: React.FC<VisorDisplayProps> = ({
  activeModuleTitle,
  activeOpLabel,
  result,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const [rates, setRates] = useState<MarketRates>({
    selic: 11.25,
    cdi: 11.15,
    ipca: 3.93,
    dolar: 5.42,
    dolarPct: 0.0,
    source: "fallback",
    updatedAt: "--:--",
  });
  const [loadingRates, setLoadingRates] = useState(false);

  const fetchRates = async () => {
    try {
      setLoadingRates(true);
      const res = await fetch("/api/market-rates");
      if (res.ok) {
        const data = await res.json();
        setRates(data);
      }
    } catch {
      // Keep existing rates
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000); // 60s auto refresh
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${result.title}: ${result.primaryValue} (${result.formattedText})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col border border-slate-200 bg-white mb-6 shadow-xs">
      {/* Top Financial Ticker Bar with Live API Integration */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-mono py-1.5 px-4 flex items-center justify-between border-b border-slate-800 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>calFin Live</span>
          </div>

          <span
            className={`px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              rates.source === "live"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 inline-block ${
                rates.source === "live" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            ></span>
            {rates.source === "live" ? "API EM TEMPO REAL" : "OFFLINE / LOCAL"}
          </span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto text-[11px] whitespace-nowrap pl-4 no-scrollbar">
          <span className="flex items-center gap-1">
            <span className="text-slate-400">SELIC:</span>
            <span className="text-amber-400 font-semibold font-mono">
              {rates.selic.toFixed(2).replace(".", ",")}% a.a.
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-400">CDI:</span>
            <span className="text-amber-400 font-semibold font-mono">
              {rates.cdi.toFixed(2).replace(".", ",")}% a.a.
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-400">IPCA (12M):</span>
            <span className="text-slate-200 font-mono">
              {rates.ipca.toFixed(2).replace(".", ",")}%
            </span>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="text-slate-400">DÓLAR (USD/BRL):</span>
            <span className="text-slate-100 font-bold font-mono">
              R$ {rates.dolar.toFixed(4).replace(".", ",")}
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-1 ${
                rates.dolarPct >= 0
                  ? "text-emerald-400 bg-emerald-950/60"
                  : "text-rose-400 bg-rose-950/60"
              }`}
            >
              {rates.dolarPct >= 0 ? "+" : ""}
              {rates.dolarPct.toFixed(2).replace(".", ",")}%
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-400">BASE:</span>
            <span className="text-emerald-400 font-mono">360 DIAS</span>
          </span>

          <button
            onClick={fetchRates}
            disabled={loadingRates}
            title={`Atualizado às ${rates.updatedAt}. Clique para recarregar cotações.`}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-400 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loadingRates ? "animate-spin" : ""}`} />
            <span>{rates.updatedAt}</span>
          </button>
        </div>
      </div>

      {/* Main Visor Header */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/40 via-white to-white border-l-4 border-l-amber-500">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300">
              MODO FINANCEIRO
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {activeModuleTitle}
              {activeOpLabel ? ` › ${activeOpLabel}` : ""}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <div className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-slate-900 select-all">
              {result ? result.primaryValue : "—"}
            </div>
            {result?.title && (
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                ({result.title})
              </span>
            )}
          </div>

          {result?.formulaUsed && (
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              Fórmula: <span className="text-slate-800 font-semibold">{result.formulaUsed}</span>
            </div>
          )}
        </div>

        {/* Visor Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          {result && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-amber-500 transition-colors cursor-pointer"
              title="Copiar resultado formatado"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          )}

          {onClear && (
            <button
              onClick={onClear}
              className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
