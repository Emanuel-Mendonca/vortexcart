import { formatBRL } from './currency';

describe('formatBRL', () => {
  it('formata um valor positivo em Real brasileiro', () => {
    expect(formatBRL(1234.5)).toBe('R$\u00a01.234,50');
  });

  it('formata zero corretamente', () => {
    expect(formatBRL(0)).toBe('R$\u00a00,00');
  });

  it('trata null/undefined como zero, sem lançar erro', () => {
    expect(formatBRL(null)).toBe('R$\u00a00,00');
    expect(formatBRL(undefined)).toBe('R$\u00a00,00');
  });

  it('arredonda para duas casas decimais', () => {
    expect(formatBRL(9.999)).toBe('R$\u00a010,00');
  });
});
