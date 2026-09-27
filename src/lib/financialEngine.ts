import { PERIODS, PeriodKey, CalculationResult, SacRow, VplAnalysis, VplCashFlow } from "./types";
import { formatMoney, formatPercent, formatNumber } from "./formatters";

export function getPeriodDays(pKey: PeriodKey): number {
  return PERIODS.find((p) => p.value === pKey)?.days ?? 30;
}

// -------------------------------------------------------------
// 1. CAPITALIZAÇÃO SIMPLES (JUROS SIMPLES)
// -------------------------------------------------------------
export type JurosSimplesOp = "vp" | "vf" | "j" | "i" | "n";

export interface JurosSimplesInputs {
  op: JurosSimplesOp;
  vp?: number;
  vf?: number;
  j?: number;
  i?: number;
  n?: number;
  iPeriod?: PeriodKey;
  nPeriod?: PeriodKey;
  outPeriod?: PeriodKey;
}

export function calcJurosSimples(inputs: JurosSimplesInputs): CalculationResult {
  const { op } = inputs;
  const iPeriod = inputs.iPeriod ?? "monthly";
  const nPeriod = inputs.nPeriod ?? "monthly";
  const outPeriod = inputs.outPeriod ?? "monthly";

  const rateDays = getPeriodDays(iPeriod);
  const timeDays = getPeriodDays(nPeriod);
  const outDays = getPeriodDays(outPeriod);

  let out = 0;
  let formulaStr = "";

  switch (op) {
    case "vp": {
      const vf = inputs.vf ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (vf <= 0) throw new Error("Valor Futuro (VF) deve ser maior que zero.");
      const iAdj = (i / 100) * (timeDays / rateDays);
      const denom = 1 + iAdj * n;
      if (denom === 0) throw new Error("Divisão por zero: denominador (1 + i * n) resultou em zero.");
      out = vf / denom;
      formulaStr = "VP = VF / (1 + i_adj * n)";
      return {
        title: "Capital Inicial (Valor Presente - VP)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `VP = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Valor Futuro (VF)", value: formatMoney(vf) },
          { label: "Taxa Ajustada", value: formatPercent(iAdj, 4) },
          { label: "Tempo Informado", value: `${n} período(s)` },
        ],
      };
    }

    case "vf": {
      const vp = inputs.vp ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (vp <= 0) throw new Error("Valor Presente (VP) deve ser maior que zero.");
      const iAdj = (i / 100) * (timeDays / rateDays);
      out = vp * (1 + iAdj * n);
      formulaStr = "VF = VP * (1 + i_adj * n)";
      return {
        title: "Montante (Valor Futuro - VF)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `VF = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Capital Inicial (VP)", value: formatMoney(vp) },
          { label: "Juros Acumulados (J)", value: formatMoney(out - vp) },
          { label: "Taxa Ajustada", value: formatPercent(iAdj, 4) },
        ],
      };
    }

    case "j": {
      const vp = inputs.vp ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (vp <= 0) throw new Error("Valor Presente (VP) deve ser maior que zero.");
      const iAdj = (i / 100) * (timeDays / rateDays);
      out = vp * iAdj * n;
      formulaStr = "J = VP * i_adj * n";
      return {
        title: "Total de Juros (J)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `J = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Capital Inicial (VP)", value: formatMoney(vp) },
          { label: "Montante Final (VF)", value: formatMoney(vp + out) },
          { label: "Taxa Ajustada", value: formatPercent(iAdj, 4) },
        ],
      };
    }

    case "i": {
      const vp = inputs.vp ?? 0;
      const vf = inputs.vf ?? 0;
      const n = inputs.n ?? 0;
      if (vp === 0) throw new Error("VP não pode ser zero.");
      if (n === 0) throw new Error("O período (n) não pode ser zero.");
      const iNPeriod = (vf / vp - 1) / n;
      out = iNPeriod * (outDays / timeDays);
      formulaStr = "i = ((VF / VP - 1) / n) * (dias_saida / dias_tempo)";
      return {
        title: "Taxa de Juros (i)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `i = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Decimal", value: formatNumber(out, 6) },
          { label: "Período de Saída", value: PERIODS.find((p) => p.value === outPeriod)?.label ?? "" },
        ],
      };
    }

    case "n": {
      const vp = inputs.vp ?? 0;
      const vf = inputs.vf ?? 0;
      const i = inputs.i ?? 0;
      if (vp === 0) throw new Error("VP não pode ser zero.");
      if (i === 0) throw new Error("Taxa (i) não pode ser zero.");
      const iAdj = (i / 100) * (outDays / rateDays);
      out = (vf / vp - 1) / iAdj;
      formulaStr = "n = (VF / VP - 1) / i_adj";
      return {
        title: "Período de Tempo (n)",
        primaryValue: `${formatNumber(out, 4)}`,
        primaryRaw: out,
        formattedText: `n = ${formatNumber(out, 4)} períodos`,
        formulaUsed: formulaStr,
        details: [
          { label: "Unidade do Tempo", value: PERIODS.find((p) => p.value === outPeriod)?.label ?? "" },
          { label: "Número Inteiro Mais Próximo", value: `${Math.round(out)}` },
        ],
      };
    }
  }
}

