import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import {
  Button,
  Card,
  Checkbox,
  ConfirmModal,
  IconButton,
  MonthPicker,
  TextField
} from '@/components';
import { useComprasStore, useCompraEmEdicao } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import { formatBRL } from '@/utils/currency';
import { currentMonthValue } from '@/utils/date';
import { novaCompraFormSchema } from '@/utils/validation';
import type { NovaCompraFormValues } from '@/utils/validation';

const ITEM_VAZIO = { nome: '', quantidade: 1, valorUnitario: 0, extra: false };

export function NovaCompraScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const salvarCompra = useComprasStore((s) => s.salvarCompra);
  const cancelarEdicao = useComprasStore((s) => s.cancelarEdicao);
  const editingId = useComprasStore((s) => s.editingId);
  const compraEmEdicao = useCompraEmEdicao();

  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<NovaCompraFormValues>({
    resolver: zodResolver(novaCompraFormSchema),
    defaultValues: {
      mes: currentMonthValue(),
      mercadoNome: '',
      itens: [ITEM_VAZIO]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });
  const itensAtuais = watch('itens');

  useEffect(() => {
    if (compraEmEdicao) {
      reset({
        mes: compraEmEdicao.mes,
        mercadoNome: compraEmEdicao.mercadoNome,
        itens: compraEmEdicao.itens.map((i) => ({
          nome: i.nome,
          quantidade: i.quantidade,
          valorUnitario: i.valorUnitario,
          extra: i.extra
        }))
      });
    }
  }, [compraEmEdicao, reset]);

  const total = itensAtuais.reduce(
    (soma, item) => soma + (Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0),
    0
  );

  async function onSubmit(values: NovaCompraFormValues) {
    await salvarCompra({
      mes: values.mes,
      mercadoNome: values.mercadoNome,
      itens: values.itens
        .filter((i) => i.nome.trim().length > 0)
        .map((i) => ({
          nome: i.nome.trim(),
          quantidade: Number(i.quantidade),
          valorUnitario: Number(i.valorUnitario),
          extra: i.extra
        }))
    });

    const eraEdicao = editingId != null;
    reset({ mes: currentMonthValue(), mercadoNome: '', itens: [ITEM_VAZIO] });
    setConfirmacao(
      eraEdicao ? 'Alterações salvas!' : `Compra de ${formatBRL(total)} salva com sucesso!`
    );
  }

  function handleCancelarEdicao() {
    cancelarEdicao();
    reset({ mes: currentMonthValue(), mercadoNome: '', itens: [ITEM_VAZIO] });
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.lg }}
    >
      <Card>
        <Text
          style={{
            fontFamily: theme.fontFamily.extraBold,
            fontSize: theme.type.title.fontSize,
            color: theme.colors.text,
            marginBottom: 16
          }}
        >
          Registrar compra
        </Text>

        {editingId != null ? (
          <View
            style={[
              styles.editBanner,
              {
                backgroundColor: theme.colors.accent,
                borderColor: theme.colors.border,
                borderWidth: theme.borderWidth.bold
              }
            ]}
          >
            <Text style={{ fontFamily: theme.fontFamily.bold, color: theme.colors.onAccent }}>
              Editando uma compra existente
            </Text>
            <Button label="Cancelar" variant="ghost" onPress={handleCancelarEdicao} />
          </View>
        ) : null}

        <Controller
          control={control}
          name="mes"
          render={({ field }) => (
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontFamily: theme.fontFamily.semiBold,
                  fontSize: theme.type.caption.fontSize,
                  color: theme.colors.textMuted,
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}
              >
                Mês da compra
              </Text>
              <MonthPicker value={field.value} onChange={field.onChange} />
            </View>
          )}
        />

        <Controller
          control={control}
          name="mercadoNome"
          render={({ field }) => (
            <TextField
              label="Supermercado"
              placeholder="Ex: Supermercado Silva"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.mercadoNome?.message}
            />
          )}
        />

        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.type.caption.fontSize,
            color: theme.colors.textMuted,
            textTransform: 'uppercase',
            marginTop: 8,
            marginBottom: 8
          }}
        >
          Itens
        </Text>

        {fields.map((field, index) => {
          const qtd = Number(itensAtuais[index]?.quantidade) || 0;
          const valorUnit = Number(itensAtuais[index]?.valorUnitario) || 0;
          const subtotal = qtd * valorUnit;

          return (
            <View
              key={field.id}
              style={[
                styles.itemRow,
                {
                  borderColor: theme.colors.borderMuted,
                  borderBottomWidth: theme.borderWidth.hairline
                }
              ]}
            >
              <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
                <Controller
                  control={control}
                  name={`itens.${index}.nome`}
                  render={({ field: f }) => (
                    <TextField
                      placeholder="Nome do item"
                      value={f.value}
                      onChangeText={f.onChange}
                    />
                  )}
                />
              </View>
              <View style={styles.qtdField}>
                <Controller
                  control={control}
                  name={`itens.${index}.quantidade`}
                  render={({ field: f }) => (
                    <TextField
                      placeholder="Qtd"
                      value={String(f.value)}
                      onChangeText={f.onChange}
                      keyboardType="decimal-pad"
                      textAlign="right"
                    />
                  )}
                />
              </View>
              <View style={styles.valorField}>
                <Controller
                  control={control}
                  name={`itens.${index}.valorUnitario`}
                  render={({ field: f }) => (
                    <TextField
                      placeholder="0,00"
                      value={String(f.value)}
                      onChangeText={f.onChange}
                      keyboardType="decimal-pad"
                      textAlign="right"
                    />
                  )}
                />
              </View>
              <Text
                style={{
                  width: 54,
                  textAlign: 'right',
                  fontFamily: theme.fontFamily.semiBold,
                  fontSize: theme.type.caption.fontSize,
                  color: theme.colors.textMuted
                }}
              >
                {formatBRL(subtotal)}
              </Text>
              <Controller
                control={control}
                name={`itens.${index}.extra`}
                render={({ field: f }) => <Checkbox checked={f.value} onToggle={f.onChange} />}
              />
              <IconButton
                name="trash-outline"
                color={theme.colors.textFaint}
                onPress={() => remove(index)}
              />
            </View>
          );
        })}

        {errors.itens?.message ? (
          <Text style={{ color: theme.colors.danger, marginTop: 6 }}>{errors.itens.message}</Text>
        ) : null}

        <View style={{ marginTop: 12 }}>
          <Button
            label="Adicionar item"
            variant="secondary"
            icon={<Ionicons name="add" size={16} color={theme.colors.text} />}
            onPress={() => append(ITEM_VAZIO)}
          />
        </View>

        <View
          style={[
            styles.totalLine,
            { borderTopColor: theme.colors.border, borderTopWidth: theme.borderWidth.bold }
          ]}
        >
          <Text
            style={{ fontFamily: theme.fontFamily.extraBold, fontSize: theme.type.title.fontSize }}
          >
            Total da compra
          </Text>
          <Text
            style={{
              fontFamily: theme.fontFamily.extraBold,
              fontSize: theme.type.title.fontSize,
              color: theme.colors.text
            }}
          >
            {formatBRL(total)}
          </Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <Button
            label={editingId != null ? 'Salvar alterações' : 'Salvar compra'}
            icon={<Ionicons name="save-outline" size={16} color={theme.colors.onPrimary} />}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </Card>

      <ConfirmModal
        visible={confirmacao != null}
        message={confirmacao ?? ''}
        onDismiss={() => setConfirmacao(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
    marginBottom: 8
  },
  qtdField: { width: 44, flexShrink: 0 },
  valorField: { width: 66, flexShrink: 0 },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16
  }
});
