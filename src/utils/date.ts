import { MESES_PT } from '@/constants';

/** "2026-07" -> "julho de 2026" */
export function monthLabel(ym: string | null | undefined): string {
  if (!ym) return '(sem mês)';
  const [anoStr, mesStr] = ym.split('-');
  const ano = Number(anoStr);
  const mesIndex = Number(mesStr) - 1;
  const nomeMes = MESES_PT[mesIndex] ?? mesStr;
  return `${nomeMes} de ${ano}`;
}

export function currentMonthValue(date: Date = new Date()): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

export function buildMonthValue(ano: number, mesIndexZeroBased: number): string {
  return `${ano}-${String(mesIndexZeroBased + 1).padStart(2, '0')}`;
}

export function parseMonthValue(ym: string): { ano: number; mesIndex: number } {
  const [anoStr, mesStr] = ym.split('-');
  return { ano: Number(anoStr), mesIndex: Number(mesStr) - 1 };
}
