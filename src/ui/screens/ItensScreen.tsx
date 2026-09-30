import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
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
  ConfirmModal,
  EmptyState,
  Screen,
  SeletorCategoria,
  TextField,
  Toast
} from '@/components';
import { CATEGORIAS, CATEGORIA_PADRAO } from '@/constants';
import { useComprasStore } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import type { CatalogoItem, MetodoPagamento } from '@/types';
import { getCategoriaIcon } from '@/utils/categoria';
import { formatBRL } from '@/utils/currency';

export function ItensScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');

  const catalogo = useComprasStore((s) => s.catalogo);
  const precoMedioPorItem = useComprasStore((s) => s.precoMedioPorItem);
  const adicionarItemCatalogo = useComprasStore((s) => s.adicionarItemCatalogo);
  const metodosPagamento = useComprasStore((s) => s.metodosPagamento);
  const adicionarMetodoPagamento = useComprasStore((s) => s.adicionarMetodoPagamento);
  const removerMetodoPagamento = useComprasStore((s) => s.removerMetodoPagamento);
  const renomearItemCatalogo = useComprasStore((s) => s.renomearItemCatalogo);
  const removerItemCatalogo = useComprasStore((s) => s.removerItemCatalogo);

  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState(CATEGORIA_PADRAO);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [editando, setEditando] = useState<CatalogoItem | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [categoriaEdicao, setCategoriaEdicao] = useState(CATEGORIA_PADRAO);
  const [confirmarRemocao, setConfirmarRemocao] = useState<CatalogoItem | null>(null);
  const [confirmarRemocaoMetodo, setConfirmarRemocaoMetodo] = useState<MetodoPagamento | null>(
    null
  );
  const [novoMetodo, setNovoMetodo] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categoriasAtivas = useMemo(
    () => Array.from(new Set(catalogo.map((c) => c.categoria))),
    [catalogo]
  );

  const catalogoFiltrado = useMemo(() => {
    if (!categoriaFiltro) return catalogo;
    return catalogo.filter((c) => c.categoria === categoriaFiltro);
  }, [catalogo, categoriaFiltro]);

  async function handleAdicionar() {
    const nome = novoNome.trim();
    // Sem `return` mudo: o botão fica sempre habilitado e cada caminho diz o
    // que aconteceu, senão um toque sem efeito parece um botão quebrado.
    if (!nome) {
      setToastMsg('Digite o nome do item antes de adicionar');
      return;
    }
    try {
      const inserido = await adicionarItemCatalogo(nome, novaCategoria);
      if (inserido) {
        setToastMsg(`"${nome}" adicionado ao catálogo`);
        setNovoNome('');
        setNovaCategoria(CATEGORIA_PADRAO);
      } else {
        setToastMsg(`"${nome}" já está no catálogo`);
      }
    } catch (erro) {
      console.error('Falha ao adicionar item ao catálogo', erro);
      setToastMsg('Não foi possível salvar o item');
    }
  }

  async function handleAdicionarMetodo() {
    const nome = novoMetodo.trim();
    if (!nome) {
      setToastMsg('Digite o nome da forma de pagamento');
      return;
    }
    try {
      const inserido = await adicionarMetodoPagamento(nome);
      if (inserido) {
        setToastMsg(`"${nome}" cadastrada`);
        setNovoMetodo('');
      } else {
        setToastMsg(`"${nome}" já está cadastrada`);
      }
    } catch (erro) {
      console.error('Falha ao cadastrar forma de pagamento', erro);
      setToastMsg('Não foi possível cadastrar');
    }
  }

  function abrirEdicao(item: CatalogoItem) {
    setEditando(item);
    setNomeEdicao(item.nome);
    setCategoriaEdicao(item.categoria);
  }

  async function salvarEdicao() {
    if (!editando || !nomeEdicao.trim()) return;
    await renomearItemCatalogo(editando.id, nomeEdicao.trim(), categoriaEdicao);
    setToastMsg('Item atualizado');
    setEditando(null);
  }

  return (
    <Screen>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={catalogoFiltrado}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <AmbientGlow
              color={theme.colors.primary}
              size={230}
              top={-40}
              right={-80}
              opacity={0.16}
            />
            <AmbientGlow
              color={theme.colors.accent}
              size={180}
              top={200}
              left={-70}
              opacity={0.1}
            />

            <View
              style={[
                styles.headerCard,
                { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
              ]}
            >
              <View style={styles.headerTopRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.pulseDot, { backgroundColor: theme.colors.accent }]} />
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.extraBold,
                      fontSize: theme.type.headline.fontSize,
                      color: theme.colors.text
                    }}
                  >
                    Catálogo de Itens
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: theme.type.caption.fontSize,
                  color: theme.colors.textMuted,
                  marginTop: 4,
                  marginBottom: 14
                }}
              >
                Base de produtos usada como sugestão ao registrar uma compra.
              </Text>

              <TextField
                placeholder="Nome do novo item, ex: Arroz"
                value={novoNome}
                onChangeText={setNovoNome}
              />
              <SeletorCategoria
                label="Departamento"
                categorias={CATEGORIAS}
                valor={novaCategoria}
                onChange={setNovaCategoria}
              />
              <View style={{ marginTop: 10 }}>
                <Button
                  label="Adicionar"
                  icon={<Ionicons name="add" size={16} color={theme.colors.onPrimary} />}
                  onPress={handleAdicionar}
                />
              </View>
            </View>

            <View
              style={[
                styles.headerCard,
                { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
              ]}
            >
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: theme.type.title.fontSize,
                  color: theme.colors.text
                }}
              >
                Formas de pagamento
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: theme.type.caption.fontSize,
                  color: theme.colors.textMuted,
                  marginTop: 4,
                  marginBottom: 12
                }}
              >
                Aparecem como opção ao registrar uma compra.
              </Text>

              {metodosPagamento.map((metodo) => (
                <View
                  key={metodo.id}
                  style={[styles.metodoLinha, { borderColor: theme.colors.borderMuted }]}
                >
                  <Ionicons name="wallet-outline" size={16} color={theme.colors.primary} />
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: theme.fontFamily.semiBold,
                      fontSize: theme.type.body.fontSize,
                      color: theme.colors.text
                    }}
                  >
                    {metodo.nome}
                  </Text>
                  <Pressable
                    onPress={() => setConfirmarRemocaoMetodo(metodo)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.textFaint} />
                  </Pressable>
                </View>
              ))}

              <View style={{ marginTop: 10 }}>
                <TextField
                  placeholder="Nova forma, ex: Nubank crédito"
                  value={novoMetodo}
                  onChangeText={setNovoMetodo}
                />
                <Button
                  label="Cadastrar forma de pagamento"
                  icon={<Ionicons name="add" size={16} color={theme.colors.onPrimary} />}
                  onPress={handleAdicionarMetodo}
                />
              </View>
            </View>

            <View style={[styles.metricStrip, { backgroundColor: theme.colors.surfaceAlt }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="cube-outline" size={16} color={theme.colors.primary} />
                <Text
                  style={{
                    fontFamily: theme.fontFamily.semiBold,
                    fontSize: 12,
                    color: theme.colors.text
                  }}
                >
                  {catalogo.length}{' '}
                  {catalogo.length === 1 ? 'item cadastrado' : 'itens cadastrados'}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: theme.fontFamily.medium,
                  fontSize: 12,
                  color: theme.colors.textMuted
                }}
              >
                {categoriasAtivas.length}{' '}
                {categoriasAtivas.length === 1 ? 'categoria ativa' : 'categorias ativas'}
              </Text>
            </View>

            {/* Rolagem horizontal: com 15 departamentos, a versão que
                quebrava linha ocupava um terço da tela só de filtro. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <Pressable
                onPress={() => setCategoriaFiltro(null)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      categoriaFiltro === null ? theme.colors.primary : theme.colors.surfaceAlt,
                    borderColor: theme.colors.borderMuted
                  }
                ]}
              >
                <Text
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    fontSize: 12,
                    color:
                      categoriaFiltro === null ? theme.colors.onPrimary : theme.colors.textMuted
                  }}
                >
                  Todos ({catalogo.length})
                </Text>
              </Pressable>
              {categoriasAtivas.map((cat) => {
                const count = catalogo.filter((c) => c.categoria === cat).length;
                const ativo = categoriaFiltro === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategoriaFiltro(ativo ? null : cat)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: ativo ? theme.colors.primary : theme.colors.surfaceAlt,
                        borderColor: theme.colors.borderMuted
                      }
                    ]}
                  >
                    <Ionicons
                      name={getCategoriaIcon(cat)}
                      size={12}
                      color={ativo ? theme.colors.onPrimary : theme.colors.textMuted}
                    />
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.bold,
                        fontSize: 12,
                        color: ativo ? theme.colors.onPrimary : theme.colors.textMuted
                      }}
                    >
                      {cat} ({count})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="list-outline" message="Nenhum item nessa categoria ainda." />
        }
        renderItem={({ item }) => {
          const stats = precoMedioPorItem[item.nome];
          return (
            <View
              style={[
                styles.itemRow,
                { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
              ]}
            >
              <View style={[styles.itemIcon, { backgroundColor: theme.colors.background }]}>
                <Ionicons
                  name={getCategoriaIcon(item.categoria)}
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: theme.fontFamily.semiBold,
                      fontSize: 14,
                      color: theme.colors.text
                    }}
                  >
                    {item.nome}
                  </Text>
                  <View
                    style={[styles.badgeCategoria, { backgroundColor: theme.colors.background }]}
                  >
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.semiBold,
                        fontSize: 9,
                        color: theme.colors.textMuted
                      }}
                    >
                      {item.categoria}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontFamily: theme.fontFamily.medium,
                    fontSize: 11,
                    color: theme.colors.textMuted
                  }}
                >
                  {stats
                    ? `Preço médio: ${formatBRL(stats.precoMedio)} (${stats.quantidadeCompras}x)`
                    : 'Sem histórico de compra ainda'}
                </Text>
              </View>
              <Pressable onPress={() => abrirEdicao(item)} hitSlop={8} style={{ padding: 4 }}>
                <Ionicons name="pencil-outline" size={17} color={theme.colors.textFaint} />
              </Pressable>
              <Pressable
                onPress={() => setConfirmarRemocao(item)}
                hitSlop={8}
                style={{ padding: 4 }}
              >
                <Ionicons name="trash-outline" size={17} color={theme.colors.textFaint} />
              </Pressable>
            </View>
          );
        }}
      />

      <Modal
        visible={editando != null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditando(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderMuted }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: 16,
                  color: theme.colors.text
                }}
              >
                Atualizar item
              </Text>
              <Pressable onPress={() => setEditando(null)} hitSlop={8}>
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            <TextField value={nomeEdicao} onChangeText={setNomeEdicao} />
            <SeletorCategoria
              label="Departamento"
              categorias={CATEGORIAS}
              valor={categoriaEdicao}
              onChange={setCategoriaEdicao}
            />
            <View style={styles.modalActions}>
              <View style={{ flex: 1 }}>
                <Button label="Cancelar" variant="secondary" onPress={() => setEditando(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Salvar" onPress={salvarEdicao} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmarRemocao != null}
        message={`Remover "${confirmarRemocao?.nome ?? ''}" do catálogo?`}
        confirmLabel="Remover"
        onConfirm={() => {
          if (confirmarRemocao) void removerItemCatalogo(confirmarRemocao.id);
        }}
        onDismiss={() => setConfirmarRemocao(null)}
      />

      <ConfirmModal
        visible={confirmarRemocaoMetodo != null}
        message={`Remover "${confirmarRemocaoMetodo?.nome ?? ''}"? As compras que usaram esta forma de pagamento continuam salvas, apenas sem ela.`}
        confirmLabel="Remover"
        onConfirm={() => {
          if (confirmarRemocaoMetodo) void removerMetodoPagamento(confirmarRemocaoMetodo.id);
        }}
        onDismiss={() => setConfirmarRemocaoMetodo(null)}
      />

      <Toast message={toastMsg} onHide={() => setToastMsg(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  categoriaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  metodoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  metricStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  filterScroll: { flexDirection: 'row', gap: 6, paddingBottom: 14, paddingRight: 16 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1
  },
  itemRow: {
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
  badgeCategoria: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999 },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalBox: { width: '100%', maxWidth: 360, padding: 20, borderRadius: 18, borderWidth: 1, gap: 4 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 }
});
