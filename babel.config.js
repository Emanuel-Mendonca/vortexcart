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
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/hooks': './src/hooks',
            '@/store': './src/store',
            '@/services': './src/services',
            '@/storage': './src/storage',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/constants': './src/constants',
            '@/theme': './src/theme',
            '@/navigation': './src/navigation',
            '@/features': './src/features'
          },
          extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json']
        }
      ],
      // Reanimated plugin deve ser sempre o último da lista
      'react-native-reanimated/plugin'
    ]
  };
};
