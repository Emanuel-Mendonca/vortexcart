import type { NovoItemCompra } from '@/types';

/**
 * Extração dos itens da página de consulta da NFC-e (SEFAZ-MG).
 *
 * Esta é a parte mais frágil da funcionalidade: depende do HTML de um portal
 * de terceiro, que pode mudar sem aviso. Por isso ela vive isolada aqui — se
 * o portal mudar, só este arquivo precisa de ajuste, e a entrada manual de
 * compras continua funcionando normalmente.
 *
 * Deliberadamente **não** dependemos de classes CSS. A primeira versão usava
 * os seletores do layout de referência (`.txtTit`, `.RvlUnit`) e não achou
 * nada: o portal de MG usa outro HTML. Ler o texto da linha e interpretá-lo
 * sobrevive a remarcação de layout, que é o tipo de mudança mais comum.
 *
 * Texto de uma linha, como o portal entrega:
 *   "CEBOLA MD PACOTE (Código: 44050857606001) Qtde total de ítens: 0.8712
 *    UN: KG Valor total R$: R$ 4,87"
 */

export interface NotaExtraida {
  mercadoNome: string | null;
  itens: NovoItemCompra[];
}

/** Colapsa espaços e quebras de linha que o HTML do portal traz em excesso. */
export function limparTexto(texto: string | null | undefined): string {
  return (texto ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Converte número escrito em qualquer das duas convenções que a mesma página
 * usa ao mesmo tempo: quantidade vem com ponto decimal ("0.8712") e dinheiro
 * com vírgula decimal ("1.234,56").
 *
 * A regra: se houver vírgula, ela é o separador decimal e os pontos são
 * milhar. Sem vírgula, o último ponto é o decimal.
 *
 * Retorna 0 em vez de NaN — um item ilegível não deve envenenar o total.
 */
export function numeroFlexivel(texto: string | null | undefined): number {
  if (!texto) return 0;
  const bruto = String(texto).replace(/[^\d,.-]/g, '');
  if (!bruto) return 0;

  let normalizado: string;
  if (bruto.includes(',')) {
    normalizado = bruto.replace(/\./g, '').replace(',', '.');
  } else {
    const partes = bruto.split('.');
    normalizado = partes.length > 1 ? `${partes.slice(0, -1).join('')}.${partes.at(-1)}` : bruto;
  }

  const n = Number(normalizado);
  return Number.isFinite(n) ? n : 0;
}

/**
 * JavaScript injetado na WebView depois que a nota aparece.
 *
 * Envia o texto cru de cada linha da tabela — a interpretação acontece do
 * lado do app, onde dá para testar sem navegador. Também manda uma amostra
 * do HTML quando não encontra nada, para o diagnóstico não depender de
 * adivinhação na próxima vez que o portal mudar.
 */
export const SCRIPT_EXTRACAO = `
(function () {
  try {
    var enviar = function (obj) {
      window.ReactNativeWebView.postMessage(JSON.stringify(obj));
    };
    var linhas = document.querySelectorAll('tr');
    var textos = [];
    for (var i = 0; i < linhas.length; i++) {
      var t = (linhas[i].innerText || linhas[i].textContent || '').replace(/\\s+/g, ' ').trim();
      if (t) textos.push(t);
    }
    if (textos.length === 0) {
      enviar({ tipo: 'aguardando' });
      return;
    }
    var emitente = null;
    var h = document.querySelector('h4, h3, .txtTopo');
    if (h) emitente = (h.innerText || h.textContent || '').trim();
    enviar({ tipo: 'nota', mercadoNome: emitente, linhas: textos });
  } catch (e) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ tipo: 'erro', mensagem: String(e) })
    );
  }
})();
true;
`;

export interface PayloadWebView {
  tipo: 'nota' | 'aguardando' | 'erro';
  mercadoNome?: string | null;
  /** Texto cru de cada `<tr>` da página. */
  linhas?: string[];
  mensagem?: string;
}

/** Rótulos do portal, tolerando acento e espaçamento variáveis. */
const RE_QTD = /qtde[^:]*:\s*([\d.,]+)/i;
const RE_VALOR = /valor\s*total[^:]*:\s*R?\$?\s*([\d.,]+)/i;
const RE_CODIGO = /\(\s*c[óo]digo\s*:\s*[^)]*\)/i;
const RE_UNIDADE = /\bUN\s*:\s*([A-Za-zÀ-ú]+)/;

/**
 * Interpreta uma linha da tabela do portal.
 * Retorna `null` quando a linha não é um item (cabeçalho, rodapé, totais).
 */
export function lerLinhaItem(linhaBruta: string): NovoItemCompra | null {
  const linha = limparTexto(linhaBruta);
  if (!linha) return null;

  const mQtd = linha.match(RE_QTD);
  const mValor = linha.match(RE_VALOR);
  // Sem quantidade E sem valor não é linha de produto.
  if (!mQtd || !mValor) return null;

  // O nome é tudo que vem antes do código do produto (ou antes do primeiro
  // rótulo, quando o portal omite o código).
  const cortePorCodigo = linha.search(RE_CODIGO);
  const cortePorRotulo = linha.search(/qtde/i);
  const corte =
    cortePorCodigo >= 0 ? cortePorCodigo : cortePorRotulo >= 0 ? cortePorRotulo : linha.length;

  const nome = limparTexto(linha.slice(0, corte));
  if (!nome) return null;

  const quantidade = numeroFlexivel(mQtd[1]);
  const valorTotal = numeroFlexivel(mValor[1]);

  // O portal de MG não mostra valor unitário — só quantidade e total. Para
  // itens vendidos por peso (UN: KG) isso dá o preço por quilo, que é o que
  // faz sentido guardar.
  const valorUnitario = quantidade > 0 ? valorTotal / quantidade : valorTotal;

  return {
    nome,
    quantidade: quantidade > 0 ? quantidade : 1,
    valorUnitario,
    // Itens do cupom são exatamente o que foi comprado; quem decide o que é
    // "extra" é o usuário, na revisão.
    extra: false
  };
}

/** Unidade declarada na linha ("UN", "KG"), quando houver. */
export function lerUnidade(linhaBruta: string): string | null {
  return limparTexto(linhaBruta).match(RE_UNIDADE)?.[1]?.toUpperCase() ?? null;
}

export function normalizarNota(payload: PayloadWebView): NotaExtraida {
  const itens: NovoItemCompra[] = [];
  for (const linha of payload.linhas ?? []) {
    const item = lerLinhaItem(linha);
    if (item) itens.push(item);
  }
  return { mercadoNome: limparTexto(payload.mercadoNome) || null, itens };
}
