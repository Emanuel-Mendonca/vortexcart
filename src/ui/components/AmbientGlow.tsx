import { View } from 'react-native';

interface AmbientGlowProps {
  color: string;
  size?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}

/**
 * Mancha de luz ambiente decorativa, usada atrás de cards para dar a
 * sensação de "glow" atmosférico. RN não tem blur de fundo nativo sem
 * biblioteca extra, então aproximamos com um círculo grande de cor sólida
 * em baixa opacidade — funciona bem porque nossas superfícies já são
 * escuras e o efeito não precisa ser um blur perfeito para "ler" como luz.
 */
export function AmbientGlow({
  color,
  size = 220,
  top,
  left,
  right,
  bottom,
  opacity = 0.25
}: AmbientGlowProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        top,
        left,
        right,
        bottom,
        zIndex: -1
      }}
    />
  );
}
