import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { addCatalogoItem } from '@/storage/catalogoRepository';
import { inserirCompraImportada } from '@/storage/comprasRepository';

import { exportPayloadSchema } from './exportSchema';

export class ImportCanceladoError extends Error {
  constructor() {
    super('Importação cancelada pelo usuário.');
    this.name = 'ImportCanceladoError';
  }
}

export class ImportInvalidoError extends Error {
  constructor(detalhe: string) {
    super(`Arquivo de backup inválido: ${detalhe}`);
    this.name = 'ImportInvalidoError';
  }
}

export interface ResultadoImportacao {
  comprasImportadas: number;
  itensCatalogoImportados: number;
}

/**
 * Abre o seletor de arquivos do sistema, valida o JSON escolhido e
 * insere os dados no banco local. Não apaga dados existentes — os
 * registros importados são adicionados aos que já existem.
 */
export async function selecionarEImportarBackup(): Promise<ResultadoImportacao> {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true
  });

  if (resultado.canceled || resultado.assets.length === 0) {
    throw new ImportCanceladoError();
  }

  const arquivo = resultado.assets[0];
  if (!arquivo) {
    throw new ImportCanceladoError();
  }
  const conteudo = await FileSystem.readAsStringAsync(arquivo.uri, {
    encoding: FileSystem.EncodingType.UTF8
  });

  let json: unknown;
  try {
    json = JSON.parse(conteudo);
  } catch {
    throw new ImportInvalidoError('o arquivo não é um JSON válido.');
  }

  const parse = exportPayloadSchema.safeParse(json);
  if (!parse.success) {
    throw new ImportInvalidoError(
      'a estrutura do arquivo não corresponde a um backup do Vortex Cart.'
    );
  }

  const payload = parse.data;

  for (const nome of payload.catalogo) {
    await addCatalogoItem(nome);
  }
  for (const compra of payload.compras) {
    await inserirCompraImportada(compra);
  }

  return {
    comprasImportadas: payload.compras.length,
    itensCatalogoImportados: payload.catalogo.length
  };
}
