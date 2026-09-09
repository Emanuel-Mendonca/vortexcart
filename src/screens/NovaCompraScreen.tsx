import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from 'react-native';

import {
  AmbientGlow,
  Button,
  Card,
  Checkbox,
  ConfirmModal,
  IconButton,
  MonthPicker,
  TextField,
  Toast
} from '@/components';
import { useComprasStore, useCompraEmEdicao } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import { getCategoriaIcon } from '@/utils/categoria';
import { formatBRL } from '@/utils/currency';
import { currentMonthValue } from '@/utils/date';
import { novaCompraFormSchema } from '@/utils/validation';
import type { NovaCompraFormValues } from '@/utils/validation';

function labelStyle(theme: ReturnType<typeof getTheme>) {
  return {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: theme.type.caption.fontSize,
    color: theme.colors.textMuted,
    textTransform: 'uppercase' as const,
    marginBottom: 4
  };
}

function PulsingDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.8, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <View style={{ width: 8, height: 8 }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          opacity: 0.5,
          transform: [{ scale }]
        }}
      />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

export function NovaCompraScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const salvarCompra = useComprasStore((s) => s.salvarCompra);
  const cancelarEdicao = useComprasStore((s) => s.cancelarEdicao);
  const editingId = useComprasStore((s) => s.editingId);
  const catalogo = useComprasStore((s) => s.catalogo);
  const compraEmEdicao = useCompraEmEdicao();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmacaoFinal, setConfirmacaoFinal] = useState<string | null>(null);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [draftNome, setDraftNome] = useState('');
  const [draftQtd, setDraftQtd] = useState('1');
  const [draftValor, setDraftValor] = useState('');
  const [draftExtra, setDraftExtra] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<NovaCompraFormValues>({
    resolver: zodResolver(novaCompraFormSchema),
    defaultValues: { mes: currentMonthValue(), mercadoNome: '', itens: [] }
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'itens' });
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

  function limparComposer() {
    setDraftNome('');
    setDraftQtd('1');
    setDraftValor('');
    setDraftExtra(false);
    setEditandoIndex(null);
  }

  function inserirOuAtualizarItem() {
    if (!draftNome.trim()) return;
    const novoItem = {
      nome: draftNome.trim(),
      quantidade: Number(draftQtd.replace(',', '.')) || 0,
      valorUnitario: Number(draftValor.replace(',', '.')) || 0,
      extra: draftExtra
    };
    if (editandoIndex != null) {
      update(editandoIndex, novoItem);
      setToastMsg(`"${novoItem.nome}" atualizado`);
    } else {
      append(novoItem);
      setToastMsg(`"${novoItem.nome}" adicionado à lista`);
    }
    limparComposer();
  }

  function editarItem(index: number) {
    const item = itensAtuais[index];
    if (!item) return;
    setEditandoIndex(index);
    setDraftNome(item.nome);
    setDraftQtd(String(item.quantidade));
    setDraftValor(String(item.valorUnitario));
    setDraftExtra(item.extra);
  }

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
    reset({ mes: currentMonthValue(), mercadoNome: '', itens: [] });
    limparComposer();
    setConfirmacaoFinal(
      eraEdicao ? 'Alterações salvas!' : `Compra de ${formatBRL(total)} salva com sucesso!`
    );
  }

  function handleCancelarEdicao() {
    cancelarEdicao();
    reset({ mes: currentMonthValue(), mercadoNome: '', itens: [] });
    limparComposer();
  }

  const draftSubtotal =
    (Number(draftQtd.replace(',', '.')) || 0) * (Number(draftValor.replace(',', '.')) || 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }}>
        <AmbientGlow color={theme.colors.primary} size={260} top={-60} left={-80} opacity={0.18} />
        <AmbientGlow color={theme.colors.accent} size={200} top={220} right={-70} opacity={0.12} />

        <View style={styles.statusRow}>
          <PulsingDot color={theme.colors.accent} />
          <Text
            style={{
              fontFamily: theme.fontFamily.bold,
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: theme.colors.accent
            }}
          >
            Sessão ativa
          </Text>
        </View>

        <Text
          style={{
            fontFamily: theme.fontFamily.extraBold,
            fontSize: theme.type.headline.fontSize,
            color: theme.colors.text,
            marginTop: 6
          }}
        >
          Registrar Compra
        </Text>
        <Text
          style={{
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.body.fontSize,
            color: theme.colors.textMuted,
            marginTop: 2,
            marginBottom: 18
          }}
        >
          Adicione os dados e produtos da sua compra atual
        </Text>

        {editingId != null ? (
          <View
            style={[
              styles.editBanner,
              { backgroundColor: theme.colors.accent, borderColor: theme.colors.border }
            ]}
          >
            <Text style={{ fontFamily: theme.fontFamily.bold, color: theme.colors.onAccent }}>
              Editando uma compra existente
            </Text>
            <Button label="Cancelar" variant="ghost" onPress={handleCancelarEdicao} />
          </View>
        ) : null}

        <Card>
          <Controller
            control={control}
            name="mes"
            render={({ field }) => (
              <View style={{ marginBottom: 12 }}>
                <Text style={labelStyle(theme)}>Mês da compra</Text>
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
        </Card>

        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="list-outline" size={20} color={theme.colors.primary} />
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.type.title.fontSize,
                color: theme.colors.text
              }}
            >
              Itens da Compra
            </Text>
          </View>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.semiBold,
                fontSize: theme.type.caption.fontSize,
                color: theme.colors.textMuted
              }}
            >
              {fields.length} {fields.length === 1 ? 'item inserido' : 'itens inseridos'}
            </Text>
          </View>
        </View>

        {fields.length === 0 ? (
          <Text
            style={{
              fontFamily: theme.fontFamily.medium,
              fontSize: theme.type.caption.fontSize,
              color: theme.colors.textFaint,
              marginBottom: 12
            }}
          >
            Nenhum item ainda — use o campo abaixo para adicionar.
          </Text>
        ) : null}

        {fields.map((field, index) => {
          const item = itensAtuais[index];
          if (!item) return null;
          const catalogoItem = catalogo.find(
            (c) => c.nome.toLowerCase() === item.nome.toLowerCase()
          );
          const subtotal = (Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0);

          return (
            <Pressable
              key={field.id}
              onPress={() => editarItem(index)}
              style={[
                styles.itemCard,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor:
                    editandoIndex === index ? theme.colors.primary : theme.colors.borderMuted
                }
              ]}
            >
              <View style={[styles.itemIcon, { backgroundColor: theme.colors.background }]}>
                <Ionicons
                  name={getCategoriaIcon(catalogoItem?.categoria)}
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: theme.fontFamily.semiBold,
                    fontSize: theme.type.body.fontSize,
                    color: theme.colors.text
                  }}
                >
                  {item.nome}
                  {item.extra ? <Text style={{ color: theme.colors.accent }}> · extra</Text> : null}
                </Text>
                <Text
                  style={{
                    fontFamily: theme.fontFamily.medium,
                    fontSize: theme.type.caption.fontSize,
                    color: theme.colors.textMuted
                  }}
                >
                  Qtd: {item.quantidade} · Un: {formatBRL(item.valorUnitario)}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: theme.fontFamily.extraBold,
                  fontSize: theme.type.bodyLg.fontSize,
                  color: theme.colors.text
                }}
              >
                {formatBRL(subtotal)}
              </Text>
              <IconButton
                name="trash-outline"
                color={theme.colors.textFaint}
                onPress={() => {
                  remove(index);
                  if (editandoIndex === index) limparComposer();
                }}
              />
            </Pressable>
          );
        })}

        {errors.itens?.message ? (
          <Text style={{ color: theme.colors.danger, marginBottom: 8 }}>
            {errors.itens.message}
          </Text>
        ) : null}

        <View
          style={[
            styles.composer,
            { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
          ]}
        >
          <View style={styles.composerHeader}>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: theme.colors.primary
              }}
            >
              {editandoIndex != null ? 'Editando item' : 'Inserção rápida'}
            </Text>
            {editandoIndex != null ? (
              <Pressable onPress={limparComposer}>
                <Text
                  style={{
                    fontFamily: theme.fontFamily.semiBold,
                    fontSize: theme.type.caption.fontSize,
                    color: theme.colors.textMuted
                  }}
                >
                  cancelar
                </Text>
              </Pressable>
            ) : null}
          </View>

          <TextField
            placeholder="Nome do item (ex: Iogurte Grego)"
            value={draftNome}
            onChangeText={setDraftNome}
          />
          <View style={styles.composerRow}>
            <View style={[styles.composerField, { borderColor: theme.colors.borderMuted }]}>
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fontFamily.medium }}>
                Qtd
              </Text>
              <TextField
                value={draftQtd}
                onChangeText={setDraftQtd}
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
            <View style={[styles.composerField, { borderColor: theme.colors.borderMuted }]}>
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fontFamily.medium }}>
                R$
              </Text>
              <TextField
                placeholder="0,00"
                value={draftValor}
                onChangeText={setDraftValor}
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.composerFooter}>
            <Checkbox checked={draftExtra} onToggle={setDraftExtra} />
            <Text
              style={{
                fontFamily: theme.fontFamily.medium,
                fontSize: theme.type.caption.fontSize,
                color: theme.colors.textMuted,
                flex: 1
              }}
            >
              Item extra (fora da lista comum)
            </Text>
            <Text
              style={{
                fontFamily: theme.fontFamily.extraBold,
                fontSize: theme.type.body.fontSize,
                color: theme.colors.text
              }}
            >
              {formatBRL(draftSubtotal)}
            </Text>
          </View>

          <Button
            label={editandoIndex != null ? 'Atualizar item' : 'Inserir na lista'}
            icon={<Ionicons name="add-circle-outline" size={17} color={theme.colors.onPrimary} />}
            onPress={inserirOuAtualizarItem}
            disabled={!draftNome.trim()}
          />
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
          ]}
        >
          <View style={styles.summaryRow}>
            <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fontFamily.medium }}>
              Subtotal
            </Text>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                color: theme.colors.text,
                fontSize: theme.type.body.fontSize
              }}
            >
              {formatBRL(total)}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.borderMuted }]} />
          <View style={styles.summaryRow}>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: theme.colors.primary
              }}
            >
              Total da compra
            </Text>
            <Text
              style={{
                fontFamily: theme.fontFamily.extraBold,
                fontSize: theme.type.headline.fontSize,
                color: theme.colors.text
              }}
            >
              {formatBRL(total)}
            </Text>
          </View>

          <Pressable onPress={handleSubmit(onSubmit)}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Ionicons name="save-outline" size={18} color={theme.colors.onPrimary} />
              <Text
                style={{
                  fontFamily: theme.fontFamily.extraBold,
                  color: theme.colors.onPrimary,
                  fontSize: theme.type.body.fontSize,
                  letterSpacing: 0.4
                }}
              >
                {editingId != null ? 'Salvar alterações' : 'Salvar compra'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>

      <Toast message={toastMsg} onHide={() => setToastMsg(null)} />
      <ConfirmModal
        visible={confirmacaoFinal != null}
        message={confirmacaoFinal ?? ''}
        onDismiss={() => setConfirmacaoFinal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  composer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginTop: 4,
    marginBottom: 18
  },
  composerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  composerRow: { flexDirection: 'row', gap: 10 },
  composerField: { flex: 1 },
  composerFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -4 },
  summaryCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryDivider: { height: 1, marginVertical: 10 },
  gradientButton: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  }
});
