import { z } from 'zod';

export const itemFormSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do item'),
  quantidade: z.coerce
    .number({ invalid_type_error: 'Quantidade inválida' })
    .min(0, 'Não pode ser negativa'),
  valorUnitario: z.coerce
    .number({ invalid_type_error: 'Valor inválido' })
    .min(0, 'Não pode ser negativo'),
  extra: z.boolean().default(false)
});

export const novaCompraFormSchema = z.object({
  mes: z.string().min(1, 'Escolha o mês'),
  mercadoNome: z.string().trim().min(1, 'Informe o supermercado'),
  // Opcional de propósito: registrar a compra não deve travar porque o
  // usuário não lembra (ou não quer informar) como pagou.
  metodoPagamentoNome: z.string().nullable().default(null),
  itens: z
    .array(itemFormSchema)
    .min(1, 'Adicione pelo menos um item')
    .refine((itens) => itens.some((i) => i.nome.trim().length > 0), {
      message: 'Adicione pelo menos um item com nome'
    })
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
export type NovaCompraFormValues = z.infer<typeof novaCompraFormSchema>;
