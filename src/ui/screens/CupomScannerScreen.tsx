import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import { AmbientGlow, Button, Screen, Toast } from '@/components';
import { SCRIPT_EXTRACAO, normalizarNota } from '@/services/nfce/extrairItens';
import type { PayloadWebView } from '@/services/nfce/extrairItens';
import { useComprasStore } from '@/store/useComprasStore';
import { getTheme } from '@/theme';
import { QrCodeInvalidoError, lerQrCodeNfce, urlPortalMg } from '@/utils/nfce';
import type { ChaveNfce } from '@/utils/nfce';
import { casarComCatalogo } from '@/utils/texto';

type Etapa = 'escaneando' | 'portal';

/**
 * Leitura do cupom fiscal em duas etapas.
 *
 * 1. Câmera lê o QR e extrai a chave de acesso (o QR **não** traz os itens).
 * 2. O portal da SEFAZ-MG abre numa WebView. O usuário resolve o reCAPTCHA —
 *    é ele quem passa pela verificação, o app não a contorna — e assim que a
 *    nota aparece, o app lê os itens da página já carregada.
 *
 * Só MG por enquanto: cada UF tem portal e HTML próprios.
 */
export function CupomScannerScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark' ? 'dark' : 'light');
  const router = useRouter();

  const [permissao, pedirPermissao] = useCameraPermissions();
  const [etapa, setEtapa] = useState<Etapa>('escaneando');
  const [urlPortal, setUrlPortal] = useState<string | null>(null);
  const [chaveLida, setChaveLida] = useState<ChaveNfce | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // A câmera dispara o callback várias vezes por segundo enquanto o QR
  // estiver no enquadramento; sem esta trava abriríamos o portal em loop.
  const jaLeu = useRef(false);

  const definirRascunhoCupom = useComprasStore((s) => s.definirRascunhoCupom);
  const catalogo = useComprasStore((s) => s.catalogo);

  /** Volta ao estado inicial para ler outro cupom. */
  const reiniciarLeitura = useCallback(() => {
    jaLeu.current = false;
    setEtapa('escaneando');
    setUrlPortal(null);
    setChaveLida(null);
  }, []);

  /**
   * Reabrir a aba Cupom sempre começa uma leitura nova. Sem isto, voltar à
   * aba depois de importar uma nota mostrava o portal da nota anterior, sem
   * caminho óbvio para escanear a próxima.
   */
  useFocusEffect(reiniciarLeitura);

  function aoLerQr(resultado: { data: string }) {
    if (jaLeu.current) return;
    try {
      const chave = lerQrCodeNfce(resultado.data);
      jaLeu.current = true;
      setChaveLida(chave);
      setUrlPortal(urlPortalMg(resultado.data));
      setEtapa('portal');
    } catch (erro) {
      if (erro instanceof QrCodeInvalidoError) {
        // Não travamos a leitura: o usuário pode simplesmente estar apontando
        // para outro QR qualquer enquanto procura o do cupom.
        setToastMsg(erro.message);
        return;
      }
      throw erro;
    }
  }

  function aoReceberDaPagina(evento: WebViewMessageEvent) {
    let payload: PayloadWebView;
    try {
      payload = JSON.parse(evento.nativeEvent.data) as PayloadWebView;
    } catch {
      return;
    }

    // A página ainda não mostrou a nota (reCAPTCHA pendente, por exemplo).
    if (payload.tipo !== 'nota') return;

    const nota = normalizarNota(payload);
    if (nota.itens.length === 0) return;

    // O cupom escreve abreviado ("ARROZ TIPO 1 5KG"). Reaproveitar o nome já
    // cadastrado evita encher o catálogo de variações do mesmo produto e faz
    // o preço médio por item acumular histórico de verdade.
    const nomesCatalogo = catalogo.map((c) => c.nome);
    let reconhecidos = 0;
    const itens = nota.itens.map((item) => {
      const conhecido = casarComCatalogo(item.nome, nomesCatalogo);
      if (!conhecido) return item;
      reconhecidos++;
      return { ...item, nome: conhecido };
    });

    definirRascunhoCupom({
      mes: chaveLida?.mesCompra ?? null,
      mercadoNome: nota.mercadoNome,
      itens,
      reconhecidos
    });
    router.replace('/');
  }

  // Estado transitório enquanto o SO responde sobre a permissão.
  if (!permissao) {
    return (
      <Screen>
        <View style={styles.centro} />
      </Screen>
    );
  }

  if (!permissao.granted) {
    return (
      <Screen respeitarBase>
        <View style={styles.centro}>
          <AmbientGlow
            color={theme.colors.primary}
            size={240}
            top={-40}
            left={-60}
            opacity={0.18}
          />
          <Ionicons name="camera-outline" size={44} color={theme.colors.primary} />
          <Text
            style={{
              fontFamily: theme.fontFamily.bold,
              fontSize: theme.type.title.fontSize,
              color: theme.colors.text,
              textAlign: 'center',
              marginTop: 12
            }}
          >
            Precisamos da câmera
          </Text>
          <Text
            style={{
              fontFamily: theme.fontFamily.medium,
              fontSize: theme.type.body.fontSize,
              color: theme.colors.textMuted,
              textAlign: 'center',
              marginTop: 6,
              marginBottom: 18
            }}
          >
            Para ler o QR Code do cupom fiscal e preencher a compra sozinho.
          </Text>
          <Button label="Permitir acesso" onPress={() => void pedirPermissao()} />
        </View>
      </Screen>
    );
  }

  if (etapa === 'portal' && urlPortal) {
    return (
      <Screen respeitarBase>
        <View style={[styles.avisoPortal, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.accent} />
          <Text
            style={{
              flex: 1,
              fontFamily: theme.fontFamily.medium,
              fontSize: theme.type.caption.fontSize,
              color: theme.colors.textMuted
            }}
          >
            Se o portal pedir, confirme o "não sou um robô". Os itens são lidos em seguida.
          </Text>
          <Pressable onPress={reiniciarLeitura} hitSlop={8} style={styles.botaoNovoCupom}>
            <Ionicons name="scan-outline" size={14} color={theme.colors.primary} />
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.type.caption.fontSize,
                color: theme.colors.primary
              }}
            >
              Novo
            </Text>
          </Pressable>
        </View>
        <WebView
          source={{ uri: urlPortal }}
          onMessage={aoReceberDaPagina}
          // Reinjetado a cada carregamento e depois em intervalo curto: a
          // página troca de conteúdo sem navegar quando o reCAPTCHA é aceito.
          injectedJavaScript={`setInterval(function(){${SCRIPT_EXTRACAO}}, 1200); true;`}
          style={{ flex: 1, backgroundColor: theme.colors.background }}
        />
        <Toast message={toastMsg} onHide={() => setToastMsg(null)} />
      </Screen>
    );
  }

  return (
    <Screen respeitarBase>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={aoLerQr}
      />
      <View style={[styles.instrucao, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} />
        <Text
          style={{
            flex: 1,
            fontFamily: theme.fontFamily.medium,
            fontSize: theme.type.body.fontSize,
            color: theme.colors.text
          }}
        >
          Aponte para o QR Code do cupom fiscal
        </Text>
      </View>
      <Toast message={toastMsg} onHide={() => setToastMsg(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  instrucao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    margin: 16,
    borderRadius: 16
  },
  botaoNovoCupom: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  avisoPortal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    margin: 12,
    borderRadius: 12
  }
});
