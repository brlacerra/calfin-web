import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export interface MarketRatesResponse {
  selic: number;
  cdi: number;
  ipca: number;
  dolar: number;
  dolarPct: number;
  source: "live" | "fallback";
  updatedAt: string;
}

const FALLBACK_RATES: MarketRatesResponse = {
  selic: 11.25,
  cdi: 11.15,
  ipca: 3.93,
  dolar: 5.42,
  dolarPct: 0.12,
  source: "fallback",
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const [taxasRes, dollarRes] = await Promise.allSettled([
      fetch("https://brasilapi.com.br/api/taxas/v1", {
        signal: controller.signal,
        next: { revalidate: 60 },
      }).then((r) => (r.ok ? r.json() : null)),
      fetch("https://economia.awesomeapi.com.br/last/USD-BRL", {
        signal: controller.signal,
        next: { revalidate: 60 },
      }).then((r) => (r.ok ? r.json() : null)),
    ]);

    clearTimeout(timeoutId);

    let selic = FALLBACK_RATES.selic;
    let cdi = FALLBACK_RATES.cdi;
    let ipca = FALLBACK_RATES.ipca;
    let dolar = FALLBACK_RATES.dolar;
    let dolarPct = FALLBACK_RATES.dolarPct;
    let isLive = false;

    // Process BrasilAPI Taxas
    if (taxasRes.status === "fulfilled" && Array.isArray(taxasRes.value)) {
      const taxas = taxasRes.value;
      const selicItem = taxas.find((t: { nome: string; valor: number }) =>
        t.nome?.toLowerCase().includes("selic")
      );
      const cdiItem = taxas.find((t: { nome: string; valor: number }) =>
        t.nome?.toLowerCase().includes("cdi")
      );
      const ipcaItem = taxas.find((t: { nome: string; valor: number }) =>
        t.nome?.toLowerCase().includes("ipca")
      );

      if (selicItem?.valor) selic = Number(selicItem.valor);
      if (cdiItem?.valor) cdi = Number(cdiItem.valor);
      if (ipcaItem?.valor) ipca = Number(ipcaItem.valor);
      isLive = true;
    }

    // Process AwesomeAPI USD
    if (dollarRes.status === "fulfilled" && dollarRes.value?.USDBRL) {
      const usd = dollarRes.value.USDBRL;
      if (usd.bid) dolar = Number(usd.bid);
      if (usd.pctChange) dolarPct = Number(usd.pctChange);
      isLive = true;
    }

    const payload: MarketRatesResponse = {
      selic,
      cdi,
      ipca,
      dolar,
      dolarPct,
      source: isLive ? "live" : "fallback",
      updatedAt: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return NextResponse.json(FALLBACK_RATES);
  }
}
