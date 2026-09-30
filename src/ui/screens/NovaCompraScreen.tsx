import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  Animated,
  Modal,
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
  Screen,
  TextField,
  Toast
} from '@/components';
import { useComprasStore, useCompraEmEdicao } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import { getCategoriaIcon } from '@/utils/categoria';
import { formatBRL } from '@/utils/currency';
import { currentMonthValue } from '@/utils/date';
import { mesmoNome, normalizarNome } from '@/utils/texto';
import { novaCompraFormSchema } from '@/utils/validation';
import type { NovaCompraFormValues } from '@/utils/validation';

/**
 * As formas de pagamento são cadastráveis, então o ícone é escolhido pelo
 * que o nome contém — "Nubank crédito" continua ganhando ícone de cartão.
 */
function iconeMetodoPagamento(nome: string): ComponentProps<typeof Ionicons>['name'] {
  const n = normalizarNome(nome);
  if (n.includes('vale') || n.includes('refeicao') || n.includes('alimentacao')) {
    return 'fast-food-outline';
  }
  if (n.includes('credito')) return 'card-outline';
  if (n.includes('debito')) return 'card';
  if (n.includes('pix')) return 'flash-outline';
  if (n.includes('dinheiro') || n.includes('especie')) return 'cash-outline';
  return 'wallet-outline';
}

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
  const metodosPagamento = useComprasStore((s) => s.metodosPagamento);
  const adicionarMetodoPagamento = useComprasStore((s) => s.adicionarMetodoPagamento);
  const precoMedioPorItem = useComprasStore((s) => s.precoMedioPorItem);
  const compraEmEdicao = useCompraEmEdicao();
  const rascunhoCupom = useComprasStore((s) => s.rascunhoCupom);
  const definirRascunhoCupom = useComprasStore((s) => s.definirRascunhoCupom);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmacaoFinal, setConfirmacaoFinal] = useState<string | null>(null);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [draftNome, setDraftNome] = useState('');
  const [draftQtd, setDraftQtd] = useState('1');
  const [draftValor, setDraftValor] = useState('');
  const [draftExtra, setDraftExtra] = useState(false);
  const [sugestoesAbertas, setSugestoesAbertas] = useState(false);
  const [cadastroMetodoAberto, setCadastroMetodoAberto] = useState(false);
  const [novoMetodoNome, setNovoMetodoNome] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const composerY = useRef(0);

  /**
   * O bloco de inserção rápida fica no fim da tela, então ao abrir o teclado
   * ele e o botão "Inserir na lista" caem atrás dele.
   *
   * Rolamos até o topo do próprio bloco (e não até o fim da tela): assim o
   * campo de nome, os valores e o botão ficam todos visíveis de uma vez. Um
   * `scrollToEnd` passaria do ponto e cortaria justamente o campo que está
   * sendo digitado.
   *
   * O atraso espera a animação de abertura do teclado terminar — antes disso
   * a altura visível ainda é a antiga e o destino sairia errado.
   */
  function revelarComposer() {
    setTimeout(
      () => scrollRef.current?.scrollTo({ y: Math.max(0, composerY.current - 12), animated: true }),
      280
    );
  }

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<NovaCompraFormValues>({
    resolver: zodResolver(novaCompraFormSchema),
    defaultValues: {
      mes: currentMonthValue(),
      mercadoNome: '',
      metodoPagamentoNome: null,
      itens: []
    }
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'itens' });
  const itensAtuais = watch('itens');

  /**
   * Carrega a compra lida de um cupom fiscal para revisão. Consome o
   * rascunho na mesma passada para não reaplicá-lo a cada re-render (e não
   * sobrescrever o que o usuário já corrigiu à mão).
   */
  useEffect(() => {
    if (!rascunhoCupom) return;
    reset({
      mes: rascunhoCupom.mes ?? currentMonthValue(),
      mercadoNome: rascunhoCupom.mercadoNome ?? '',
      metodoPagamentoNome: null,
      itens: rascunhoCupom.itens
    });
    definirRascunhoCupom(null);
    const total = rascunhoCupom.itens.length;
    const reconhecidos = rascunhoCupom.reconhecidos;
    setToastMsg(
      `${total} ${total === 1 ? 'item lido' : 'itens lidos'}` +
        (reconhecidos > 0 ? ` · ${reconhecidos} já no catálogo` : '') +
        ' — confira antes de salvar'
    );
  }, [rascunhoCupom, reset, definirRascunhoCupom]);

  useEffect(() => {
    if (compraEmEdicao) {
      reset({
        mes: compraEmEdicao.mes,
        mercadoNome: compraEmEdicao.mercadoNome,
        metodoPagamentoNome: compraEmEdicao.metodoPagamentoNome,
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
    setSugestoesAbertas(false);
  }

  /**
   * Item do catálogo que corresponde ao que está sendo digitado — ignorando
   * acento e caixa, senão "cafe" viraria um item novo ao lado de "Café".
   */
  const itemNoCatalogo = catalogo.find((c) => mesmoNome(c.nome, draftNome));

  /**
   * Já está no catálogo → insere direto, sem perguntar nada.
   * Não está → é item novo, e aí o checkbox decide se entra como extra.
   */
  const itemEhNovo = draftNome.trim().length > 0 && !itemNoCatalogo;

  const sugestoes = (() => {
    const busca = normalizarNome(draftNome);
    if (busca.length === 0) return [];
    // Um nome exato já resolvido não precisa continuar sugerindo.
    if (itemNoCatalogo) return [];
    return catalogo.filter((c) => normalizarNome(c.nome).includes(busca)).slice(0, 6);
  })();

  function escolherSugestao(nome: string) {
    setDraftNome(nome);
    setSugestoesAbertas(false);
    // Item conhecido nunca é "extra" — ele já faz parte da lista comum.
    setDraftExtra(false);
    // Preenche o valor com o preço médio já pago por este item, quando houver
    // histórico. Continua editável — é um ponto de partida, não um travamento.
    const precoMedio = precoMedioPorItem[nome]?.precoMedio;
    if (precoMedio != null && precoMedio > 0 && draftValor.trim().length === 0) {
      setDraftValor(precoMedio.toFixed(2).replace('.', ','));
    }
  }

  function inserirOuAtualizarItem() {
    if (!draftNome.trim()) {
      setToastMsg('Digite o nome do item antes de inserir');
      return;
    }
    const novoItem = {
      nome: draftNome.trim(),
      quantidade: Number(draftQtd.replace(',', '.')) || 0,
      valorUnitario: Number(draftValor.replace(',', '.')) || 0,
      // Item já catalogado nunca é extra, mesmo que o checkbox tenha ficado
      // marcado de uma digitação anterior.
      extra: itemNoCatalogo ? false : draftExtra
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

  function fecharCadastroMetodo() {
    setCadastroMetodoAberto(false);
    setNovoMetodoNome('');
  }

  async function salvarNovoMetodo() {
    const nome = novoMetodoNome.trim();
    if (!nome) {
      setToastMsg('Digite o nome da forma de pagamento');
      return;
    }
    try {
      const inserido = await adicionarMetodoPagamento(nome);
      setToastMsg(inserido ? `"${nome}" cadastrada` : `"${nome}" já está cadastrada`);
      // Escolhe a forma recém-cadastrada: quem acabou de criá-la quase sempre
      // quer usá-la nesta compra.
      setValue('metodoPagamentoNome', nome);
      fecharCadastroMetodo();
    } catch (erro) {
      console.error('Falha ao cadastrar forma de pagamento', erro);
      setToastMsg('Não foi possível cadastrar');
    }
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
    try {
      await salvarCompra({
        mes: values.mes,
        mercadoNome: values.mercadoNome,
        metodoPagamentoNome: values.metodoPagamentoNome,
        itens: values.itens
          .filter((i) => i.nome.trim().length > 0)
          .map((i) => ({
            nome: i.nome.trim(),
            quantidade: Number(i.quantidade),
            valorUnitario: Number(i.valorUnitario),
            extra: i.extra
          }))
      });
    } catch (erro) {
      // Sem isso a falha de gravação some sem rastro e o botão parece morto.
      console.error('Falha ao salvar a compra', erro);
      setToastMsg('Não foi possível salvar a compra — tente de novo');
      return;
    }

    const eraEdicao = editingId != null;
    reset({ mes: currentMonthValue(), mercadoNome: '', metodoPagamentoNome: null, itens: [] });
    limparComposer();
    setConfirmacaoFinal(
      eraEdicao ? 'Alterações salvas!' : `Compra de ${formatBRL(total)} salva com sucesso!`
    );
  }

  /**
   * O botão "Salvar compra" fica no fim da tela e os campos com erro (mês,
   * supermercado) no início — quem toca no botão não vê a mensagem que o
   * formulário mostrou lá em cima. O toast repete o primeiro erro aqui embaixo.
   */
  function onInvalid(errosForm: typeof errors) {
    const primeiro =
      errosForm.mercadoNome?.message ?? errosForm.mes?.message ?? errosForm.itens?.message;
    setToastMsg(primeiro ?? 'Confira os campos da compra');
  }

  function handleCancelarEdicao() {
    cancelarEdicao();
    reset({ mes: currentMonthValue(), mercadoNome: '', metodoPagamentoNome: null, itens: [] });
    limparComposer();
  }

  const draftSubtotal =
    (Number(draftQtd.replace(',', '.')) || 0) * (Number(draftValor.replace(',', '.')) || 0);

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }}
      >
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
          <Controller
            control={control}
            name="metodoPagamentoNome"
            render={({ field }) => (
              <View>
                <Text style={labelStyle(theme)}>Forma de pagamento</Text>
                <View style={styles.metodosRow}>
                  {metodosPagamento.map((metodo) => {
                    const ativo = field.value === metodo.nome;
                    return (
                      <Pressable
                        key={metodo.id}
                        // Tocar de novo na forma já escolhida desmarca: a
                        // forma de pagamento é opcional.
                        onPress={() => field.onChange(ativo ? null : metodo.nome)}
                        style={[
                          styles.metodoChip,
                          {
                            backgroundColor: ativo ? theme.colors.primary : theme.colors.surfaceAlt,
                            borderColor: ativo ? theme.colors.primary : theme.colors.borderMuted
                          }
                        ]}
                      >
                        <Ionicons
                          name={iconeMetodoPagamento(metodo.nome)}
                          size={13}
                          color={ativo ? theme.colors.onPrimary : theme.colors.textMuted}
                        />
                        <Text
                          style={{
                            fontFamily: theme.fontFamily.semiBold,
                            fontSize: 11,
                            color: ativo ? theme.colors.onPrimary : theme.colors.textMuted
                          }}
                        >
                          {metodo.nome}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    onPress={() => setCadastroMetodoAberto(true)}
                    style={[
                      styles.metodoChip,
                      { backgroundColor: 'transparent', borderColor: theme.colors.primary }
                    ]}
                  >
                    <Ionicons name="add" size={13} color={theme.colors.primary} />
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.semiBold,
                        fontSize: 11,
                        color: theme.colors.primary
                      }}
                    >
                      Nova
                    </Text>
                  </Pressable>
                </View>
              </View>
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
          onLayout={(evento) => {
            composerY.current = evento.nativeEvent.layout.y;
          }}
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
            onFocus={revelarComposer}
            onChangeText={(texto) => {
              setDraftNome(texto);
              setSugestoesAbertas(true);
            }}
          />

          {sugestoesAbertas && sugestoes.length > 0 ? (
            <View
              style={[
                styles.sugestoes,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
              ]}
            >
              {sugestoes.map((sugestao) => (
                <Pressable
                  key={sugestao.id}
                  onPress={() => escolherSugestao(sugestao.nome)}
                  style={styles.sugestaoLinha}
                >
                  <Ionicons
                    name={getCategoriaIcon(sugestao.categoria)}
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: theme.fontFamily.semiBold,
                      fontSize: theme.type.body.fontSize,
                      color: theme.colors.text
                    }}
                  >
                    {sugestao.nome}
                  </Text>
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.medium,
                      fontSize: theme.type.caption.fontSize,
                      color: theme.colors.textFaint
                    }}
                  >
                    {sugestao.categoria}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {itemNoCatalogo ? (
            <View style={styles.statusItem}>
              <Ionicons
                name={getCategoriaIcon(itemNoCatalogo.categoria)}
                size={14}
                color={theme.colors.primary}
              />
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: theme.type.caption.fontSize,
                  color: theme.colors.textMuted
                }}
              >
                No catálogo · {itemNoCatalogo.categoria}
              </Text>
            </View>
          ) : null}
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
            {/* O checkbox só faz sentido para item novo: o que já está no
                catálogo entra direto na lista, sem pergunta nenhuma. */}
            {itemEhNovo ? (
              <>
                <Checkbox checked={draftExtra} onToggle={setDraftExtra} />
                <Text
                  style={{
                    fontFamily: theme.fontFamily.medium,
                    fontSize: theme.type.caption.fontSize,
                    color: theme.colors.textMuted,
                    flex: 1
                  }}
                >
                  Item novo — marcar como extra
                </Text>
              </>
            ) : (
              <View style={{ flex: 1 }} />
            )}
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

          <Pressable onPress={handleSubmit(onSubmit, onInvalid)}>
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

      <Modal
        visible={cadastroMetodoAberto}
        transparent
        animationType="fade"
        onRequestClose={fecharCadastroMetodo}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.type.title.fontSize,
                color: theme.colors.text,
                marginBottom: 10
              }}
            >
              Nova forma de pagamento
            </Text>
            <TextField
              placeholder="Ex: Nubank crédito"
              value={novoMetodoNome}
              onChangeText={setNovoMetodoNome}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button label="Cancelar" variant="secondary" onPress={fecharCadastroMetodo} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Cadastrar" onPress={salvarNovoMetodo} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Toast message={toastMsg} onHide={() => setToastMsg(null)} />
      <ConfirmModal
        visible={confirmacaoFinal != null}
        message={confirmacaoFinal ?? ''}
        onDismiss={() => setConfirmacaoFinal(null)}
      />
    </Screen>
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
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 20, borderWidth: 1, padding: 20 },
  metodosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  metodoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  composerFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -4 },
  sugestoes: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: -6,
    marginBottom: 10
  },
  sugestaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
    marginBottom: 10
  },
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
