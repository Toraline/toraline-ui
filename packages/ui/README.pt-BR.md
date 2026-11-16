# @toraline.tech/ui

[English](https://github.com/Toraline/toraline-ui/blob/main/packages/ui/README.md) | **Português**

Os componentes React estilizados da biblioteca de componentes da Toraline.

| O quê | Importe de | Estado |
|---|---|---|
| As partes que controlam o tema: um provider, um hook e um botão que alterna o tema | `@toraline.tech/ui/theme` | Feito na fase 2 |
| Os componentes | `@toraline.tech/ui` | Feitos a partir da fase 3 (TOR-997). A fase 7 (TOR-1123) deu a eles as variantes, os tamanhos e as props dos mesmos componentes do app Intraweb, e trocou o `Input` por `Field` e `TextInput`. As fases 8 a 10 adicionaram os controles de formulário, os componentes de feedback, os overlays e os componentes de dados. Cada componente tem sua seção abaixo |
| A linha que faz o Tailwind CSS gerar as classes de tudo o que está acima | `@toraline.tech/ui/tailwind.css` | Um arquivo CSS, importado uma vez pelo app |

Os componentes são estilizados com classes do Tailwind CSS 4 que leem os tokens de [`@toraline.tech/tokens`](../tokens/README.pt-BR.md). O pacote não tem CSS próprio para um componente. Por isso o app precisa usar o Tailwind CSS 4.

A aparência padrão é a aparência do app Intraweb, um app da Toraline: as cores, as fontes (Inter para o texto normal, Poppins para títulos e botões), os tamanhos de raio e as sombras dele. Os tokens e as classes do Tailwind têm os nomes que o Intraweb usa. A biblioteca não baixa nenhuma fonte: o app carrega a Inter e a Poppins. O guia 1 de [`docs/guide.pt-BR.md`](../../docs/guide.pt-BR.md) mostra como.

O catálogo está online: https://toraline-ui.vercel.app/ Ele mostra todo componente deste pacote, em todo tema, com a tabela das props dele.

As regras que todo componente segue estão em [Regras que todo componente segue](#regras-que-todo-componente-segue).

Um tema é um conjunto de cores, fontes, tamanhos de canto e sombras. A página seleciona um tema com o atributo `data-theme` em `<html>`. Os temas e os valores deles estão em [`@toraline.tech/tokens`](../tokens/README.pt-BR.md).

## Instalação

O pacote está no npm. A versão atual é a `0.3.0`, publicada em 2026-11-16. A primeira versão, a `0.1.0`, foi publicada em 2026-11-15.

```bash
npm install @toraline.tech/ui @toraline.tech/tokens
```

- Instale os dois pacotes, na mesma versão. `@toraline.tech/ui` precisa exatamente da sua própria versão de `@toraline.tech/tokens`.
- A biblioteca está na versão `0.x`: props e tokens ainda podem mudar entre versões.
- O app precisa do React 19 (`react` e `react-dom`) e do Tailwind CSS 4 (`tailwindcss`).
- O pacote tem só módulos ES (arquivos lidos com `import`), com arquivos de tipos para TypeScript.

Para testar uma mudança da biblioteca que ainda não foi publicada, um app pode instalar os arquivos de pacote que `make pack` escreve. Os passos estão no começo do guia 1 em [`docs/guide.pt-BR.md`](../../docs/guide.pt-BR.md).

## Como usar o tema em um app Next.js

1. Importe o CSS uma vez, no arquivo CSS global (`app/globals.css`):

   ```css
   @import "tailwindcss";
   @import "@toraline.tech/tokens/css/tailwind.css";
   @import "@toraline.tech/ui/tailwind.css";
   ```

   As 3 linhas são necessárias. A segunda linha faz de cada token uma classe do Tailwind, por exemplo `bg-primary`. A terceira linha diz ao Tailwind para ler os arquivos gerados deste pacote, e assim ele gera o CSS das classes que os componentes usam. O Tailwind não lê a pasta `node_modules` sozinho. Sem a terceira linha os componentes ficam sem estilo.

2. No layout raiz (`app/layout.tsx`), leia o tema salvo no servidor, escreva o tema em `<html>` e entregue o tema ao provider:

   ```tsx
   import { cookies } from "next/headers";
   import type { ReactNode } from "react";
   import { THEME_COOKIE_NAME, resolveTheme } from "@toraline.tech/tokens";
   import { ThemeProvider } from "@toraline.tech/ui/theme";
   import "./globals.css";

   const themes = ["light", "dark"];

   export default async function RootLayout({ children }: { children: ReactNode }) {
     const cookieStore = await cookies();
     const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, themes);

     return (
       <html lang="en" data-theme={theme}>
         <body>
           <ThemeProvider themes={themes} initialTheme={theme}>
             {children}
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

3. Coloque o botão que alterna o tema em qualquer lugar dentro do provider:

   ```tsx
   import { ThemeToggle } from "@toraline.tech/ui/theme";

   export default function Page() {
     return <ThemeToggle />;
   }
   ```

O servidor escreve `data-theme` no HTML que ele envia, e assim a página nunca mostra o tema errado primeiro. Este exemplo que funciona é o app [`apps/playground`](../../apps/playground/README.md).

Ler um cookie no layout raiz faz o Next.js renderizar cada página no momento da requisição (renderização dinâmica). Um app que precisa de páginas geradas uma única vez (renderização estática) não lê o cookie no servidor. Ele coloca o script de `createThemeScript` de `@toraline.tech/tokens` dentro de `<head>` e não dá `initialTheme` ao provider.

## As partes

As três vêm de `@toraline.tech/ui/theme`. Elas são Client Components: rodam no navegador.

### `ThemeProvider`

Guarda o tema atual, escreve o tema em `<html data-theme="...">` e salva a escolha da pessoa no cookie `toraline-theme` por 1 ano.

| Prop | Obrigatória | Significado |
|---|---|---|
| `children` | Sim | O app |
| `themes` | Não | Os nomes dos temas do app, na ordem em que o botão passa por eles. Quando falta: `["light", "dark"]` |
| `defaultTheme` | Não | O tema de uma pessoa que ainda não escolheu. Quando falta: o primeiro de `themes` |
| `initialTheme` | Não | O tema que o servidor já escreveu em `<html>` |
| `cookieName` | Não | O nome do cookie. Quando falta: `"toraline-theme"` |

### `useTheme()`

Retorna `{ theme, themes, setTheme }`. `theme` é o nome do tema atual. `setTheme("dark")` mostra esse tema e salva a escolha. Ele lança um erro para um nome que não está em `themes`. `useTheme` funciona só dentro de `ThemeProvider`.

### `ThemeToggle`

Um botão. Cada vez que é pressionado, ele mostra o próximo tema de `themes`. Depois do último tema ele volta ao primeiro.

- É um `<button type="button">` de verdade, e por isso funciona com as teclas Tab, Enter e Espaço.
- Ele mostra o tema atual como texto: `Theme: dark`.
- Um leitor de tela diz o tema atual e o que acontece ao pressionar: `Theme: dark. Switch to light.` A prop `formatLabel={(theme, nextTheme) => "..."}` muda esse texto. Mantenha nele o texto que o botão mostra (`Theme: dark`): uma pessoa que controla o dispositivo com a voz diz o texto que ela vê.
- `children` substitui o texto que é mostrado, por exemplo por um ícone.
- Ele tem a aparência do Button secundário no tamanho `md`.
- `className` adiciona classes, como descrito em [Estilizar por cima](#estilizar-por-cima). O botão também aceita todas as outras props de `<button>`.

## Os componentes

Todos vêm de `@toraline.tech/ui`. Eles precisam das 3 linhas de CSS do passo 1 acima. A página `/components` de [`apps/playground`](../../apps/playground/README.md) mostra cada um com todas as variantes e todos os estados.

### `Button`

```tsx
import { Plus } from "lucide-react";
import { Button } from "@toraline.tech/ui";

<Button variant="secondary" size="sm" icon={Plus} onClick={addOrder}>
  New order
</Button>
```

| Prop | Valores | Significado |
|---|---|---|
| `variant` | `"primary"` (padrão), `"secondary"`, `"soft"`, `"danger"`, `"ghost"` | A aparência. `primary`: a ação principal. `secondary`: outra ação, com borda. `soft`: uma ação com um fundo discreto na cor da marca. `danger`: uma ação que apaga. `ghost`: uma ação sem fundo e sem borda |
| `size` | `"sm"`, `"md"` (padrão), `"lg"` | O tamanho. O botão tem pelo menos 32 pixels de altura para `sm`, 40 para `md` e 48 para `lg` |
| `icon` | Um componente de ícone | Um ícone mostrado antes do texto. Veja [Ícones](#ícones). Ele é decoração: um leitor de tela pula o ícone |
| `loading` | `true`, `false` (padrão) | `true` enquanto a ação está rodando. O botão mostra um spinner (um pequeno círculo que gira) no lugar do ícone, e pressionar o botão não faz nada |
| `disabled` | O atributo HTML | O botão não pode receber o foco e não pode ser pressionado. Ele fica com metade da opacidade |
| `type` | `"button"` (padrão), `"submit"`, `"reset"` | O atributo HTML. O padrão é `"button"`, e assim um botão dentro de um formulário não envia o formulário por acidente |

- As variantes, os tamanhos, os paddings e a fonte (Poppins, peso 500) são os do Button do app Intraweb. O estado `loading` é da própria biblioteca: o Intraweb não tem esse estado.
- Elemento nativo principal: o `<button>`. Todas as outras props e `ref` vão para ele. `className` também vai para ele. O spinner dentro dele tem `data-slot="spinner"`.
- Teclado: Tab move o foco para ele, Enter e Espaço pressionam o botão.
- Leitor de tela: um botão carregando tem `aria-busy="true"` e `aria-disabled="true"`. Ele mantém o foco do teclado, e assim uma pessoa que pressionou o botão com o teclado não perde o lugar onde estava.
- As listas `buttonVariants` e `buttonSizes` e os tipos `ButtonProps`, `ButtonVariant` e `ButtonSize` são exportados.
- Ele não tem `"use client"`: um Server Component pode renderizar o botão e dar a ele um componente de ícone. Só o `<button>` dele, que bloqueia o pressionar de um botão carregando, roda no navegador. Uma função como `onClick` ainda precisa de um Client Component, como toda função.

### `ButtonLink`

Um link com a aparência de um Button. Use quando pressionar leva a outra página.

```tsx
import Link from "next/link";
import { ButtonLink } from "@toraline.tech/ui";

<ButtonLink linkComponent={Link} href="/orders/new" variant="secondary">
  New order
</ButtonLink>
```

| Prop | Valores | Significado |
|---|---|---|
| `href` | Um endereço | Para onde o link vai. É a prop do componente de link |
| `linkComponent` | Um componente. Quando falta: `"a"` | O componente que renderiza o link. Ele recebe `href`, `className`, `children` e todas as outras props. Um app Next.js dá o `Link` de `next/link`, e assim pressionar o link não carrega a página inteira de novo. A biblioteca não importa o Next.js |
| `variant` | As variantes de Button. `"primary"` é o padrão | A aparência |
| `size` | Os tamanhos de Button. `"md"` é o padrão | O tamanho |
| `icon` | Um componente de ícone | Um ícone mostrado antes do texto. Veja [Ícones](#ícones) |

- Ele tem as mesmas classes de Button: os dois leem as classes de um único arquivo.
- Elemento nativo principal: o `<a>`, ou o componente de link do app. `className`, todas as outras props e `ref` vão para ele. Com `linkComponent={Link}`, o TypeScript aceita as props desse `Link`, por exemplo `prefetch`.
- Teclado: Tab move o foco para ele, Enter segue o link.
- Leitor de tela: ele é lido como um link, não como um botão.
- Ele não tem o estado `disabled` nem o estado `loading`: um link não pode ser desabilitado. Uma página que não deve oferecer o link não renderiza o link.
- O tipo `ButtonLinkProps` é exportado.
- Ele não tem `"use client"`: também renderiza em um Server Component.
- O `ButtonLink` do próprio Intraweb importa `next/link`. Para passar a usar este, o Intraweb adiciona `linkComponent={Link}`, ou mantém um arquivo de 5 linhas que faz isso uma vez: `export const ButtonLink = (props) => <UiButtonLink linkComponent={Link} {...props} />`.

### `IconButton`

Um botão que mostra só um ícone.

```tsx
import { Trash2 } from "lucide-react";
import { IconButton } from "@toraline.tech/ui";

<IconButton icon={Trash2} aria-label="Delete the order" onClick={deleteOrder} />
```

| Prop | Valores | Significado |
|---|---|---|
| `icon` | Um componente de ícone. Obrigatória | O ícone. Veja [Ícones](#ícones) |
| `aria-label` | Texto. Obrigatória | O nome do botão para um leitor de tela. O botão não tem texto visível, e por isso o TypeScript recusa um IconButton sem `aria-label` |
| `variant` | `"ghost"` (padrão), `"secondary"`, `"soft"`, `"primary"` | A aparência. `ghost`: sem fundo e sem borda. `secondary`: uma borda. `soft`: um fundo discreto na cor da marca. `primary`: a ação principal |
| `size` | `"sm"`, `"md"` (padrão), `"lg"` | Um quadrado de 32, 40 ou 48 pixels, com um ícone de 16, 20 ou 24 pixels |
| `disabled` | O atributo HTML | O botão não pode receber o foco e não pode ser pressionado. Ele fica com metade da opacidade |
| `type` | `"button"` (padrão), `"submit"`, `"reset"` | O atributo HTML |

- As variantes, os tamanhos e as cores são os do IconButton do app Intraweb.
- Elemento nativo principal: o `<button>`. `className`, todas as outras props e `ref` vão para ele. Ele não tem `children`.
- Teclado: Tab move o foco para ele, Enter e Espaço pressionam o botão.
- Leitor de tela: ele diz o texto de `aria-label`. O ícone tem `aria-hidden="true"`.
- As listas `iconButtonVariants` e `iconButtonSizes` e os tipos `IconButtonProps`, `IconButtonVariant` e `IconButtonSize` são exportados.
- Ele não tem `"use client"`: também renderiza em um Server Component.

### Ícones

A biblioteca não tem um conjunto de ícones e não depende de nenhum. Um componente com a prop `icon` recebe um componente React que desenha um ícone como um `<svg>`:

```tsx
import { Plus } from "lucide-react";

<Button icon={Plus}>New order</Button>
```

- O tipo é `IconComponent`, exportado de `@toraline.tech/ui`: um componente que aceita `className` e `aria-hidden`. Todo ícone do pacote `lucide-react`, os ícones que o app Intraweb usa, tem esse formato. Um pequeno componente do app que retorna um `<svg {...props}>` também tem.
- A biblioteca dá ao ícone o tamanho (uma classe como `size-4`, 16 pixels) e `aria-hidden="true"`. O ícone é desenhado com `currentColor`, e por isso tem a cor do texto.
- Dê o componente, não um elemento: `icon={Plus}`, não `icon={<Plus />}`.
- Os ícones que a própria biblioteca desenha (o ícone de erro de Field, a seta de SplitButton) são pequenos elementos `<svg>` dentro dos componentes.

### `Field`

Um campo de um formulário: um label, um controle e, abaixo dele, uma dica ou uma mensagem de erro, todos ligados para um leitor de tela.

```tsx
import { Field, TextInput } from "@toraline.tech/ui";

<Field label="Client name" hint="As it is written on the invoice." error={nameError}>
  <TextInput name="name" />
</Field>
```

| Prop | Valores | Significado |
|---|---|---|
| `label` | Texto ou elementos. Obrigatória | O nome visível do campo, mostrado acima do controle. Um clique nele move o foco para o controle |
| `children` | Um elemento, ou uma função. Obrigatória | O controle: `<TextInput />`, um `<select>` nativo, um `<textarea>`, ou um elemento com o controle dentro dele. Veja "Como um controle é ligado" abaixo |
| `hint` | Texto ou elementos | Um texto curto de ajuda, mostrado abaixo do controle enquanto o campo não tem erro |
| `error` | Texto ou elementos | A mensagem de erro, mostrada abaixo do controle com um ícone, no lugar da dica |
| `optional` | `true`, `false` (padrão) | `true` para um campo que uma pessoa pode deixar vazio. O label então mostra uma marca |
| `optionalText` | Texto. Quando falta: `"(optional)"` | O texto da marca. Um app em outro idioma dá o texto: `optionalText="(opcional)"` |
| `id` | Texto | O id do controle. Quando falta: o id que o controle já tem, ou um que o componente cria |

Como um controle é ligado:

1. Quando o controle é o filho direto, Field dá a ele 3 props: `id`, `aria-describedby` e `aria-invalid`. Todo controle da biblioteca e todo controle nativo aceita essas props. O controle mantém o seu próprio `aria-describedby` (Field acrescenta a ele) e o seu próprio `aria-invalid`. Um componente do app como filho direto (por exemplo um editor) recebe as mesmas 3 props, e passa as props para o controle dele.
2. Quando o controle está dentro de outro elemento, escreva o mesmo id no Field e no controle: `<Field id="amount" label="Amount"><div>R$ <TextInput id="amount" /></div></Field>`. Field procura dentro dos elementos nativos o elemento com esse id, e dá `aria-describedby` e `aria-invalid` a ele. O elemento em volta do controle não recebe nada. Desde a versão 0.3.1; antes dela, o `<div>` também recebia o id, e um clique no label não chegava ao controle.
3. Ou dê uma função. Ela recebe as 3 props: `<Field label="Amount">{(controlProps) => <div>R$ <TextInput {...controlProps} /></div>}</Field>`. Use a função quando o controle não tem id próprio, ou quando ele está dentro de um componente em que Field não consegue procurar.
4. O id da dica é o id do controle seguido de `-hint`, e o id da mensagem de erro é o id seguido de `-error`.

Qual filho é "o controle": um componente, ou um dos elementos nativos `<input>`, `<select>`, `<textarea>`, `<button>`, `<meter>`, `<output>` e `<progress>`. Qualquer outro elemento nativo (`<div>`, `<span>`), um fragmento e um texto são "um elemento em volta do controle". Quando nenhum elemento dentro dele tem o id do Field, nada é ligado: o label então não aponta para nenhum elemento.

- As partes e as aparências delas são as do Field do app Intraweb. O uso do Intraweb, `<Field id="name" label="Nome"><TextInput id="name" /></Field>`, funciona sem mudança. Duas coisas são diferentes: o texto da marca é em inglês, a não ser que o app dê `optionalText`, e Field agora escreve `aria-describedby` e `aria-invalid` no controle, o que as telas do Intraweb escreviam à mão.
- Elemento nativo principal: o `<div>` mais externo. `className`, todas as outras props e `ref` vão para ele. `id` é a exceção: é o id do controle. As partes internas têm o atributo `data-slot` com os valores `label`, `optional`, `hint`, `error` e `error-icon`.
- Leitor de tela: o label é um `<label>` ligado ao controle com `for` e `id`. A dica ou a mensagem de erro que está sendo mostrada é lida junto com o controle. Com um erro o controle tem `aria-invalid="true"`.
- A dica e a marca têm a cor `text-tertiary`. Em um card (`bg-surface`) o contraste dela é 4.97 (tema claro) e 5.18 (tema escuro). No fundo da página (`bg-page`) do tema claro ele é 4.48, abaixo do limite de 4.5: um valor do Intraweb, registrado em [`docs/decisions.md`](../../docs/decisions.md).
- Os tipos `FieldProps` e `FieldControlProps` são exportados.
- Ele não tem `"use client"`: também renderiza em um Server Component. Uma função como `children` é então escrita também em um Server Component.

### `TextInput`

Um campo de texto: uma linha de texto. Ele não tem label próprio: coloque o campo dentro de [`Field`](#field).

```tsx
import { Search } from "lucide-react";
import { Field, TextInput } from "@toraline.tech/ui";

<Field label="Client name" error={nameError}>
  <TextInput name="name" />
</Field>

<TextInput aria-label="Search an order" type="search" icon={Search} size="sm" />
```

| Prop | Valores | Significado |
|---|---|---|
| `size` | `"md"` (padrão), `"sm"` | `md`: 48 pixels de altura com texto de 16 pixels em uma tela pequena, e 40 pixels com texto de 14 pixels a partir do breakpoint `lg` do Tailwind CSS (uma tela com 1024 pixels de largura ou mais). `sm`: 32 pixels, para uma tabela ou uma linha de filtros. Ela substitui o atributo HTML `size` |
| `icon` | Um componente de ícone | Um ícone mostrado dentro do campo, à esquerda. Veja [Ícones](#ícones) |
| `type` | `"text"` (padrão), e todos os outros tipos de `<input>` | O atributo HTML |
| `aria-invalid` | `true` | O campo tem a borda vermelha de um campo que não é válido. Field define esse atributo quando tem um erro |
| `disabled` | O atributo HTML | O campo não pode receber o foco e não pode ser alterado. Ele tem um fundo discreto e um texto discreto |

- Os tamanhos e as aparências são os do `TextInput` do app Intraweb. A aparência do foco é a do Intraweb: a borda na cor do foco e um anel de 3 pixels, sem outline. Um celular aumenta a página quando um campo com texto menor que 16 pixels recebe o foco, e é por isso que `md` tem texto de 16 pixels em uma tela pequena.
- Elemento nativo principal: o `<input>`. `className`, todas as outras props (`name`, `value`, `defaultValue`, `onChange`, `placeholder`, `required`, `readOnly`) e `ref` vão para ele. Com um ícone, o `<input>` fica dentro de um `<div data-slot="wrapper">` com a largura do seu contêiner, e `className` continua indo para o `<input>`, como no Intraweb.
- Leitor de tela: dentro de Field, o label, a dica e a mensagem de erro são ligados a ele. Sozinho, ele precisa de `aria-label`.
- Um campo somente leitura (`readOnly`) não tem aparência própria.
- A lista `controlSizes` e os tipos `TextInputProps` e `ControlSize` são exportados. Todo controle de formulário da biblioteca tem esses tamanhos.
- Ele não tem `"use client"`: também renderiza em um Server Component. Com `onChange`, o arquivo do app que dá a função é um Client Component.

### `Toggle`

Um interruptor: um controle que está ligado ou desligado. Ele não é o `ThemeToggle`, o botão que muda o tema.

```tsx
import { Toggle } from "@toraline.tech/ui";

<Toggle label="Send e-mails" checked={sendEmails} onChange={(event) => setSendEmails(event.target.checked)} />
```

| Prop | Valores | Significado |
|---|---|---|
| `label` | Texto ou elementos | O nome visível do interruptor, mostrado ao lado dele. Ele diz o que o interruptor controla e não muda com o estado. Um interruptor sem `label` precisa de `aria-label` |
| `checked` e `onChange` | O atributo HTML e o evento do React | O app guarda o estado: `checked` é `true` quando o interruptor está ligado |
| `defaultChecked` | `true`, `false` | O estado em que o interruptor começa, quando o app não guarda o estado |
| `disabled` | O atributo HTML | O interruptor não pode receber o foco e não pode ser alterado. O trilho fica com metade da opacidade |

- Elemento nativo principal: um `<input type="checkbox" role="switch">`. Todas as outras props (`name`, `value`, `id`) e `ref` vão para ele.
- `className` vai para o elemento mais externo, um `<label>` que contém o interruptor e o texto dele. As partes internas têm o atributo `data-slot` com os valores `input`, `track`, `thumb`, `check` e `label`. O interruptor tem 36 pixels de largura e 20 pixels de altura, a altura do checkbox do app Intraweb, e o label dele tem o tamanho de texto pequeno.
- Teclado: Tab move o foco para ele, Espaço muda o estado. Um clique no label também muda o estado.
- Leitor de tela: o papel `switch` com o estado do checkbox, lido como "on" ou "off".
- Uma pessoa que não consegue ver cores ainda vê o estado: o círculo fica à esquerda quando desligado, e à direita com uma marca de seleção quando ligado.
- Ele não tem `"use client"`: também renderiza em um Server Component. Com `onChange`, o arquivo do app que dá a função é um Client Component.

### `TabNav`

Abas em que cada aba é um link para uma rota do app. Use para ir de uma página a outra. Para mudar o conteúdo dentro de uma página, use [`Tabs`](#tabs).

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabNav } from "@toraline.tech/ui";

const items = [
  { href: "/sales", label: "Overview", exact: true },
  { href: "/sales/orders", label: "Orders" },
  { href: "/sales/clients", label: "Clients" },
];

export function SalesTabs() {
  return <TabNav items={items} currentPath={usePathname()} linkComponent={Link} aria-label="Sales" />;
}
```

| Prop | Valores | Significado |
|---|---|---|
| `items` | Uma lista de `{ href, label, exact }`. Obrigatória | As abas, na ordem em que são mostradas. `href` é o endereço da rota. `label` é o texto. `exact` é opcional, veja abaixo |
| `currentPath` | Texto. Obrigatória | O caminho da página em que a pessoa está, por exemplo `"/sales/orders/12"`. Um app Next.js dá o resultado de `usePathname()` |
| `aria-label` | Texto. Obrigatória | O nome do grupo de abas para um leitor de tela |
| `variant` | `"primary"` (padrão), `"secondary"` | A aparência. `primary`: uma linha de abas com um traço abaixo dela, e um traço na cor da marca abaixo da aba atual. `secondary`: a aparência segmentada, em que a aba atual é uma peça branca elevada |
| `linkComponent` | Um componente. Quando falta: `"a"` | O componente que renderiza cada link. Ele recebe `href`, `className`, `aria-current` e `children`. Um app Next.js dá o `Link` de `next/link` |

- Qual aba é a atual: a aba cujo `href` é `currentPath`, ou o começo dele seguido de `/`. Assim a aba `/sales/orders` é a atual em `/sales/orders/12`. Uma aba com `exact: true` é a atual só na sua própria rota; dê essa opção a uma primeira aba cuja rota é o começo das outras (`/sales`).
- As duas aparências e as classes delas são as do `TabNav` do app Intraweb. O `TabNav` do Intraweb lê o caminho sozinho com `usePathname` do Next.js. A biblioteca não importa o Next.js, e por isso o app dá `currentPath` e `linkComponent`, e o nome é `aria-label` (Intraweb: `label`).
- Elemento nativo principal: o `<nav>`. `className`, todas as outras props e `ref` vão para ele. Cada link tem `data-slot="link"`. Sem nenhum item, o componente não renderiza nada.
- Teclado: Tab passa pelos links, Enter segue um deles.
- Leitor de tela: uma região de navegação com links. O link da página atual tem `aria-current="page"`. As abas não têm os papéis `tablist` e `tab`: esses são para abas que mudam o conteúdo dentro de uma página.
- Muitas abas: `primary` rola para os lados em uma tela estreita, com a borda direita esmaecida, e passa para uma segunda linha a partir do breakpoint `md` do Tailwind CSS (768 pixels). `secondary` rola para os lados.
- A lista `tabNavVariants` e os tipos `TabNavProps`, `TabNavItem` e `TabNavVariant` são exportados.
- Ele não tem `"use client"`. O arquivo do app que chama `usePathname()` é um Client Component.

### `Tabs`

Uma linha de abas que muda o conteúdo dentro de uma página. Ela tem a aparência segmentada: a aba selecionada é uma peça branca elevada. Para ir de uma página a outra, use [`TabNav`](#tabnav).

```tsx
import { Tabs } from "@toraline.tech/ui";

// Uncontrolled: the component holds the state and shows the content.
<Tabs
  aria-label="Orders by kind"
  defaultValue="open"
  tabs={[
    { id: "all", label: "All", content: <AllOrders /> },
    { id: "open", label: "Open", content: <OpenOrders /> },
  ]}
/>

// Controlled: the app holds the state, and here it also shows the content.
<Tabs
  aria-label="Mode of the editor"
  value={mode}
  onChange={setMode}
  tabs={[
    { id: "write", label: "Write" },
    { id: "preview", label: "Preview" },
  ]}
/>
```

| Prop | Valores | Significado |
|---|---|---|
| `tabs` | Uma lista de `{ id, label, content }`. Obrigatória | As abas, na ordem em que são mostradas. `id` é um nome que nenhuma outra aba tem. `label` é o texto da aba. `content` é opcional: o que o componente mostra abaixo da linha de abas enquanto a aba está selecionada |
| `value` e `onChange` | O `id` de uma aba, e uma função que recebe um `id` | Controlado: o app guarda o estado |
| `defaultValue` | O `id` de uma aba | Não controlado: o componente guarda o estado, e essa aba está selecionada no começo. Quando falta: a primeira aba |
| `aria-label` ou `aria-labelledby` | Texto, ou o id de um elemento | O nome da linha de abas para um leitor de tela |

- A aparência é a do `SegmentedTabs` do app Intraweb. Para passar dele para este: `label` vira `aria-label`, `items` vira `tabs`, e a `key` de um item vira `id`. `value` e `onChange` mantêm os nomes.
- Quando os `id`s são escritos como textos fixos (`as const`), o TypeScript conhece esses valores: `onChange` recebe `"write" | "preview"`, não um texto qualquer.
- Elemento nativo principal: o `<div>` mais externo. `className`, todas as outras props e `ref` vão para ele. As partes internas têm o atributo `data-slot` com os valores `list`, `tab` e `panel`.
- Teclado: Tab move o foco para a aba selecionada, e Tab de novo move o foco para o conteúdo. As setas para a esquerda e para a direita vão para a aba anterior ou a seguinte e selecionam essa aba; depois da última aba vem a primeira. Home seleciona a primeira aba, End a última.
- Leitor de tela: a linha de abas tem o papel `tablist`, cada aba o papel `tab`, e o conteúdo o papel `tabpanel`. A aba selecionada tem `aria-selected="true"`, as outras `"false"`. O conteúdo recebe o nome da aba selecionada.
- Só o conteúdo da aba selecionada está na página. Uma aba selecionada sem `content` não tem `tabpanel`.
- Muitas abas: a linha de abas rola para os lados quando é mais larga que o seu contêiner.
- Os tipos `TabsProps` e `TabItem` são exportados.
- É um Client Component, porque guarda estado.

### `BreadCrumbs`

Breadcrumbs são o caminho da primeira página do app até a página atual, como uma linha de links.

```tsx
import { BreadCrumbs } from "@toraline.tech/ui";

<BreadCrumbs
  crumbs={[
    { label: "Clients", href: "/clients" },
    { label: "Fernando Dias", href: "/clients/12" },
  ]}
/>
```

| Prop | Valores | Significado |
|---|---|---|
| `crumbs` | Uma lista de `{ label, href }` | Os passos do caminho, em ordem. O último passo é a página atual: ele é mostrado como texto na cor principal de texto, e o `href` dele não é usado. Um passo sem `href` também é texto |
| `linkComponent` | Um componente. Quando falta: `"a"` | O componente que renderiza cada link. Ele recebe `href`, `className` e `children`. Um app Next.js dá o `Link` de `next/link`, e assim pressionar o link não carrega a página inteira de novo |
| `aria-label` | Texto. Quando falta: `"Breadcrumb"` | O nome da região para um leitor de tela |

- Elemento nativo principal: o `<nav>`. `className`, todas as outras props e `ref` vão para ele. As partes internas têm o atributo `data-slot` com os valores `list`, `item`, `link`, `text`, `separator` e `current`.
- Teclado: Tab passa pelos links. A página atual não é um link e não recebe o foco.
- Leitor de tela: uma região de navegação com uma lista ordenada. A página atual tem `aria-current="page"`. A `/` entre os passos tem `aria-hidden="true"`, e por isso não é lida.
- Ele não tem `"use client"`: também renderiza em um Server Component.

### `SplitButton`

Um botão principal para a ação principal e, ao lado dele, um botão pequeno que abre um menu com mais ações.

```tsx
"use client";
import { SplitButton } from "@toraline.tech/ui";

<SplitButton
  onClick={downloadAll}
  menuPlacement="top"
  items={[
    { label: "Download the invoice", onSelect: downloadInvoice },
    { label: "Send by e-mail", onSelect: sendByEmail },
  ]}
>
  Download all
</SplitButton>
```

| Prop | Valores | Significado |
|---|---|---|
| `children` | Texto ou elementos | O texto do botão principal |
| `onClick` | Uma função | A ação principal |
| `items` | Uma lista de `{ label, onSelect, icon }` | As ações do menu. `onSelect` é chamada quando uma pessoa escolhe a ação. `icon` é opcional e é mostrado antes do texto |
| `menuPlacement` | `"bottom"` (padrão), `"top"` | Onde o menu abre: abaixo dos botões, ou acima deles (para cima) |
| `menuLabel` | Texto. Quando falta: `"More options"` | O nome que um leitor de tela diz para o botão que abre o menu, e para o menu |
| `disabled` | O atributo HTML | Desabilita os dois botões. Eles ficam com metade da opacidade |

- Os dois botões têm a aparência do Button primário no tamanho `md`: 40 pixels de altura. O menu tem a aparência do menu de ações do app Intraweb.
- Elemento nativo principal: o `<button>` principal. Todas as outras props e `ref` vão para ele.
- `className` vai para o elemento mais externo, um `<div>` que contém os dois botões e o menu. As partes internas têm o atributo `data-slot` com os valores `main`, `trigger`, `arrow`, `menu`, `item` e `item-icon`.
- Teclado, no botão que abre o menu: Enter, Espaço e a seta para baixo abrem o menu com o foco na primeira ação. A seta para cima abre o menu com o foco na última ação.
- Teclado, no menu: as setas para cima e para baixo vão de uma ação a outra, e dão a volta. Home vai para a primeira ação, End para a última. Uma letra vai para a próxima ação que começa com ela. Enter e Espaço escolhem a ação, fecham o menu e devolvem o foco ao botão que abriu o menu. Escape fecha o menu e devolve o foco. Tab fecha o menu e move o foco para o próximo elemento da página.
- Pressionar fora do componente também fecha o menu.
- Leitor de tela: o botão que abre o menu tem `aria-haspopup="menu"` e `aria-expanded` (`"true"` enquanto o menu está aberto). O menu tem o papel `menu`, e cada ação o papel `menuitem`.
- O menu fica acima do conteúdo da página e não empurra o conteúdo para baixo. Limite: o menu não muda de lugar sozinho quando não há espaço no lado escolhido. O app escolhe o lado com `menuPlacement`.
- A lista `splitButtonMenuPlacements` e os tipos `SplitButtonProps`, `SplitButtonItem` e `SplitButtonMenuPlacement` são exportados.
- É um Client Component, porque guarda estado. As ações são funções, e por isso o arquivo do app que usa o componente também é um Client Component.

## Estilizar por cima

Todo componente aceita `className`. As classes vão no elemento mais externo do componente, depois das classes da biblioteca.

1. **Uma classe do Tailwind do app substitui a classe da biblioteca que define a mesma propriedade CSS.** Exemplo: `<Button className="rounded-full">` tem `rounded-full` e não tem mais a `rounded-md` da biblioteca. A biblioteca `tailwind-merge` faz isso, dentro de todo componente. Funciona para uma classe de token contra uma classe de token (`bg-surface` substitui `bg-primary`), e para uma classe padrão do Tailwind contra uma classe de token (`bg-red-500` substitui `bg-primary`). Uma classe substitui só uma classe da mesma propriedade CSS: `text-brand` (uma cor de texto) não remove `text-sm` (um tamanho de fonte), `border-brand` (uma cor de borda) não remove `border` (uma largura de borda), e `bg-promo` não remove a cor do texto.
2. **Uma classe substitui só uma classe com a mesma variante do Tailwind.** Uma variante do Tailwind é a parte de uma classe do Tailwind antes do `:`, que diz quando a classe se aplica. Ela não é uma variante de um componente. `bg-red-500` substitui `bg-primary`. Ela não substitui `hover:bg-primary-hover` nem `disabled:bg-subtle`. Para mudar a aparência de um estado, dê uma classe com a variante do Tailwind desse estado: `hover:bg-red-600`, `disabled:bg-red-200`.
3. **O CSS do app que não está em nenhuma cascade layer também vence.** Uma cascade layer é um grupo nomeado de regras CSS com uma prioridade fixa. As classes do Tailwind estão na layer `utilities`, e o CSS fora de qualquer layer tem prioridade maior que todas as layers. Uma classe do app que está dentro de `@layer components` ou de `@layer base` não vence.
4. **Uma parte interna** de um componente tem o atributo `data-slot`, por exemplo `data-slot="label"` no `<label>` de Field. Um app pode selecionar essa parte no seu próprio CSS: `.search [data-slot="label"] { text-transform: uppercase; }`.

## Regras que todo componente segue

Estas regras foram decididas em TOR-1009, e as regras sobre estilos em TOR-1205. Os motivos estão em [`docs/decisions.md`](../../docs/decisions.md). A pasta [`src/template/`](src/template/README.md) é um pequeno componente que segue todas elas: copie a pasta para começar um novo componente.

### Arquivos

| Arquivo | Conteúdo |
|---|---|
| `src/<name>/<Name>.tsx` | O componente |
| `src/<name>/<Name>.test.tsx` | Os testes dele |
| `src/<name>/index.ts` | O que a pasta exporta |
| `src/index.ts` | Exporta o componente e os tipos dele de `@toraline.tech/ui` |

### Variantes, tamanhos e estados

Uma variante é uma das aparências de um componente, por exemplo `primary` ou `danger`.

Os tamanhos têm os nomes e as alturas do Intraweb. Um botão (Button, ButtonLink, IconButton) é `sm`, `md` ou `lg`: 32, 40 ou 48 pixels de altura. Um controle de formulário (TextInput) é `md` ou `sm`, da lista `controlSizes`: `md` tem 48 pixels em uma tela pequena e 40 pixels a partir do breakpoint `lg`, e `sm` tem 32 pixels. O padrão é `md`. Um componente que fica ao lado de um botão tem a altura de um tamanho de botão: os dois botões de SplitButton e o ThemeToggle têm 40 pixels de altura.

1. As variantes são uma lista no arquivo do componente, e o tipo vem da lista: `export const buttonVariants = ["primary", "secondary"] as const`. Os tamanhos funcionam do mesmo jeito (`buttonSizes`). As listas são exportadas, e assim um teste ou um catálogo pode mostrar todos os valores. Quando o arquivo do componente começa com `"use client"`, as listas ficam em um segundo arquivo sem `"use client"`, `src/<name>/<name>-options.ts`. O Next.js não deixa um Server Component ler um valor que um arquivo com `"use client"` exporta; ele só pode renderizar os componentes desse arquivo.
2. As classes de cada variante e de cada tamanho são um objeto no arquivo do componente, com um texto de classes do Tailwind para cada valor: `const variantClass: Record<ButtonVariant, string> = { primary: "bg-primary text-inverse", ... }`. O tipo faz o build falhar quando um valor não tem classes. Os objetos não são exportados.
3. O componente também escreve a variante e o tamanho no seu elemento como os atributos `data-variant` e `data-size`, e assim um teste ou o CSS de um app pode selecionar esses valores.
4. Um estado (desabilitado, carregando, erro, selecionado, atual, ligado, aberto) é escrito uma vez, como o atributo HTML ou ARIA que um leitor de tela lê: `disabled`, `aria-busy`, `aria-invalid`, `aria-selected`, `aria-current`, `checked`, `aria-expanded`. Atributos ARIA são atributos HTML que descrevem um elemento para um leitor de tela. A classe do estado tem a variante do Tailwind que seleciona o mesmo atributo: `disabled:opacity-50`, `aria-invalid:border-invalid`, `aria-selected:bg-surface`, `aria-[current=page]:text-brand`, `peer-checked:bg-primary`. A aparência e o que um leitor de tela diz não podem ser diferentes, porque os dois vêm de um único atributo. O componente não escolhe as classes de um estado no código dele. Uma exceção: um Button carregando deixa de fora a classe do ponteiro sobre ele (`hover:`), para que uma cor que o app deu continue enquanto ele carrega.

### Props

1. O tipo das props é formado pelas props do elemento HTML nativo mais as props próprias do componente: `ComponentProps<"button"> & { variant?: ButtonVariant }`. Cada prop própria tem um comentário curto.
2. Uma prop tem o nome que o HTML ou o React já usa, quando existe um: `disabled`, `checked`, `href`, `onChange`.
3. Um ícone é a prop `icon`, do tipo `IconComponent` (`src/shared/icon.ts`): um componente que o app dá, nunca um elemento e nunca um conjunto de ícones da biblioteca. Veja [Ícones](#ícones).
4. `className` é juntada depois das classes da biblioteca com o helper `classNames(baseClass, sizeClass[size], variantClass[variant], className)` de `src/shared/class-names.ts`, e vai no elemento mais externo. Uma exceção: a `className` de TextInput vai para o `<input>` dele, também quando um ícone coloca o `<input>` dentro de um wrapper. O helper remove uma classe da biblioteca quando uma classe posterior define a mesma propriedade CSS.
5. Todas as outras props vão para o elemento nativo principal: o `<button>`, o `<input>`. A seção do componente neste arquivo diz qual é esse elemento.
6. `ref` é uma prop normal, como o React 19 permite, e aponta para o elemento nativo principal. Nenhum componente usa `forwardRef`.
7. Um import relativo escreve o nome do arquivo com `.js`: `import { classNames } from "../shared/class-names.js"`, `export { Button } from "./button/index.js"`. Os arquivos de tipos gerados mantêm o import como foi escrito, e o TypeScript em um app que usa as regras de módulos do Node precisa do nome completo do arquivo. `make check` falha quando um arquivo de tipos gerado tem um import relativo sem `.js`.
8. Um arquivo começa com `"use client"` só quando o componente usa estado do React, um efeito, ou um manipulador de evento próprio. `"use client"` diz ao Next.js que o arquivo roda no navegador. Um componente sem essa linha também pode renderizar em um Server Component. Um componente que tem a prop `icon` não pode ter `"use client"`: o Next.js não deixa um Server Component dar um componente de ícone a um Client Component. Quando um componente desses precisa de código que roda no navegador, esse código é um segundo arquivo com `"use client"`, como `src/button/ButtonElement.tsx`.
9. Um componente que renderiza um link (ButtonLink, TabNav, BreadCrumbs) tem a prop `linkComponent`, com o padrão `"a"`. A biblioteca nunca importa o Next.js.
10. Um controle de formulário é ligado ao label, à dica e à mensagem de erro dele por [`Field`](#field), que dá a ele `id`, `aria-describedby` e `aria-invalid`. Um controle só precisa passar essas props para o elemento nativo dele. A caixa dele tem as classes de `controlClassNames` (`src/shared/control.ts`).

### Comportamento e acessibilidade

1. Um componente usa o elemento HTML nativo que já tem o comportamento: `<button>`, `<input>`, `<label>`, `<a>`, `<nav>`. O navegador então dá o suporte ao teclado e ao leitor de tela.
2. O comportamento que o HTML não tem (teclas de seta entre abas, um menu) é escrito à mão no componente, seguindo o padrão do WAI-ARIA Authoring Practices Guide (https://www.w3.org/WAI/ARIA/apg/patterns/). O pacote não usa nenhuma biblioteca de primitivos. Uma biblioteca de primitivos é um conjunto de componentes com comportamento e sem estilos, por exemplo Base UI, Radix ou React Aria.
3. Quando um componente futuro precisar de um comportamento difícil de escrever corretamente (um diálogo que mantém o foco dentro dele, um select, um combobox, um tooltip ou um menu que precisa mudar de lugar para continuar na tela), a biblioteca a usar é a Base UI (`@base-ui/react`). Os overlays da fase 9 (diálogo, painel lateral, menu, popover, tooltip) são escritos à mão mesmo assim, a partir do código do Intraweb: a entrada de TOR-1156 de `docs/decisions.md` tem a comparação e os motivos.
4. Todo elemento que pode receber o foco mostra o anel de foco: as classes de `focusRingClass` de `src/shared/focus-ring.ts` (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`). `outline-focus` é a classe do token `--border-focus`. Uma exceção: um controle de formulário (TextInput) mostra a aparência de foco dos controles do Intraweb, a borda na cor do foco e um anel de 3 pixels (`focus:border-focus focus:ring-3 focus:ring-info focus:outline-none`), de `src/shared/control.ts`.
5. Um ícone que é só decoração tem `aria-hidden="true"`. Um ícone é desenhado com `currentColor`, e por isso tem a cor do texto.
6. Uma classe de um movimento ou de uma transição tem a variante do Tailwind `motion-safe:`, e assim uma pessoa que pediu menos movimento ao dispositivo não recebe nenhum.

### Estilos

1. Um componente é estilizado só com classes do Tailwind CSS 4, escritas no arquivo `.tsx` dele. O pacote não tem arquivo CSS para um componente. O único arquivo CSS dele é `css/tailwind.css`, que diz ao Tailwind de um app para ler os arquivos gerados.
2. Um nome de classe é escrito por inteiro, como um único texto: `"bg-primary"`. O Tailwind lê os arquivos como texto, e por isso não encontra um nome que o código monta a partir de partes (`"bg-" + color`).
3. Uma cor é sempre uma classe de token do seu grupo: um fundo é `bg-<name>` (`bg-primary`, `bg-surface`), uma cor de texto é `text-<name>` (`text-primary`, `text-tertiary`), uma cor de borda é `border-<name>` (`border-default`), o outline do foco é `outline-focus`, e a cor de um ícone é `text-icon`, `text-icon-strong` ou `text-icon-brand`. `border-current`, `bg-current`, `border-transparent` e `bg-transparent` são permitidas. Uma cor de nível 1 (`bg-brand-700`), uma cor padrão do Tailwind (`bg-red-500`) e uma cor bruta (`bg-[#f00]`) nunca são usadas.
   - Quando o app Intraweb tem o mesmo componente, cada parte tem o token que o componente do Intraweb usa. As escolhas para os 6 primeiros componentes estão na entrada de TOR-1131 de [`docs/decisions.md`](../../docs/decisions.md).
4. Um tamanho de fonte é `text-xs`, `text-sm`, `text-base` ou `text-lg` (e `text-2xl` e `text-3xl` para o número grande de StatCard), escrito com a altura da linha: `text-xs/4` (uma linha de 16 pixels), `text-sm/5` (uma linha de 20 pixels, a altura de linha que o `text-sm` do Intraweb tem), `text-base/6` (24 pixels) ou `text-base/normal`. Uma fonte é `font-body` (texto normal), `font-heading` (um título, um botão, uma aba) ou `font-mono`. `font-heading` é a Poppins, que os apps carregam nos pesos 400, 500 e 600, e por isso o peso dela é `font-normal`, `font-medium` ou `font-semibold`, nunca `font-bold`. O texto de um botão, de uma aba e de um link com a aparência de um deles é `font-heading text-sm/5 font-medium`: os valores do estilo de texto `label` do Intraweb. O raio é `rounded-md` para um botão ou um campo e `rounded-lg` para um menu; `rounded-xl` e `rounded-2xl` são para um card e um drawer. Dois formatos não são tokens: um círculo completo ou uma pílula (`rounded-full`), e o trilho da aparência segmentada (`rounded-[10px]`, o valor do Intraweb). A sombra é uma entre `shadow-sm`, `shadow-card`, `shadow-lg`, `shadow-xl` e `shadow-2xl`; um menu tem `shadow-lg`.
5. Um padding, uma margem e um gap são uma classe padrão de espaçamento do Tailwind (`px-4`, `gap-2`), que é um múltiplo do token `--spacing`.
6. Estes são escritos como valores simples, porque não mudam com o tema: a largura de uma borda ou de um outline (`border`, `border-2`, `outline-2`), um peso de fonte (`font-bold`), uma largura em pixels que não é um passo da escala de espaçamento (`border-[1.5px]`), um tamanho em `em` ou `%`, uma duração, e um `z-index` (`z-10`). Um comprimento em `rem` nunca é usado.
7. Quando duas classes de um elemento definem a mesma propriedade em estados diferentes, o estado que precisa vencer tem a variante do Tailwind que o Tailwind escreve depois no CSS. A ordem que o Tailwind usa: sem variante do Tailwind, `hover:`, `focus:`, `focus-visible:`, `disabled:`, depois `aria-*:`, depois um breakpoint (`md:`, `lg:`). Quando essa ordem não é a necessária, a classe escreve as duas condições: `disabled:hover:border-default`.
8. Um elemento que outra classe precisa selecionar recebe uma classe marcadora com o nome do componente: `group/toggle`, `group/split-button`. `peer` não precisa de nome.
9. Um elemento interno tem o atributo `data-slot` com o nome da parte, e assim um app pode selecionar esse elemento.
10. O texto sobre o seu fundo tem um contraste de 4.5 ou mais nos dois temas. Cada par de token de texto e token de fundo que um componente usa está no teste de contraste de `packages/tokens/src/tokens.test.ts`.

O teste `src/tailwind.test.tsx` renderiza todos os componentes, e verifica que o Tailwind gera o CSS de todas as classes, as regras 1, 3, 4 e 6 (sem `rem`), a ordem da regra 7, e a variante do Tailwind `motion-safe:`. O teste `src/shared/class-names.test.ts` verifica que uma classe do app substitui a classe da biblioteca.

### O que o teste de todo componente cobre

Os testes usam Vitest, Testing Library e `@testing-library/user-event`, que pressiona teclas do jeito que uma pessoa faz.

1. Ele renderiza, com o papel e o nome acessível corretos. O nome acessível é o texto que um leitor de tela diz para o elemento.
2. Cada variante e cada tamanho, a partir das listas exportadas.
3. Cada estado, lido do atributo que um leitor de tela lê.
4. A `className` do app está no elemento mais externo, depois das classes da biblioteca, e substitui a classe da biblioteca da mesma propriedade CSS.
5. Outro atributo nativo chega ao elemento nativo principal, e `ref` aponta para ele.
6. O teclado: todas as teclas a que o componente responde.
7. Um componente sem `"use client"` renderiza no servidor (`renderToString`).

### Depois do código

1. O componente está em uma página de `apps/playground`, com todas as variantes e todos os estados.
2. Este arquivo tem as props do componente e um exemplo curto.

## Os controles de formulário e os componentes de feedback da fase 8

Estes componentes foram adicionados na fase 8 (TOR-1124). Eles vêm de `@toraline.tech/ui`, precisam das 3 linhas de CSS de [Como usar o tema em um app Next.js](#como-usar-o-tema-em-um-app-nextjs) e seguem as [regras que todo componente segue](#regras-que-todo-componente-segue). Cada um tem as partes, as classes e as medidas do mesmo componente do app Intraweb. A página `/forms-feedback` de [`apps/playground`](../../apps/playground/README.md) mostra cada um com todas as variantes e estados.

### `Select`

Um select: um controle em que a pessoa escolhe um valor de uma lista. Ele não tem label próprio: coloque-o dentro de [`Field`](#field).

```tsx
import { Field, Select } from "@toraline.tech/ui";

<Field label="Kind of contract" error={kindError}>
  <Select name="kind" defaultValue="monthly">
    <option value="monthly">Monthly</option>
    <option value="hourly">By the hour</option>
  </Select>
</Field>

<Select aria-label="State" size="sm" className="w-auto" value={state} onChange={changeState}>
  <option value="open">Open</option>
  <option value="closed">Closed</option>
</Select>
```

| Prop | Valores | Significado |
|---|---|---|
| `size` | `"md"` (padrão), `"sm"` | Os tamanhos de todo controle de formulário (`controlSizes`): `md` tem 48 pixels de altura em uma tela pequena e 40 pixels a partir do breakpoint `lg`, `sm` tem 32 pixels. Ela substitui o atributo HTML `size` |
| `children` | Elementos `<option>` e `<optgroup>` | As opções |
| `aria-invalid` | `true` | O select tem a borda vermelha de um campo que não é válido. O Field define esse atributo quando tem um erro |
| `disabled` | O atributo HTML | O select não pode receber o foco e não pode ser alterado. Ele tem um fundo discreto e um texto discreto |

- É um `<select>` nativo: o navegador mostra a lista de opções e cuida do teclado. A biblioteca esconde a seta do navegador e mostra a sua própria, a 12 pixels da borda direita.
- A caixa, os tamanhos e as aparências de foco, de desabilitado e de não válido são as do TextInput (`controlClassNames`), como no Intraweb.
- A seta é uma imagem dentro de uma classe, como no Intraweb. Uma imagem em uma classe não pode ler um token, então a linha dela é o cinza `#667085` em todos os temas.
- Elemento nativo principal: o `<select>`. `className`, todas as outras props (`name`, `value`, `defaultValue`, `onChange`, `required`) e `ref` vão para ele. Uma classe de largura do app (`w-auto`, `w-40`) substitui a largura total.
- Leitor de tela: dentro do Field, o label, a dica e a mensagem de erro ficam ligados a ele. Sozinho, ele precisa de `aria-label`.
- O tipo `SelectProps` é exportado. Ele não tem `"use client"`.

### `Textarea`

Um campo de texto com mais de uma linha. Ele não tem label próprio: coloque-o dentro de [`Field`](#field).

```tsx
import { Field, Textarea } from "@toraline.tech/ui";

<Field label="Notes" optional hint="200 characters at most.">
  <Textarea name="notes" rows={3} maxLength={200} />
</Field>
```

| Prop | Valores | Significado |
|---|---|---|
| `rows` | O atributo HTML | A altura, em linhas de texto. Quando falta: 2, o valor do navegador |
| `aria-invalid` | `true` | O textarea tem a borda vermelha de um campo que não é válido. O Field define esse atributo quando tem um erro |
| `disabled` | O atributo HTML | O textarea não pode receber o foco e não pode ser alterado. Ele tem um fundo discreto e um texto discreto |

- É um `<textarea>` nativo com a caixa e as aparências de foco, de desabilitado e de não válido do TextInput, como no Intraweb. Ele tem um tamanho só e nenhuma prop `size`: texto de 16 pixels em uma tela pequena e de 14 pixels a partir do breakpoint `lg`.
- Elemento nativo principal: o `<textarea>`. `className`, todas as outras props (`name`, `value`, `defaultValue`, `onChange`, `placeholder`, `maxLength`, `readOnly`) e `ref` vão para ele.
- A pessoa pode mudar o tamanho dele com o canto que o navegador mostra. `className="resize-none"` remove esse canto.
- Leitor de tela: dentro do Field, o label, a dica e a mensagem de erro ficam ligados a ele. Sozinho, ele precisa de `aria-label`.
- O tipo `TextareaProps` é exportado. Ele não tem `"use client"`.

### `DecimalInput`

Um campo de texto para um número com decimais: um preço, uma quantidade, uma taxa. Ele não tem label próprio: coloque-o dentro de [`Field`](#field).

```tsx
"use client";
import { useState } from "react";
import { DecimalInput, Field, parseDecimalInput } from "@toraline.tech/ui";

const [priceText, setPriceText] = useState("");
const price = parseDecimalInput(priceText); // a number, null for an empty text, NaN for a text that is not a number
const priceError = price !== null && Number.isNaN(price) ? "Type a number, for example 12,50." : undefined;

<Field label="Price" error={priceError}>
  <DecimalInput name="price" value={priceText} onChange={(event) => setPriceText(event.target.value)} />
</Field>
```

| Prop | Valores | Significado |
|---|---|---|
| `size` | `"md"` (padrão), `"sm"` | Os tamanhos de todo controle de formulário, como em [`TextInput`](#textinput) |
| `icon` | Um componente de ícone | Um ícone mostrado dentro do campo, à esquerda. Veja [Ícones](#ícones) |
| `inputMode` | `"decimal"` (padrão), e os outros valores do atributo HTML | O teclado que um celular mostra. `decimal`: os dígitos e o separador decimal |
| `aria-invalid`, `disabled` | Como no TextInput | As aparências de um campo que não é válido e de um campo desabilitado |

- É um [`TextInput`](#textinput) com `type="text"` e `inputMode="decimal"`, como no Intraweb. Os tipos recusam a prop `type`. Ele não é `type="number"`: em alguns idiomas o navegador recusa uma vírgula em um campo assim, e a roda do mouse muda o valor dele.
- O valor dele é o texto que a pessoa digitou. O campo não muda o texto e não recusa nenhum caractere. O app lê o número e mostra a sua própria mensagem de erro pelo Field.
- `parseDecimalInput(text)` lê o texto como um número, do jeito que o Intraweb faz. Com uma vírgula no texto, a vírgula é o separador decimal e todo ponto é um separador de milhar: `"1.234,5"` é `1234.5`. Sem vírgula, um ponto é o separador decimal: `"2.5"` é `2.5`. Um texto vazio é `null`. Um texto que não é um número é `NaN`.
- `decimalToInput(value)` escreve um número como o texto do campo, com vírgula: `0.4` é `"0,4"`. `null` e `undefined` são o texto vazio.
- As duas funções seguem o jeito de escrever um número no Brasil, o idioma do Intraweb. Um número em inglês com vírgula entre os milhares (`"1,234.5"`) não é lido corretamente.
- Elemento nativo principal: o `<input>`. `className`, todas as outras props e `ref` vão para ele, como no TextInput.
- O tipo `DecimalInputProps` é exportado. Ele não tem `"use client"`.

### `Checkbox` e `CheckboxControl`

`Checkbox` é uma caixa de seleção com o seu label. `CheckboxControl` é só a caixa, para uma lista ou uma tabela que tem o seu próprio label.

```tsx
import { Checkbox, CheckboxControl } from "@toraline.tech/ui";

<Checkbox label="Send the invoice by e-mail" name="send" checked={send} onChange={changeSend} />

<CheckboxControl id="task-12" checked={done} onChange={changeDone} />
<label htmlFor="task-12">Buy the flowers</label>

<CheckboxControl aria-label="Select the order 12" />
```

| Prop | Componente | Valores | Significado |
|---|---|---|---|
| `label` | `Checkbox` | Texto ou elementos, obrigatório | O nome visível, mostrado depois da caixa. Um clique nele muda a caixa |
| `changed` | `CheckboxControl` | `true`, `false` (padrão) | `true` para um valor que a pessoa mudou e que ainda não foi salvo, por exemplo em uma tabela que é editada no lugar. A caixa tem uma borda e um anel laranja |
| `checked`, `defaultChecked`, `onChange` | Os dois | Os atributos HTML, como o React os usa | `checked` com `onChange` controla a caixa a partir do app. `defaultChecked` define só como ela começa |
| `disabled` | Os dois | O atributo HTML | A caixa não pode receber o foco e não pode ser alterada. Ela tem metade da sua opacidade |

- A caixa é um `<input type="checkbox">` de verdade, desenhado pela biblioteca: 20 pixels, um canto de 6 pixels, uma borda de 1,5 pixel. Marcada, ela tem a cor da ação principal e um sinal de marcado. A tecla Tab move o foco para ela, a tecla Espaço muda a caixa, e um leitor de tela diz "marcado" ou "não marcado".
- O foco do teclado mostra o anel de foco da biblioteca (o outline), não o anel de um campo de texto.
- `Checkbox`: o elemento mais externo é o `<label>`, e `className` vai para ele. `CheckboxControl`: o elemento mais externo é um `<span>` com o tamanho da caixa, e `className` vai para ele. Nos dois, todas as outras props (`name`, `value`, `id`, `required`) e `ref` vão para o `<input>`.
- `CheckboxControl` não tem nome próprio. Dê a ele `aria-label`, ou o `id` para o qual um `<label>` do app aponta. Dentro de [`Field`](#field) ele recebe o label, a dica e a mensagem de erro do Field.
- Uma caixa de seleção não tem aparência de "não válido" nem o estado "parcialmente marcado" (indeterminate): o Intraweb não tem nenhum dos dois.
- Uma caixa com `changed` tem o atributo `data-changed="true"`.
- Os tipos `CheckboxProps` e `CheckboxControlProps` são exportados. Nenhum dos dois tem `"use client"`.

### `StatusBadge`

Um badge que mostra o estado de uma coisa: um texto curto em uma pílula na cor do seu significado.

```tsx
import { StatusBadge } from "@toraline.tech/ui";

<StatusBadge label="Paid" variant="success" dot />
```

| Prop | Valores | Significado |
|---|---|---|
| `label` | Texto ou elementos, obrigatório | O texto do badge |
| `variant` | `"neutral"` (padrão), `"success"`, `"warning"`, `"error"`, `"info"` | A aparência. `neutral`: um estado sem sentido de bom ou ruim. `success`: concluído ou bom. `warning`: precisa de atenção. `error`: falhou ou ruim. `info`: um fato |
| `dot` | `true`, `false` (padrão) | `true` mostra um ponto de 6 pixels na cor mais forte da variante, antes do texto |

- O texto tem 12 pixels no peso 500 da fonte de título, e fica em uma linha só.
- O texto precisa dizer o estado por si só. A cor e o ponto são decoração; um leitor de tela pula o ponto.
- Elemento nativo principal: o `<span>`. `className`, todas as outras props e `ref` vão para ele. Ele tem `data-variant`. O ponto tem `data-slot="dot"`.
- A lista `statusBadgeVariants` e os tipos `StatusBadgeProps` e `StatusBadgeVariant` são exportados. Ele não tem `"use client"`.

### `CountBadge`

Uma pílula pequena com um número: quantas coisas esperam, por exemplo ao lado do texto de uma aba ou de um link de um menu.

```tsx
import { CountBadge } from "@toraline.tech/ui";

<CountBadge count={pendingOrders} label={`${pendingOrders} pending orders`} />
<CountBadge count={12} label="12 messages not read" variant="brand" />
```

| Prop | Valores | Significado |
|---|---|---|
| `count` | Um número, obrigatório | O número que o badge mostra |
| `label` | Texto, obrigatório | O que o número significa, com o número dentro (`"3 pending orders"`). Ele não é mostrado. Um leitor de tela o lê no lugar do número |
| `variant` | `"warning"` (padrão), `"brand"` | A aparência. `warning`: coisas que precisam de atenção. `brand`: uma contagem simples, na cor da ação principal |

- O badge tem 20 pixels de altura e pelo menos 20 pixels de largura: um dígito é um círculo, e um número mais longo o deixa mais largo. O texto tem 12 pixels no peso 500 da fonte de título, com dígitos da mesma largura.
- Leitor de tela: o número que é mostrado tem `aria-hidden="true"`, e `label` está na página como texto que não é mostrado (`sr-only`). O Intraweb escreve `label` como `aria-label` no `<span>`; um leitor de tela nem sempre lê `aria-label` em um elemento sem role.
- O app escreve `label`, no seu próprio idioma. A biblioteca não formata o número: `count={1234}` mostra `1234`.
- Elemento nativo principal: o `<span>` mais externo. `className`, todas as outras props e `ref` vão para ele. Ele tem `data-variant`. As partes internas têm `data-slot="count"` e `data-slot="label"`.
- A lista `countBadgeVariants` e os tipos `CountBadgeProps` e `CountBadgeVariant` são exportados. Ele não tem `"use client"`.

### `Panel`

Um card que agrupa conteúdo: a caixa com sombra que contém uma parte de uma página.

```tsx
import { Button, Panel } from "@toraline.tech/ui";

<Panel
  id="contract"
  title="Contract"
  subtitle="What the client pays for each month"
  actions={<Button variant="secondary" size="sm">Edit</Button>}
>
  <p>Monthly contract, signed in March.</p>
</Panel>
```

| Prop | Valores | Significado |
|---|---|---|
| `title` | Texto ou elementos | O título do card: um título de nível 2 (`<h2>`) no topo dele |
| `subtitle` | Texto ou elementos | Uma linha discreta abaixo do título. Ela é mostrada só quando o card tem um título |
| `actions` | Elementos | Botões ou links no canto superior direito do card. Em um card estreito eles vão para baixo do título |
| `children` | Elementos | O conteúdo do card |
| `id` | O atributo HTML | Faz do card o destino de um link (`href="#contract"`). O card para 24 pixels abaixo do topo da janela |

- O card tem o fundo `bg-surface`, a sombra `shadow-card`, um canto de 12 pixels e um padding de 16 pixels. A partir do breakpoint `md` do Tailwind CSS (uma tela com 768 pixels de largura ou mais) o canto tem 16 pixels e o padding 24 pixels. As partes dele ficam a 16 pixels uma da outra.
- Sem título e sem ações o card não tem cabeçalho.
- O título é sempre um `<h2>`, como no Intraweb. Uma página cujos cards ficam abaixo de um título de outro nível não dá `title` e escreve o seu próprio título em `children`.
- Elemento nativo principal: o `<section>`. `className`, todas as outras props e `ref` vão para ele. A prop `title` substitui o atributo HTML `title` (um tooltip). As partes internas têm `data-slot`: `header`, `titles`, `title`, `subtitle`, `actions`.
- O tipo `PanelProps` é exportado. Ele não tem `"use client"`.

### `EmptyState`

O que uma lista, uma tabela ou uma página mostra quando não tem nada para mostrar: um ícone, um título, um texto curto e uma ação.

```tsx
import { Plus, Users } from "lucide-react";
import { Button, EmptyState } from "@toraline.tech/ui";

<EmptyState title="No client yet" icon={Users} action={<Button icon={Plus}>New client</Button>}>
  Add the first client to start a contract.
</EmptyState>
```

| Prop | Valores | Significado |
|---|---|---|
| `title` | Texto ou elementos, obrigatório | O que está faltando, em poucas palavras: um título de nível 2 (`<h2>`) |
| `icon` | Um componente de ícone | O ícone no círculo acima do título. Veja [Ícones](#ícones). Quando falta: uma bandeja vazia, desenhada pela biblioteca. É decoração: um leitor de tela o pula |
| `children` | Texto ou elementos | O texto abaixo do título: por que o lugar está vazio, ou o que será mostrado aqui. No máximo 448 pixels de largura |
| `action` | Um elemento | O próximo passo, abaixo do texto: um botão ou link |

- Ele tem a aparência de um card: o fundo `bg-surface`, a sombra `shadow-card`, e tudo no meio. O canto e o padding lateral são maiores a partir do breakpoint `md` do Tailwind CSS.
- O mesmo componente mostra "não foi possível carregar": o app dá outro ícone, título e texto, e uma ação que tenta de novo.
- Todo texto é dado pelo app. A biblioteca não tem título padrão.
- Elemento nativo principal: o `<section>`. `className`, todas as outras props e `ref` vão para ele. A prop `title` substitui o atributo HTML `title`. As partes internas têm `data-slot`: `icon`, `title`, `description`, `action`.
- O tipo `EmptyStateProps` é exportado. Ele não tem `"use client"`, então um Server Component pode dar a ele um componente de ícone.

### `StatCard`

Um card com um número: um label, o número, e como ele mudou desde um período anterior.

```tsx
import { ShoppingCart } from "lucide-react";
import { StatCard } from "@toraline.tech/ui";

<StatCard
  label="Sales of the month"
  value="R$ 12.400"
  icon={ShoppingCart}
  tone="tinted"
  trend={{ direction: "up", value: "12%", comparison: "vs. last month" }}
/>
```

| Prop | Valores | Significado |
|---|---|---|
| `label` | Texto ou elementos, obrigatório | O que o número é: um título de nível 3 (`<h3>`) |
| `value` | Texto, um número ou elementos, obrigatório | O número, já escrito como o app quer que ele seja mostrado |
| `icon` | Um componente de ícone | Um ícone em uma caixa de 40 pixels antes do label. Veja [Ícones](#ícones). É decoração: um leitor de tela o pula |
| `tone` | `"default"` (padrão), `"tinted"` | `default`: um card branco. `tinted`: a cor discreta da marca, para o número que mais importa |
| `trend` | Um objeto, veja abaixo | Como o número mudou, mostrado abaixo do número |
| `progress` | `{ value, max, label, tone }` | Uma [`ProgressBar`](#progressbar-e-progressring) na parte de baixo do card, para um número que vai em direção a uma meta. As chaves são as props da ProgressBar com os mesmos nomes; `label` é mostrado acima da barra |

O objeto de `trend` (o tipo `StatCardTrend`):

| Chave | Valores | Significado |
|---|---|---|
| `direction` | `"up"`, `"down"`, obrigatório | `up`: o número cresceu. `down`: ele caiu. Ela dá a seta e o sinal antes do valor: `+` ou `−` |
| `value` | Texto, obrigatório | Quanto ele mudou, sem sinal: `"12%"`, `"3 h"` |
| `comparison` | Texto | Com o que ele é comparado: `"vs. last month"` |
| `upIsGood` | `true` (padrão), `false` | `true` quando um número que cresce é bom (vendas), `false` quando é ruim (custos). Ela dá a cor: verde para bom, vermelho para ruim |

- O número tem 24 pixels, e 32 pixels a partir do breakpoint `md` do Tailwind CSS, no peso 600 da fonte de título, com dígitos da mesma largura.
- O app escreve todo texto e formata todo número. O card adiciona só o sinal da mudança.
- A cor da mudança diz bom ou ruim. O sinal diz a direção, então a cor não é o único jeito de ler a mudança. Um leitor de tela lê o sinal, o valor e a comparação.
- Elemento nativo principal: o `<section>`. `className`, todas as outras props e `ref` vão para ele. Ele tem `data-tone`. As partes internas têm `data-slot`: `header`, `icon`, `label`, `value`, `trend`, `trend-value` (com `data-direction` e `data-meaning`), `trend-icon`, `trend-comparison`.
- A lista `statCardTones` e os tipos `StatCardProps`, `StatCardTone`, `StatCardTrend` e `StatCardProgress` são exportados. Ele não tem `"use client"`.

### `ProgressBar` e `ProgressRing`

Quanto de um todo está feito: como uma parte preenchida de uma linha (`ProgressBar`) ou de um círculo (`ProgressRing`).

```tsx
import { ProgressBar, ProgressRing } from "@toraline.tech/ui";

<ProgressBar label="Hours of the month" value={30} max={40} valueText="30 of 40 h" />
<ProgressBar label="Goal" value={82} tone="success" hideLabel />

<ProgressRing label="Ideal stock" value={1} max={4} tone="warning" />
<ProgressRing label="Ideal stock" value={1} max={4} size="sm" />
```

| Prop | Componente | Valores | Significado |
|---|---|---|---|
| `value` | Os dois | Um número, obrigatório | Quanto está feito, de 0 a `max`. Um valor fora disso é mostrado como 0 ou como `max` |
| `max` | Os dois | Um número. Padrão: `100` | O valor que significa "tudo feito" |
| `label` | Os dois | Texto, obrigatório | O que ele mede. A ProgressBar o mostra acima da barra. O ProgressRing não o mostra. Nos dois ele é o nome que um leitor de tela diz |
| `tone` | Os dois | `"brand"` (padrão), `"success"`, `"warning"`, `"danger"` | A cor da parte preenchida. `brand`: uma medida simples. `success`: bom. `warning`: precisa de atenção. `danger`: ruim |
| `valueText` | `ProgressBar` | Texto. Padrão: a porcentagem, `"75%"` | O texto do valor, mostrado à direita do label e lido por um leitor de tela |
| `hideLabel` | `ProgressBar` | `true`, `false` (padrão) | `true` mostra só a barra. Um leitor de tela ainda diz o label e o valor |
| `size` | `ProgressRing` | `"md"` (padrão), `"sm"` | `md`: 64 pixels, com a porcentagem no meio. `sm`: 40 pixels, sem texto, para uma linha de uma lista ou de uma tabela |

- Leitor de tela: o trilho da ProgressBar e o elemento mais externo do ProgressRing têm `role="progressbar"`, `aria-label` (o label), `aria-valuemin="0"`, `aria-valuemax`, `aria-valuenow` (o valor, mantido entre 0 e `max`) e `aria-valuetext` (a porcentagem, ou `valueText`). Um leitor de tela diz, por exemplo, "Hours of the month, 75%". O desenho do anel e a porcentagem no meio dele têm `aria-hidden="true"`.
- A porcentagem é um número inteiro: `value / max`, arredondado. Um `max` de 0 ou menos mostra 0%.
- A barra tem 8 pixels de altura e a largura do seu contêiner. O app escreve `label` e `valueText`, no seu próprio idioma.
- A parte preenchida não se move sozinha: não há animação. Nenhum dos dois componentes mostra "carregando sem fim conhecido".
- Contraste: no tema claro a parte preenchida dos tons `success` e `warning` tem um contraste abaixo de 3 sobre o trilho e sobre um card (os valores estão em [`docs/decisions.md`](../../docs/decisions.md)). O valor está sempre lá como texto para um leitor de tela; para uma pessoa que enxerga, use esses tons com o label mostrado, ou o anel `md`.
- `ProgressBar`: o elemento mais externo é um `<div>` que contém a linha do label e o trilho. `className`, todas as outras props e `ref` vão para ele. Ele tem `data-tone`; as partes internas têm `data-slot`: `header`, `label`, `value`, `track`, `fill`.
- `ProgressRing`: o elemento mais externo é o `<div role="progressbar">`. `className`, todas as outras props e `ref` vão para ele. Ele tem `data-size` e `data-tone`; as partes internas têm `data-slot`: `drawing`, `track`, `fill`, `percent`.
- As listas `progressTones` e `progressRingSizes` e os tipos `ProgressBarProps`, `ProgressRingProps`, `ProgressTone` e `ProgressRingSize` são exportados. Nenhum dos dois tem `"use client"`.

## Os overlays

Um overlay é uma parte da tela que abre acima da página: um diálogo, um painel lateral, um menu, um popover, um tooltip. Eles vêm de `@toraline.tech/ui`, como os outros componentes, e foram construídos na fase 9 (TOR-1125) a partir dos overlays do app Intraweb. Eles são escritos à mão, sem biblioteca de primitivos: os motivos estão na entrada de TOR-1156 de [`docs/decisions.md`](../../docs/decisions.md). Um app não configura nada para eles. A página `/overlays` de [`apps/playground`](../../apps/playground/README.md) mostra cada um.

### `useAnchoredPanel`

Um hook (uma função que um componente chama) para um painel flutuante que pertence a um botão: um menu, um popover, um filtro. `ActionMenu` e `Popover` o usam. Um app o usa para um painel próprio.

```tsx
"use client";
import { useAnchoredPanel } from "@toraline.tech/ui";

export function ColumnFilter() {
  const { open, toggle, triggerRef, panelRef, panelStyle, placed, handleEscape } = useAnchoredPanel({
    align: "left",
  });
  return (
    <>
      <button ref={triggerRef} aria-expanded={open} onClick={toggle}>
        Filter
      </button>
      {open ? (
        <div
          ref={panelRef}
          style={panelStyle}
          className={placed ? "fixed z-50" : "invisible fixed z-50"}
          onKeyDown={handleEscape}
        >
          ...
        </div>
      ) : null}
    </>
  );
}
```

| Opção | Valores | Significado |
|---|---|---|
| `side` | `"bottom"` (padrão), `"top"` | O lado do botão em que o painel abre |
| `align` | `"right"` (padrão), `"left"`, `"center"` | Quais bordas do botão e do painel ficam alinhadas |
| `gap` | Um número de pixels. Quando falta: 4 | O espaço entre o botão e o painel |
| `strategy` | `"fixed"` (padrão), `"absolute"` | `fixed`: o painel tem `position: fixed`, para um painel renderizado em `<body>` com `createPortal`. `absolute`: o painel tem `position: absolute` dentro de um elemento posicionado |

Ele retorna `open`, `toggle`, `show`, `close({ restoreFocus })`, `triggerRef` (para o botão), `panelRef` e `panelStyle` (para o painel), `placed` (`false` até o painel ser medido: esconda o painel com a classe `invisible` até lá, ou com `opacity-0` quando um elemento dentro do painel tem `autoFocus`, porque um elemento que está `invisible` não pode receber o foco), `side` (o lado em que o painel está) e `handleEscape` (para o `onKeyDown` do painel).

- O painel abre no lado pedido. Quando ele não cabe ali, ele abre no outro lado, a não ser que esse lado tenha menos espaço.
- O painel mantém 8 pixels até as bordas esquerda e direita da janela.
- O painel é posicionado de novo quando a página rola, quando a janela muda de tamanho e quando o painel muda de tamanho.
- Um clique fora do painel e do botão fecha o painel. Escape fecha o painel, devolve o foco ao botão, e não chega a um Modal ou a um Drawer que está aberto embaixo dele.
- A função `computeAnchoredPosition` calcula a posição a partir de 3 retângulos, sem navegador. Ela também tem os lados `"right"` e `"left"`, que o Tooltip usa.

### `CloseButton`

```tsx
import { CloseButton } from "@toraline.tech/ui";

<CloseButton aria-label="Fechar" onClick={close} />
```

| Prop | Valores | Significado |
|---|---|---|
| `aria-label` | Texto. Quando falta: `"Close"` | O nome do botão para um leitor de tela |
| `onClick` | Uma função | O que o clique faz |
| `variant`, `size`, `disabled` | As props de [`IconButton`](#iconbutton) | Quando faltam: `ghost` e `md` (40 pixels) |

- É um `IconButton` cujo ícone é um xis, desenhado pela biblioteca. Todas as outras props e `ref` vão para o `<button>` dele.
- Ele não tem `"use client"`. O clique é uma função, então o arquivo do app que dá `onClick` é um Client Component.

### `Modal`

```tsx
"use client";
import { useState } from "react";
import { Button, Modal } from "@toraline.tech/ui";

export function NewClient() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>New client</Button>
      {isOpen ? (
        <Modal title="New client" size="md" closeLabel="Close" onClose={() => setIsOpen(false)}>
          ...
        </Modal>
      ) : null}
    </>
  );
}
```

Um diálogo acima da página, para uma tarefa que precisa de toda a atenção. O app renderiza o Modal enquanto ele está aberto, e para de renderizá-lo em `onClose`. Não existe a prop `open`.

| Prop | Valores | Significado |
|---|---|---|
| `title` | Texto ou elementos. Obrigatório | O título do diálogo. Ele também é o nome do diálogo para um leitor de tela |
| `onClose` | Uma função. Obrigatório | Chamada quando a pessoa fecha o diálogo: o botão com o xis, a tecla Escape, ou um clique na camada escura |
| `children` | Elementos | O conteúdo |
| `actions` | Elementos | Botões ou links ao lado do título, antes do botão que fecha |
| `size` | `"md"`, `"lg"` (padrão), `"xl"`, `"full"` | A maior largura que o diálogo alcança: 512, 672, 896 e 1152 pixels |
| `closeLabel` | Texto. Quando falta: `"Close"` | O nome do botão que fecha, para um leitor de tela |
| `discardConfirmation` | `{ title, description, discardLabel, keepEditingLabel }` | Os 4 textos da pergunta antes de as alterações não salvas serem perdidas. Quando falta: o diálogo nunca pergunta. Veja [`DiscardConfirmation`](#discardconfirmation) |

- Foco: quando o diálogo abre, o foco vai para o elemento dentro dele que tem o atributo `data-overlay-autofocus`, ou para o próprio diálogo. Quando ele fecha, o foco volta para o elemento que o tinha antes, por exemplo o botão que o abriu.
- Teclado: Tab e Shift+Tab ficam dentro do diálogo; depois do último elemento vem o primeiro. Escape fecha o diálogo. Com vários overlays abertos, Escape fecha só o mais novo.
- Ponteiro: um clique na camada escura fecha o diálogo. Um clique que começa dentro do diálogo e termina na camada escura (a pessoa seleciona texto) não fecha. A página atrás não rola.
- Leitor de tela: o diálogo tem `role="dialog"`, `aria-modal="true"` e `aria-labelledby` com o id do título dele.
- Em uma tela com menos de 768 pixels de largura o diálogo é uma folha na parte de baixo da tela, com no máximo 92% da altura dela.
- Elemento principal: o `<div role="dialog">`. `className`, todas as outras props e `ref` vão para ele. Esta é uma exceção a "className vai no elemento mais externo": o elemento mais externo é a camada escura. As partes têm `data-slot`: `backdrop`, `handle`, `header`, `title`, `actions`, `body`.
- O diálogo é renderizado em `<body>` (um portal), então ele não renderiza nada no servidor.
- A lista `modalSizes` e os tipos `ModalProps` e `ModalSize` são exportados.
- É um Client Component. `onClose` é uma função, então o arquivo do app que renderiza um Modal também é um Client Component. `title`, `actions` e `children` podem ser elementos que um Server Component criou.

### `Drawer`

```tsx
"use client";
import { Button, Drawer } from "@toraline.tech/ui";

{isOpen ? (
  <Drawer
    title="Order 12"
    onClose={close}
    footer={
      <Button type="submit" form="order-form">
        Save
      </Button>
    }
  >
    <form id="order-form">...</form>
  </Drawer>
) : null}
```

Um painel no lado direito da tela que deixa a página ao lado dele visível e utilizável, por exemplo os detalhes da linha que a pessoa escolheu em uma lista. O app renderiza o Drawer enquanto ele está aberto, e para de renderizá-lo em `onClose`.

| Prop | Valores | Significado |
|---|---|---|
| `title` | Texto ou elementos. Obrigatório | O título do painel. Ele também é o nome do painel para um leitor de tela |
| `onClose` | Uma função. Obrigatório | Chamada quando a pessoa fecha o painel: o botão com o xis ou a tecla Escape |
| `children` | Elementos | O conteúdo. Ele rola; o cabeçalho e o rodapé ficam no lugar |
| `footer` | Elementos | Fica na parte de baixo do painel, fora da parte que rola. O conteúdo dele é alinhado à direita |
| `actions` | Elementos | Botões ou links ao lado do título, antes do botão que fecha |
| `wide` | `true`, `false` (padrão) | `true`: o painel tem no máximo 896 pixels de largura, para um formulário com uma tabela. `false`: 512 pixels |
| `closeLabel` | Texto. Quando falta: `"Close"` | O nome do botão que fecha, para um leitor de tela |
| `discardConfirmation` | `{ title, description, discardLabel, keepEditingLabel }` | Os 4 textos da pergunta antes de as alterações não salvas serem perdidas. Quando falta: o painel nunca pergunta. Veja [`DiscardConfirmation`](#discardconfirmation) |

- Foco: quando o painel abre, o foco vai para o elemento dentro dele que tem o atributo `data-overlay-autofocus`, ou para o próprio painel. Quando ele fecha, o foco volta para o elemento que o tinha antes.
- Teclado: Tab e Shift+Tab ficam dentro do painel enquanto o foco está nele; depois do último elemento (no rodapé) vem o primeiro. Escape fecha o painel. Com vários overlays abertos, Escape fecha só o mais novo.
- Ponteiro: o painel não tem camada escura. A pessoa ainda pode clicar na página ao lado dele, e o foco então fica onde ela clicou.
- Leitor de tela: o painel tem `role="dialog"`, `aria-modal="false"` e `aria-labelledby` com o id do título dele.
- Um conteúdo sem nenhum ponto de parada (só texto) entra ele mesmo na ordem do Tab, para que uma pessoa que usa o teclado possa rolá-lo.
- Enquanto o painel está aberto, `<body>` tem o atributo `data-drawer-open` com o valor `narrow` ou `wide`. A biblioteca não adiciona nenhum estilo para ele. Um app que quer que a página abra espaço escreve a sua própria regra, como o Intraweb faz: `body[data-drawer-open="narrow"] main { padding-right: 34rem; }`.
- Em uma tela com menos de 768 pixels de largura o painel cobre a tela.
- Elemento principal: o `<div role="dialog">`, que também é o elemento mais externo. `className`, todas as outras props e `ref` vão para ele. As partes têm `data-slot`: `header`, `title`, `actions`, `body`, `footer`.
- O painel é renderizado em `<body>` (um portal), então ele não renderiza nada no servidor.
- É um Client Component. `onClose` é uma função, então o arquivo do app que renderiza um Drawer também é um Client Component.

### `DiscardConfirmation`

```tsx
const discardTexts = {
  title: "Discard the changes?",
  description: "You typed something that is not saved yet. If you leave now, these changes are lost.",
  discardLabel: "Discard",
  keepEditingLabel: "Keep editing",
};

// Modal and Drawer show the question by themselves:
<Drawer title="Order 12" discardConfirmation={discardTexts} onClose={close}>
  <form>...</form>
</Drawer>

// An app shows it itself for another case:
{isAsking ? <DiscardConfirmation {...discardTexts} onDiscard={leave} onKeepEditing={stay} /> : null}
```

A pergunta que a pessoa recebe antes de algo que ela digitou ser perdido. A biblioteca não tem texto próprio: os 4 textos são props obrigatórias.

| Prop | Valores | Significado |
|---|---|---|
| `title` | Texto ou elementos. Obrigatório | A pergunta. Ela é o nome do diálogo para um leitor de tela |
| `description` | Texto ou elementos. Obrigatório | O que acontece. Um leitor de tela a diz depois do título |
| `discardLabel` | Texto ou elementos. Obrigatório | O texto do botão que perde as alterações |
| `keepEditingLabel` | Texto ou elementos. Obrigatório | O texto do botão que volta para o formulário |
| `onDiscard` | Uma função. Obrigatório | Chamada quando a pessoa escolhe perder as alterações |
| `onKeepEditing` | Uma função. Obrigatório | Chamada quando a pessoa escolhe continuar editando, com o botão ou com Escape |

- Foco: o foco vai para o botão que continua a edição, a escolha segura. Quando a pergunta fecha, o foco volta para o elemento que o tinha antes.
- Teclado: Tab e Shift+Tab ficam dentro da pergunta. Escape significa "continuar editando".
- Ponteiro: um clique na camada escura não faz nada. A pessoa precisa escolher.
- Leitor de tela: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` (o título) e `aria-describedby` (a descrição).
- `className`, todas as outras props e `ref` vão para o `<div role="alertdialog">`. As partes têm `data-slot`: `backdrop`, `title`, `description`, `buttons`.
- Em um Modal ou um Drawer com `discardConfirmation`:
  - Uma pessoa que digitou em um campo dentro dele (um evento `input` ou `change`) e não enviou o formulário (um evento `submit`) recebe a pergunta antes de ele fechar: o botão com o xis, Escape, ou a camada escura do Modal.
  - Um clique na página ao lado de um Drawer é interrompido e pergunta primeiro. Depois de "descartar", o mesmo clique é feito de novo.
  - O navegador pergunta antes de a página ser deixada ou carregada de novo.
  - Um campo com o atributo `data-overlay-ignore-dirty`, ou dentro de um elemento com ele, não conta como uma alteração, por exemplo um campo de busca.
- O tipo `DiscardConfirmationTexts` são os 4 textos, para um arquivo do app que os guarda uma vez só.
- É um Client Component, e não renderiza nada no servidor.

### `DeleteOverlay`

```tsx
{isOpen ? (
  <DeleteOverlay
    title="Delete"
    cancelLabel="Cancel"
    deleteLabel="Delete"
    pendingLabel="Deleting…"
    closeLabel="Close"
    consequence="Its prices are deleted too."
    pending={isDeleting}
    error={deleteError}
    onDelete={deleteProduct}
    onClose={close}
  >
    Delete the product "Brownie"? This cannot be undone.
  </DeleteOverlay>
) : null}
```

O diálogo que pergunta antes de algo ser excluído. É um [`Modal`](#modal) no tamanho `md`. A biblioteca não tem texto próprio, e ela não exclui: o app exclui, e dá `pending`, `error` e `blocked`.

| Prop | Valores | Significado |
|---|---|---|
| `title` | Texto ou elementos. Obrigatório | O título do diálogo |
| `children` | Texto ou elementos. Obrigatório | A pergunta, com o nome do que é excluído |
| `cancelLabel` | Texto ou elementos. Obrigatório | O texto do botão que volta |
| `deleteLabel` | Texto ou elementos. Obrigatório | O texto do botão que exclui |
| `closeLabel` | Texto. Obrigatório | O nome do botão com o xis, e o texto do botão da tela `blocked` |
| `onDelete` | Uma função. Obrigatório | Chamada quando a pessoa pressiona o botão que exclui |
| `onClose` | Uma função. Obrigatório | Chamada quando a pessoa cancela: o botão, o xis, Escape ou a camada escura |
| `consequence` | Texto ou elementos | O que mais é excluído junto, em uma cor discreta |
| `pending` | `true`, `false` (padrão) | `true` enquanto a exclusão roda: o botão que exclui fica no estado `loading` do Button |
| `pendingLabel` | Texto ou elementos | O texto do botão que exclui enquanto `pending` é `true`. Quando falta: `deleteLabel` |
| `error` | Texto ou elementos | A mensagem quando a exclusão falhou. Ela tem `role="alert"` |
| `blocked` | Elementos | Dê essa prop quando o registro não pode ser excluído: a explicação. Ela substitui a pergunta e os 2 botões, e um botão com o texto de `closeLabel` fecha o diálogo |
| `blockedTitle` | Texto ou elementos | O título enquanto `blocked` é dada. Quando falta: `title` |

- Foco e teclado: as regras do Modal. O foco vai para o botão que cancela, a escolha segura.
- `className`, todas as outras props e `ref` vão para o diálogo, como no Modal. As partes têm `data-slot`: `content`, `question`, `consequence`, `error`, `buttons`.
- É um Client Component, e não renderiza nada no servidor.

### `ActionMenu`

```tsx
"use client";
import { Pencil, Trash2 } from "lucide-react";
import { ActionMenu } from "@toraline.tech/ui";

<ActionMenu
  aria-label="Actions of Ana"
  items={[
    { key: "edit", label: "Edit", icon: Pencil, onSelect: editClient },
    { key: "delete", label: "Delete", icon: Trash2, onSelect: askToDelete, disabled: hasOrders, hint: "Ana has open orders." },
  ]}
/>

<ActionMenu aria-label="Actions of the list" trigger="button" items={items}>
  Actions
</ActionMenu>
```

Um botão que abre um menu de ações, por exemplo as ações de uma linha de uma tabela.

| Prop | Valores | Significado |
|---|---|---|
| `items` | Uma lista de `{ key, label, onSelect, icon, disabled, hint }`. Obrigatório | As ações. `key` é diferente para cada ação. `icon` é um componente de ícone, mostrado antes do texto. `disabled: true` mostra uma ação que não pode ser escolhida, e `hint` diz por quê |
| `aria-label` | Texto. Obrigatório | O nome do botão e do menu para um leitor de tela, por exemplo `"Actions of Ana"` |
| `trigger` | `"icon"` (padrão), `"button"` | O botão que abre o menu. `icon`: um botão pequeno com 3 pontos. `button`: um botão secundário pequeno com um texto e uma seta |
| `children` | Texto ou elementos | O texto do botão, para o trigger `button`. Comece `aria-label` com esse texto, para que uma pessoa que controla o dispositivo com a voz possa dizer o que ela vê |
| `disabled` | O atributo HTML | Desabilita o botão |

- O menu abre abaixo do botão, com as bordas direitas alinhadas. Ele abre acima quando não há espaço abaixo, e mantém 8 pixels até as bordas esquerda e direita da janela. Ele segue o botão quando a página rola. Ele é renderizado em `<body>` (um portal), então uma tabela ou um Drawer que rola não o corta.
- Teclado, no botão: Enter, Espaço e Seta para baixo abrem o menu com o foco na primeira ação. Seta para cima abre o menu com o foco na última ação.
- Teclado, no menu: as setas para cima e para baixo movem entre as ações, e dão a volta. Home vai para a primeira ação, End para a última. Uma letra vai para a próxima ação que começa com ela. Enter e Espaço escolhem a ação, fecham o menu e devolvem o foco ao botão. Escape fecha o menu e devolve o foco. Tab fecha o menu e move o foco para o elemento depois do botão.
- Um clique fora do menu fecha o menu.
- Uma ação com `disabled: true` tem `aria-disabled="true"` e metade da sua opacidade. Ela pode receber o foco com as teclas de seta, então um leitor de tela diz a ação e o `hint` dela. Escolher essa ação não faz nada.
- Dentro de um Modal ou de um Drawer: Escape fecha só o menu, e um clique em uma ação não é um clique "atrás" do overlay.
- Leitor de tela: o botão tem `aria-haspopup="menu"` e `aria-expanded`. O menu tem o role `menu` e o nome de `aria-label`, e cada ação o role `menuitem`.
- Sem nenhuma ação em `items`, o componente não renderiza nada.
- Elemento nativo principal: o `<button>` que abre o menu. `className`, todas as outras props e `ref` vão para ele. As partes têm `data-slot`: `trigger`, `arrow`, `menu`, `item`.
- O menu é o mesmo código do menu do SplitButton (`src/shared/menu/Menu.tsx`): a mesma aparência e as mesmas teclas.
- A lista `actionMenuTriggers` e os tipos `ActionMenuProps`, `ActionMenuItem` e `ActionMenuTrigger` são exportados.
- É um Client Component. As ações são funções e os ícones são componentes, então o arquivo do app que dá `items` também é um Client Component.

### `Popover`

```tsx
import { Popover } from "@toraline.tech/ui";

<Popover label="Columns" align="right" panelClassName="w-64">
  <ColumnList />
</Popover>

// With a button that closes the panel ("children" is a function, so this file is a Client Component):
<Popover label="Filters">
  {(close) => <FilterForm onApply={close} />}
</Popover>
```

Um botão com um painel flutuante abaixo dele, por exemplo a lista de colunas de uma tabela ou os filtros dela.

| Prop | Valores | Significado |
|---|---|---|
| `label` | Texto ou elementos. Obrigatório | O texto do botão que abre o painel |
| `children` | Elementos, ou uma função `(close) => elements`. Obrigatório | O conteúdo do painel. A forma de função recebe `close`, para um painel com um botão que o fecha |
| `align` | `"left"` (padrão), `"right"` | Quais bordas do botão e do painel ficam alinhadas |
| `panelClassName` | Classes | Classes para o painel, por exemplo a largura dele. Elas vêm depois das classes da biblioteca |
| `aria-label` | Texto | O nome do botão quando `label` não é texto simples |
| `disabled` | O atributo HTML | Desabilita o botão |

- O botão é um Button secundário no tamanho `md`.
- Ponteiro: um clique no botão abre o painel, e um segundo clique o fecha. Um clique fora do botão e do painel fecha o painel.
- Teclado: Enter e Espaço no botão abrem e fecham o painel. O painel vem logo depois do botão na página, então Tab vai do botão para dentro dele. Escape, com o foco no botão ou dentro do painel, fecha o painel e dá o foco ao botão. Escape não chega a um Modal ou a um Drawer em que o Popover está.
- Foco quando o painel abre: um elemento dentro do painel com `autoFocus` recebe o foco, por exemplo um campo de busca: `<Popover label="Choose an item"><TextInput autoFocus aria-label="Search" /></Popover>`. Sem um elemento assim, o foco fica no botão. Desde a versão 0.3.1; antes dela, `autoFocus` dentro do painel não fazia nada.
- O painel abre 8 pixels abaixo do botão. Ele abre acima quando não há espaço abaixo, e mantém 8 pixels até as bordas esquerda e direita da janela.
- Leitor de tela: o botão tem `aria-expanded`, e `aria-controls` com o id do painel enquanto ele está aberto.
- Elemento nativo principal: o `<button>`. Todas as outras props e `ref` vão para ele. `className` vai para o elemento mais externo, um `<div>` que contém o botão e o painel. As partes têm `data-slot`: `trigger`, `panel`.
- A lista `popoverAligns` e os tipos `PopoverProps` e `PopoverAlign` são exportados.
- É um Client Component. Um Server Component pode renderizá-lo quando `label` e `children` são texto ou elementos. `children` como função, e `onClick`, precisam de um arquivo Client Component no app.

### `Tooltip`

```tsx
import { Settings } from "lucide-react";
import { IconButton, Tooltip } from "@toraline.tech/ui";

<Tooltip label="Settings of the shop" side="top">
  <IconButton icon={Settings} aria-label="Settings" />
</Tooltip>
```

Um rótulo pequeno ao lado de um elemento, mostrado enquanto o ponteiro está sobre o elemento e enquanto ele tem o foco do teclado.

| Prop | Valores | Significado |
|---|---|---|
| `label` | Texto ou elementos. Obrigatório | O texto do tooltip |
| `children` | Um elemento que pode receber o foco. Obrigatório | O elemento ao qual o tooltip pertence, por exemplo um botão ou um link |
| `side` | `"right"` (padrão), `"top"` | O lado do elemento em que o tooltip é mostrado: 12 pixels à direita dele, ou 8 pixels acima dele, centralizado |

- Mostrado por CSS: enquanto o ponteiro está sobre o elemento ou sobre o tooltip, e enquanto o elemento tem o foco do teclado (`:focus-visible`). Um clique com o mouse não o mantém mostrado depois que o ponteiro sai.
- Leitor de tela: o tooltip tem `role="tooltip"`, e o elemento recebe `aria-describedby` com o id dele. Assim o texto é dito depois do nome do elemento, também enquanto o tooltip está escondido. Quando o elemento tem um `aria-label` com exatamente o texto de `label`, ele não é ligado, para que o texto não seja dito duas vezes.
- Teclado: Escape esconde o tooltip até que o ponteiro ou o foco saia do elemento e volte. Esse Escape não fecha um Modal ou um Drawer em que o elemento está.
- Ponteiro: o ponteiro pode ir do elemento para o tooltip sem escondê-lo.
- Quando o lado não tem espaço na janela, o tooltip é mostrado no lado oposto (`left`, `bottom`). Quando o lugar centralizado dele sairia da janela, ele é movido ao longo do elemento para manter 8 pixels até a borda.
- O tooltip fica dentro do `<span>` em volta do elemento. Um elemento em volta dele que esconde o que sai dele (`overflow: hidden`) corta o tooltip.
- `className`, todas as outras props e `ref` vão para o elemento mais externo, um `<span>` com `inline-flex`. O tooltip tem `data-slot="tooltip"`, e o `<span>` tem `data-side` com o lado em que o tooltip está.
- Um tooltip não substitui um nome: um elemento só com um ícone ainda precisa de `aria-label`. Não coloque um link ou um botão dentro de `label`.
- A lista `tooltipSides` e os tipos `TooltipProps` e `TooltipSide` são exportados.
- É um Client Component. Um Server Component pode renderizá-lo: `label` e `children` são texto e elementos.

## Os componentes de dados (fase 10)

Eles vêm de `@toraline.tech/ui`, como os componentes acima, e seguem as mesmas regras. A rota `/data` de [`apps/playground`](../../apps/playground/README.md) mostra esses componentes.

### `DataTable`, `Tr`, `Th`, `Td`, `ActionsTh`, `DataTableMessage`

Uma tabela de dados dentro de um card. É uma `<table>` de verdade: o próprio app escreve `<thead>`, `<tbody>` e `<tfoot>`, com as partes da biblioteca dentro.

```tsx
import { Pencil } from "lucide-react";
import { ActionsTh, DataTable, DataTableMessage, IconButton, Td, Th, Tr } from "@toraline.tech/ui";

<DataTable caption="Orders">
  <thead>
    <tr>
      <Th>Client</Th>
      <Th align="right">Total</Th>
      <ActionsTh />
    </tr>
  </thead>
  <tbody>
    {orders.length === 0 ? <DataTableMessage colSpan={3}>No orders yet.</DataTableMessage> : null}
    {orders.map((order) => (
      <Tr key={order.id} hoverable selected={order.id === openOrderId}>
        <Td>{order.client}</Td>
        <Td align="right">{order.total}</Td>
        <Td className="w-12" align="right">
          <IconButton icon={Pencil} size="sm" aria-label={`Edit the order of ${order.client}`} />
        </Td>
      </Tr>
    ))}
  </tbody>
</DataTable>
```

| Parte | Prop | Valores | Significado |
|---|---|---|---|
| `DataTable` | `caption` | Texto ou elementos | O nome da tabela. Um leitor de tela o diz; ele não é mostrado. A tabela precisa de `caption`, `aria-label` ou `aria-labelledby`: o TypeScript recusa uma tabela sem nenhum deles |
| `DataTable` | `stackOnMobile` | `true`, `false` (padrão) | `true`: em uma tela com menos de 768 pixels de largura, cada linha é um bloco, e cada célula é uma linha de texto com o nome da sua coluna à esquerda. Cada `Td` então precisa do atributo `data-label` com o nome da sua coluna. Uma célula sem `data-label` (a célula dos botões) fica em uma linha própria |
| `Tr` | `selected` | `true`, `false` (padrão) | A linha do registro que está aberto, por exemplo em um painel ao lado da tabela. A linha recebe `aria-current="true"`, o fundo `bg-selected` e uma linha na cor da marca à esquerda |
| `Tr` | `hoverable` | `true`, `false` (padrão) | A linha tem um fundo discreto enquanto o ponteiro está sobre ela |
| `Th` | `align` | `"left"`, `"center"`, `"right"` | O lado para o qual o conteúdo é alinhado. Quando falta: a esquerda |
| `Th` | `scope` | `"col"` (padrão), `"row"`, `"colgroup"`, `"rowgroup"` | O atributo HTML: o que a célula de cabeçalho nomeia |
| `Td` | `align` | `"left"`, `"center"`, `"right"` | O lado para o qual o conteúdo é alinhado. `right` é para números: ele também dá a todo dígito a mesma largura (`tabular-nums`), então os números de uma coluna ficam alinhados |
| `ActionsTh` | `label` | Texto. Padrão `"Actions"` | O nome da coluna dos botões de cada linha. Só um leitor de tela o diz |
| `DataTableMessage` | `colSpan` | Um número. Obrigatório | O número de colunas da tabela. A parte é uma linha com uma mensagem da largura da tabela: uma tabela sem linhas, ou uma tabela cujas linhas estão carregando |

- As classes são as do DataTable do app Intraweb (`components/ui/data-table.tsx`). A aparência foi comparada com a do Intraweb nos dois temas.
- Elemento nativo principal: a `<table>`. Todas as outras props e `ref` vão para ela. `className` vai para a caixa em volta da tabela (`data-slot="box"`), que é o card.
- Cada parte (`Tr`, `Th`, `Td`) dá `className`, todas as outras props e `ref` ao seu próprio elemento. Um `<tr>` simples também funciona. `DataTableMessage` dá essas props ao `<td>` dele.
- Uma tabela mais larga que a sua caixa rola para os lados. Enquanto ela é mais larga, a caixa pode receber o foco do teclado (`tabindex="0"`), então as teclas de seta a rolam, e ela tem `role="group"` e o nome da tabela. Uma tabela que cabe não adiciona nenhuma parada para a tecla Tab.
- Uma tabela cujas linhas estão carregando: dê `aria-busy="true"` ao `DataTable` e o texto em um `DataTableMessage`.
- Uma linha de rodapé é um `<tfoot>` com classes do app, por exemplo `<tr className="bg-subtle font-medium">` e `<Td className="border-t text-strong">`.
- A lista `tableCellAlignments` e os tipos `DataTableProps`, `TrProps`, `ThProps`, `TdProps`, `ActionsThProps`, `DataTableMessageProps` e `TableCellAlignment` são exportados.
- Eles não têm `"use client"`: eles também renderizam em um Server Component. Só a caixa em volta da tabela roda no navegador, para medir a largura dela.

### `DataGrid`

Uma tabela de registros com um campo de busca, uma ordenação e um filtro por coluna, páginas, uma seleção com ações para as linhas selecionadas, uma linha de rodapé com totais, e grupos de linhas. O app entrega todos os registros; o grid busca, filtra, ordena e divide os registros em páginas no navegador. Ele não carrega dados. Cada recurso é ligado pela sua prop ou por um campo de uma coluna.

```tsx
"use client";

import { DataGrid } from "@toraline.tech/ui";
import type { DataGridColumn } from "@toraline.tech/ui";

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => product.name,
    sortValue: (product) => product.name,
    searchValue: (product) => product.name,
  },
  {
    id: "stock",
    header: "Stock",
    align: "right",
    cell: (product) => product.stock,
    sortValue: (product) => product.stock,
    footer: (rows) => rows.reduce((sum, product) => sum + product.stock, 0),
  },
];

<DataGrid
  caption="Products"
  columns={columns}
  rows={products}
  getRowKey={(product) => product.id}
  getRowLabel={(product) => product.name}
  search={{ placeholder: "Search the products" }}
  pageSize={25}
  rowActions={(product) => <IconButton icon={Pencil} size="sm" aria-label={`Edit ${product.name}`} />}
/>
```

| Prop | Valores | Significado |
|---|---|---|
| `caption` | Texto. Obrigatória | O nome da tabela. Um leitor de tela o lê; ele não é mostrado |
| `columns` | Uma lista de colunas. Obrigatória | Veja a tabela de uma coluna abaixo |
| `rows` | Uma lista de registros. Obrigatória | Todos os registros, não uma página deles |
| `getRowKey` | Uma função. Obrigatória | Um valor que nenhum outro registro tem, por exemplo o id dele |
| `getRowLabel` | Uma função. Obrigatória | O nome do registro para um leitor de tela, por exemplo no nome do checkbox dele |
| `search` | `{ placeholder }` | Liga o campo de busca. Ele procura nas colunas com `searchValue`, sem diferença para letras maiúsculas e acentos |
| `toolbar` | Elementos | Os filtros e os botões da tela, mostrados acima da tabela, depois do campo de busca |
| `pageSize` | Um número | Liga as páginas: o número de linhas de uma página até a pessoa escolher outro |
| `pageSizeOptions` | Uma lista de números. Padrão `10, 25, 50, 100` | Os números que uma pessoa pode escolher. `pageSize` é adicionado quando não está na lista |
| `selection` | `{ actions: (rows, clear) => elements }` | Liga um checkbox em cada linha e um no cabeçalho, que seleciona todas as linhas que a busca encontrou. Enquanto uma linha está selecionada, uma barra mostra o número de linhas selecionadas e o que `actions` retorna. `clear()` limpa a seleção |
| `onSaveCell` | Uma função `(row, columnId, value) => Promise` | Salva uma célula de uma coluna com `editOnClick`. Veja [Editar uma célula no lugar](#editar-uma-célula-no-lugar) |
| `onSaveRow` | Uma função `(row, changes) => Promise` | Liga o modo "Edit table", e salva uma linha alterada. Veja [O modo que edita a tabela](#o-modo-que-edita-a-tabela) |
| `getSaveErrorMessage` | Uma função `(error) => text` | O texto para um erro com que `onSaveCell` ou `onSaveRow` foi rejeitada. Quando falta: a mensagem de um `Error`, ou `labels.saveFailed` |
| `columnsMenu` | `true`, `false` (padrão) | Liga o menu "Columns", onde uma pessoa esconde e mostra as colunas. Veja [O menu das colunas](#o-menu-das-colunas) |
| `hiddenColumns` | Uma lista de ids de colunas | As colunas escondidas, quando o app guarda a escolha. Quando falta: o grid a guarda, e começa com as colunas que têm `defaultHidden` escondidas |
| `onHiddenColumnsChange` | Uma função | Chamada com a lista dos ids das colunas escondidas depois que uma pessoa muda as colunas no menu |
| `rowActions` | Uma função | Os botões da última coluna de uma linha |
| `isRowSelected` | Uma função | `true` para o registro que está aberto, por exemplo em um painel ao lado do grid. A linha dele recebe `aria-current="true"` |
| `renderExpanded` | Uma função | Conteúdo mostrado em uma linha própria abaixo da linha de um registro. `null`: nenhuma linha extra |
| `rowProps` | Uma função | Props para o `<tr>` de uma linha, por exemplo os handlers de um arrasto |
| `renderView` | Uma função `(rows) => elements` | Mostra outra visualização no lugar da tabela. Veja [Outra visualização no lugar da tabela](#outra-visualização-no-lugar-da-tabela) |
| `subRows` | Um objeto | Os itens dentro de cada linha, mostrados por uma seta. Veja [Linhas dentro de uma linha](#linhas-dentro-de-uma-linha) |
| `groups` | Uma lista de `{ key, title, rows, actions, headerProps }` | Mostra as linhas em blocos, cada um com uma linha de cabeçalho: o título dele, o número de linhas dele e os botões dele. Com grupos não há busca, ordenação, filtro, seleção nem páginas |
| `emptyMessage` | Texto ou elementos. Padrão `"No records."` | A mensagem quando `rows` está vazia |
| `loading` | `true`, `false` (padrão) | `true` enquanto os registros carregam: a tabela tem `aria-busy="true"` e mostra o texto de `labels.loading` no lugar das linhas |
| `defaultState` | `{ search, sort, filters, page, pageSize }`, cada um opcional | Com o que o grid começa, por exemplo lido do endereço da página. `sort` é `{ columnId, descending }` ou `null`. `filters` é descrito em [O filtro de uma coluna](#o-filtro-de-uma-coluna) |
| `onStateChange` | Uma função | Chamada com o estado completo depois que uma pessoa muda o texto da busca, a ordenação, um filtro, a página ou o tamanho da página, por exemplo para escrevê-los no endereço da página |
| `locale` | Um idioma, por exemplo `"pt-BR"` | O idioma que ordena os textos de uma ordenação. Quando falta: o idioma do navegador |
| `labels` | Um objeto | Os textos do grid. Cada um que falta tem seu padrão em inglês. Veja abaixo |
| `checkboxComponent` | Um componente | O checkbox de uma linha e do cabeçalho. Quando falta: o `CheckboxControl` desta biblioteca |
| `selectComponent` | Um componente | O campo do tamanho da página. Quando falta: o `Select` desta biblioteca |
| `className` | Classes | Elas vão para o elemento em volta do grid inteiro (`data-slot="data-grid"`) |

Uma coluna (`DataGridColumn<Row>`):

| Campo | Valores | Significado |
|---|---|---|
| `id` | Texto. Obrigatório | Um nome que nenhuma outra coluna tem |
| `header` | Texto. Obrigatório | O texto da célula de cabeçalho, e o nome da coluna em uma linha mostrada como um bloco |
| `cell` | Uma função. Obrigatório | O que a célula mostra para um registro |
| `align` | `"left"`, `"center"`, `"right"` | O lado para o qual o conteúdo é alinhado. `right` é para números |
| `sortValue` | Uma função que retorna um texto, um número ou `null` | Liga a ordenação por esta coluna. Um clique no cabeçalho ordena de forma crescente, um segundo clique de forma decrescente, um terceiro clique remove a ordenação. Um registro com `null` fica sempre no fim. Um texto com um número é ordenado pelo número (`P9` antes de `P10`) |
| `searchValue` | Uma função que retorna um texto | O texto desta coluna em que a busca procura |
| `footer` | Uma função que recebe as linhas depois da busca e dos filtros | O conteúdo da célula de rodapé. A linha de rodapé é mostrada quando uma coluna tem `footer` |
| `required` | `true`, `false` (padrão) | `true`: a coluna é sempre mostrada, e não está no menu "Columns" |
| `defaultHidden` | `true`, `false` (padrão) | `true`: a coluna fica escondida até uma pessoa ligá-la no menu "Columns" |
| `editor` | `{ type, value }`, e `options` para um select | O campo que edita uma célula desta coluna: `"text"`, `"number"`, `"select"` ou `"checkbox"`. Ele é usado por uma célula editada por um clique (`editOnClick`) e pelo modo "Edit table" (`onSaveRow`) |
| `editOnClick` | `true`, `false` (padrão) | `true`: um clique em uma célula desta coluna a edita no lugar. Precisa de `editor` e da prop `onSaveCell` do grid |
| `canEdit` | Uma função | `false` para um registro cuja célula não pode ser editada, por exemplo um registro arquivado |
| `filter` | `{ type: "options", options, value, defaultValues }` ou `{ type: "text", value }` | Liga o filtro desta coluna. Veja [O filtro de uma coluna](#o-filtro-de-uma-coluna) |

Os textos (`labels`), com seus padrões: `actions` (`"Actions"`), `clearFilters` (`"Clear filters"`), `noResults` (`"No results with these filters."`), `loading` (`"Loading…"`), `total` (`"Total"`), `bulkActions` (`"Bulk actions"`), `selectedCount(count)` (`"3 selected"`), `clearSelection` (`"Clear selection"`), `selectAll` (`"Select all"`), `selectRow(rowLabel)` (`"Select Coffee"`), `pagination` (`"Pagination"`), `pageRange(firstRow, lastRow, rowCount)` (`"Showing 1–10 of 34"`), `rowsPerPage` (`"Per page"`), `pageOf(page, pageCount)` (`"1 of 4"`), `previousPage` (`"Previous page"`), `nextPage` (`"Next page"`), `filterColumn(columnHeader, isActive)` (`"Filter Status"`, `"Filter Status (filter on)"`), `filterChoices(columnHeader)` (`"Show Status"`), `filterSelectAll` (`"Select all"`), `filterClear` (`"Clear"`), `filterContains` (`"Contains…"`), `cellLabel(columnHeader, rowLabel)` (`"Price — Coffee"`), `editCell(cellLabel)` (`"Edit Price — Coffee:"`), `saving` (`"Saving…"`), `saveFailed` (`"Could not save."`), `selectPlaceholder` (`"Select…"`), `editTable` (`"Edit table"`), `noChanges` (`"No changes"`), `changedRows(count)` (`"2 rows changed"`), `cancelEditing` (`"Cancel"`), `saveChanges(count)` (`"Save changes (2)"`), `savingChanges` (`"Saving…"`), `rowError(rowLabel, errorMessage)` (`"Coffee: The price is not valid."`), `showSubRows(subRowsLabel, rowLabel, count)` (`"Show options of Milk (3)"`), `hideSubRows(subRowsLabel, rowLabel, count)` (`"Hide options of Milk (3)"`), `subRowsCaption(subRowsLabel, rowLabel)` (`"options of Milk"`), `noSubRows` (`"No items."`), `columns` (`"Columns"`), `visibleColumns` (`"Visible columns"`), `resetColumns` (`"Back to default"`).

- As classes são as do DataGrid do app Intraweb (`components/ui/data-grid/`). A tabela, o cabeçalho com uma ordenação, as páginas e a barra das linhas selecionadas foram comparados com os do Intraweb nos dois temas.
- A tabela é uma [`DataTable`](#datatable-tr-th-td-actionsth-datatablemessage) com `stackOnMobile`: em uma tela com menos de 768 pixels de largura, cada linha é um bloco. Uma tabela mais larga que a sua caixa rola para os lados.
- Teclado: todo controle é um elemento nativo. Tab passa pelo campo de busca, pelos botões de ordenação, pelos checkboxes, pelos botões das linhas e pelos controles de página; Enter e Espaço pressionam um botão; Espaço marca um checkbox.
- Leitor de tela: a célula de cabeçalho de uma coluna com `sortValue` tem `aria-sort` (`none`, `ascending`, `descending`). A barra das linhas selecionadas é uma região com o nome de `labels.bulkActions`, e a contagem dela é um status. Os controles de página são uma região de navegação. O checkbox do cabeçalho fica "misto" enquanto só uma parte das linhas está selecionada.
- `checkboxComponent` recebe `checked`, `disabled`, `onChange`, `aria-label` e `ref` (tipo `DataGridCheckboxProps`). Ele deve passar `ref` para o seu `<input>`. `selectComponent` recebe `size="sm"`, `className="w-20"`, `value`, `onChange` e filhos `<option>` (tipo `DataGridSelectProps`). Quando eles faltam, o grid usa o `CheckboxControl` e o `Select` da biblioteca.
- Não está na biblioteca, e ainda só no Intraweb: uma célula editada com várias escolhas (o editor `multiselect`). Nenhuma tela do Intraweb o usa.
- A lista `dataGridPageSizes` e os tipos `DataGridProps`, `DataGridColumn`, `DataGridColumnEditor`, `DataGridCellValue`, `DataGridRowChanges`, `DataGridColumnFilter`, `DataGridOption`, `DataGridFilters`, `DataGridFilterValue`, `DataGridGroup`, `DataGridSubRows`, `DataGridSort`, `DataGridState`, `DataGridLabels`, `DataGridCheckboxProps` e `DataGridSelectProps` são exportados.
- É um Client Component, porque guarda estado. As colunas dele têm funções, então o arquivo do app que o usa também é um Client Component. Uma página que é Server Component entrega os registros para esse arquivo.

#### O filtro de uma coluna

Uma coluna com `filter` tem um botão pequeno no seu cabeçalho. Um clique abre um painel com uma lista de escolhas ou um campo de texto. Cada mudança filtra as linhas na hora.

```tsx
const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => product.name,
    // A text field: the rows whose name has the text.
    filter: { type: "text", value: (product) => product.name },
  },
  {
    id: "status",
    header: "Status",
    cell: (product) => (product.active ? "Active" : "Inactive"),
    // A list of choices. "Active" is checked until a person changes the filter.
    filter: {
      type: "options",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      value: (product) => (product.active ? "active" : "inactive"),
      defaultValues: ["active"],
    },
  },
];
```

| Campo de `filter` | Valores | Significado |
|---|---|---|
| `type` | `"options"`, `"text"`. Obrigatório | Uma lista de escolhas com um checkbox cada, ou um campo de texto |
| `value` | Uma função. Obrigatório | Para `"text"`: o texto de um registro em que o filtro procura, sem diferença para letras maiúsculas e acentos. Para `"options"`: o valor de um registro, ou uma lista de valores; com uma lista, um valor marcado é suficiente |
| `options` | Uma lista de `{ value, label }`. Obrigatório para `"options"` | As escolhas, na ordem em que são mostradas |
| `defaultValues` | Uma lista de valores. Só para `"options"` | As escolhas que ficam marcadas até uma pessoa mudar o filtro, por exemplo só os registros ativos |

- Sem nenhuma escolha marcada, uma lista de escolhas não filtra nada.
- O estado do grid tem os filtros: `state.filters` é um objeto com uma entrada para cada coluna cujo filtro uma pessoa mudou. A chave é o `id` da coluna. O valor é a lista dos valores marcados, ou o texto. Uma coluna que não está no objeto tem o seu padrão. Uma lista vazia significa que uma pessoa desmarcou os padrões. `defaultState.filters` tem o mesmo formato.
- "Clear filters" é mostrado enquanto o campo de busca tem um texto ou `state.filters` tem uma entrada. Ele esvazia o campo de busca e põe cada filtro de volta no seu padrão. Os padrões de uma coluna não contam como uma mudança.
- O botão do cabeçalho tem as cores da marca e `data-active` enquanto o filtro dele esconde linhas, e o nome dele termina com o texto de `labels.filterColumn(header, true)`.
- Teclado: Enter ou Espaço no botão abre o painel, e o foco vai para o primeiro controle dele. Tab e Shift+Tab ficam dentro do painel. Espaço marca uma escolha. Escape fecha o painel e devolve o foco ao botão; ele não chega a um Modal ou a um Drawer que está abaixo. Um clique fora fecha o painel.
- Leitor de tela: o botão tem `aria-haspopup="dialog"` e `aria-expanded`. O painel é um diálogo com o nome "Filter" e o cabeçalho da coluna. Ele não bloqueia a página.
- O painel é renderizado em `<body>` com [`useAnchoredPanel`](#useanchoredpanel), como o menu do ActionMenu: a caixa da tabela rola e cortaria um painel dentro dela. As escolhas dele são o `Checkbox` da biblioteca e o campo de texto dele é o `TextInput`.
- Um grid com `groups` não mostra filtro.

#### O menu das colunas

`columnsMenu` adiciona o botão "Columns" à direita da barra de ferramentas. Ele abre uma lista com um checkbox para cada coluna que não é `required`. Uma coluna com `defaultHidden` começa escondida.

```tsx
const columns: DataGridColumn<Product>[] = [
  { id: "name", header: "Product", required: true, cell: (product) => product.name },
  { id: "category", header: "Category", cell: (product) => product.category },
  { id: "supplier", header: "Supplier", defaultHidden: true, cell: (product) => product.supplier },
];

<DataGrid columnsMenu columns={columns} /* ... */ />
```

- O menu é o [`Popover`](#popover) da biblioteca com um `Checkbox` para cada coluna. Teclado: Enter ou Espaço no botão o abre, Tab vai para os checkboxes, Espaço muda um, Escape o fecha e devolve o foco ao botão.
- O botão "Back to default" é mostrado depois de uma mudança. Ele volta para as colunas com que a tela começa, e o foco vai para o primeiro checkbox.
- Uma coluna escondida não tem cabeçalho, nem célula, nem célula de rodapé. O filtro e a ordenação dela não se aplicam enquanto ela está escondida: uma pessoa não poderia vê-los nem desligá-los.
- Sem coluna para escolher (toda coluna `required`), o botão não é mostrado.
- Sem `columnsMenu`, `defaultHidden` e `hiddenColumns` ainda escondem colunas; um app pode então mostrar o seu próprio controle.

O grid não salva a escolha. Um app que quer lembrar dela passa `hiddenColumns` e salva o que `onHiddenColumnsChange` entrega. Este exemplo a guarda no armazenamento do navegador (`localStorage`). É o arquivo `apps/playground/app/data/grid-parts/SavedColumnsGrid.tsx` deste repositório:

```tsx
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { DataGrid } from "@toraline.tech/ui";

const CHANGE_EVENT = "my-app:hidden-columns-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readHiddenColumns(saved: string | null): string[] | undefined {
  if (saved === null) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(saved);
    const isListOfTexts = Array.isArray(parsed) && parsed.every((item) => typeof item === "string");
    return isListOfTexts ? (parsed as string[]) : undefined;
  } catch {
    return undefined;
  }
}

export function useSavedHiddenColumns(storageKey: string, defaultHiddenColumns: readonly string[]) {
  // On the server and until the browser takes over the page: null, so the grid shows its default columns.
  const saved = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(storageKey),
    () => null,
  );
  const hiddenColumns = useMemo(() => readHiddenColumns(saved), [saved]);

  function saveHiddenColumns(nextHiddenColumns: string[]) {
    // Back to the default: nothing is kept, so a column added later follows its "defaultHidden".
    if (nextHiddenColumns.join("\n") === defaultHiddenColumns.join("\n")) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(nextHiddenColumns));
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return [hiddenColumns, saveHiddenColumns] as const;
}

const defaultHiddenColumns = columns.filter((column) => column.defaultHidden).map((column) => column.id);

export function ProductsGrid({ products }: { products: Product[] }) {
  const [hiddenColumns, saveHiddenColumns] = useSavedHiddenColumns("my-app:columns:products", defaultHiddenColumns);
  return (
    <DataGrid
      /* caption, columns, rows, getRowKey, getRowLabel */
      columnsMenu
      hiddenColumns={hiddenColumns}
      onHiddenColumnsChange={saveHiddenColumns}
    />
  );
}
```

#### Editar uma célula no lugar

Uma coluna com `editor` e `editOnClick` é editada no grid. O grid mostra o campo e os estados; o app salva o valor em `onSaveCell`.

```tsx
const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => product.name,
    editor: { type: "text", value: (product) => product.name },
    editOnClick: canEdit,
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    cell: (product) => formatMoney(product.price),
    // The value is the text a person typed. The app reads the number when it saves.
    editor: { type: "number", value: (product) => decimalToInput(product.price) },
    editOnClick: canEdit,
    canEdit: (product) => !product.archived,
  },
  {
    id: "status",
    header: "Status",
    cell: (product) => (product.active ? "Active" : "Inactive"),
    editor: {
      type: "select",
      value: (product) => (product.active ? "active" : "inactive"),
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    editOnClick: canEdit,
  },
];

<DataGrid
  /* caption, columns, rows, getRowKey, getRowLabel */
  onSaveCell={async (product, columnId, value) => {
    // A promise that is rejected leaves the field open with the error text.
    await api.updateProduct(product.id, { [columnId]: value });
  }}
  getSaveErrorMessage={(error) => apiErrorText(error)}
/>
```

| `editor.type` | O campo | O valor entregue a `onSaveCell` |
|---|---|---|
| `"text"` | [`TextInput`](#textinput), tamanho `sm` | O texto |
| `"number"` | [`DecimalInput`](#decimalinput), tamanho `sm`, alinhado à direita | O texto que uma pessoa digitou, com uma vírgula ou um ponto. O app lê o número, por exemplo com `parseDecimalInput` |
| `"select"` | [`Select`](#select), tamanho `sm`, com as escolhas de `options` | O `value` da escolha |
| `"checkbox"` | [`CheckboxControl`](#checkbox-e-checkboxcontrol) | `true` ou `false` |

- Em repouso a célula é um botão com o conteúdo da célula. O ponteiro sobre ela, ou o foco do teclado, mostra um fundo discreto e um lápis. Um clique, Enter ou Espaço mostra o campo, com o foco.
- Um texto e um número são salvos com Enter, e quando o foco sai do campo. Um select é salvo quando uma escolha é feita. Um checkbox é sempre mostrado e é salvo quando é alterado.
- Escape desiste da mudança e devolve o foco à célula. Ele não chega a um Modal ou a um Drawer que está abaixo do grid.
- Um valor que não mudou não é salvo.
- Um campo cujo valor é diferente do valor salvo tem uma borda laranja e um fundo laranja discreto, e `data-changed="true"`.
- Pendente: enquanto a promise de `onSaveCell` não é concluída, o campo fica desabilitado, a célula tem `aria-busy="true"`, e o texto de `labels.saving` é mostrado abaixo do campo como um status.
- Salvo: o campo fecha. Depois de Enter, o foco volta para o botão da célula. O app entrega os novos registros em `rows`, então a célula mostra o novo valor.
- Erro: quando a promise é rejeitada, o campo fica aberto com o valor que uma pessoa digitou. O texto do erro fica abaixo dele, como um alerta, e é a descrição do campo (`aria-describedby`, com `aria-invalid="true"`). Depois de Enter, o campo tem o foco de novo. O texto é o que `getSaveErrorMessage(error)` retorna; sem essa prop é a mensagem do `Error`, ou `labels.saveFailed`.
- Leitor de tela: o botão de uma célula tem o nome "Edit", a coluna, o registro e o conteúdo da célula (`labels.editCell`, `labels.cellLabel`). O campo tem o nome da coluna e do registro.
- `editOnClick` é um valor verdadeiro ou falso, então um app passa ali a permissão da pessoa (`editOnClick: canEdit`). `canEdit(row)` recusa registros individuais.
- Um select cujo registro tem um valor que não é uma das escolhas mostra o texto de `labels.selectPlaceholder`, para que a primeira escolha não pareça ser o valor.
- Não construído: um campo com várias escolhas (o `multiselect` do Intraweb, que nenhuma tela do Intraweb usa).

#### O modo que edita a tabela

`onSaveRow` adiciona o botão "Edit table" à direita da barra de ferramentas. Um clique transforma em um campo cada célula de uma coluna com `editor`. Uma pessoa muda as células de quantas linhas quiser, e um botão salva cada linha alterada de uma vez.

```tsx
const columns: DataGridColumn<Category>[] = [
  {
    id: "name",
    header: "Category",
    cell: (category) => category.name,
    editor: { type: "text", value: (category) => category.name },
  },
  {
    id: "isActive",
    header: "Active",
    cell: (category) => (category.isActive ? "Yes" : "No"),
    editor: { type: "checkbox", value: (category) => category.isActive },
  },
];

<DataGrid
  /* caption, columns, rows, getRowKey, getRowLabel */
  onSaveRow={async (category, changes) => {
    // "changes" has only the cells a person changed, by the id of the column: { name: "Drinks" }.
    // A promise that is rejected keeps the row changed, with the error text under it.
    await api.updateCategory(category.id, changes);
  }}
  getSaveErrorMessage={(error) => apiErrorText(error)}
/>
```

- O botão "Edit table" é mostrado quando o grid tem `onSaveRow` e uma coluna tem `editor`. Ele fica desabilitado enquanto `rows` está vazia. Ele não é mostrado acima de [outra visualização](#outra-visualização-no-lugar-da-tabela).
- No modo, a barra de ferramentas mostra um status ("No changes", "2 rows changed"), o botão "Cancel" e o botão "Save changes (2)", que fica desabilitado enquanto nenhuma linha está alterada. O menu das colunas fica escondido.
- Os campos são os de [uma célula editada no lugar](#editar-uma-célula-no-lugar), todos mostrados de uma vez. `editOnClick` não é necessário. `canEdit(row)` recusa registros individuais.
- Um campo alterado tem a borda laranja e `data-changed="true"`. Uma linha com uma célula alterada tem um fundo laranja discreto e `data-changed="true"`. Um valor que é de novo o valor salvo não é uma mudança.
- "Save changes" chama `onSaveRow(row, changes)` uma vez para cada linha alterada, uma depois da outra. `changes` (tipo `DataGridRowChanges`) tem só as células alteradas da linha.
- Pendente: enquanto o app salva, os campos e os 2 botões ficam desabilitados, o botão diz "Saving…", e a tabela tem `aria-busy="true"`.
- Salvo: quando todas as linhas estão salvas, o modo termina e o foco vai para o botão "Edit table". O app entrega os novos registros em `rows`.
- Erro: uma linha cuja promise é rejeitada continua alterada, com os seus valores. O texto do erro fica em uma linha própria abaixo dela, como um alerta: o rótulo do registro e o texto de `getSaveErrorMessage(error)` (sem essa prop: a mensagem do `Error`, ou `labels.saveFailed`). As linhas que foram salvas não estão mais alteradas. O botão conta as linhas que restam e tem o foco.
- "Cancel" desiste de todas as mudanças e termina o modo. O foco vai para o botão "Edit table".
- No modo uma linha não tem botões (`rowActions`), nem checkbox (`selection`), nem conteúdo extra (`renderExpanded`), nem seta (`subRows`), nem props do app (`rowProps`, por exemplo um arrasto). Os botões de um grupo ficam escondidos. A busca, os filtros, a ordenação e as páginas continuam funcionando, e as mudanças de uma linha que não é mostrada são mantidas.
- Teclado: Enter ou Espaço em "Edit table" inicia o modo, e o foco vai para o primeiro campo. Tab vai de campo em campo e depois para os botões. Enter em um campo não faz nada: só o botão salva.
- Um app pode ter os dois: uma coluna com `editOnClick` é editada por um clique fora do modo, e é um campo no modo.

#### Linhas dentro de uma linha

`subRows` dá a cada linha uma seta antes da sua primeira célula. Um clique mostra os itens do registro em uma tabela pequena, em uma linha própria logo abaixo da linha.

```tsx
<DataGrid
  caption="Groups of complements"
  columns={groupColumns}
  rows={groups}
  getRowKey={(group) => group.id}
  getRowLabel={(group) => group.name}
  subRows={{
    label: "options",
    getRows: (group) => group.options,
    columns: optionColumns,
    getRowKey: (option) => option.id,
    getRowLabel: (option) => option.name,
    onSaveCell: (group, option, columnId, value) => api.updateOption(group.id, option.id, { [columnId]: value }),
    rowActions: (group, option) => <IconButton icon={Trash2} size="sm" aria-label={`Remove ${option.name}`} />,
    footer: (group) => <AddOptionForm group={group} />,
    emptyMessage: "No option in this group.",
  }}
/>
```

| Campo de `subRows` | Valores | Significado |
|---|---|---|
| `label` | Texto. Obrigatório | O nome dos itens no plural, por exemplo `"options"`. Ele está no nome da seta e da tabela interna |
| `getRows` | Uma função. Obrigatório | Os itens de um registro |
| `columns` | Uma lista de colunas. Obrigatório | As colunas da tabela interna. De uma coluna, são usados `id`, `header`, `cell`, `align`, `editor`, `editOnClick` e `canEdit` |
| `getRowKey` | Uma função. Obrigatório | Um valor que nenhum outro item do registro tem |
| `getRowLabel` | Uma função. Obrigatório | O nome do item para um leitor de tela |
| `onSaveCell` | Uma função `(row, subRow, columnId, value) => Promise` | Salva uma célula de um item. Funciona como [a edição de uma célula](#editar-uma-célula-no-lugar), com os mesmos estados e o mesmo texto de erro |
| `rowActions` | Uma função `(row, subRow) => elements` | Os botões da última coluna de um item |
| `footer` | Uma função `(row) => elements` | Conteúdo abaixo dos itens, por exemplo um campo que adiciona um item |
| `emptyMessage` | Texto ou elementos. Padrão `labels.noSubRows` | A mensagem de um registro sem nenhum item |

- A seta é um botão com `aria-expanded`, e `aria-controls` enquanto os itens são mostrados. O nome dela é `labels.showSubRows` ou `labels.hideSubRows`, com o número de itens. Enter e Espaço a pressionam, e ela mantém o foco.
- Várias linhas podem estar abertas ao mesmo tempo. O grid guarda quais linhas estão abertas.
- A tabela interna tem o nome de `labels.subRowsCaption`. Quando ela é mais larga que a sua caixa, ela rola para os lados, e a caixa pode receber o foco do teclado.
- Os itens não têm busca, nem ordenação, nem filtro, nem menu das colunas.
- O tipo genérico do grid tem uma segunda parte para os itens: `DataGridProps<Row, SubRow>`. O TypeScript a lê de `subRows`.

#### Outra visualização no lugar da tabela

`renderView` mostra o que o app retorna no lugar da tabela, por exemplo um calendário ou cards. Ela recebe as linhas depois da busca, dos filtros e da ordenação, de todas as páginas.

```tsx
const [view, setView] = useState<"list" | "calendar">("list");

<DataGrid
  /* caption, columns, rows, getRowKey, getRowLabel */
  search={{ placeholder: "Search the events" }}
  toolbar={<ViewSwitch value={view} onChange={setView} />}
  renderView={view === "calendar" ? (events) => <EventCalendar events={events} /> : undefined}
/>
```

- O app guarda qual visualização é mostrada: ele passa `renderView` para a outra visualização, e `undefined` para a tabela. O grid guarda a busca e os filtros, então eles ficam quando a visualização muda, e se aplicam às duas.
- O campo de busca, a `toolbar` e "Clear filters" ficam acima da visualização.
- Uma visualização não tem células de cabeçalho. Então o filtro de cada coluna que é mostrada vai para a barra de ferramentas, como um botão de 32 pixels de altura com o ícone de filtro e o nome da coluna. O painel, o teclado e o nome dele são os de [o filtro de uma coluna](#o-filtro-de-uma-coluna).
- Com uma visualização não há seleção, nem páginas, nem menu das colunas. `loading` e `emptyMessage` pertencem à tabela: a visualização mostra o seu próprio texto para nenhuma linha.
- A visualização fica dentro de um elemento com `data-slot="view"`.

#### Manter o estado no endereço da página

O grid não lê nem escreve o endereço da página, e a biblioteca não importa o Next.js. O app faz isso com 2 props: `defaultState` é com o que o grid começa, e `onStateChange` é chamada com o estado completo depois de cada mudança. O adaptador abaixo guarda a busca, a ordenação, os filtros, a página e o tamanho da página nos parâmetros de consulta do endereço, com a navegação do Next.js. Depois de recarregar a página, ou quando uma pessoa abre um link salvo, o grid está igual.

O exemplo é a rota `/data/address` do playground deste repositório (`apps/playground/app/data/address/`). Os nomes dos parâmetros são os do app Intraweb, então os endereços salvos dele continuam funcionando:

| Parâmetro | Exemplo | Significado |
|---|---|---|
| `busca` | `busca=cake` | O texto do campo de busca |
| `ordem` | `ordem=name`, `ordem=-name` | O `id` da coluna ordenada. `-` na frente significa decrescente |
| `f-<column id>` | `f-status=active,paused` | As escolhas marcadas do filtro dessa coluna, com vírgulas; ou o texto de um filtro de texto |
| `f-<column id>` | `f-status=` | Vazio: uma pessoa desmarcou as escolhas padrão da coluna |
| `pagina` | `pagina=3` | A página. Não é escrito para a primeira página |
| `por-pagina` | `por-pagina=50` | As linhas de uma página. Não é escrito para o tamanho de página da tela |

Um valor que é o padrão não é escrito, então o endereço de um grid que ninguém mudou não tem parâmetro.

Arquivo 1, `grid-address.ts`: o estado como parâmetros de consulta, e de volta. Ele não conhece nenhum router, então também funciona com outro router.

```ts
const SEARCH = "busca";
const SORT = "ordem";
const FILTER_PREFIX = "f-";
const PAGE = "pagina";
const PAGE_SIZE = "por-pagina";

/** What reads one query parameter: URLSearchParams, and the result of useSearchParams of Next.js. */
type QueryReader = { get: (name: string) => string | null };

function readSort(text: string | null): DataGridSort {
  if (text === null || text === "") {
    return null;
  }
  return text.startsWith("-") ? { columnId: text.slice(1), descending: true } : { columnId: text, descending: false };
}

/** The filters of the address. Only a column that has a filter is read. */
function readFilters<Row>(query: QueryReader, columns: readonly DataGridColumn<Row>[]): DataGridFilters {
  const filters: DataGridFilters = {};
  for (const column of columns) {
    const text = query.get(`${FILTER_PREFIX}${column.id}`);
    if (column.filter === undefined || text === null) {
      continue;
    }
    if (column.filter.type === "options") {
      // An empty text is an empty list: every default choice unchecked.
      filters[column.id] = text === "" ? [] : text.split(",");
    } else if (text !== "") {
      filters[column.id] = text;
    }
  }
  return filters;
}

/**
 * The state that the grid starts with, read from the address: give it to
 * "defaultState". A page size that is not one of "pageSizes" is ignored.
 */
export function readGridState<Row>(
  query: QueryReader,
  columns: readonly DataGridColumn<Row>[],
  pageSizes: readonly number[],
): Partial<DataGridState> {
  const pageSize = Number(query.get(PAGE_SIZE));
  return {
    search: query.get(SEARCH) ?? "",
    sort: readSort(query.get(SORT)),
    filters: readFilters(query, columns),
    page: Math.max(1, Math.floor(Number(query.get(PAGE))) || 1),
    ...(pageSizes.includes(pageSize) ? { pageSize } : {}),
  };
}

/**
 * The query parameters of a state of the grid: what "onStateChange" writes in
 * the address. null means "take this parameter out of the address". A value
 * that is the default (no search, no sort, the first page, the page size of
 * the screen, the default of a filter) is taken out, so the address stays short.
 */
export function gridStateToQuery<Row>(
  state: DataGridState,
  columns: readonly DataGridColumn<Row>[],
  defaultPageSize: number,
): Record<string, string | null> {
  const sortPrefix = state.sort?.descending ? "-" : "";
  const query: Record<string, string | null> = {
    [SEARCH]: state.search === "" ? null : state.search,
    [SORT]: state.sort === null ? null : `${sortPrefix}${state.sort.columnId}`,
    [PAGE]: state.page > 1 ? String(state.page) : null,
    [PAGE_SIZE]: state.pageSize === defaultPageSize ? null : String(state.pageSize),
  };
  for (const column of columns) {
    if (column.filter === undefined) {
      continue;
    }
    const value = state.filters[column.id];
    const text = typeof value === "string" ? value : value?.join(",");
    query[`${FILTER_PREFIX}${column.id}`] = text ?? null;
  }
  return query;
}
```

O arquivo começa com `import type { DataGridColumn, DataGridFilters, DataGridSort, DataGridState } from "@toraline.tech/ui";`.

Arquivo 2, `use-grid-address.ts`: a navegação do Next.js.

```ts
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { dataGridPageSizes } from "@toraline.tech/ui";
import type { DataGridColumn, DataGridState } from "@toraline.tech/ui";
import { gridStateToQuery, readGridState } from "./grid-address";

/** URLSearchParams writes "," ":" "(" ")" and "!" as codes. They are allowed as they are, and the address is easier to read. */
const READABLE: Record<string, string> = { "%2C": ",", "%3A": ":", "%28": "(", "%29": ")", "%21": "!" };

function readableQuery(params: URLSearchParams): string {
  return params.toString().replace(/%2C|%3A|%28|%29|%21/g, (code) => READABLE[code] ?? code);
}

/**
 * Keeps the search, the sort, the filters and the page of a DataGrid in the
 * address of the page, with the navigation of Next.js. It is the adapter
 * between the grid and the router: the library does not import Next.js.
 *
 * - The address is read once, when the grid is first shown: "defaultState".
 * - Each change of the grid replaces the address ("onStateChange"). It adds no
 *   step to the history of the browser, and it does not scroll the page.
 * - The other query parameters of the page are kept.
 * - One grid for each page: the names have no prefix.
 *
 * The component that calls it must be inside <Suspense>, because it reads the
 * query parameters (a rule of useSearchParams in Next.js).
 */
export function useGridAddress<Row>(columns: readonly DataGridColumn<Row>[], defaultPageSize: number) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [defaultState] = useState(() => readGridState(searchParams, columns, dataGridPageSizes));

  function onStateChange(state: DataGridState) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [name, value] of Object.entries(gridStateToQuery(state, columns, defaultPageSize))) {
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
    }
    const query = readableQuery(params);
    router.replace(query === "" ? pathname : `${pathname}?${query}`, { scroll: false });
  }

  return { defaultState, onStateChange };
}
```

A tela:

```tsx
"use client";

const PAGE_SIZE = 25;

export function ProductsGrid({ products }: { products: Product[] }) {
  const { defaultState, onStateChange } = useGridAddress(columns, PAGE_SIZE);
  return (
    <DataGrid
      /* caption, columns, rows, getRowKey, getRowLabel */
      search={{ placeholder: "Search the products" }}
      pageSize={PAGE_SIZE}
      defaultState={defaultState}
      onStateChange={onStateChange}
    />
  );
}
```

```tsx
// The page, a Server Component. useSearchParams needs <Suspense> around the component that calls it.
<Suspense fallback={<p>Loading…</p>}>
  <ProductsGrid products={products} />
</Suspense>
```

- O endereço é lido uma vez, quando o grid é mostrado pela primeira vez. Depois disso o grid guarda o seu próprio estado e responde na hora; o endereço o acompanha.
- Cada mudança substitui o endereço (`router.replace`), então o botão "voltar" do navegador sai da página em um passo.
- Os outros parâmetros de consulta da página são mantidos, por exemplo o que abre um painel lateral.
- Um grid para cada página: os nomes não têm prefixo.
- As colunas escondidas não estão no endereço. Elas são uma escolha da pessoa, não do link: veja [O menu das colunas](#o-menu-das-colunas).

### `ListItem`

Uma linha de uma lista de registros: um ícone, um título e uma segunda linha, e um valor e um status à direita.

```tsx
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { ListItem } from "@toraline.tech/ui";

<ul>
  {requests.map((request) => (
    <li key={request.id}>
      <ListItem
        title={request.title}
        meta={request.date}
        value={request.hours}
        icon={CalendarDays}
        href={`/requests/${request.id}`}
        linkComponent={Link}
        selected={request.id === openRequestId}
      />
    </li>
  ))}
</ul>
```

| Prop | Valores | Significado |
|---|---|---|
| `title` | Texto ou elementos. Obrigatória | O texto principal. Uma linha: um texto longo termina com "…" |
| `meta` | Texto ou elementos | A segunda linha, por exemplo uma data. Uma linha: um texto longo termina com "…" |
| `value` | Texto ou elementos | O valor à direita, por exemplo `"8 h"`. Os dígitos dele têm todos a mesma largura |
| `status` | Elementos | Mostrado abaixo do valor, normalmente um badge com o status do registro |
| `icon` | Um componente de ícone | Um ícone mostrado antes do texto, em uma caixa de 40 pixels. Veja [Ícones](#ícones). É decoração: um leitor de tela o pula |
| `selected` | `true`, `false` (padrão) | O item que está aberto, por exemplo em um painel ao lado da lista. Ele recebe `aria-current="true"`, o fundo `bg-selected` e uma linha curta na cor da marca à sua esquerda |
| `href` | Um endereço | Com ele, o item é um link |
| `onClick` | Uma função | Chamada em um clique. Com ela e sem `href`, o item é um `<button>` |
| `linkComponent` | Um componente. Padrão `"a"` | O componente que renderiza o link. Um app Next.js passa o `Link` de `next/link` |

- As partes e as classes são as do ListItem do app Intraweb (`components/ui/list-item.tsx`). O item tem pelo menos 64 pixels de altura.
- Sem `href` e sem `onClick` o item é um `<div>` que não pode ser pressionado: ele não tem seta à direita nem fundo sob o ponteiro.
- Elemento nativo principal: o `<a>`, o `<button>` ou o `<div>`. `className`, todas as outras props e `ref` vão para ele. O atributo HTML `title` não é aceito: `title` é o texto principal.
- O componente não renderiza nenhum `<li>`: ponha cada item dentro de um `<li>` de uma lista.
- Teclado: Tab move o foco para um link ou um botão; Enter segue o link; Enter e Espaço pressionam o botão. O anel de foco é desenhado dentro do item.
- Leitor de tela: ele lê o título, a segunda linha, o valor e o status como o nome do link ou do botão. O item selecionado tem `aria-current="true"`.
- As partes internas têm `data-slot`: `icon`, `text`, `title`, `meta`, `end`, `value`, `chevron`.
- O tipo `ListItemProps` é exportado.
- Ele não tem `"use client"`: também renderiza em um Server Component. Um item com `onClick` precisa de um Client Component em volta dele, porque uma função não pode ir de um Server Component para o navegador.

### `DetailPanel`

O detalhe do registro selecionado, mostrado ao lado de uma lista. Ele não cobre a página e não prende o foco dentro dele: a lista ainda pode ser usada.

```tsx
import { Button, DetailPanel } from "@toraline.tech/ui";

<DetailPanel
  title="Vacation of Marina Lopes"
  status={<StatusBadge status="open" />}
  onClose={closePanel}
  fields={[
    { label: "Period", value: "01/11/2026 to 10/11/2026" },
    { label: "Hours", value: "80 h" },
  ]}
  footer={<Button onClick={approve}>Approve</Button>}
/>
```

| Prop | Valores | Significado |
|---|---|---|
| `title` | Texto ou elementos. Obrigatória | O título, um `<h2>`. É o nome do painel para um leitor de tela |
| `status` | Elementos | Mostrado abaixo do título, normalmente um badge com o status do registro |
| `onClose` | Uma função | Chamada em um clique no botão de fechar. Sem ela, o painel não tem botão de fechar |
| `closeLabel` | Texto. Padrão `"Close"` | O nome do botão de fechar para um leitor de tela |
| `fields` | Uma lista de `{ label, value }` | Os campos do registro, mostrados como uma lista de nomes e valores. `label` é um texto que nenhum outro campo do painel tem; `value` é texto ou elementos |
| `footer` | Elementos | As ações do registro, mostradas na parte de baixo, à direita |
| `children` | Elementos | Mais conteúdo, mostrado depois dos campos |

- As partes e as classes são as do DetailPanel do app Intraweb (`components/ui/detail-panel.tsx`). A aparência foi comparada com a do Intraweb nos dois temas.
- Largura: a largura do seu contêiner, e 360 pixels a partir de uma tela com 1280 pixels de largura (`xl:w-90 xl:shrink-0`), então ele fica ao lado de uma lista em uma linha. Passe `className` para mudá-la.
- Elemento nativo principal: o `<aside>`. `className`, todas as outras props e `ref` vão para ele. O atributo HTML `title` não é aceito: `title` é o título do painel.
- Leitor de tela: o painel é uma região complementar com o nome do seu título. Os campos são uma lista de descrição (`<dl>`).
- Teclado: Tab move o foco para o botão de fechar e para os botões do rodapé. O conteúdo rola quando o app limita a altura do painel (`className="max-h-96"`); enquanto ele rola, ele pode receber o foco do teclado, então as teclas de seta o rolam.
- Enquanto o registro carrega, o app passa o seu próprio texto como `children` e `aria-busy="true"`.
- As partes internas têm `data-slot`: `header`, `title`, `body`, `fields`, `footer`.
- Os tipos `DetailPanelProps` e `DetailField` são exportados.
- Ele não tem `"use client"`: também renderiza em um Server Component. Um painel com `onClose` precisa de um Client Component em volta dele, porque uma função não pode ir de um Server Component para o navegador.
