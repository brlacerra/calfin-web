export type PeriodKey =
  | "daily"
  | "weekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "quadrimestral"
  | "semiannual"
  | "yearly";

export interface PeriodOption {
  value: PeriodKey;
  label: string;
  shortLabel: string;
  days: number;
}

export const PERIODS: PeriodOption[] = [
  { value: "daily", label: "a.d. (ao dia)", shortLabel: "dia(s)", days: 1 },
  { value: "weekly", label: "a.sem. (semanal)", shortLabel: "semana(s)", days: 7 },
  { value: "monthly", label: "a.m. (ao mês)", shortLabel: "mês(es)", days: 30 },
  { value: "bimonthly", label: "a.b. (ao bimestre)", shortLabel: "bimestre(s)", days: 60 },
  { value: "quarterly", label: "a.t. (ao trimestre)", shortLabel: "trimestre(s)", days: 90 },
  { value: "quadrimestral", label: "a.q. (ao quadrimestre)", shortLabel: "quadrimestre(s)", days: 120 },
  { value: "semiannual", label: "a.s. (ao semestre)", shortLabel: "semestre(s)", days: 180 },
  { value: "yearly", label: "a.a. (ao ano)", shortLabel: "ano(s)", days: 360 },
];

export interface CalculationResult {
  title: string;
  primaryValue: string;
  primaryRaw: number;
  formattedText: string;
  formulaUsed: string;
  details?: { label: string; value: string }[];
  isError?: boolean;
}

export interface SacRow {
  periodo: number;
  saldoDevedorInicial: number;
  amortizacao: number;
  juros: number;
  prestacao: number;
  saldoDevedorFinal: number;
}

export interface VplCashFlow {
  periodo: number;
  fluxo: number;
  descontado: number;
  acumulado: number;
}

export interface VplAnalysis {
  vpl: number;
  vplFormatted: string;
  parecer: "aceitar" | "recusar" | "indiferente";
  parecerTexto: string;
  totalEntradas: number;
  totalDescontado: number;
  investimentoInicial: number;
  paybackSimples: number | null;
  paybackDescontado: number | null;
  fluxosTabela: VplCashFlow[];
}
