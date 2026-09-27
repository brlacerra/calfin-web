"use client";

import React, { useState, useEffect } from "react";
import { SidebarNav, ModuleKey } from "@/components/SidebarNav";
import { VisorDisplay } from "@/components/VisorDisplay";
import { CalculationResult } from "@/lib/types";

// Modules
import { JurosSimplesModule } from "@/components/modules/JurosSimplesModule";
import { JurosCompostosModule } from "@/components/modules/JurosCompostosModule";
import { DescontoComercialModule } from "@/components/modules/DescontoComercialModule";
import { DescontoRacionalModule } from "@/components/modules/DescontoRacionalModule";
import { SacModule } from "@/components/modules/SacModule";
import { TaxasEquivalentesModule } from "@/components/modules/TaxasEquivalentesModule";
import { TaxaComercialEfetivaModule } from "@/components/modules/TaxaComercialEfetivaModule";
import { FvpModule } from "@/components/modules/FvpModule";
import { VplModule } from "@/components/modules/VplModule";

const MODULE_TITLES: Record<ModuleKey, string> = {
  "juros-simples": "Juros Simples (Capitalização Linear)",
  "juros-compostos": "Juros Compostos (Capitalização Exponencial)",
  "desc-comercial": "Desconto Comercial Composto (Por Fora)",
  "desc-racional": "Desconto Racional Composto (Por Dentro)",
  sac: "Amortização SAC (Sistema de Amortização Constante)",
  taxas: "Taxas Equivalentes & Proporcionais",
  "taxa-efetiva-comercial": "Taxa Comercial vs Taxa Efetiva",
  fvp: "FVP (Price - Fator de Valor Presente)",
  vpl: "VPL - Valor Presente Líquido & Viabilidade",
};

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("juros-simples");
  const [activeResult, setActiveResult] = useState<CalculationResult | null>(null);

  // Sync hash if present in URL (preserving classic URL compatibility e.g. #juros-compostos)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as ModuleKey;
      if (hash && MODULE_TITLES[hash]) {
        setActiveModule(hash);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSelectModule = (mod: ModuleKey) => {
    setActiveModule(mod);
    window.location.hash = mod;
    setActiveResult(null);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Left Sidebar */}
      <SidebarNav activeModule={activeModule} onSelect={handleSelectModule} />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Executive Visor / Financial HUD Display */}
        <VisorDisplay
          activeModuleTitle={MODULE_TITLES[activeModule]}
          activeOpLabel={activeResult?.title}
          result={activeResult}
          onClear={() => setActiveResult(null)}
        />

        {/* Dynamic Calculator Content */}
        <div className="flex-1 transition-all duration-200">
          {activeModule === "juros-simples" && (
            <JurosSimplesModule onResultChange={setActiveResult} />
          )}

          {activeModule === "juros-compostos" && (
            <JurosCompostosModule onResultChange={setActiveResult} />
          )}

          {activeModule === "desc-comercial" && (
            <DescontoComercialModule onResultChange={setActiveResult} />
          )}

          {activeModule === "desc-racional" && (
            <DescontoRacionalModule onResultChange={setActiveResult} />
          )}

          {activeModule === "sac" && <SacModule onResultChange={setActiveResult} />}

          {activeModule === "taxas" && (
            <TaxasEquivalentesModule onResultChange={setActiveResult} />
          )}

          {activeModule === "taxa-efetiva-comercial" && (
            <TaxaComercialEfetivaModule onResultChange={setActiveResult} />
          )}

          {activeModule === "fvp" && <FvpModule onResultChange={setActiveResult} />}

          {activeModule === "vpl" && <VplModule onResultChange={setActiveResult} />}
        </div>

        {/* Executive Compliance Footer */}
        <footer className="mt-12 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 inline-block"></span>
            <span>calFin Pro • Calculadora Financeira Corporativa em Next.js & TypeScript</span>
          </div>
          <div>
            Regulamentação: Resolução BACEN / CVM • Fórmulas de Engenharia Econômica
          </div>
        </footer>
      </main>
    </div>
  );
}
