import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { EXPORT_MIME_TYPES } from '@/constants';
import type { CatalogoItem, CompraComItens, ExportPayload } from '@/types';
import { formatBRL } from '@/utils/currency';
import { monthLabel } from '@/utils/date';

export class ExportIndisponivelError extends Error {
  constructor() {
    super('O compartilhamento não está disponível neste dispositivo.');
    this.name = 'ExportIndisponivelError';
  }
}

function timestampArquivo(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function compartilhar(uri: string, mimeType: string, dialogTitle: string): Promise<void> {
  const disponivel = await Sharing.isAvailableAsync();
  if (!disponivel) {
    throw new ExportIndisponivelError();
  }
  await Sharing.shareAsync(uri, { mimeType, dialogTitle, UTI: mimeType });
}

export function buildExportPayload(
  compras: CompraComItens[],
  catalogo: CatalogoItem[]
): ExportPayload {
  return {
    versao: 1,
    exportadoEm: Date.now(),
    catalogo: catalogo.map((c) => c.nome),
    compras: compras.map((c) => ({
      mes: c.mes,
      mercadoNome: c.mercadoNome,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      itens: c.itens.map((i) => ({
        nome: i.nome,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
        extra: i.extra
      }))
    }))
  };
}

export async function exportarJson(
  compras: CompraComItens[],
  catalogo: CatalogoItem[]
): Promise<void> {
  const payload = buildExportPayload(compras, catalogo);
  const uri = `${FileSystem.cacheDirectory}controle-compras-${timestampArquivo()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8
  });
  await compartilhar(uri, EXPORT_MIME_TYPES.json, 'Exportar dados (JSON)');
}

function escaparCsv(valor: string): string {
  if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export async function exportarCsv(compras: CompraComItens[]): Promise<void> {
  const cabecalho = [
    'Mes',
    'Supermercado',
    'Item',
    'Quantidade',
    'ValorUnitario',
    'Subtotal',
    'Extra'
  ];
  const linhas = [cabecalho.join(',')];

  for (const compra of compras) {
    for (const item of compra.itens) {
      const subtotal = item.quantidade * item.valorUnitario;
      linhas.push(
        [
          escaparCsv(compra.mes),
          escaparCsv(compra.mercadoNome),
          escaparCsv(item.nome),
          String(item.quantidade),
          item.valorUnitario.toFixed(2),
          subtotal.toFixed(2),
          item.extra ? 'sim' : 'nao'
        ].join(',')
      );
    }
  }

  const csv = linhas.join('\n');
  const uri = `${FileSystem.cacheDirectory}controle-compras-${timestampArquivo()}.csv`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await compartilhar(uri, EXPORT_MIME_TYPES.csv, 'Exportar dados (CSV)');
}

function buildPdfHtml(compras: CompraComItens[]): string {
  const porMes = new Map<string, CompraComItens[]>();
  for (const compra of compras) {
    const lista = porMes.get(compra.mes) ?? [];
    lista.push(compra);
    porMes.set(compra.mes, lista);
  }
  const meses = Array.from(porMes.keys()).sort().reverse();

  const totalGeral = compras.reduce((soma, c) => soma + c.total, 0);

  const blocosMes = meses
    .map((mes) => {
      const comprasDoMes = porMes.get(mes) ?? [];
      const totalMes = comprasDoMes.reduce((s, c) => s + c.total, 0);
      const linhasCompras = comprasDoMes
        .map(
          (compra) => `
            <tr class="compra-header">
              <td colspan="3">${compra.mercadoNome}</td>
              <td style="text-align:right">${formatBRL(compra.total)}</td>
            </tr>
            ${compra.itens
              .map(
                (item) => `
                  <tr>
                    <td></td>
                    <td>${item.nome}${item.extra ? ' (extra)' : ''}</td>
                    <td style="text-align:right">${item.quantidade}</td>
                    <td style="text-align:right">${formatBRL(item.quantidade * item.valorUnitario)}</td>
                  </tr>`
              )
              .join('')}
          `
        )
        .join('');

      return `
        <h2>${monthLabel(mes)} — total ${formatBRL(totalMes)}</h2>
        <table>
          <thead>
            <tr><th></th><th>Item</th><th>Qtd</th><th>Valor</th></tr>
          </thead>
          <tbody>${linhasCompras}</tbody>
        </table>
      `;
    })
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Helvetica, Arial, sans-serif; color: #000; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitulo { color: #555; font-size: 12px; margin-bottom: 20px; }
          h2 { font-size: 15px; margin-top: 24px; border-bottom: 2px solid #000; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
          th { text-align: left; border-bottom: 1px solid #000; padding: 4px; }
          td { padding: 4px; border-bottom: 1px solid #eee; }
          .compra-header td { font-weight: bold; border-top: 1px solid #000; padding-top: 8px; }
          .total-geral { margin-top: 24px; font-size: 14px; font-weight: bold; text-align: right; }
        </style>
      </head>
      <body>
        <h1>Vortex Cart — Relatório de Compras</h1>
        <div class="subtitulo">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
        ${blocosMes}
        <div class="total-geral">Total geral: ${formatBRL(totalGeral)}</div>
      </body>
    </html>
  `;
}

export async function exportarPdf(compras: CompraComItens[]): Promise<void> {
  const html = buildPdfHtml(compras);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await compartilhar(uri, EXPORT_MIME_TYPES.pdf, 'Exportar relatório (PDF)');
}
