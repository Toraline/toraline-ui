# Guia: use a biblioteca em um app

[English](guide.md) | **Português**

Depois dos 3 guias desta página, um app Next.js novo mostra um Button da biblioteca, primeiro na aparência padrão da biblioteca e depois no tema do próprio app, com um botão que alterna entre um tema claro e um tema escuro.

| Guia | Resultado |
|---|---|
| [1. Instale a biblioteca em um app](#guia-1-instale-a-biblioteca-em-um-app) | Uma página do app mostra um Button estilizado, na aparência padrão da biblioteca |
| [2. Monte o tema do app](#guia-2-monte-o-tema-do-app) | O app tem suas próprias cores e fontes, e um botão que muda o tema |
| [3. Estilize por cima de um componente](#guia-3-estilize-por-cima-de-um-componente) | Um Button fica com outra aparência, sem nenhuma mudança na biblioteca |

Faça o guia 1 primeiro. Os guias 2 e 3 precisam dele.

## Palavras que este guia usa

- **Token**: um valor do design que tem nome, por exemplo uma cor ou uma fonte. Ele é guardado como uma variável CSS, por exemplo `--bg-primary`, o fundo da ação principal.
- **Tema**: um conjunto de valores para os tokens. A biblioteca tem os temas `light` e `dark`.
- **Intraweb**: um app da Toraline. A aparência padrão da biblioteca é a aparência do Intraweb: as mesmas cores, com os mesmos nomes de token e os mesmos nomes de classe.
- **`data-theme`**: o atributo em `<html>` que seleciona o tema, por exemplo `<html data-theme="dark">`.
- **Tailwind CSS**: uma ferramenta que dá uma classe CSS para cada estilo, por exemplo `p-4` para um padding. Os componentes da biblioteca são estilizados com classes do Tailwind CSS 4, então o app precisa usar o Tailwind CSS 4.
- **Cookie**: um valor pequeno, com nome, que o navegador guarda e envia ao servidor em toda requisição.
- **Cascade layer**: um grupo de regras CSS que tem nome e uma prioridade fixa. O Tailwind CSS coloca as classes dele na cascade layer `utilities`.
- **Variante do Tailwind**: a parte de uma classe do Tailwind antes do `:`, que diz quando a classe se aplica. Exemplo: `hover:bg-primary-hover` se aplica enquanto o ponteiro está sobre o elemento.

## Guia 1: instale a biblioteca em um app

**Resultado:** uma página do app mostra um Button estilizado.

Os pacotes estão no npm. A versão atual é a `0.3.0`, publicada em 2026-11-16. A primeira versão, a `0.1.0`, foi publicada em 2026-11-15.

Para testar uma mudança da biblioteca que ainda não foi publicada, gere os dois arquivos de pacote neste repositório e instale os dois no app:

```bash
make pack     # in this repository; writes 2 files into .pack/tarballs/
npm install <path>/.pack/tarballs/toraline.tech-tokens-0.3.0.tgz <path>/.pack/tarballs/toraline.tech-ui-0.3.0.tgz     # in the app, in place of step 2
```

Troque `<path>` pela pasta deste repositório. Os 3 guias foram executados desse jeito em 2026-11-15, em um app criado com `create-next-app` 16.4.6 (Tailwind CSS 4.3.3), e a seção "Sem Next.js" em um app criado com `npm create vite@latest` (Vite 8.3). Os resultados estão em `apps/catalog/README.md`.

O que você precisa: Node 24, React 19 e Tailwind CSS 4.

1. Crie um app Next.js. Pule este passo quando você já tem um.

   ```bash
   npx create-next-app@latest my-app
   cd my-app
   ```

   Responda **Yes** para TypeScript, para Tailwind CSS e para App Router.

2. Instale os dois pacotes.

   ```bash
   npm install @toraline.tech/ui @toraline.tech/tokens
   ```

   `@toraline.tech/ui` tem os componentes. `@toraline.tech/tokens` tem os tokens, os temas e a função que monta um tema. Instale os dois, sempre na mesma versão.

   A biblioteca está na versão `0.x`: ela é testada nos apps da própria Toraline, e props e tokens ainda podem mudar entre versões.

3. Abra `app/globals.css`. Apague tudo o que está nele e escreva estas 3 linhas:

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "@toraline.tech/ui/tailwind.css";
   ```

   A segunda linha carrega os tokens e os dois temas, e faz de cada token uma classe do Tailwind, por exemplo `bg-surface`. A terceira linha diz ao Tailwind para ler os arquivos de `@toraline.tech/ui`, então ele gera o CSS das classes que os componentes usam.

   As 3 linhas são necessárias. Sem a terceira linha o Button fica sem estilo: o Tailwind gera o CSS de uma classe só quando encontra a classe em um arquivo que ele lê, e ele não lê a pasta `node_modules` sozinho.

   O resto do arquivo que o `create-next-app` escreveu precisa sair: ele define suas próprias cores em `<body>`, e elas ganhariam das cores do tema.

4. Crie o arquivo `app/fonts.ts`. Ele carrega as duas fontes padrão da biblioteca: Inter para o texto normal, e Poppins para títulos e botões. A biblioteca dá o nome dessas fontes e não baixa as fontes, então o app carrega as duas. `next/font` é a parte do Next.js que baixa uma fonte quando o build do app é feito e serve a fonte junto com o app.

   ```ts
   import { Inter, Poppins } from "next/font/google";

   export const inter = Inter({
     subsets: ["latin"],
     variable: "--font-inter",
     display: "swap",
   });

   export const poppins = Poppins({
     subsets: ["latin"],
     weight: ["400", "500", "600"],
     variable: "--font-poppins",
     display: "swap",
   });
   ```

   Os dois nomes `--font-inter` e `--font-poppins` precisam ser exatamente esses: eles são as variáveis CSS que os tokens de fonte da biblioteca leem. A Poppins precisa dos 3 pesos `400`, `500` e `600`.

5. Troque o conteúdo de `app/layout.tsx`. Ele coloca as duas fontes em `<html>`, e dá à página o fundo e a cor de texto do tema.

   ```tsx
   import type { ReactNode } from "react";
   import { inter, poppins } from "./fonts";
   import "./globals.css";

   export default function RootLayout({ children }: { children: ReactNode }) {
     return (
       <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
         <body className="bg-page text-primary">{children}</body>
       </html>
     );
   }
   ```

   `inter.variable` é uma classe que define a variável CSS `--font-inter`. As duas classes precisam estar em `<html>`, não em `<body>`: os tokens são definidos em `<html>` e leem as variáveis ali.

   Um app que pula os passos 4 e 5 ainda funciona. O texto fica então com uma fonte do dispositivo, porque os tokens de fonte terminam com `ui-sans-serif, system-ui, sans-serif`.

6. Troque o conteúdo de `app/page.tsx`:

   ```tsx
   import { Button } from "@toraline.tech/ui";

   export default function Page() {
     return (
       <main className="p-8">
         <Button>Save</Button>
       </main>
     );
   }
   ```

7. Inicie o app e abra http://localhost:3000.

   ```bash
   npm run dev
   ```

   A página mostra um botão azul-acinzentado (`#42637c`) com o texto branco "Save", em uma página cinza-claro. O texto do botão tem a fonte Poppins.

## Guia 2: monte o tema do app

**Resultado:** o app tem sua própria cor principal, uma cor que a biblioteca não tem, e sua própria fonte de título. Um botão alterna entre o tema claro e o tema escuro, e o app lembra a escolha.

Os passos são para um app Next.js. A seção [Sem Next.js](#sem-nextjs) tem as diferenças para outro tipo de app.

1. Crie o arquivo `theme.config.ts` na pasta do app. Ele guarda os temas do app.

   ```ts
   import type { ThemeInput } from "@toraline.tech/tokens";

   // The heading font of this app: a font that app/fonts.ts loads (step 7), then fonts every device has.
   const headingFont = "var(--font-fraunces), Georgia, serif";

   export const themeInputs: ThemeInput[] = [
     {
       name: "light",
       base: "light",
       isDefault: true,
       colors: {
         "bg-primary": "#0b5cad", // changes --bg-primary
         "bg-primary-hover": "#084a8c", // changes --bg-primary-hover
         "text-brand": "#0b5cad", // changes --text-brand
         "bg-promo": "#b34700", // adds --bg-promo
         "text-on-promo": "#ffffff", // adds --text-on-promo
       },
       fonts: { heading: headingFont },
     },
     {
       name: "dark",
       base: "dark",
       colors: {
         "bg-primary": "#8cc8ff",
         "bg-primary-hover": "#b9dcff",
         "text-brand": "#8cc8ff",
         "bg-promo": "#ffb37a",
         "text-on-promo": "#0c111d",
       },
       fonts: { heading: headingFont },
     },
   ];

   // The theme names, in the order the theme button goes through them.
   export const themes = themeInputs.map((themeInput) => themeInput.name);
   ```

   O que cada parte faz:

   - **Mudar uma cor.** Uma chave que é o nome de um token de cor da biblioteca, por exemplo `bg-primary`, muda esse token. A chave é o nome do token sem os dois traços. `--bg-primary` é o fundo da ação principal, e `--text-brand` é o texto na cor da marca. Cada uso de uma cor tem seu próprio token, então um app que muda sua cor principal muda cada token que tem essa cor. A lista completa está em `packages/tokens/README.pt-BR.md`.
   - **Adicionar uma cor.** Uma chave que a biblioteca não tem adiciona um token. A primeira parte da chave diz onde a cor é usada, como na biblioteca: `bg-` um fundo, `text-` um texto, `border-` uma borda, `icon-` um ícone. `bg-promo` adiciona o token `--bg-promo` e a classe do Tailwind `bg-promo`. `text-on-promo` adiciona `--text-on-promo` e a classe `text-on-promo`.
   - **Mudar as fontes.** `fonts` aceita `body`, `heading` e `mono`. O valor é qualquer valor de `font-family` do CSS. Uma fonte que você não informa continua sendo a padrão da biblioteca: Inter para `body`, Poppins para `heading`. Aqui os títulos e os botões ficam com a fonte Fraunces, e o texto normal continua com a Inter.
   - `base` dá o nome do tema da biblioteca que fornece todo valor que você não informa.
   - `isDefault: true` faz o tema valer também quando `<html>` não tem `data-theme`.

   Dê a cada cor um valor em cada tema. Um texto sobre o fundo dele precisa de um contraste de 4.5 ou mais para ser legível.

2. Crie o arquivo `scripts/write-theme-css.ts`. Ele transforma os temas em um arquivo CSS.

   ```ts
   import { writeFileSync } from "node:fs";
   import { createTailwindTheme, createTheme } from "@toraline.tech/tokens";
   import { themeInputs } from "../theme.config.ts";

   const css = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");

   writeFileSync(new URL("../app/theme.generated.css", import.meta.url), css);
   console.log(`Wrote app/theme.generated.css with ${themeInputs.length} themes.`);
   ```

   `createTheme` devolve o CSS de um tema. `createTailwindTheme` devolve o CSS que faz de cada cor adicionada uma classe do Tailwind, por exemplo `bg-promo`.

3. Abra `package.json`. Adicione a linha `"type": "module"`, e adicione 3 scripts, para que o arquivo CSS seja escrito antes de o app iniciar e antes do build:

   ```json
   {
     "type": "module",
     "scripts": {
       "theme": "node scripts/write-theme-css.ts",
       "predev": "npm run theme",
       "dev": "next dev",
       "prebuild": "npm run theme",
       "build": "next build",
       "start": "next start"
     }
   }
   ```

   Mantenha as outras linhas do arquivo. O Node 24 executa o arquivo TypeScript diretamente.

4. Abra `tsconfig.json`. Adicione esta linha dentro de `compilerOptions`:

   ```json
   "allowImportingTsExtensions": true,
   ```

   Sem ela, `npm run build` para com o erro `An import path can only end with a '.ts' extension`, por causa do import no script do passo 2.

5. Abra `.gitignore`. Adicione esta linha, porque o arquivo é escrito de novo a cada início:

   ```
   app/theme.generated.css
   ```

6. Abra `app/globals.css`. Adicione a linha que importa o arquivo gerado, depois da linha dos tokens:

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "./theme.generated.css";
   @import "@toraline.tech/ui/tailwind.css";
   ```

7. Abra `app/fonts.ts`, o arquivo do guia 1. Adicione a fonte de título do app. `next/font` coloca a fonte na variável CSS `--font-fraunces`, a variável que `theme.config.ts` usa.

   ```ts
   import { Fraunces, Inter } from "next/font/google";

   export const inter = Inter({
     subsets: ["latin"],
     variable: "--font-inter",
     display: "swap",
   });

   export const fraunces = Fraunces({
     subsets: ["latin"],
     variable: "--font-fraunces",
     display: "swap",
   });
   ```

   A Poppins não está mais no arquivo: este app trocou a fonte de título, então nada usa a Poppins. Qualquer fonte de `next/font/google` ou de `next/font/local` funciona do mesmo jeito: dê a ela uma `variable`, e use essa variável em `theme.config.ts`.

8. Troque o conteúdo de `app/layout.tsx`. O layout lê o tema salvo no cookie, no servidor, escreve o tema em `<html>`, e coloca o provider em volta do app. O provider é o componente que guarda o tema atual.

   ```tsx
   import { cookies } from "next/headers";
   import type { ReactNode } from "react";
   import { THEME_COOKIE_NAME, resolveTheme } from "@toraline.tech/tokens";
   import { ThemeProvider } from "@toraline.tech/ui/theme";
   import { themes } from "../theme.config";
   import { fraunces, inter } from "./fonts";
   import "./globals.css";

   export default async function RootLayout({ children }: { children: ReactNode }) {
     const cookieStore = await cookies();
     const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, themes);

     return (
       <html lang="en" data-theme={theme} className={`${inter.variable} ${fraunces.variable}`}>
         <body className="bg-page text-primary">
           <ThemeProvider themes={themes} initialTheme={theme}>
             {children}
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

   O servidor escreve `data-theme` no HTML que ele envia, então a página nunca mostra primeiro o tema errado.

   Abra `next.config.ts`. Quando ele tem a linha `cacheComponents: true` (o `create-next-app` 16.4.6 escreve essa linha), adicione esta linha em `app/layout.tsx`, abaixo dos imports:

   ```tsx
   export const instant = false;
   ```

   Sem ela, `npm run build` para com o erro `Next.js encountered uncached or runtime data during prerendering`. Com `cacheComponents`, o Next.js quer uma parte de toda página pronta antes de qualquer requisição, e este layout lê um cookie, que só existe durante uma requisição. A linha diz ao Next.js que este layout pode esperar a requisição. Quando `next.config.ts` não tem `cacheComponents: true`, a linha não é necessária.

9. Adicione o botão de tema em `app/page.tsx`:

   ```tsx
   import { Button } from "@toraline.tech/ui";
   import { ThemeToggle } from "@toraline.tech/ui/theme";

   export default function Page() {
     return (
       <main className="p-8">
         <h1 className="font-heading text-3xl text-brand">My app</h1>
         <p className="mt-4 inline-block rounded-md bg-promo px-3 py-1 text-on-promo">
           The color the app added
         </p>
         <div className="mt-4 flex gap-4">
           <Button>Save</Button>
           <ThemeToggle />
         </div>
       </main>
     );
   }
   ```

10. Pare o app com Ctrl+C, inicie de novo com `npm run dev`, e abra http://localhost:3000.

    - O botão "Save" é azul (`#0b5cad`), não azul-acinzentado.
    - O título e o texto do botão usam a fonte Fraunces. O título é azul.
    - O outro texto usa a fonte Inter.
    - A nota tem a cor laranja que o app adicionou.
    - Pressione o botão `Theme: light`. A página fica escura, e o botão "Save" fica azul-claro (`#8cc8ff`).
    - Recarregue a página. Ela abre no tema escuro.

### Sem Next.js

A função de tema e os componentes não precisam do Next.js. Eles precisam do Tailwind CSS 4. Estes passos são para um app criado com Vite e React (`npm create vite@latest my-app -- --template react-ts`). Eles substituem os passos 4 e 5 do guia 1, e os passos 2 e 6 a 9 do guia 2.

1. Instale o Tailwind CSS 4 e o plugin dele para o Vite:

   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

2. Carregue as fontes padrão da biblioteca, Inter e Poppins. Sem `next/font`, o jeito simples é um arquivo de fonte cujo nome de família é o nome que o token tem: `Inter` e `Poppins`. Os pacotes npm do Fontsource têm esses arquivos. Instale os pacotes:

   ```bash
   npm install @fontsource/inter @fontsource/poppins
   ```

   Depois importe um arquivo CSS para cada peso, no topo de `src/main.tsx`:

   ```ts
   import "@fontsource/inter/400.css";
   import "@fontsource/inter/500.css";
   import "@fontsource/inter/600.css";
   import "@fontsource/inter/700.css";
   import "@fontsource/poppins/400.css";
   import "@fontsource/poppins/500.css";
   import "@fontsource/poppins/600.css";
   ```

   Qualquer outro jeito de carregar uma fonte também funciona (um `<link>` para um serviço de fontes, sua própria regra `@font-face`), quando os nomes de família são `Inter` e `Poppins`. O catálogo deste repositório usa regras `@font-face`: `apps/catalog/.storybook/preview.css`.

3. Em `theme.config.ts`, a fonte de título é uma fonte que o app carrega sozinho, ou fontes que todo dispositivo tem:

   ```ts
   const headingFont = "Georgia, serif";
   ```

   Com esse valor o app não usa a Poppins, então os 3 imports da Poppins do passo 2 podem sair. Para manter a Poppins nos títulos, remova as duas linhas `fonts: { heading: headingFont },` de `theme.config.ts` e mantenha os imports.

4. `scripts/write-theme-css.ts` escreve o arquivo em `src/`:

   ```ts
   import { writeFileSync } from "node:fs";
   import { createTailwindTheme, createTheme } from "@toraline.tech/tokens";
   import { themeInputs } from "../theme.config.ts";

   const css = [createTailwindTheme(themeInputs), ...themeInputs.map(createTheme)].join("\n");

   writeFileSync(new URL("../src/theme.generated.css", import.meta.url), css);
   console.log(`Wrote src/theme.generated.css with ${themeInputs.length} themes.`);
   ```

   Os scripts de `package.json` são `"theme"`, `"predev"` e `"prebuild"`, como no passo 3 do guia 2.

5. Troque o conteúdo do arquivo CSS do app (`src/index.css`). Os 4 imports são os mesmos de um app Next.js. A regra abaixo deles dá à página as cores do tema:

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "./theme.generated.css";
   @import "@toraline.tech/ui/tailwind.css";

   body {
     background-color: var(--bg-page);
     color: var(--text-primary);
   }
   ```

6. Não há servidor para ler o cookie. Um script pequeno em `<head>` lê o cookie antes de o navegador pintar a página. `createThemeScript` devolve esse script como texto. Adicione o script, e o plugin do Tailwind, em `vite.config.ts`:

   ```ts
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import tailwindcss from "@tailwindcss/vite";
   import { createThemeScript } from "@toraline.tech/tokens";
   import { themes } from "./theme.config.ts";

   export default defineConfig({
     plugins: [
       react(),
       tailwindcss(),
       {
         name: "theme-script",
         // Puts the script in <head>. The browser runs it before it paints the page.
         transformIndexHtml: () => [
           { tag: "script", children: createThemeScript({ themes }), injectTo: "head" },
         ],
       },
     ],
   });
   ```

7. Em `src/main.tsx`, coloque o provider em volta do app, sem `initialTheme`. O provider pega o tema que o script escreveu em `<html>`.

   ```tsx
   import "@fontsource/inter/400.css";
   import "@fontsource/inter/500.css";
   import "@fontsource/inter/600.css";
   import "@fontsource/inter/700.css";
   import "@fontsource/poppins/400.css";
   import "@fontsource/poppins/500.css";
   import "@fontsource/poppins/600.css";
   import { StrictMode } from "react";
   import { createRoot } from "react-dom/client";
   import { Button } from "@toraline.tech/ui";
   import { ThemeProvider, ThemeToggle } from "@toraline.tech/ui/theme";
   import { themes } from "../theme.config";
   import "./index.css";

   createRoot(document.getElementById("root")!).render(
     <StrictMode>
       <ThemeProvider themes={themes}>
         <Button>Save</Button>
         <ThemeToggle />
       </ThemeProvider>
     </StrictMode>,
   );
   ```

O `npm run build` de um app Vite pode imprimir um aviso para cada componente: `The semantics of the module level directive "use client" ... may not be preserved`. A linha `"use client"` é para o Next.js. Um app Vite não precisa dela, então o aviso não muda nada.

## Guia 3: estilize por cima de um componente

**Resultado:** um Button tem os cantos totalmente redondos e a cor que o app adicionou, e o label de um campo fica em letras maiúsculas. Nada na biblioteca muda.

Todo componente aceita `className`. As classes vão no elemento mais externo do componente.

1. **Com uma classe do Tailwind:** passe a classe para o componente. Ela substitui a classe da biblioteca que define a mesma propriedade CSS. Aqui `rounded-full` substitui a `rounded-md` da biblioteca, e os outros estilos do Button continuam.

   ```tsx
   <Button className="rounded-full">Save</Button>
   ```

2. **Uma cor:** uma classe de token e uma classe padrão do Tailwind funcionam, as duas. Uma cor que o app adicionou no guia 2 também é uma classe de token.

   ```tsx
   <Button className="bg-promo text-on-promo hover:bg-primary-hover">Save</Button>
   ```

   Uma classe substitui só uma classe da mesma propriedade CSS, com a mesma variante do Tailwind. `bg-promo` substitui a `bg-primary` da biblioteca, e `text-on-promo` substitui a `text-inverse` da biblioteca. Elas não substituem `hover:bg-primary-hover` nem `disabled:opacity-50`. Então passe uma classe para cada estado que você quer mudar: `hover:` para o ponteiro sobre o elemento, `disabled:` para um elemento desabilitado, `focus-visible:` para o foco do teclado. Um estado para o qual você não passa classe mantém a aparência da biblioteca.

3. **Com seu próprio CSS:** escreva uma classe no arquivo CSS do app, fora de qualquer cascade layer, e passe a classe para o componente.

   ```css
   .round {
     border-radius: 9999px;
   }
   ```

   ```tsx
   <Button className="round">Save</Button>
   ```

4. **Uma parte interna de um componente:** um componente com mais de um elemento dá a cada elemento interno o atributo `data-slot`, com o nome da parte. Use o atributo depois da sua própria classe. Esta regra escreve o label de um Field em letras maiúsculas:

   ```css
   .search [data-slot="label"] {
     text-transform: uppercase;
   }
   ```

   ```tsx
   <Field className="search" label="Search">
     <TextInput name="search" />
   </Field>
   ```

5. **Com as cores do tema no seu próprio CSS:** use os tokens, para que o estilo acompanhe o tema.

   ```css
   .promo-note {
     background-color: var(--bg-promo);
     color: var(--text-on-promo);
   }
   ```

Por que a sua classe ganha:

- **Uma classe do Tailwind.** Todo componente junta as classes dele e o seu `className` com a biblioteca `tailwind-merge`. Quando duas classes do Tailwind definem a mesma propriedade CSS, com a mesma variante do Tailwind, só a última fica. A sua é a última.
- **Seu próprio CSS.** As classes do Tailwind da biblioteca estão na cascade layer `utilities`. O CSS do app que não está em nenhuma layer tem prioridade maior do que toda layer.

Então você nunca precisa de `!important`.

Limite: uma classe do seu próprio CSS que está dentro de `@layer components` ou `@layer base` não ganha, porque essas layers têm prioridade menor do que `utilities`. Escreva a classe fora de qualquer layer.

Os nomes de `data-slot` das partes internas de cada componente estão listados em `packages/ui/README.pt-BR.md`.

## Onde olhar em seguida

- O catálogo mostra todo componente, em todo tema: execute `make catalog` na raiz deste repositório.
- Toda prop de todo componente: `packages/ui/README.pt-BR.md`.
- Todo token, e todo campo da função de tema: `packages/tokens/README.pt-BR.md`.