// -------------------------------------------------------------
// 2. CAPITALIZAÇÃO COMPOSTA (JUROS COMPOSTOS)
// -------------------------------------------------------------
export type JurosCompostosOp = "vp" | "vf" | "j" | "i" | "n";

export interface JurosCompostosInputs {
  op: JurosCompostosOp;
  vp?: number;
  vf?: number;
  j?: number;
  i?: number;
  n?: number;
  iPeriod?: PeriodKey;
  nPeriod?: PeriodKey;
  outPeriod?: PeriodKey;
}

export function calcJurosCompostos(inputs: JurosCompostosInputs): CalculationResult {
  const { op } = inputs;
  const iPeriod = inputs.iPeriod ?? "monthly";
  const nPeriod = inputs.nPeriod ?? "monthly";
  const outPeriod = inputs.outPeriod ?? "monthly";

  const rateDays = getPeriodDays(iPeriod);
  const timeDays = getPeriodDays(nPeriod);
  const outDays = getPeriodDays(outPeriod);

  let out = 0;
  let formulaStr = "";

  switch (op) {
    case "vp": {
      const vf = inputs.vf ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (vf <= 0) throw new Error("VF deve ser maior que zero.");
      const iAdj = Math.pow(1 + i / 100, timeDays / rateDays) - 1;
      const factor = Math.pow(1 + iAdj, n);
      if (factor === 0) throw new Error("Divisão por zero.");
      out = vf / factor;
      formulaStr = "VP = VF / (1 + i_adj)^n";
      return {
        title: "Capital Inicial (Valor Presente - VP)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `VP = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Valor Futuro (VF)", value: formatMoney(vf) },
          { label: "Fator de Desconto", value: formatNumber(1 / factor, 6) },
          { label: "Taxa Efetiva no Período", value: formatPercent(iAdj, 4) },
        ],
      };
    }

    case "vf": {
      const vp = inputs.vp ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (vp <= 0) throw new Error("VP deve ser maior que zero.");
      const iAdj = Math.pow(1 + i / 100, timeDays / rateDays) - 1;
      out = vp * Math.pow(1 + iAdj, n);
      formulaStr = "VF = VP * (1 + i_adj)^n";
      return {
        title: "Montante (Valor Futuro - VF)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `VF = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Capital Inicial (VP)", value: formatMoney(vp) },
          { label: "Juros Compostos Totais", value: formatMoney(out - vp) },
          { label: "Multiplicador Acumulado", value: `${formatNumber(out / vp, 4)}x` },
        ],
      };
    }

    case "j": {
      const vp = inputs.vp ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (vp <= 0) throw new Error("VP deve ser maior que zero.");
      const iAdj = Math.pow(1 + i / 100, timeDays / rateDays) - 1;
      out = vp * (Math.pow(1 + iAdj, n) - 1);
      formulaStr = "J = VP * ((1 + i_adj)^n - 1)";
      return {
        title: "Juros Compostos (J)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `J = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Capital Inicial (VP)", value: formatMoney(vp) },
          { label: "Montante Resultante (VF)", value: formatMoney(vp + out) },
          { label: "Taxa Efetiva no Período", value: formatPercent(iAdj, 4) },
        ],
      };
    }

    case "i": {
      const vp = inputs.vp ?? 0;
      const vf = inputs.vf ?? 0;
      const n = inputs.n ?? 0;
      if (vp === 0) throw new Error("VP não pode ser zero.");
      if (n === 0) throw new Error("Tempo (n) não pode ser zero.");
      if (vf / vp <= 0) throw new Error("A razão VF/VP deve ser positiva.");
      const iNPeriod = Math.pow(vf / vp, 1 / n) - 1;
      out = Math.pow(1 + iNPeriod, outDays / timeDays) - 1;
      formulaStr = "i = (1 + (VF/VP)^(1/n) - 1)^(dias_saida / dias_tempo) - 1";
      return {
        title: "Taxa Composta (i)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `i = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Decimal", value: formatNumber(out, 6) },
          { label: "Período de Saída", value: PERIODS.find((p) => p.value === outPeriod)?.label ?? "" },
        ],
      };
    }

    case "n": {
      const vp = inputs.vp ?? 0;
      const vf = inputs.vf ?? 0;
      const i = inputs.i ?? 0;
      if (vp === 0) throw new Error("VP não pode ser zero.");
      if (i === -100) throw new Error("Taxa não pode ser -100%.");
      const iAdj = Math.pow(1 + i / 100, outDays / rateDays) - 1;
      if (1 + iAdj <= 0) throw new Error("Base do logaritmo (1 + i) deve ser maior que zero.");
      out = Math.log10(vf / vp) / Math.log10(1 + iAdj);
      formulaStr = "n = log10(VF / VP) / log10(1 + i_adj)";
      return {
        title: "Tempo Decorrido (n)",
        primaryValue: `${formatNumber(out, 4)}`,
        primaryRaw: out,
        formattedText: `n = ${formatNumber(out, 4)} períodos`,
        formulaUsed: formulaStr,
        details: [
          { label: "Unidade do Tempo", value: PERIODS.find((p) => p.value === outPeriod)?.label ?? "" },
          { label: "Arredondado", value: `${Math.round(out)} períodos` },
        ],
      };
    }
  }
}

