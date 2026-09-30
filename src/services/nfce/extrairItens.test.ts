import {
  lerLinhaItem,
  lerUnidade,
  limparTexto,
  normalizarNota,
  numeroFlexivel
} from './extrairItens';

/**
 * Linhas copiadas da consulta real de uma NFC-e no portal da SEFAZ-MG
 * (Supermercado Pilar, Itajubá/MG). O formato misto — quantidade com ponto
 * decimal e dinheiro com vírgula — vem de lá, não é invenção do teste.
 */
const LINHA_KG =
  'CEBOLA MD PACOTE (Código: 44050857606001) Qtde total de ítens: 0.8712 UN: KG Valor total R$: R$ 4,87';
const LINHA_UN =
  'GUAR.ANTARC.PET 2LT ZERO (Código: 1840001) Qtde total de ítens: 1.0000 UN: UN Valor total R$: R$ 7,48';

describe('numeroFlexivel', () => {
  it('lê quantidade com ponto decimal, como o portal escreve', () => {
    expect(numeroFlexivel('0.8712')).toBeCloseTo(0.8712, 4);
    expect(numeroFlexivel('1.0000')).toBe(1);
  });

  it('lê dinheiro com vírgula decimal', () => {
    expect(numeroFlexivel('4,87')).toBe(4.87);
  });

  it('lê milhar com ponto quando há vírgula decimal', () => {
    expect(numeroFlexivel('1.234,56')).toBe(1234.56);
  });

  it('ignora símbolos e rótulos colados', () => {
    expect(numeroFlexivel('R$ 10,76')).toBe(10.76);
  });

  it('devolve 0 para texto ilegível, em vez de NaN', () => {
    expect(numeroFlexivel('abc')).toBe(0);
    expect(numeroFlexivel('')).toBe(0);
    expect(numeroFlexivel(null)).toBe(0);
  });
});

describe('limparTexto', () => {
  it('colapsa espaços e quebras de linha do HTML', () => {
    expect(limparTexto('  ARROZ\n   TIPO 1  ')).toBe('ARROZ TIPO 1');
  });
});

describe('lerLinhaItem', () => {
  it('lê item vendido por unidade', () => {
    expect(lerLinhaItem(LINHA_UN)).toEqual({
      nome: 'GUAR.ANTARC.PET 2LT ZERO',
      quantidade: 1,
      valorUnitario: 7.48,
      extra: false
    });
  });

  it('lê item por peso e calcula o preço por quilo', () => {
    const item = lerLinhaItem(LINHA_KG);
    expect(item?.nome).toBe('CEBOLA MD PACOTE');
    expect(item?.quantidade).toBeCloseTo(0.8712, 4);
    // 4,87 / 0,8712 kg ≈ R$ 5,59 por quilo
    expect(item?.valorUnitario).toBeCloseTo(5.59, 2);
  });

  it('remove o código do produto do nome', () => {
    expect(lerLinhaItem(LINHA_KG)?.nome).not.toMatch(/código/i);
  });

  it('descarta cabeçalho da tabela', () => {
    expect(lerLinhaItem('Descrição Qtde UN Valor')).toBeNull();
  });

  it('descarta linha de totais, que não tem quantidade', () => {
    expect(lerLinhaItem('Valor total R$: R$ 268,55')).toBeNull();
  });

  it('descarta linha vazia', () => {
    expect(lerLinhaItem('   ')).toBeNull();
  });

  it('não confunde o total da nota com um item', () => {
    expect(lerLinhaItem('Qtde total de ítens: 23')).toBeNull();
  });

  it('funciona mesmo se o portal omitir o código do produto', () => {
    const item = lerLinhaItem(
      'PAO FRANCES Qtde total de ítens: 2.0000 UN: UN Valor total R$: R$ 9,00'
    );
    expect(item?.nome).toBe('PAO FRANCES');
    expect(item?.valorUnitario).toBe(4.5);
  });
});

describe('lerUnidade', () => {
  it('reconhece KG e UN', () => {
    expect(lerUnidade(LINHA_KG)).toBe('KG');
    expect(lerUnidade(LINHA_UN)).toBe('UN');
  });

  it('devolve null quando a linha não declara unidade', () => {
    expect(lerUnidade('PAO Qtde total de ítens: 1')).toBeNull();
  });
});

describe('normalizarNota', () => {
  it('extrai só as linhas que são produto', () => {
    const nota = normalizarNota({
      tipo: 'nota',
      mercadoNome: '  SUPERMERCADO PILAR LTDA \n',
      linhas: ['Descrição Qtde UN Valor', LINHA_KG, LINHA_UN, 'Valor total R$: R$ 12,35']
    });

    expect(nota.mercadoNome).toBe('SUPERMERCADO PILAR LTDA');
    expect(nota.itens).toHaveLength(2);
    expect(nota.itens.map((i) => i.nome)).toEqual(['CEBOLA MD PACOTE', 'GUAR.ANTARC.PET 2LT ZERO']);
  });

  it('devolve lista vazia enquanto a nota não carregou', () => {
    expect(normalizarNota({ tipo: 'aguardando' }).itens).toEqual([]);
    expect(normalizarNota({ tipo: 'aguardando' }).mercadoNome).toBeNull();
  });
});
