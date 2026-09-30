import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Vortex Cart',
  slug: 'vortex-cart',
  scheme: 'vortexcart',
  owner: undefined,
  version: '0.1.0',
  orientation: 'portrait',
  icon: './src/ui/assets/icon.png',
  userInterfaceStyle: 'automatic',
  // A chave `splash` de topo saiu do ExpoConfig no SDK 57 — a splash agora é
  // configurada exclusivamente pelo plugin `expo-splash-screen`, mais abaixo.
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.vortexcart.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/ui/assets/adaptive-icon.png',
      backgroundColor: '#000000'
    },
    package: 'com.vortexcart.app'
  },
  web: {
    favicon: './src/ui/assets/favicon.png',
    bundler: 'metro'
  },
  plugins: [
    'expo-router',
    // A partir do SDK 57 estes módulos precisam ser declarados explicitamente
    // como plugins (antes eram resolvidos por autolinking sem entrada aqui).
    'expo-font',
    [
      'expo-camera',
      {
        cameraPermission:
          'O Vortex Cart usa a câmera para ler o QR Code do cupom fiscal e preencher a compra automaticamente.'
      }
    ],
    'expo-sharing',
    'expo-sqlite',
    'expo-status-bar',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#000000',
        image: './src/ui/assets/splash.png',
        imageWidth: 200
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: false
    }
  }
});
