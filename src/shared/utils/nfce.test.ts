import {
  QrCodeInvalidoError,
  calcularDvChave,
  chaveEhValida,
  formatarCnpj,
  lerQrCodeNfce,
  urlPortalMg
} from './nfce';

/**
 * Chave montada a partir de campos conhecidos, com DV calculado:
 * UF 31 (MG) · 09/2026 · CNPJ 12345678000195 · modelo 65 · série 001 ·
 * nota 12345 · tpEmis 1 · cNF 87654321.
 */
const CHAVE = '31260912345678000195650010000123451876543212';

const QR_ONLINE = `https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=${CHAVE}|2|1|1|A1B2C3D4E5`;

describe('chave de acesso da NFC-e', () => {
  it('valida o dígito verificador', () => {
    expect(chaveEhValida(CHAVE)).toBe(true);
  });

  it('rejeita chave com dígito verificador trocado', () => {
    const adulterada = `${CHAVE.slice(0, 43)}${(Number(CHAVE[43]) + 1) % 10}`;
    expect(chaveEhValida(adulterada)).toBe(false);
  });

  it('rejeita chave com tamanho errado', () => {
    expect(chaveEhValida(CHAVE.slice(0, 43))).toBe(false);
    expect(chaveEhValida(`${CHAVE}0`)).toBe(false);
  });

  it('calcula DV 0 quando o resto é 0 ou 1', () => {
    // O módulo 11 devolve 0 nesses dois restos, em vez de 11 ou 10.
    expect(calcularDvChave('0'.repeat(43))).toBe(0);
  });
});

describe('lerQrCodeNfce', () => {
  it('extrai os campos de um QR de emissão online', () => {
    const lido = lerQrCodeNfce(QR_ONLINE);
    expect(lido.chave).toBe(CHAVE);
    expect(lido.codigoUf).toBe('31');
    expect(lido.ano).toBe(2026);
    expect(lido.mes).toBe(9);
    expect(lido.mesCompra).toBe('2026-09');
    expect(lido.cnpjEmitente).toBe('12345678000195');
    expect(lido.modelo).toBe('65');
    expect(lido.numero).toBe(12345);
  });

  it('lê também o formato de contingência, que tem campos a mais', () => {
    const offline = `https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=${CHAVE}|2|1|09|123.45||1|HASH`;
    expect(lerQrCodeNfce(offline).chave).toBe(CHAVE);
  });

  it('aceita a chave crua, sem URL', () => {
    expect(lerQrCodeNfce(CHAVE).chave).toBe(CHAVE);
  });

  it('aceita chave com separadores, como vem impressa no cupom', () => {
    const comEspacos = CHAVE.replace(/(\d{4})/g, '$1 ').trim();
    expect(lerQrCodeNfce(comEspacos).chave).toBe(CHAVE);
  });

  it('recusa conteúdo vazio', () => {
    expect(() => lerQrCodeNfce('   ')).toThrow(QrCodeInvalidoError);
  });

  it('recusa um QR que não é de nota fiscal', () => {
    expect(() => lerQrCodeNfce('https://example.com/promo')).toThrow(QrCodeInvalidoError);
  });

  it('recusa chave corrompida na leitura', () => {
    const adulterada = `${CHAVE.slice(0, 43)}${(Number(CHAVE[43]) + 1) % 10}`;
    expect(() => lerQrCodeNfce(adulterada)).toThrow(/dígito verificador/);
  });

  it('recusa chave com mês impossível', () => {
    // Mês 13 nas posições 5-6; o DV é recalculado para isolar o erro de mês.
    const base =
      '31' + '26' + '13' + '12345678000195' + '65' + '001' + '000012345' + '1' + '87654321';
    const comDv = `${base}${calcularDvChave(base)}`;
    expect(() => lerQrCodeNfce(comDv)).toThrow(/mês de emissão/);
  });
});

describe('urlPortalMg', () => {
  it('preserva a URL lida, mantendo o hash de autenticação', () => {
    // Sem o hash o portal exigiria digitar a chave na mão.
    expect(urlPortalMg(QR_ONLINE)).toBe(QR_ONLINE);
  });

  it('monta a URL do portal quando o QR trazia só a chave', () => {
    expect(urlPortalMg(CHAVE)).toContain(`p=${CHAVE}`);
    expect(urlPortalMg(CHAVE)).toContain('portalsped.fazenda.mg.gov.br');
  });
});

describe('formatarCnpj', () => {
  it('formata os 14 dígitos', () => {
    expect(formatarCnpj('12345678000195')).toBe('12.345.678/0001-95');
  });

  it('devolve como veio quando não são 14 dígitos', () => {
    expect(formatarCnpj('123')).toBe('123');
  });
});
