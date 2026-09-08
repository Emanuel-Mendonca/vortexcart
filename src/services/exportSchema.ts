import { z } from 'zod';

export const exportedItemSchema = z.object({
  nome: z.string().min(1),
  quantidade: z.number().min(0),
  valorUnitario: z.number().min(0),
  extra: z.boolean()
});

export const exportedCompraSchema = z.object({
  mes: z.string().min(1),
  mercadoNome: z.string().min(1),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
  itens: z.array(exportedItemSchema).min(1)
});

export const exportPayloadSchema = z.object({
  versao: z.literal(1),
  exportadoEm: z.number(),
  catalogo: z.array(z.string()),
  compras: z.array(exportedCompraSchema)
});
