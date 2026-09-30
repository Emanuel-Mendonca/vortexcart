const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(valor: number | null | undefined): string {
  return formatter.format(valor ?? 0);
}
