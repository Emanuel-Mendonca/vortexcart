import { calcularTotal } from './totals';

describe('calcularTotal', () => {
  it('multiplica quantidade x valor unitário e soma todos os itens', () => {
    const total = calcularTotal([
      { quantidade: 2, valorUnitario: 8.99 },
      { quantidade: 1, valorUnitario: 7.5 }
    ]);
    expect(total).toBeCloseTo(25.48, 2);
  });

  it('retorna zero para uma lista vazia', () => {
    expect(calcularTotal([])).toBe(0);
  });

  it('ignora quantidade zero sem lançar erro', () => {
    const total = calcularTotal([{ quantidade: 0, valorUnitario: 12 }]);
    expect(total).toBe(0);
  });

  it('soma corretamente múltiplos itens, incluindo os marcados como extra', () => {
    const total = calcularTotal([
      { quantidade: 2, valorUnitario: 4.2 },
      { quantidade: 1, valorUnitario: 3 }
    ]);
    expect(total).toBeCloseTo(11.4, 2);
  });
});
