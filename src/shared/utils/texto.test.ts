import { casarComCatalogo, mesmoNome, normalizarNome } from './texto';

describe('normalizarNome', () => {
  it('remove acentos, caixa e espaços das pontas', () => {
    expect(normalizarNome('  Café  ')).toBe('cafe');
    expect(normalizarNome('PÃO')).toBe('pao');
    expect(normalizarNome('Feijão Preto')).toBe('feijao preto');
  });

  it('preserva espaços internos e números', () => {
    expect(normalizarNome('Leite 1L')).toBe('leite 1l');
  });
});

describe('mesmoNome', () => {
  it('trata variações de acento e caixa como o mesmo item', () => {
    expect(mesmoNome('Café', 'cafe')).toBe(true);
    expect(mesmoNome('Pão', 'PAO')).toBe(true);
    expect(mesmoNome('Requeijão', ' requeijao ')).toBe(true);
  });

  it('distingue itens de fato diferentes', () => {
    expect(mesmoNome('Café', 'Café solúvel')).toBe(false);
    expect(mesmoNome('Leite', 'Leite condensado')).toBe(false);
  });
});

describe('casarComCatalogo', () => {
  // Nomes reais lidos de uma NFC-e do Supermercado Pilar (Itajubá/MG).
  const CATALOGO = ['Arroz', 'Feijão', 'Cebola', 'Leite', 'Sal', 'Pão', 'Linguiça', 'Café'];

  it('casa nome abreviado do cupom com o item do catálogo', () => {
    expect(casarComCatalogo('ARROZ TIPO 1 5KG', CATALOGO)).toBe('Arroz');
    expect(casarComCatalogo('CEBOLA MD PACOTE', CATALOGO)).toBe('Cebola');
  });

  it('ignora acento e caixa', () => {
    expect(casarComCatalogo('FEIJAO PRETO 1KG', CATALOGO)).toBe('Feijão');
    expect(casarComCatalogo('CAFE TORRADO 500G', CATALOGO)).toBe('Café');
  });

  it('casa nome idêntico', () => {
    expect(casarComCatalogo('Arroz', CATALOGO)).toBe('Arroz');
  });

  it('exige palavra inteira — não casa prefixo de outra palavra', () => {
    // O erro clássico: "SALGADINHO" contém "sal", mas não é sal.
    expect(casarComCatalogo('SALGADINHO ONDULADO', CATALOGO)).toBeNull();
    expect(casarComCatalogo('PANETONE 400G', CATALOGO)).toBeNull();
  });

  it('trata ponto e hífen como separador, como o cupom escreve', () => {
    expect(casarComCatalogo('LING.PIF-PAF CALABRESA', ['Linguiça', 'Ling'])).toBe('Ling');
  });

  it('prefere o nome mais específico quando há mais de um candidato', () => {
    const comCondensado = [...CATALOGO, 'Leite condensado'];
    expect(casarComCatalogo('LEITE CONDENSADO MOCA 395G', comCondensado)).toBe('Leite condensado');
  });

  it('devolve null quando o produto não está no catálogo', () => {
    expect(casarComCatalogo('DORITOS 183WJO NACHO', CATALOGO)).toBeNull();
  });

  it('devolve null para nome vazio ou catálogo vazio', () => {
    expect(casarComCatalogo('  ', CATALOGO)).toBeNull();
    expect(casarComCatalogo('ARROZ', [])).toBeNull();
  });
});
