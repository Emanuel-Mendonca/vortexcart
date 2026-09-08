import { buildMonthValue, currentMonthValue, monthLabel, parseMonthValue } from './date';

describe('monthLabel', () => {
  it('converte "YYYY-MM" para o nome do mês por extenso em português', () => {
    expect(monthLabel('2026-07')).toBe('julho de 2026');
    expect(monthLabel('2026-01')).toBe('janeiro de 2026');
    expect(monthLabel('2026-12')).toBe('dezembro de 2026');
  });

  it('retorna um texto amigável quando não há mês', () => {
    expect(monthLabel(null)).toBe('(sem mês)');
    expect(monthLabel(undefined)).toBe('(sem mês)');
  });
});

describe('currentMonthValue', () => {
  it('formata uma data como "YYYY-MM"', () => {
    const data = new Date(2026, 6, 15); // 15 de julho de 2026 (mês 0-indexado)
    expect(currentMonthValue(data)).toBe('2026-07');
  });

  it('preenche o mês com zero à esquerda quando necessário', () => {
    const data = new Date(2026, 0, 1); // janeiro
    expect(currentMonthValue(data)).toBe('2026-01');
  });
});

describe('buildMonthValue / parseMonthValue', () => {
  it('constrói e desfaz o valor do mês de forma consistente (round-trip)', () => {
    const valor = buildMonthValue(2026, 6); // índice 6 = julho
    expect(valor).toBe('2026-07');

    const { ano, mesIndex } = parseMonthValue(valor);
    expect(ano).toBe(2026);
    expect(mesIndex).toBe(6);
  });
});
