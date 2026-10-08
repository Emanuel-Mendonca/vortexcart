import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useComprasStore } from '@/store/useComprasStore';
import { useTema } from '@/theme';
import type { PreferenciaTema } from '@/types';

interface Opcao {
  valor: PreferenciaTema;
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
}

const OPCOES: readonly Opcao[] = [
  { valor: 'claro', rotulo: 'Claro', icone: 'sunny-outline' },
  { valor: 'escuro', rotulo: 'Escuro', icone: 'moon-outline' },
  { valor: 'sistema', rotulo: 'Sistema', icone: 'phone-portrait-outline' }
];

/**
 * Alterna entre tema claro, escuro e o do aparelho.
 *
 * A escolha é gravada no banco local, então sobrevive ao fechamento do app.
 * "Sistema" continua sendo o padrão: quem nunca tocou aqui acompanha a
 * preferência do celular, como antes.
 */
export function SeletorTema() {
  const theme = useTema();
  const preferencia = useComprasStore((s) => s.preferenciaTema);
  const definirPreferenciaTema = useComprasStore((s) => s.definirPreferenciaTema);

  return (
    <View
      style={[
        styles.area,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderMuted }
      ]}
    >
      <View style={styles.cabecalho}>
        <Ionicons name="color-palette-outline" size={16} color={theme.colors.primary} />
        <Text
          style={{
            flex: 1,
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.type.body.fontSize,
            color: theme.colors.text
          }}
        >
          Aparência
        </Text>
      </View>

      <View style={[styles.grupo, { backgroundColor: theme.colors.surfaceAlt }]}>
        {OPCOES.map((opcao) => {
          const ativo = preferencia === opcao.valor;
          return (
            <Pressable
              key={opcao.valor}
              onPress={() => void definirPreferenciaTema(opcao.valor)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={`Tema ${opcao.rotulo}`}
              style={[styles.opcao, ativo && { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons
                name={opcao.icone}
                size={15}
                color={ativo ? theme.colors.onPrimary : theme.colors.textMuted}
              />
              <Text
                style={{
                  fontFamily: ativo ? theme.fontFamily.bold : theme.fontFamily.medium,
                  fontSize: 12,
                  color: ativo ? theme.colors.onPrimary : theme.colors.textMuted
                }}
              >
                {opcao.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 12, gap: 10 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grupo: { flexDirection: 'row', borderRadius: 999, padding: 4, gap: 4 },
  opcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 999
  }
});
