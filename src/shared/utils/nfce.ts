/**
 * Leitura do QR Code da NFC-e (cupom fiscal eletrônico).
 *
 * O QR **não contém os itens da compra** — apenas a chave de acesso e dados
 * de autenticação. Os itens só existem na página da SEFAZ, e é por isso que
 * o fluxo do app abre o portal em seguida (ver `src/services/nfce/`).
 *
 * Formato do conteúdo lido (NT 2015/002, QR Code versão 2):
 *   https://<portal>/qrcode.xhtml?p=<chave>|<versao>|<ambiente>|<idCSC>|<hash>
 *
 * Em emissão offline/contingência entram dois campos a mais (dia da emissão
 * e valor total) antes do idCSC — por isso lemos os campos por posição
 * apenas até a chave, que é a única garantida em todas as variantes.
 */

/** Código da UF dentro da chave de acesso. Minas Gerais é 31. */
export const CODIGO_UF_MG = '31';

export interface ChaveNfce {
  /** Os 44 dígitos completos. */
  chave: string;
  /** Código numérico da UF emitente (ex.: "31" = MG). */
  codigoUf: string;
  /** Ano de emissão com 4 dígitos (ex.: 2026). */
  ano: number;
  /** Mês de emissão, 1 a 12. */
  mes: number;
  /** Mês no formato usado pelo app: "AAAA-MM". */
  mesCompra: string;
  /** CNPJ do estabelecimento, só dígitos. */
  cnpjEmitente: string;
  /** Modelo do documento: 65 = NFC-e, 55 = NF-e. */
  modelo: string;
  /** Número da nota. */
  numero: number;
}

export class QrCodeInvalidoError extends Error {
  constructor(detalhe: string) {
    super(`QR Code não reconhecido: ${detalhe}`);
    this.name = 'QrCodeInvalidoError';
  }
}

/**
 * Dígito verificador da chave de acesso (módulo 11, pesos 2 a 9 da direita
 * para a esquerda). Serve para rejeitar leitura corrompida antes de sair
 * consultando o portal à toa.
 */
export function calcularDvChave(primeiros43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = primeiros43.length - 1; i >= 0; i--) {
    soma += Number(primeiros43[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  return resto === 0 || resto === 1 ? 0 : 11 - resto;
}

export function chaveEhValida(chave: string): boolean {
  if (!/^\d{44}$/.test(chave)) return false;
  return calcularDvChave(chave.slice(0, 43)) === Number(chave[43]);
}

/** Extrai só os 44 dígitos da chave de dentro do conteúdo lido no QR. */
function extrairChaveBruta(conteudo: string): string | null {
  // Caminho normal: o parâmetro `p`, cujo primeiro campo é a chave.
  const match = conteudo.match(/[?&]p=([^&\s]+)/i);
  if (match?.[1]) {
    const primeiroCampo = decodeURIComponent(match[1]).split('|')[0] ?? '';
    const somenteDigitos = primeiroCampo.replace(/\D/g, '');
    if (somenteDigitos.length === 44) return somenteDigitos;
  }

  // Alguns emissores imprimem a chave crua (com ou sem espaços) no QR.
  const solta = conteudo.replace(/\D/g, '');
  if (solta.length === 44) return solta;

  return null;
}

/**
 * Interpreta o conteúdo lido do QR Code de um cupom fiscal.
 *
 * @throws QrCodeInvalidoError quando não é um QR de NFC-e legível.
 */
export function lerQrCodeNfce(conteudo: string): ChaveNfce {
  const texto = conteudo.trim();
  if (!texto) throw new QrCodeInvalidoError('conteúdo vazio.');

  const chave = extrairChaveBruta(texto);
  if (!chave) {
    throw new QrCodeInvalidoError('não foi encontrada uma chave de acesso de 44 dígitos.');
  }
  if (!chaveEhValida(chave)) {
    throw new QrCodeInvalidoError('o dígito verificador da chave não confere.');
  }

  const codigoUf = chave.slice(0, 2);
  const ano = 2000 + Number(chave.slice(2, 4));
  const mes = Number(chave.slice(4, 6));
  if (mes < 1 || mes > 12) {
    throw new QrCodeInvalidoError('o mês de emissão na chave é inválido.');
  }

  return {
    chave,
    codigoUf,
    ano,
    mes,
    mesCompra: `${ano}-${String(mes).padStart(2, '0')}`,
    cnpjEmitente: chave.slice(6, 20),
    modelo: chave.slice(20, 22),
    numero: Number(chave.slice(25, 34))
  };
}

/** Monta a URL de consulta do portal da SEFAZ-MG para uma chave. */
export function urlPortalMg(conteudoQr: string): string {
  // O portal aceita o conteúdo do QR inteiro. Preservá-lo (em vez de montar
  // a URL só com a chave) mantém o hash de autenticação, que é o que permite
  // a consulta sem digitar a chave manualmente.
  const texto = conteudoQr.trim();
  if (/^https?:\/\//i.test(texto)) return texto;

  const chave = extrairChaveBruta(texto);
  return `https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=${chave ?? ''}`;
}

export function formatarCnpj(cnpj: string): string {
  if (!/^\d{14}$/.test(cnpj)) return cnpj;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}