// -------------------------------------------------------------
// 3. DESCONTO COMERCIAL COMPOSTO (DCC - Desconto "Por Fora")
// -------------------------------------------------------------
export type DescontoComercialOp = "a" | "n" | "dc" | "i" | "t";

export interface DescontoComercialInputs {
  op: DescontoComercialOp;
  nVal?: number; // N = Valor Nominal
  aVal?: number; // A = Valor Atual
  i?: number;
  n?: number;
  iPeriod?: PeriodKey;
  nPeriod?: PeriodKey;
  outPeriod?: PeriodKey;
}

export function calcDescontoComercial(inputs: DescontoComercialInputs): CalculationResult {
  const { op } = inputs;
  const iPeriod = inputs.iPeriod ?? "monthly";
  const nPeriod = inputs.nPeriod ?? "monthly";
  const outPeriod = inputs.outPeriod ?? "monthly";

  const rateDays = getPeriodDays(iPeriod);
  const timeDays = getPeriodDays(nPeriod);
  const outDays = getPeriodDays(outPeriod);

  let out = 0;
  let formulaStr = "";

  switch (op) {
    case "a": {
      const N = inputs.nVal ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (N <= 0) throw new Error("Valor Nominal (N) deve ser maior que zero.");
      const dAdj = 1 - Math.pow(1 - i / 100, timeDays / rateDays);
      out = N * Math.pow(1 - dAdj, n);
      formulaStr = "A = N * (1 - d_adj)^n";
      return {
        title: "Valor Atual (A)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `A = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Valor Nominal (N)", value: formatMoney(N) },
          { label: "Desconto Comercial Total", value: formatMoney(N - out) },
          { label: "Taxa de Desconto Ajustada", value: formatPercent(dAdj, 4) },
        ],
      };
    }

    case "n": {
      const A = inputs.aVal ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (A <= 0) throw new Error("Valor Atual (A) deve ser maior que zero.");
      if (i === 100) throw new Error("Taxa não pode ser 100%.");
      const dAdj = 1 - Math.pow(1 - i / 100, timeDays / rateDays);
      out = A / Math.pow(1 - dAdj, n);
      formulaStr = "N = A / (1 - d_adj)^n";
      return {
        title: "Valor Nominal (N)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `N = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Valor Atual (A)", value: formatMoney(A) },
          { label: "Desconto Abatido", value: formatMoney(out - A) },
        ],
      };
    }

    case "dc": {
      const N = inputs.nVal ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (N <= 0) throw new Error("Valor Nominal (N) deve ser maior que zero.");
      const dAdj = 1 - Math.pow(1 - i / 100, timeDays / rateDays);
      out = N * (1 - Math.pow(1 - dAdj, n));
      formulaStr = "Dc = N * (1 - (1 - d_adj)^n)";
      return {
        title: "Desconto Comercial Composto (Dc)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `Dc = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Valor Nominal (N)", value: formatMoney(N) },
          { label: "Valor Atual Líquido (A)", value: formatMoney(N - out) },
        ],
      };
    }

    case "i": {
      const N = inputs.nVal ?? 0;
      const A = inputs.aVal ?? 0;
      const n = inputs.n ?? 0;
      if (N <= 0 || A <= 0) throw new Error("N e A devem ser maiores que zero.");
      if (n === 0) throw new Error("n não pode ser zero.");
      const dNPeriod = 1 - Math.pow(A / N, 1 / n);
      out = 1 - Math.pow(1 - dNPeriod, outDays / timeDays);
      formulaStr = "i = 1 - (1 - (1 - (A/N)^(1/n)))^(dias_saida / dias_tempo)";
      return {
        title: "Taxa de Desconto Comercial (i)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `i = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Decimal", value: formatNumber(out, 6) },
          { label: "Período de Saída", value: PERIODS.find((p) => p.value === outPeriod)?.label ?? "" },
        ],
      };
    }

    case "t": {
      const N = inputs.nVal ?? 0;
      const A = inputs.aVal ?? 0;
      const i = inputs.i ?? 0;
      if (N <= 0 || A <= 0) throw new Error("N e A devem ser maiores que zero.");
      if (i === 100) throw new Error("Taxa não pode ser 100%.");
      const dAdj = 1 - Math.pow(1 - i / 100, outDays / rateDays);
      out = Math.log(A / N) / Math.log(1 - dAdj);
      formulaStr = "n = ln(A / N) / ln(1 - d_adj)";
      return {
        title: "Período de Antecipação (n)",
        primaryValue: `${formatNumber(out, 4)}`,
        primaryRaw: out,
        formattedText: `n = ${formatNumber(out, 4)} períodos`,
        formulaUsed: formulaStr,
        details: [
          { label: "Unidade do Tempo", value: PERIODS.find((p) => p.value === outPeriod)?.label ?? "" },
        ],
      };
    }
  }
}

