interface ItemComQuantidadeEValor {
  quantidade: number;
  valorUnitario: number;
}

/** Soma quantidade × valor unitário de uma lista de itens. Função pura, sem I/O. */
export function calcularTotal(itens: readonly ItemComQuantidadeEValor[]): number {
  return itens.reduce((soma, item) => soma + item.quantidade * item.valorUnitario, 0);
}
