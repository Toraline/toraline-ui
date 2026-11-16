# @toraline.tech/tokens

[English](https://github.com/Toraline/toraline-ui/blob/main/packages/tokens/README.md) | **Português**

Os design tokens e os temas da biblioteca de componentes da Toraline. Um design token é um valor do design com nome, por exemplo uma cor ou uma fonte, guardado como uma variável CSS. Este pacote não tem código React.

O catálogo está online: https://toraline-ui.vercel.app/ A página **Foundations > Tokens** dele mostra todo token deste pacote, com o valor dele em cada tema.

## Instalação

O pacote está no npm. A versão atual é a `0.3.0`, publicada em 2026-11-16. A primeira versão, a `0.1.0`, foi publicada em 2026-11-15.

```bash
npm install @toraline.tech/tokens
```

- A biblioteca está na versão `0.x`: os tokens ainda podem mudar entre versões.
- Um app que também usa `@toraline.tech/ui` instala os dois pacotes na mesma versão.
- O pacote não precisa de React. O Tailwind CSS 4 é opcional.
- O pacote tem apenas ES modules (arquivos lidos com `import`), com arquivos de tipos para TypeScript.

Para testar uma mudança da biblioteca que ainda não foi publicada, um app pode instalar o arquivo do pacote que `make pack` escreve. Os passos estão no começo do guia 1 em [`docs/guide.pt-BR.md`](../../docs/guide.pt-BR.md).

## Os dois níveis

- **Nível 1: valores brutos.** O nome diz o que o valor é. Exemplo: `--color-brand-700` é `#42637c`. Arquivo: [`css/primitives.css`](css/primitives.css).
- **Nível 2: significados.** O nome diz para que o valor serve. Exemplo: `--bg-primary` é o fundo da ação principal. Os componentes usam apenas tokens de nível 2.

Os tokens de cor de nível 2 têm os nomes e os valores do design system do app Intraweb, um app da Toraline. Por isso a aparência padrão da biblioteca é a aparência do Intraweb. Um teste compara os dois temas com uma cópia dos arquivos de tema do Intraweb.

Um **tema** é um bloco de valores de nível 2. A página seleciona um tema com o atributo `data-theme` no seu elemento raiz (`<html>`). A biblioteca tem dois temas:

| Tema | Arquivo | Vale quando |
|---|---|---|
| `light` | [`css/themes/light.css`](css/themes/light.css) | `<html data-theme="light">`, e também quando `<html>` não tem `data-theme` |
| `dark` | [`css/themes/dark.css`](css/themes/dark.css) | `<html data-theme="dark">` |

## Como usar

1. Importe o CSS uma vez, no arquivo CSS global do app:

   ```css
   @import "@toraline.tech/tokens/css";
   ```

   Esta única linha carrega os tokens de nível 1, o tema claro e o tema escuro. Os três arquivos também podem ser importados um por um: `@toraline.tech/tokens/css/primitives.css`, `@toraline.tech/tokens/css/themes/light.css`, `@toraline.tech/tokens/css/themes/dark.css`.

2. Selecione o tema no elemento raiz:

   ```html
   <html data-theme="dark">
   ```

3. Use os tokens de nível 2 no CSS:

   ```css
   .card {
     background: var(--bg-surface);
     color: var(--text-primary);
     border: 1px solid var(--border-default);
     border-radius: var(--radius-xl);
     box-shadow: var(--shadow-card);
     font-family: var(--font-body);
   }
   ```

Os mesmos valores estão disponíveis em TypeScript:

```ts
import { colorTokenNames, darkTheme, lightTheme, primitives, themeTokenNames } from "@toraline.tech/tokens";

lightTheme.tokens["bg-primary"]; // "var(--color-brand-700)"
darkTheme.tokens["bg-primary"]; // "#8eaec5"
primitives["color-brand-700"]; // "#42637c"
themeTokenNames; // the names of every level 2 token
colorTokenNames; // the names of the level 2 color tokens only
```

## Monte um tema para um app: `createTheme`

`createTheme` é uma função que recebe os valores de um app e devolve o CSS de um tema, como texto. O app pode mudar uma cor da biblioteca, adicionar uma cor nova, mudar as fontes, os tamanhos de texto, a unidade de espaçamento, os tamanhos de raio e as sombras. Um valor que o app não dá vem do tema padrão.

```ts
import { createTheme } from "@toraline.tech/tokens";

const css = createTheme({
  name: "ocean",
  colors: {
    "bg-primary": "#0055aa", // changes --bg-primary
    "bg-promo": "#ff6600", // adds the new token --bg-promo
  },
  fonts: { heading: "Georgia, serif" }, // changes --font-heading
});
```

`css` é este texto. As linhas que não aparecem têm os valores do tema claro:

```css
[data-theme="ocean"] {
  color-scheme: light;
  --bg-page: var(--color-slate-100);
  /* ... */
  --bg-primary: #0055aa;
  /* ... */
  --font-heading: Georgia, serif;
  /* ... */
  --bg-promo: #ff6600;
}
```

Coloque o texto na página depois do CSS deste pacote, por exemplo em um elemento `<style>` ou em um arquivo CSS. Depois selecione o tema com `<html data-theme="ocean">`.

A entrada, tipo `ThemeInput`:

| Campo | Obrigatório | Significado |
|---|---|---|
| `name` | Sim | O nome do tema, usado em `data-theme="<name>"`. Letras minúsculas, dígitos e hifens |
| `base` | Não | `"light"` ou `"dark"`: o tema padrão que dá os valores que o app não dá. Quando falta: `"light"` |
| `isDefault` | Não | `true`: o tema também vale quando `<html>` não tem `data-theme` |
| `colors` | Não | O valor é qualquer cor CSS. A chave decide o que a cor é. Veja "As chaves de `colors`" abaixo |
| `fonts` | Não | `body`, `heading`, `mono`. O valor é qualquer valor CSS de `font-family` |
| `textSizes` | Não | `xs`, `sm`, `base`, `lg`, `2xl`, `3xl`. O valor é qualquer comprimento CSS. Muda `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-2xl`, `--text-3xl` |
| `spacing` | Não | Qualquer comprimento CSS. Muda `--spacing`, a unidade de todo padding e gap de um componente |
| `radius` | Não | Qualquer comprimento CSS, ou um objeto. Um valor muda `--radius-md`, o canto de um botão e de um campo. Um objeto muda cada tamanho que ele nomeia: `{ md: "0.625rem", lg: "1rem", xl: "1.25rem", "2xl": "1.5rem" }` |
| `shadows` | Não | Um objeto com `sm`, `card`, `lg`, `xl`, `2xl`. O valor é qualquer valor CSS de `box-shadow` |

As chaves de `colors`:

| Chave | Exemplo | O que faz | Classe do Tailwind |
|---|---|---|---|
| O nome de um token de cor da biblioteca | `bg-primary`, `text-brand`, `border-default`, `icon-default`, `data-1` | Muda esse token | A classe do token, sem mudança |
| Outro nome que começa com `bg-` | `bg-promo` | Adiciona o token `--bg-promo`, um fundo | `bg-promo` |
| Outro nome que começa com `text-` | `text-on-promo` | Adiciona o token `--text-on-promo`, uma cor de texto | `text-on-promo` |
| Outro nome que começa com `border-` | `border-promo` | Adiciona o token `--border-promo`, uma cor de borda | `border-promo` |
| Outro nome que começa com `icon-` | `icon-promo` | Adiciona o token `--icon-promo`, uma cor de ícone | `text-icon-promo` |
| Outro nome que começa com `data-` | `data-4` | Adiciona o token `--data-4`, uma cor de um gráfico | `bg-data-4`, `text-data-4`, `fill-data-4` e as classes das outras propriedades |
| Qualquer outro nome | `promo` | Adiciona o token `--color-promo`, uma cor para toda propriedade CSS | `bg-promo`, `text-promo`, `border-promo`, `fill-promo` e as outras |

Cada uso de uma cor tem o seu próprio token. Um app que muda a sua cor principal dá o mesmo valor a cada token que tem essa cor. No tema claro da biblioteca estes tokens têm a cor principal: `bg-primary`, `bg-inverse`, `text-brand`, `text-info`, `border-brand`, `border-inverse`, `icon-brand`. `bg-primary-hover` e `bg-inverse-hover` são um passo mais escuros.

`createTheme` recusa 2 tipos de chave, com um erro que diz o que escrever:

- Um nome sem grupo que é o fim de uma classe da biblioteca, por exemplo `primary`, `surface`, `brand` ou `danger`. `primary` adicionaria uma cor nova para toda propriedade CSS, e as classes `bg-primary` e `text-primary` continuariam lendo os tokens da biblioteca, então o app não veria nenhuma mudança. Escreva o nome completo do token: `bg-primary`.
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl` até `text-9xl`, e um nome que começa com `text-shadow`. O Tailwind CSS usa as variáveis com esses nomes para tamanhos de fonte e sombras de texto.

Para mudar o tema claro ou o tema escuro da biblioteca, use o nome dele: `createTheme({ name: "dark", base: "dark", colors: { "bg-primary": "#88ccff" } })`. O bloco vem depois do bloco da biblioteca na página, então os valores dele vencem.

`createTheme` lança um erro quando um nome tem outros caracteres, ou quando um valor tem um destes: `;`, `{`, `}`, `<`, `>`, `\` ou `/*`. Isso impede que um valor feche o bloco CSS.

### Um tema de um app pode mudar todos os tokens

O app Intraweb tem 3 temas próprios ao lado de `light` e `dark`: `cozy` (creme e rosa, cantos mais suaves, sombras quentes), `old` (escuro, cantos quase quadrados, a sua própria fonte de título) e `glass` (cards translúcidos). Eles ficam no Intraweb: a biblioteca tem apenas `light` e `dark`. O teste `src/intraweb-app-themes.test.ts` monta os 3 com `createTheme`, a partir de cópias dos arquivos do Intraweb: todas as cores, os tamanhos de raio, as sombras e a fonte de título. Uma cor transparente (`rgb(255 255 255 / 0.68)`) é um valor como qualquer outro.

O que `createTheme` não consegue expressar é uma regra CSS: ela dá valores a tokens. O tema `glass` tem 4 regras assim (um gradiente atrás da página, um desfoque atrás de cada card, um fundo menos transparente para um menu ou um diálogo, e uma alternativa para um navegador sem desfoque). Um app guarda essas regras no seu próprio arquivo CSS, ao lado da saída de `createTheme`. O mesmo teste verifica que elas funcionam juntas.

`getAddedColorNames(input)` devolve as cores de uma entrada que a biblioteca não tem. Para o exemplo acima: `["bg-promo"]`.

## Fontes

Três tokens de nível 2 decidem todas as fontes da biblioteca:

| Token | Usado para | Padrão | Classe do Tailwind |
|---|---|---|---|
| `--font-body` | Texto normal | `--font-stack-sans`: Inter | `font-body`, e `font-sans`, o nome que o Intraweb usa |
| `--font-heading` | Títulos, botões e os estilos de texto | `--font-stack-display`: Poppins, nos pesos 400, 500 e 600 | `font-heading` |
| `--font-mono` | Código | `--font-stack-mono`: a fonte de largura fixa do dispositivo | `font-mono` |

Inter e Poppins são as fontes do app Intraweb. **A biblioteca não baixa nenhuma fonte e não traz nenhum arquivo de fonte.** Ela apenas nomeia as fontes. O app carrega as fontes. Os valores dos dois tokens de nível 1 são:

```css
--font-stack-sans: var(--font-inter, "Inter"), ui-sans-serif, system-ui, sans-serif;
--font-stack-display: var(--font-poppins, "Poppins"), ui-sans-serif, system-ui, sans-serif;
```

Como ler `var(--font-inter, "Inter")`: a fonte da variável CSS `--font-inter` quando o app define essa variável em `<html>`, e a fonte com o nome de família `Inter` quando não define. Então há duas formas de carregar as fontes:

1. **Um app Next.js, com `next/font`.** `next/font` é a parte do Next.js que baixa uma fonte quando o build do app é feito e serve a fonte junto com o app. Dê às fontes as variáveis `--font-inter` e `--font-poppins`, e coloque as duas classes em `<html>`:

   ```ts
   // app/fonts.ts
   import { Inter, Poppins } from "next/font/google";

   export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

   export const poppins = Poppins({
     subsets: ["latin"],
     weight: ["400", "500", "600"],
     variable: "--font-poppins",
     display: "swap",
   });
   ```

   ```tsx
   // app/layout.tsx
   <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
   ```

   As classes precisam estar em `<html>`, não em `<body>`: os tokens são definidos em `<html>` e leem as variáveis ali.

2. **Qualquer outro app, a forma simples.** Carregue arquivos de fonte cujos nomes de família são `Inter` e `Poppins`, de qualquer forma: os pacotes npm `@fontsource/inter` e `@fontsource/poppins`, um `<link>` para um serviço de fontes, ou as suas próprias regras `@font-face`. Exemplo com os pacotes npm, no primeiro arquivo do app:

   ```ts
   import "@fontsource/inter/400.css";
   import "@fontsource/inter/500.css";
   import "@fontsource/inter/600.css";
   import "@fontsource/inter/700.css";
   import "@fontsource/poppins/400.css";
   import "@fontsource/poppins/500.css";
   import "@fontsource/poppins/600.css";
   ```

Um app que não carrega nenhuma fonte ainda funciona: o navegador usa uma fonte do dispositivo (`ui-sans-serif, system-ui, sans-serif`).

Nenhum arquivo da biblioteca nomeia uma fonte fora de `css/primitives.css` e `src/primitives.ts`, e nenhum arquivo da biblioteca carrega uma fonte. Um teste (`packages/ui/src/fonts.test.ts`) verifica isso.

### Defina outras fontes

Um app define as suas próprias fontes por meio de `createTheme`, com um valor CSS de `font-family` em `fonts.body`, `fonts.heading` ou `fonts.mono`. Uma fonte que o app não dá continua sendo a padrão. Exemplo com `next/font` em um app Next.js:

1. Carregue a fonte e dê a ela um nome de variável CSS (`app/fonts.ts`):

   ```ts
   import localFont from "next/font/local";

   export const fraunces = localFont({
     src: "./fonts/fraunces-latin-wght-normal.woff2",
     weight: "100 900",
     variable: "--font-fraunces",
   });
   ```

2. Coloque a classe que define a variável em `<html>` (`app/layout.tsx`):

   ```tsx
   <html lang="en" data-theme={theme} className={fraunces.variable}>
   ```

3. Dê a variável à função de tema, em todo tema que tem a fonte:

   ```ts
   createTheme({
     name: "paper",
     fonts: { heading: "var(--font-fraunces), Georgia, serif" },
   });
   ```

As fontes depois da variável (`Georgia, serif`) são usadas enquanto o arquivo de fonte carrega. `next/font/google` funciona da mesma forma: também tem a opção `variable`. O exemplo que funciona é [`apps/playground`](../../apps/playground/README.md): os temas `light` e `dark` dele têm Inter e Poppins, carregadas de arquivos de fonte com `next/font/local`, e o tema `paper` dele tem Fraunces para os títulos.

## Tailwind CSS 4

`css/tailwind.css` é um preset: um arquivo CSS que faz de cada token de nível 2 uma classe do Tailwind CSS 4. Importe o arquivo depois do Tailwind, no arquivo CSS global do app. Ele também carrega os tokens e os dois temas, então o import de `@toraline.tech/tokens/css` não é necessário:

```css
@import "tailwindcss";
@import "@toraline.tech/tokens/css/tailwind.css";
```

Um app que usa `@toraline.tech/ui` precisa importar o preset: os componentes são estilizados com as classes que ele cria. Esse app adiciona uma terceira linha, `@import "@toraline.tech/ui/tailwind.css";`, descrita em [`packages/ui/README.md`](../ui/README.pt-BR.md).

```html
<div class="rounded-xl border border-default bg-surface p-4 text-primary shadow-card">
  <h2 class="font-heading text-brand">Title</h2>
</div>
```

Cada classe lê a variável CSS quando a página é mostrada. Mudar `data-theme` muda as cores da página, sem nenhuma outra classe.

| Token | Classes |
|---|---|
| Cada `--bg-<name>` | `bg-<name>`: apenas a cor de fundo. Exemplos: `bg-page`, `bg-surface`, `bg-primary` |
| Cada `--text-<name>` que é uma cor | `text-<name>`: apenas a cor do texto. Exemplos: `text-primary`, `text-tertiary`, `text-inverse` |
| Cada `--border-<name>` | `border-<name>`, e as classes para um lado, por exemplo `border-b-<name>`: apenas a cor da borda. Exemplos: `border-default`, `border-b-brand` |
| `--border-focus` | Também `outline-focus`: a cor de um contorno |
| `--border-info` | Também `ring-info`: a cor de um anel |
| `--icon-default`, `--icon-strong`, `--icon-brand` | `text-icon`, `text-icon-strong`, `text-icon-brand`: um ícone usa a cor do texto |
| Cada `--data-<name>` | Toda classe de cor do Tailwind com `data-<name>`: `bg-data-1`, `text-data-1`, `fill-data-1`, `stroke-data-1` e as outras |
| Cada cor de nível 1 `--color-<scale>-<step>` | Toda classe de cor do Tailwind: `bg-brand-700`, `text-slate-500`, `border-red-600` e as outras |
| `--font-body`, `--font-heading`, `--font-mono` | `font-body`, `font-heading`, `font-mono`. `--font-body` também é a fonte da página, e a classe `font-sans`, o nome que o Intraweb usa para ela |
| `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-2xl`, `--text-3xl` | `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-2xl`, `text-3xl`. O Tailwind já tem essas classes. Com o preset elas leem o token. Os tamanhos são os mesmos, exceto `text-3xl`: 32 pixels (`2rem`), o tamanho do número grande do Intraweb, onde o Tailwind sozinho tem 30 pixels (`1.875rem`) |
| `--spacing` | É a unidade de toda classe de espaçamento do Tailwind: `p-4` é `calc(var(--spacing) * 4)`. O Tailwind já usa essa variável, com o mesmo valor |
| `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl` | `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, e as classes para um lado ou um canto, por exemplo `rounded-t-md` |
| `--shadow-sm`, `--shadow-card`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl` | `shadow-sm`, `shadow-card`, `shadow-lg`, `shadow-xl`, `shadow-2xl` |

Os nomes das classes são os nomes das classes do app Intraweb. Um token é uma classe apenas do seu grupo: `bg-primary` é o fundo da ação principal e `text-primary` é a cor principal do texto. São dois tokens, e não existe a classe `text-page` nem `bg-strong`. Como funciona: o preset tem uma linha para cada token de cor em um bloco `@theme inline`, por exemplo `--background-color-primary: var(--bg-primary);`. O Tailwind CSS 4 cria a classe `bg-<name>` a partir de uma variável chamada `--background-color-<name>`, `text-<name>` a partir de `--text-color-<name>`, e `border-<name>` a partir de `--border-color-<name>`. Esses 3 nomes não estão na tabela "Theme variable namespaces" da documentação do Tailwind (lida em 2026-11-15). Eles estão no código do Tailwind 4.3.5, o Intraweb usa esses nomes, e um teste deste pacote gera todas as classes com o Tailwind.

O preset também faz a variante `dark:` do Tailwind seguir `data-theme="dark"`. Exemplo: `dark:hidden` esconde um elemento no tema escuro. As outras classes do Tailwind, por exemplo `p-4`, `bg-red-500`, `rounded-full` e `shadow-md`, ficam como o Tailwind define.

### Estilos de texto

Um estilo de texto é uma classe que define juntos a fonte, o tamanho, a altura de linha e o peso de um texto. Os 9 estilos de texto são as utilities de estilo de texto do Intraweb, com os mesmos nomes e valores:

| Classe | Usado para | Tamanho da fonte | Altura de linha | Peso da fonte |
|---|---|---|---|---|
| `heading-page` | O título de uma página | `1.5rem` | `2rem` | 600 |
| `heading-section` | O título de uma seção, de um diálogo ou de um drawer | `1.125rem` | `1.75rem` | 500 |
| `heading-card` | O título de um card | `1rem` | `1.5rem` | 500 |
| `display-number` | Um número grande, por exemplo um total. Todos os dígitos têm a mesma largura | `2rem` | `2.5rem` | 600 |
| `display-number-sm` | Um número grande, um tamanho menor | `1.5rem` | `2rem` | 600 |
| `label` | O nome de um campo, o texto de uma aba ou de um badge | `0.875rem` | `1.25rem` | 500 |
| `label-lg` | Um rótulo maior | `1rem` | `1.5rem` | 500 |
| `label-sm` | Um rótulo menor | `0.75rem` | `1rem` | 500 |
| `caption-overline` | Um texto pequeno em letras maiúsculas acima de um título, com espaço maior entre as letras | `0.75rem` | `1rem` | 500 |

Todo estilo de texto tem a fonte `--font-heading`. Os mesmos valores estão em TypeScript: `textStyles` e `textStyleNames`.

```html
<h1 class="heading-page text-primary">Clients</h1>
```

### Uma cor que o app adicionou

O Tailwind gera as suas classes a partir de arquivos CSS, antes de a página existir. Uma cor que um app adiciona por meio de `createTheme` vira uma classe quando o Tailwind encontra essa cor em um arquivo CSS. `createTailwindTheme` devolve esse CSS:

```ts
import { createTailwindTheme, createTheme } from "@toraline.tech/tokens";

const themeInputs = [
  { name: "light", isDefault: true, colors: { "bg-promo": "#b34700" } },
  { name: "dark", base: "dark" as const, colors: { "bg-promo": "#ffb37a" } },
];

const css = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");
```

A primeira parte de `css` é:

```css
@theme inline {
  --background-color-promo: var(--bg-promo, #b34700);
}
```

Escreva `css` em um arquivo antes do build, e importe o arquivo depois do preset:

```css
@import "tailwindcss";
@import "@toraline.tech/tokens/css/tailwind.css";
@import "./theme.generated.css";
```

A classe `bg-promo` agora existe, e cada tema dá a ela o seu próprio valor. O valor depois da vírgula é usado apenas em uma página onde nenhum tema com essa cor está selecionado. O exemplo que funciona é [`apps/playground`](../../apps/playground/README.md): `theme.config.ts` tem as entradas e `scripts/write-theme-css.ts` escreve o arquivo.

## Salve o tema que a pessoa escolheu

A escolha é salva em um cookie chamado `toraline-theme`. Um cookie é um pequeno valor com nome que o navegador guarda e envia ao servidor em toda requisição. O provider React em `@toraline.tech/ui/theme` escreve o cookie. Este pacote tem as funções que leem o cookie, sem React:

| Função ou valor | O que faz |
|---|---|
| `THEME_COOKIE_NAME` | O nome do cookie: `"toraline-theme"` |
| `THEME_ATTRIBUTE` | O nome do atributo: `"data-theme"` |
| `resolveTheme(savedTheme, themes, defaultTheme)` | Devolve `savedTheme` quando ele é um dos `themes`. Senão devolve `defaultTheme`, ou o primeiro de `themes` |
| `readThemeCookie(cookieHeader)` | Encontra o tema salvo no texto de um cabeçalho `Cookie`. Devolve `undefined` quando não há nenhum |
| `serializeThemeCookie(theme)` | Monta o texto que salva o tema quando é atribuído a `document.cookie` |
| `createThemeScript({ themes, defaultTheme, cookieName })` | Monta um pequeno script, como texto, que lê o cookie e escreve `data-theme` em `<html>` |

Um app que renderiza em um servidor (Next.js) lê o cookie no servidor e escreve `data-theme` em `<html>`. A página então chega no tema certo. O exemplo que funciona está em [`packages/ui/README.md`](../ui/README.pt-BR.md).

Um app sem renderização no servidor coloca o script de `createThemeScript` dentro de `<head>`. O navegador executa o script antes de pintar a página:

```ts
import { createThemeScript } from "@toraline.tech/tokens";

const html = `<head><script>${createThemeScript()}</script></head>`;
```

## Tokens de nível 2: a lista completa

Os tokens de cor têm os nomes do design system do app Intraweb. A primeira parte de um nome é o grupo, e diz onde a cor é usada: `--bg-*` um fundo, `--text-*` um texto, `--border-*` uma borda, `--icon-*` um ícone, `--data-*` um gráfico ou uma barra de progresso. Com o preset do Tailwind, um token é uma classe apenas do seu grupo: `--bg-primary` é a classe `bg-primary`, e não existe a classe `text-page`.

Todo tema dá um valor a cada um destes 78 tokens.

| Token | Classe do Tailwind | Para que serve | Light | Dark |
|---|---|---|---|---|
| `--bg-page` | `bg-page` | Fundo da página | `--color-slate-100` | `#0c111d` |
| `--bg-surface` | `bg-surface` | Fundo de uma parte que fica sobre a página: card, campo, menu, diálogo, botão secundário | `#ffffff` | `#161b26` |
| `--bg-subtle` | `bg-subtle` | Fundo discreto: uma linha ou um botão secundário sob o ponteiro, um campo desabilitado | `--color-slate-50` | `#1f242f` |
| `--bg-muted` | `bg-muted` | Fundo discreto, um passo mais forte: a trilha atrás de um grupo de abas | `--color-slate-100` | `#252b37` |
| `--bg-inverse` | `bg-inverse` | Fundo forte na cor da marca | `--color-brand-700` | `#8eaec5` |
| `--bg-inverse-hover` | `bg-inverse-hover` | `--bg-inverse` enquanto o ponteiro está sobre ele | `--color-brand-800` | `#a9c2d4` |
| `--bg-selected` | `bg-selected` | Fundo da linha ou do item selecionado | `--color-brand-50` | `#1c2733` |
| `--bg-danger-subtle` | `bg-danger-subtle` | Fundo de um botão de perigo enquanto o ponteiro está sobre ele | `--color-red-50` | `#2a1614` |
| `--bg-error` | `bg-error` | Fundo de uma mensagem ou de um badge de erro | `--color-red-50` | `#2a1614` |
| `--bg-success` | `bg-success` | Fundo de uma mensagem ou de um badge de sucesso | `--color-green-50` | `#0f261b` |
| `--bg-warning` | `bg-warning` | Fundo de uma mensagem ou de um badge de aviso | `--color-orange-50` | `#2b2112` |
| `--bg-overlay` | `bg-overlay` | Camada que cobre a página atrás de um diálogo | `rgb(16 24 40 / 0.5)` | `rgb(0 0 0 / 0.6)` |
| `--bg-primary` | `bg-primary` | Fundo da ação principal: botão primário, controle marcado | `--color-brand-700` | `#8eaec5` |
| `--bg-primary-hover` | `bg-primary-hover` | A ação principal enquanto o ponteiro está sobre ela | `--color-brand-800` | `#a9c2d4` |
| `--bg-primary-subtle` | `bg-primary-subtle` | Fundo discreto na cor da marca | `--color-brand-50` | `#1c2733` |
| `--bg-primary-muted` | `bg-primary-muted` | `--bg-primary-subtle` enquanto o ponteiro está sobre ele | `--color-brand-100` | `#263545` |
| `--bg-accent-subtle` | `bg-accent-subtle` | Fundo discreto na cor de destaque | `--color-pink-50` | `#2b1f1c` |
| `--bg-highlight` | `bg-highlight` | Fundo que realça uma parte da página | `--color-cream-100` | `#2a2418` |
| `--bg-info` | `bg-info` | Fundo de uma mensagem ou de um badge de informação | `--color-brand-50` | `#1c2733` |
| `--bg-tooltip` | `bg-tooltip` | Fundo de um tooltip | `--color-slate-900` | `#f1f3f6` |
| `--text-primary` | `text-primary` | Texto principal e títulos | `--color-slate-900` | `#f5f5f6` |
| `--text-strong` | `text-strong` | Texto forte: o rótulo de um campo, o texto de um botão secundário | `--color-slate-800` | `#e4e7ec` |
| `--text-body` | `text-body` | Texto normal: um parágrafo, uma ação de um menu | `--color-slate-700` | `#cecfd2` |
| `--text-secondary` | `text-secondary` | Texto menos importante: uma aba que não está selecionada | `--color-slate-600` | `#a4a7ae` |
| `--text-tertiary` | `text-tertiary` | Dica, placeholder, texto de um controle desabilitado | `--color-slate-500` | `#8a8d94` |
| `--text-muted` | `text-muted` | Apenas decoração. O contraste dele é menor que 4.5, então não serve para texto que uma pessoa precisa ler | `--color-slate-400` | `#61646c` |
| `--text-inverse` | `text-inverse` | Texto e ícones sobre `--bg-primary` e `--bg-inverse` | `#ffffff` | `#0c111d` |
| `--text-danger` | `text-danger` | Texto de um botão de perigo e de uma mensagem de erro abaixo de um campo | `--color-red-700` | `#f97066` |
| `--text-error` | `text-error` | Texto sobre `--bg-error` | `--color-red-700` | `#f97066` |
| `--text-success` | `text-success` | Texto sobre `--bg-success` | `--color-green-700` | `#47cd89` |
| `--text-warning` | `text-warning` | Texto sobre `--bg-warning` | `--color-orange-700` | `#fdb022` |
| `--text-caution` | `text-caution` | Texto que pede atenção | `--color-orange-700` | `#fdb022` |
| `--text-brand` | `text-brand` | Texto na cor da marca: um link, a aba selecionada | `--color-brand-700` | `#a9c2d4` |
| `--text-info` | `text-info` | Texto sobre `--bg-info` | `--color-brand-700` | `#a9c2d4` |
| `--text-accent` | `text-accent` | Texto na cor de destaque | `--color-pink-700` | `#e3c2b8` |
| `--border-default` | `border-default` | Linha entre partes, e borda de um campo, de um card e de um botão secundário | `--color-slate-200` | `#333741` |
| `--border-strong` | `border-strong` | Borda mais forte: um checkbox, um switch | `--color-slate-300` | `#414651` |
| `--border-subtle` | `border-subtle` | Linha discreta: a borda de um menu | `--color-slate-100` | `#1f242f` |
| `--border-hover` | `border-hover` | Borda de um controle enquanto o ponteiro está sobre ele | `--color-slate-400` | `#61646c` |
| `--border-focus` | `border-focus` | Contorno do elemento que tem o foco do teclado, e borda de um campo que tem o foco | `--color-brand-600` | `#8eaec5` |
| `--border-inverse` | `border-inverse` | Borda sobre `--bg-inverse` | `--color-brand-700` | `#8eaec5` |
| `--border-brand` | `border-brand` | Borda na cor da marca: a linha abaixo da aba selecionada, um controle marcado | `--color-brand-700` | `#8eaec5` |
| `--border-danger` | `border-danger` | Borda de um botão de perigo | `--color-red-200` | `#7a271a` |
| `--border-error` | `border-error` | Borda de uma mensagem ou de um badge de erro | `--color-red-200` | `#7a271a` |
| `--border-invalid` | `border-invalid` | Borda de um campo com erro | `--color-red-600` | `#f97066` |
| `--border-changed` | `border-changed` | Borda de um valor que foi mudado e ainda não foi salvo | `--color-orange-400` | `#fdb022` |
| `--border-success` | `border-success` | Borda de uma mensagem ou de um badge de sucesso | `--color-green-200` | `#085d3a` |
| `--border-info` | `border-info` | Borda de uma mensagem ou de um badge de informação, e o anel em volta de um campo que tem o foco | `--color-brand-200` | `#344f63` |
| `--border-warning` | `border-warning` | Borda de uma mensagem ou de um badge de aviso | `--color-orange-200` | `#93370d` |
| `--icon-default` | `text-icon` | Ícone | `--color-slate-500` | `#8a8d94` |
| `--icon-strong` | `text-icon-strong` | Ícone que precisa se destacar | `--color-slate-700` | `#cecfd2` |
| `--icon-brand` | `text-icon-brand` | Ícone na cor da marca | `--color-brand-700` | `#a9c2d4` |
| `--data-1` | `bg-data-1`, `text-data-1`, ... | Primeira série de um gráfico | `--color-brand-600` | `#8eaec5` |
| `--data-2` | `bg-data-2`, `text-data-2`, ... | Segunda série de um gráfico | `--color-brand-300` | `#42637c` |
| `--data-3` | `bg-data-3`, `text-data-3`, ... | Terceira série de um gráfico | `--color-pink-400` | `#d7ada1` |
| `--data-success` | `bg-data-success`, `text-data-success`, ... | Valor bom em um gráfico ou em uma barra de progresso | `--color-green-500` | `#47cd89` |
| `--data-warning` | `bg-data-warning`, `text-data-warning`, ... | Valor que pede atenção em um gráfico ou em uma barra de progresso | `--color-orange-400` | `#fdb022` |
| `--data-danger` | `bg-data-danger`, `text-data-danger`, ... | Valor ruim em um gráfico ou em uma barra de progresso | `--color-red-600` | `#f97066` |
| `--data-track` | `bg-data-track`, `text-data-track`, ... | A parte vazia de uma barra de progresso | `--color-slate-200` | `#333741` |
| `--font-body` | `font-body`, `font-sans` | Fonte do texto normal | `--font-stack-sans` | `--font-stack-sans` |
| `--font-heading` | `font-heading` | Fonte dos títulos e dos botões | `--font-stack-display` | `--font-stack-display` |
| `--font-mono` | `font-mono` | Fonte de código | `--font-stack-mono` | `--font-stack-mono` |
| `--text-xs` | `text-xs` | Tamanho da fonte do menor texto: a dica abaixo de um campo | `--font-size-xs` | `--font-size-xs` |
| `--text-sm` | `text-sm` | Tamanho da fonte de texto pequeno: um botão, um rótulo, uma mensagem de erro | `--font-size-sm` | `--font-size-sm` |
| `--text-base` | `text-base` | Tamanho da fonte do texto normal em um componente | `--font-size-md` | `--font-size-md` |
| `--text-lg` | `text-lg` | Tamanho da fonte de texto grande: um botão grande | `--font-size-lg` | `--font-size-lg` |
| `--text-2xl` | `text-2xl` | Tamanho da fonte de um número grande em uma tela pequena: o valor de um card com um número | `--font-size-2xl` | `--font-size-2xl` |
| `--text-3xl` | `text-3xl` | Tamanho da fonte de um número grande: o valor de um card com um número | `--font-size-3xl` | `--font-size-3xl` |
| `--spacing` | `p-4`, `gap-2`, ... | A unidade de espaçamento. Todo padding e gap de um componente é um múltiplo dela: a classe `px-4` do Tailwind é `calc(var(--spacing) * 4)` | `--space-1` | `--space-1` |
| `--radius-md` | `rounded-md` | Canto de um botão e de um campo | `0.5rem` | `0.5rem` |
| `--radius-lg` | `rounded-lg` | Canto de um menu e de um popover | `0.75rem` | `0.75rem` |
| `--radius-xl` | `rounded-xl` | Canto de um card, de uma tabela e de um diálogo | `1rem` | `1rem` |
| `--radius-2xl` | `rounded-2xl` | Canto de um drawer | `1.25rem` | `1.25rem` |
| `--shadow-sm` | `shadow-sm` | Sombra pequena: o item selecionado de um grupo de abas | `0 1px 2px rgb(16 24 40 / 0.05)` | `0 1px 2px rgb(16 24 40 / 0.05)` |
| `--shadow-card` | `shadow-card` | Sombra de um card e de uma tabela | `0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px rgb(16 24 40 / 0.04)` | `0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px rgb(16 24 40 / 0.04)` |
| `--shadow-lg` | `shadow-lg` | Sombra de um menu e de um popover | `0 4px 6px -2px rgb(16 24 40 / 0.03), 0 12px 16px -4px rgb(16 24 40 / 0.08)` | `0 4px 6px -2px rgb(16 24 40 / 0.03), 0 12px 16px -4px rgb(16 24 40 / 0.08)` |
| `--shadow-xl` | `shadow-xl` | Sombra maior | `0 8px 8px -4px rgb(16 24 40 / 0.03), 0 20px 24px -4px rgb(16 24 40 / 0.08)` | `0 8px 8px -4px rgb(16 24 40 / 0.03), 0 20px 24px -4px rgb(16 24 40 / 0.08)` |
| `--shadow-2xl` | `shadow-2xl` | Sombra de um diálogo e de um drawer | `0 24px 48px -12px rgb(16 24 40 / 0.18)` | `0 24px 48px -12px rgb(16 24 40 / 0.18)` |

Cada tema também define a propriedade CSS `color-scheme` (`light` ou `dark`). Ela diz ao navegador qual aparência dar às partes dele mesmo, por exemplo as barras de rolagem.

Um teste verifica o contraste das cores que os componentes usam, nos dois temas. Contraste é o quanto duas cores são diferentes, de 1 (iguais) a 21 (preto sobre branco). O teste exige 4.5 ou mais para texto sobre o seu fundo, e 3 ou mais para o contorno de foco e para as cores que marcam um estado.

Os valores são do Intraweb, e alguns pares estão abaixo desses limites. A biblioteca não muda esses valores. Eles estão listados aqui, e um teste registra cada número:

| Par | Light | Dark | Limite | Onde importa |
|---|---|---|---|---|
| `--text-tertiary` sobre `--bg-page` | 4.48 | 5.67 | 4.5 | Uma dica escrita na página e não em um card. Os componentes fazem isso apenas no rótulo de um switch desabilitado, e a regra de acessibilidade não cobre um controle desabilitado |
| `--text-tertiary` sobre `--bg-muted` | 4.48 | 4.27 | 4.5 | Uma dica sobre um fundo muted. Os componentes não fazem isso |
| `--text-muted` sobre `--bg-surface` | 2.58 | 2.91 | 4.5 | O Intraweb usa essa cor apenas para decoração. Os componentes usam essa cor apenas no botão deslizante de um switch desabilitado |
| `--border-default` sobre `--bg-surface` | 1.24 | 1.45 | 3 | A borda de um campo e de um botão secundário |
| `--border-strong` sobre `--bg-surface` | 1.47 | 1.82 | 3 | A borda de um switch que está desligado |
| `--border-hover` sobre `--bg-surface` | 2.58 | 2.91 | 3 | A borda de um campo sob o ponteiro |
| `--border-danger` sobre `--bg-surface` | 1.42 | 1.75 | 3 | A borda de um botão de perigo |

O limite de 3 para uma borda vem da regra de acessibilidade para as partes de um controle que não são texto (WCAG 1.4.11).

## Tokens de nível 1

| Grupo | Tokens |
|---|---|
| Slate (a escala neutra) | `--color-slate-50`, depois `--color-slate-100` até `--color-slate-900` em passos de 100 |
| Brand (o azul da marca) | `--color-brand-50`, depois `--color-brand-100` até `--color-brand-900` em passos de 100 |
| Pink (a cor de destaque) | `--color-pink-50`, `--color-pink-100`, `--color-pink-400`, `--color-pink-700` |
| Cream (o fundo de realce) | `--color-cream-100` |
| Green (sucesso) | `--color-green-50`, `--color-green-200`, `--color-green-500`, `--color-green-700` |
| Orange (aviso) | `--color-orange-50`, `--color-orange-200`, `--color-orange-400`, `--color-orange-700` |
| Red (erro e perigo) | `--color-red-50`, `--color-red-200`, `--color-red-600`, `--color-red-700` |
| Espaçamento | `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8`, `--space-12`, `--space-16`. O número é um múltiplo de `0.25rem` |
| Tamanhos de fonte | `--font-size-xs`, `--font-size-sm`, `--font-size-md`, `--font-size-lg`, `--font-size-xl`, `--font-size-2xl`, `--font-size-3xl` |
| Font stacks | `--font-stack-sans` (Inter), `--font-stack-display` (Poppins), `--font-stack-mono`. Uma font stack é uma lista de fontes; o navegador usa a primeira que ele tem |

Os tokens de nível 2 `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-2xl`, `--text-3xl` e `--spacing` apontam para 7 dos tokens de tamanho de fonte e de espaçamento. Os outros tamanhos de fonte e valores de espaçamento ainda não têm token de nível 2. Um token de nível 2 é adicionado quando um componente precisa de um.

### As escalas de cores do Intraweb

As 7 escalas cujos nomes começam com `--color-` são as escalas de cores do design system do app Intraweb, com os mesmos nomes e os mesmos valores (o bloco `@theme` do `globals.css` do Intraweb). Um teste (`src/intraweb.test.ts`) compara as escalas com uma cópia desse bloco, `src/intraweb-fixtures/globals-theme.css`.

Com o preset do Tailwind cada uma também é uma cor do Tailwind: `--color-brand-700` dá as classes `bg-brand-700`, `text-brand-700`, `border-brand-700` e as outras. Onde o Tailwind tem uma cor com o mesmo nome (`red-600`, `green-500`), o valor do Intraweb substitui o valor do Tailwind. As outras cores do Tailwind (`red-500`, `blue-600`) ficam como o Tailwind define.

## Regra para mudanças

Os arquivos CSS e os arquivos TypeScript guardam os mesmos valores. `src/tokens.test.ts` falha quando eles diferem, ou quando este README não nomeia um token de nível 2.

As cores são do Intraweb. `src/intraweb.test.ts` falha quando uma cor de nível 1, um token de cor do tema claro ou do tema escuro, ou a classe do Tailwind de um token de cor difere das cópias dos arquivos do Intraweb em `src/intraweb-fixtures/`. Para pegar um valor novo do Intraweb: copie o arquivo de novo, mude a data no primeiro comentário dele, e mude o token no arquivo CSS e no arquivo TypeScript.