// -------------------------------------------------------------
// 4. DESCONTO RACIONAL COMPOSTO (DRC - Desconto "Por Dentro")
// -------------------------------------------------------------
export type DescontoRacionalOp = "a" | "n" | "dr" | "i" | "t";

export interface DescontoRacionalInputs {
  op: DescontoRacionalOp;
  nVal?: number; // N
  aVal?: number; // A
  i?: number;
  n?: number;
  iPeriod?: PeriodKey;
  nPeriod?: PeriodKey;
  outPeriod?: PeriodKey;
}

export function calcDescontoRacional(inputs: DescontoRacionalInputs): CalculationResult {
  const { op } = inputs;
  const iPeriod = inputs.iPeriod ?? "monthly";
  const nPeriod = inputs.nPeriod ?? "monthly";
  const outPeriod = inputs.outPeriod ?? "monthly";

  const rateDays = getPeriodDays(iPeriod);
  const timeDays = getPeriodDays(nPeriod);
  const outDays = getPeriodDays(outPeriod);

  let out = 0;
  let formulaStr = "";

  switch (op) {
    case "a": {
      const N = inputs.nVal ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (N <= 0) throw new Error("Valor Nominal (N) deve ser maior que zero.");
      const iAdj = Math.pow(1 + i / 100, timeDays / rateDays) - 1;
      out = N * Math.pow(1 + iAdj, -n);
      formulaStr = "A = N * (1 + i_adj)^(-n)";
      return {
        title: "Valor Atual Racional (A)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `A = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Valor Nominal (N)", value: formatMoney(N) },
          { label: "Desconto Racional (Dr)", value: formatMoney(N - out) },
          { label: "Taxa Efetiva Periódica", value: formatPercent(iAdj, 4) },
        ],
      };
    }

    case "n": {
      const A = inputs.aVal ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (A <= 0) throw new Error("Valor Atual (A) deve ser maior que zero.");
      const iAdj = Math.pow(1 + i / 100, timeDays / rateDays) - 1;
      out = A * Math.pow(1 + iAdj, n);
      formulaStr = "N = A * (1 + i_adj)^n";
      return {
        title: "Valor Nominal (N)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `N = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Valor Atual (A)", value: formatMoney(A) },
          { label: "Desconto Racional Total", value: formatMoney(out - A) },
        ],
      };
    }

    case "dr": {
      const N = inputs.nVal ?? 0;
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      if (N <= 0) throw new Error("Valor Nominal (N) deve ser maior que zero.");
      const iAdj = Math.pow(1 + i / 100, timeDays / rateDays) - 1;
      out = N * (1 - Math.pow(1 + iAdj, -n));
      formulaStr = "Dr = N * (1 - (1 + i_adj)^(-n))";
      return {
        title: "Desconto Racional Composto (Dr)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `Dr = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Valor Nominal (N)", value: formatMoney(N) },
          { label: "Valor Atual Resultante (A)", value: formatMoney(N - out) },
        ],
      };
    }

    case "i": {
      const N = inputs.nVal ?? 0;
      const A = inputs.aVal ?? 0;
      const n = inputs.n ?? 0;
      if (A <= 0 || N <= 0) throw new Error("A e N devem ser maiores que zero.");
      if (n === 0) throw new Error("n não pode ser zero.");
      const iNPeriod = Math.pow(N / A, 1 / n) - 1;
      out = Math.pow(1 + iNPeriod, outDays / timeDays) - 1;
      formulaStr = "i = (1 + (N/A)^(1/n) - 1)^(dias_saida / dias_tempo) - 1";
      return {
        title: "Taxa Racional (i)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `i = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Decimal", value: formatNumber(out, 6) },
          { label: "Período de Saída", value: PERIODS.find((p) => p.value === outPeriod)?.label ?? "" },
        ],
      };
    }

    case "t": {
      const N = inputs.nVal ?? 0;
      const A = inputs.aVal ?? 0;
      const i = inputs.i ?? 0;
      if (A <= 0 || N <= 0) throw new Error("A e N devem ser maiores que zero.");
      if (i === -100) throw new Error("Taxa não pode ser -100%.");
      const iAdj = Math.pow(1 + i / 100, outDays / rateDays) - 1;
      out = (Math.log(N) - Math.log(A)) / Math.log(1 + iAdj);
      formulaStr = "n = (ln(N) - ln(A)) / ln(1 + i_adj)";
      return {
        title: "Período de Tempo (n)",
        primaryValue: `${formatNumber(out, 4)}`,
        primaryRaw: out,
        formattedText: `n = ${formatNumber(out, 4)} períodos`,
        formulaUsed: formulaStr,
        details: [
          { label: "Unidade de Tempo", value: PERIODS.find((p) => p.value === outPeriod)?.label ?? "" },
        ],
      };
    }
  }
}

