module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@/components': './src/ui/components',
            '@/screens': './src/ui/screens',
            '@/theme': './src/ui/theme',
            '@/storage': './src/data/storage',
            '@/store': './src/data/store',
            '@/types': './src/data/types',
            '@/constants': './src/shared/constants',
            '@/utils': './src/shared/utils',
            '@/services': './src/services',
            '@': './src'
          },
          extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json']
        }
      ],
      // Deve ser sempre o último da lista.
      // No Reanimated 4 o plugin de worklets passou a viver em um pacote
      // próprio, `react-native-reanimated/plugin` virou só um reexport dele.
      'react-native-worklets/plugin'
    ]
  };
};
