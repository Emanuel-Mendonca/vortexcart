# Guia de desenvolvimento e publicação

Como rodar o projeto, gerar um app instalável e publicar. Para convenções de código,
commits e Pull Request, veja [CONTRIBUTING.md](../../.github/CONTRIBUTING.md).

## Pré-requisitos

| Ferramenta  | Versão                       | Necessário para                |
| ----------- | ---------------------------- | ------------------------------ |
| Node.js     | 18 ou superior               | tudo                           |
| npm         | vem com o Node               | tudo                           |
| Git         | qualquer recente             | versionamento                  |
| JDK         | **17**                       | apenas para build local do APK |
| Android SDK | platform-tools + build-tools | apenas para build local do APK |

O JDK 17 é obrigatório para o build nativo: o React Native 0.86 não compila com JDK 8 nem
com versões mais novas que a 17.

## Instalar e rodar

```bash
git clone https://github.com/Emanuel-Mendonca/vortexcart.git
cd vortexcart
npm install
```

```bash
npx expo start
```

Escaneie o QR code com o **Expo Go**. O Expo Go instalado precisa ser compatível com o
**SDK 57**, versões mais antigas recusam o projeto.

### Scripts

| Comando                 | O que faz                            |
| ----------------------- | ------------------------------------ |
| `npm start`             | inicia o servidor de desenvolvimento |
| `npm run lint`          | ESLint em todo o projeto             |
| `npm run lint:fix`      | corrige o que for automático         |
| `npm run typecheck`     | `tsc --noEmit`                       |
| `npm test`              | roda os testes uma vez               |
| `npm run test:watch`    | modo watch                           |
| `npm run test:coverage` | relatório de cobertura               |

## Gerar um APK instalável

Duas rotas. A local não exige conta nem fila; a do EAS não exige SDK Android na máquina.

### Rota 1, build local

Gera as pastas nativas a partir do `app.config.ts`:

```bash
npx expo prebuild --platform android
```

Aponte o SDK Android (use barras normais, arquivo `.properties` trata `\` como escape):

```bash
echo "sdk.dir=C:/caminho/para/android-sdk" > android/local.properties
```

Por padrão o Gradle compila **quatro arquiteturas**. Para testar no próprio celular,
restrinja a uma, corta o tempo de compilação em cerca de quatro vezes. Em
`android/gradle.properties`:

```
reactNativeArchitectures=arm64-v8a
```

Compile:

```bash
cd android && ./gradlew assembleRelease
```

O APK sai em `android/app/build/outputs/apk/release/app-release.apk`. Ele é assinado com a
chave de depuração, serve para instalar e testar, **não** para publicar em loja.

Instale com o aparelho conectado e a depuração USB ativa:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

> A pasta `android/` é ignorada pelo Git. Rodar `prebuild --clean` a recria do zero e
> desfaz os ajustes acima.

### Rota 2, EAS Build

Usa o serviço da Expo. Exige conta em expo.dev.

```bash
npx eas-cli login
```

```bash
npx eas-cli build:configure
```

```bash
npm run build:preview:android
```

O terminal devolve um link para baixar o `.apk`. Para iOS,
`npm run build:preview:ios` gera build de simulador; instalar em iPhone físico exige conta
paga da Apple Developer.

## Publicar a landing page

O workflow `.github/workflows/deploy-landing.yml` publica a pasta `docs/` no GitHub Pages a
cada push na `main` que toque nela.

Para habilitar na primeira vez: **Settings → Pages → Source: GitHub Actions**.

A página fica em `https://<usuario>.github.io/vortexcart/`.

## Publicar uma versão

O workflow `release.yml` cria a release automaticamente a partir de uma tag:

```bash
git tag -a v0.2.0 -m "Descrição da versão"
```

```bash
git push origin v0.2.0
```

A numeração segue [SemVer](https://semver.org/lang/pt-BR/): **MAJOR** para quebra de
compatibilidade, **MINOR** para funcionalidade nova compatível, **PATCH** para correção.

Antes de criar a tag, atualize a seção `[Não lançado]` do
[CHANGELOG.md](../../CHANGELOG.md) com o número da versão e a data.

## Solução de problemas

| Sintoma                                | Causa provável                                             |
| -------------------------------------- | ---------------------------------------------------------- |
| `npm install` falha em peer dependency | falta o `.npmrc` com `legacy-peer-deps=true`               |
| Gradle acusa versão de Java            | `JAVA_HOME` não aponta para o JDK 17                       |
| Erro de sintaxe de caminho no Gradle   | `local.properties` escrito com `\` em vez de `/`           |
| Expo Go recusa abrir o projeto         | versão do Expo Go incompatível com o SDK 57                |
| `adb` não enxerga o aparelho           | depuração USB desligada, ou cabo só de carga               |
| Build local demora demais              | compilando as quatro arquiteturas; restrinja a `arm64-v8a` |