// -------------------------------------------------------------
// 5. SISTEMA DE AMORTIZAÇÃO CONSTANTE (SAC)
// -------------------------------------------------------------
export type SacOp = "pmt" | "amort" | "j" | "sd";

export interface SacInputs {
  op: SacOp;
  vp: number; // Saldo devedor inicial
  n: number;  // Total de parcelas
  i: number;  // Taxa de juros (%)
  t: number;  // Parcela específica
}

export function calcSac(inputs: SacInputs): CalculationResult {
  const { op, vp, n, i, t } = inputs;
  if (vp <= 0) throw new Error("O Capital / Saldo devedor (VP) deve ser maior que zero.");
  if (n <= 0) throw new Error("O número de parcelas (n) deve ser maior que zero.");
  if (t < 1 || t > n) throw new Error(`O número da prestação (t) deve estar entre 1 e ${n}.`);

  const amort = vp / n;
  let out = 0;
  let formulaStr = "";

  switch (op) {
    case "amort":
      out = amort;
      formulaStr = "A = VP / n";
      return {
        title: "Amortização Constante (A)",
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `Amortização = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Capital Financiado (VP)", value: formatMoney(vp) },
          { label: "Número de Parcelas (n)", value: `${n}` },
          { label: "Característica SAC", value: "Amortização é constante em todas as prestações" },
        ],
      };

    case "pmt":
      out = amort * (1 + (n - t + 1) * (i / 100));
      formulaStr = "PMT_t = (VP / n) * (1 + (n - t + 1) * (i / 100))";
      return {
        title: `Prestação da Parcela ${t} (PMT_${t})`,
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `PMT_${t} = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Amortização da Parcela", value: formatMoney(amort) },
          { label: "Juros da Parcela", value: formatMoney(out - amort) },
          { label: "Saldo Anterior", value: formatMoney(vp - amort * (t - 1)) },
        ],
      };

    case "j":
      out = amort * (n - t + 1) * (i / 100);
      formulaStr = "J_t = (VP / n) * (n - t + 1) * (i / 100)";
      return {
        title: `Juros da Parcela ${t} (J_${t})`,
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `J_${t} = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Saldo Devedor na Época t-1", value: formatMoney(vp - amort * (t - 1)) },
          { label: "Taxa Aplicada", value: formatPercent(i / 100, 2) },
        ],
      };

    case "sd":
      out = vp - amort * t;
      formulaStr = "SD_t = VP - (VP / n) * t";
      return {
        title: `Saldo Devedor após Parcela ${t} (SD_${t})`,
        primaryValue: formatMoney(out),
        primaryRaw: out,
        formattedText: `SD_${t} = ${formatMoney(out)}`,
        formulaUsed: formulaStr,
        details: [
          { label: "Total Amortizado até agora", value: formatMoney(amort * t) },
          { label: "Parcelas Restantes", value: `${n - t}` },
        ],
      };
  }
}

export function generateSacSchedule(vp: number, n: number, iPercent: number): SacRow[] {
  if (vp <= 0 || n <= 0) return [];
  const rows: SacRow[] = [];
  const amort = vp / n;
  const i = iPercent / 100;

  let saldo = vp;
  for (let t = 1; t <= n; t++) {
    const juros = saldo * i;
    const pmt = amort + juros;
    const saldoFinal = Math.max(0, saldo - amort);

    rows.push({
      periodo: t,
      saldoDevedorInicial: saldo,
      amortizacao: amort,
      juros,
      prestacao: pmt,
      saldoDevedorFinal: saldoFinal,
    });

    saldo = saldoFinal;
  }

  return rows;
}

// -------------------------------------------------------------
// 6. TAXAS EQUIVALENTES
// -------------------------------------------------------------
export type TaxasEquivalentesOp = "eq_comp" | "mm" | "mM" | "ef" | "js_ef" | "js_dc";

export interface TaxasEquivalentesInputs {
  op: TaxasEquivalentesOp;
  ic?: number; // Taxa conhecida (%)
  i?: number;  // Taxa (%)
  ik?: number; // Taxa nominal (%)
  k?: number;  // Período k
  n?: number;  // Períodos
  icPeriod?: PeriodKey;
  iPeriod?: PeriodKey;
  nPeriod?: PeriodKey;
  outPeriod?: PeriodKey;
}

export function calcTaxasEquivalentes(inputs: TaxasEquivalentesInputs): CalculationResult {
  const { op } = inputs;
  let out = 0;
  let formulaStr = "";

  switch (op) {
    case "eq_comp": {
      const ic = inputs.ic ?? 0;
      const fromDays = getPeriodDays(inputs.icPeriod ?? "monthly");
      const toDays = getPeriodDays(inputs.outPeriod ?? "monthly");
      out = Math.pow(1 + ic / 100, toDays / fromDays) - 1;
      formulaStr = "i_dest = (1 + ic/100)^(dias_dest / dias_orig) - 1";
      return {
        title: "Equivalência de Taxa Composta Geral",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Nova taxa = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Original", value: formatPercent(ic / 100, 4) },
          { label: "De", value: PERIODS.find((p) => p.value === inputs.icPeriod)?.label ?? "" },
          { label: "Para", value: PERIODS.find((p) => p.value === inputs.outPeriod)?.label ?? "" },
        ],
      };
    }

    case "mm": {
      const ic = inputs.ic ?? 0;
      const n = inputs.n ?? 0;
      if (n === 0) throw new Error("n não pode ser zero.");
      out = Math.pow(1 + ic / 100, 1 / n) - 1;
      formulaStr = "i_menor = (1 + ic/100)^(1/n) - 1";
      return {
        title: "Conversão Maior para Menor (Composta)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Taxa menor = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [{ label: "Fator n", value: `${n}` }],
      };
    }

    case "mM": {
      const ic = inputs.ic ?? 0;
      const n = inputs.n ?? 0;
      if (n === 0) throw new Error("n não pode ser zero.");
      out = Math.pow(1 + ic / 100, n) - 1;
      formulaStr = "i_maior = (1 + ic/100)^n - 1";
      return {
        title: "Conversão Menor para Maior (Composta)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Taxa maior = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [{ label: "Fator n", value: `${n}` }],
      };
    }

    case "ef": {
      const ik = inputs.ik ?? 0;
      const k = inputs.k ?? 0;
      if (k === 0) throw new Error("k não pode ser zero.");
      out = ik / 100 / k;
      formulaStr = "i = (ik / 100) / k";
      return {
        title: "Taxa Efetiva Composta (i = ik/k)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Taxa efetiva = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Nominal (ik)", value: formatPercent(ik / 100, 2) },
          { label: "Períodos de Capitalização (k)", value: `${k}` },
        ],
      };
    }

    case "js_ef": {
      const ic = inputs.ic ?? 0;
      const n = inputs.n ?? 0;
      const rateDays = getPeriodDays(inputs.icPeriod ?? "monthly");
      const timeDays = getPeriodDays(inputs.nPeriod ?? "monthly");
      const nAdj = n * (timeDays / rateDays);
      const denom = 1 - (ic / 100) * nAdj;
      if (denom <= 0) throw new Error("Denominador inválido (1 - ic * n <= 0).");
      out = (ic / 100) / denom;
      formulaStr = "i_ef = (ic/100) / (1 - (ic/100) * n_adj)";
      return {
        title: "Taxa Efetiva Simples (Juros Simples)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Taxa efetiva = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa de Desconto Comercial", value: formatPercent(ic / 100, 4) },
          { label: "Tempo Ajustado", value: `${formatNumber(nAdj, 2)} período(s)` },
        ],
      };
    }

    case "js_dc": {
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      const rateDays = getPeriodDays(inputs.iPeriod ?? "monthly");
      const timeDays = getPeriodDays(inputs.nPeriod ?? "monthly");
      const nAdj = n * (timeDays / rateDays);
      const denom = 1 + (i / 100) * nAdj;
      if (denom <= 0) throw new Error("Denominador inválido (1 + i * n <= 0).");
      out = (i / 100) / denom;
      formulaStr = "d = (i/100) / (1 + (i/100) * n_adj)";
      return {
        title: "Taxa de Desconto Simples (Juros Simples)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Taxa de desconto = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Efetiva Informada", value: formatPercent(i / 100, 4) },
          { label: "Tempo Ajustado", value: `${formatNumber(nAdj, 2)} período(s)` },
        ],
      };
    }
  }
}

// -------------------------------------------------------------
// 7. TAXA COMERCIAL VS EFETIVA
// -------------------------------------------------------------
export type TecOp = "js_ef" | "js_dc" | "jc_ef";

export interface TecInputs {
  op: TecOp;
  ic?: number;
  i?: number;
  ik?: number;
  k?: number;
  n?: number;
  icPeriod?: PeriodKey;
  iPeriod?: PeriodKey;
  nPeriod?: PeriodKey;
}

export function calcTec(inputs: TecInputs): CalculationResult {
  const { op } = inputs;
  let out = 0;
  let formulaStr = "";

  switch (op) {
    case "js_ef": {
      const ic = inputs.ic ?? 0;
      const n = inputs.n ?? 0;
      const rateDays = getPeriodDays(inputs.icPeriod ?? "monthly");
      const timeDays = getPeriodDays(inputs.nPeriod ?? "monthly");
      const nAdj = n * (timeDays / rateDays);
      const icUnit = ic / 100;
      const denom = 1 - icUnit * nAdj;
      if (denom <= 0) throw new Error("Valores inválidos (denominador 1 - ic * n <= 0).");
      out = icUnit / denom;
      formulaStr = "i_ef = ic / (1 - ic * n_adj)";
      return {
        title: "Desconto Comercial -> Taxa Efetiva (Simples)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Nova taxa efetiva = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa de Desconto", value: formatPercent(icUnit, 4) },
          { label: "Taxa Efetiva Real", value: formatPercent(out, 4) },
          { label: "Acréscimo Efetivo", value: `+${formatPercent(out - icUnit, 4)}` },
        ],
      };
    }

    case "js_dc": {
      const i = inputs.i ?? 0;
      const n = inputs.n ?? 0;
      const rateDays = getPeriodDays(inputs.iPeriod ?? "monthly");
      const timeDays = getPeriodDays(inputs.nPeriod ?? "monthly");
      const nAdj = n * (timeDays / rateDays);
      const iUnit = i / 100;
      const denom = 1 + iUnit * nAdj;
      if (denom <= 0) throw new Error("Valores inválidos (denominador 1 + i * n <= 0).");
      out = iUnit / denom;
      formulaStr = "d = i / (1 + i * n_adj)";
      return {
        title: "Taxa Efetiva -> Desconto Comercial (Simples)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Taxa comercial = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Efetiva", value: formatPercent(iUnit, 4) },
          { label: "Taxa de Desconto Equivalente", value: formatPercent(out, 4) },
        ],
      };
    }

    case "jc_ef": {
      const ik = inputs.ik ?? 0;
      const k = inputs.k ?? 0;
      if (k === 0) throw new Error("k não pode ser zero.");
      out = ik / 100 / k;
      formulaStr = "i = (ik / 100) / k";
      return {
        title: "Taxa Nominal -> Taxa Efetiva (Composta)",
        primaryValue: formatPercent(out, 4),
        primaryRaw: out,
        formattedText: `Taxa efetiva por período = ${formatNumber(out, 6)} (${formatPercent(out, 4)})`,
        formulaUsed: formulaStr,
        details: [
          { label: "Taxa Nominal (ik)", value: formatPercent(ik / 100, 2) },
          { label: "Fator de Divisão (k)", value: `${k}` },
        ],
      };
    }
  }
}

// -------------------------------------------------------------
// 8. FVP (PRICE - FATOR DE VALOR PRESENTE)
// -------------------------------------------------------------
export interface FvpInputs {
  n: number;
  iPercent: number;
  vp: number;
  mult?: number;
}

export function calcFvp(inputs: FvpInputs): CalculationResult {
  const { n, iPercent, vp } = inputs;
  const mult = inputs.mult ?? 1;

  if (n <= 0) throw new Error("Número de parcelas (n) deve ser maior que zero.");
  if (iPercent === 0) throw new Error("Taxa (i) não pode ser zero para a fórmula FVP.");
  if (vp <= 0) throw new Error("Valor Presente (VP) deve ser maior que zero.");

  const i = iPercent / 100;
  const fvp = (1 - Math.pow(1 + i, -n)) / i;
  const pmt = vp * (1 / fvp);
  const resultado = fvp * mult;

  return {
    title: "FVP (Fator de Valor Presente / Price)",
    primaryValue: formatMoney(pmt),
    primaryRaw: pmt,
    formattedText: `FVP = ${formatNumber(fvp, 6)} | PMT = ${formatMoney(pmt)} | Resultado = ${formatMoney(resultado)}`,
    formulaUsed: "FVP = (1 - (1 + i)^(-n)) / i ; PMT = VP * (1 / FVP)",
    details: [
      { label: "FVP Calculado", value: formatNumber(fvp, 6) },
      { label: "Prestação (PMT Price)", value: formatMoney(pmt) },
      { label: "FVP * Multiplicador", value: formatMoney(resultado) },
      { label: "Custo Total do Financiamento", value: formatMoney(pmt * n) },
      { label: "Juros Totais Pagos", value: formatMoney(pmt * n - vp) },
    ],
  };
}

// -------------------------------------------------------------
// 9. VPL (VALOR PRESENTE LÍQUIDO) & ENGENHARIA ECONÔMICA
// -------------------------------------------------------------
export interface VplInputs {
  investimentoInicial: number;
  taxaPercent: number;
  n: number;
  fluxos: number[];
  temVr?: boolean;
  vr?: number;
  periodoVr?: number;
}

export function calcVpl(inputs: VplInputs): VplAnalysis {
  const { investimentoInicial, taxaPercent, n, fluxos } = inputs;
  const i = taxaPercent / 100;

  if (investimentoInicial < 0) throw new Error("Investimento inicial não pode ser negativo.");
  if (n <= 0) throw new Error("O tempo (n) deve ser de pelo menos 1 período.");
  if (i === -1) throw new Error("A taxa não pode ser -100%.");
  if (fluxos.length !== n) {
    throw new Error(`Foram informados ${fluxos.length} fluxo(s), mas o tempo é n = ${n}.`);
  }

  let totalEntradas = 0;
  let totalDescontado = 0;
  let saldoAcumulado = -investimentoInicial;

  const fluxosTabela: VplCashFlow[] = [];
  let paybackSimples: number | null = null;
  let paybackDescontado: number | null = null;

  let somaFluxoNominal = 0;

  for (let j = 1; j <= n; j++) {
    const fc = fluxos[j - 1];
    totalEntradas += fc;
    somaFluxoNominal += fc;

    if (paybackSimples === null && somaFluxoNominal >= investimentoInicial) {
      const anterior = somaFluxoNominal - fc;
      const fracao = fc > 0 ? (investimentoInicial - anterior) / fc : 0;
      paybackSimples = j - 1 + fracao;
    }

    const desc = fc / Math.pow(1 + i, j);
    totalDescontado += desc;
    saldoAcumulado += desc;

    if (paybackDescontado === null && saldoAcumulado >= 0) {
      const saldoAnterior = saldoAcumulado - desc;
      const fracao = desc > 0 ? -saldoAnterior / desc : 0;
      paybackDescontado = j - 1 + fracao;
    }

    fluxosTabela.push({
      periodo: j,
      fluxo: fc,
      descontado: desc,
      acumulado: saldoAcumulado,
    });
  }

  let vpl = totalDescontado - investimentoInicial;

  if (inputs.temVr && inputs.vr && inputs.periodoVr) {
    const vrDesc = inputs.vr / Math.pow(1 + i, inputs.periodoVr);
    vpl += vrDesc;
    totalDescontado += vrDesc;
  }

  let parecer: "aceitar" | "recusar" | "indiferente" = "indiferente";
  let parecerTexto = "VPL nulo (R$ 0,00): O projeto é indiferente (retorno igual ao custo de oportunidade).";

  if (vpl > 0.005) {
    parecer = "aceitar";
    parecerTexto = "VPL positivo: O projeto gera valor e DEVE SER ACEITO.";
  } else if (vpl < -0.005) {
    parecer = "recusar";
    parecerTexto = "VPL negativo: O projeto destrói valor e DEVE SER RECUSADO.";
  }

  return {
    vpl,
    vplFormatted: formatMoney(vpl),
    parecer,
    parecerTexto,
    totalEntradas,
    totalDescontado,
    investimentoInicial,
    paybackSimples,
    paybackDescontado,
    fluxosTabela,
  };
}
