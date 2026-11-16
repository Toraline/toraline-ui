# toraline-ui

[English](README.md) | **Português**

A biblioteca de componentes da Toraline: componentes React estilizados, com temas e fontes configuráveis. Cada app da Toraline instala a biblioteca.

A aparência padrão é a aparência do app Intraweb, um app da Toraline: as mesmas cores, fontes, tamanhos de raio e sombras, com os mesmos nomes de token e os mesmos nomes de classe do Tailwind (fase 6, TOR-1122).

**Para usar a biblioteca em um app, leia o [guia](docs/guide.pt-BR.md):** instale a biblioteca, monte o tema do app, e estilize por cima de um componente.

**O catálogo está online: https://toraline-ui.vercel.app/** Ele mostra todo componente em todo tema, o guia, e todos os tokens. O controle **Language** na barra de ferramentas dele mostra o guia e a página de tokens em inglês ou em português.

**Os pacotes estão no npm.** `@toraline.tech/ui` e `@toraline.tech/tokens`, versão `0.3.0`, publicada em 2026-11-15. A primeira versão, `0.1.0`, foi publicada em 2026-11-15. Versões que começam com `0` são um pré-release: testadas nos apps da própria Toraline, e props e tokens ainda podem mudar. Como uma versão é publicada: [docs/releasing.pt-BR.md](docs/releasing.pt-BR.md). O que mudou em cada versão: [CHANGELOG.md](CHANGELOG.md).

**Este é o branch `main`**, a biblioteca nova (versão 2). Até 2026-11-15 ele se chamava `v2`. A biblioteca antiga está sem mudanças em [`legacy/`](legacy/), e no branch `old-package`, que se chamava `main` até esse dia. O pacote dela é `@toraline/toraline-ui`.

## O que está onde

| Caminho | Conteúdo | Estado |
|---|---|---|
| `packages/tokens` | Design tokens, os temas claro e escuro, a função que monta um tema, e o preset do Tailwind CSS 4. Publicado como `@toraline.tech/tokens` | Feito na fase 2. Desde a fase 6 os tokens têm os nomes e os valores do Intraweb. Veja [o README dele](packages/tokens/README.pt-BR.md) |
| `packages/ui` | Os componentes estilizados. Publicado como `@toraline.tech/ui` | Tem o provider e o botão que alterna o tema, e os componentes. Botões e navegação: Button, ButtonLink, IconButton, SplitButton, TabNav, Tabs, BreadCrumbs. Controles de formulário: Field, TextInput, Textarea, Select, DecimalInput, Checkbox, CheckboxControl, Toggle. Feedback: StatusBadge, CountBadge, Panel, EmptyState, StatCard, ProgressBar, ProgressRing. Overlays: Modal, Drawer, DiscardConfirmation, DeleteOverlay, ActionMenu, Popover, Tooltip, CloseButton. Dados: DataTable, DataGrid, ListItem, DetailPanel. Desde a fase 7 eles têm as variantes, os tamanhos e as props dos mesmos componentes do app Intraweb. Tem também as regras que todo componente segue e o modelo de um componente. Veja [o README dele](packages/ui/README.pt-BR.md) |
| `apps/catalog` | O catálogo: Storybook 10, com um controle na barra de ferramentas que muda o tema de toda story | Feito na fase 4. Tem o guia como primeira página, as stories de todo componente e do botão que alterna o tema, uma página com todos os tokens, e uma verificação de acessibilidade que roda em toda story nos dois temas. Veja [o README dele](apps/catalog/README.md) |
| `apps/playground` | Um app Next.js privado que testa os temas e mostra todo componente em uma página real | Veja [o README dele](apps/playground/README.md) |
| `legacy/` | A biblioteca antiga: Create React App, styled-components 5, Storybook 6 | Sem mudanças |
| `docs/guide.pt-BR.md` | O guia para uma pessoa que usa a biblioteca em um app: instalar, montar um tema, estilizar por cima. O catálogo mostra o mesmo arquivo como primeira página | Escrito na fase 4 |
| `docs/releasing.pt-BR.md` | Os passos para publicar uma versão dos dois pacotes no npm, e como desfazer um release errado | Escrito na fase 5 |
| `CHANGELOG.md` | O que mudou em cada versão dos dois pacotes | |
| `.github/workflows/release.yml` | O workflow que publica os dois pacotes. Ele roda só quando uma pessoa o inicia à mão | Publicou a `0.1.0`, a `0.2.0` e a `0.3.0` em 2026-11-15 |
| `docs/decisions.md` | Decisões técnicas, a mais nova primeiro | |
| `AGENTS.md`, `agent/` | Como agentes de IA trabalham neste repositório | |

## Comandos

Execute os comandos na raiz do repositório. Node 24.

```bash
npm install      # once
make check       # build, type check, lint and tests of every package, and the story tests of the catalog
make catalog     # open the catalog (Storybook) on http://localhost:6006
make catalog-build # build the static catalog into apps/catalog/storybook-static
make catalog-test  # run every story as a test, in each theme, with the accessibility check
make pack        # build the two packages, write their tarballs into .pack/tarballs/ and list the files of each
make version VERSION=0.1.1  # set the version of the two packages
make doctor      # check the machine and the project
```

A biblioteca antiga tem seus próprios comandos dentro de `legacy/`: `npm install`, `npm run build`, `npm run storybook`.

## Licença

MIT. O texto está no arquivo [`LICENSE`](LICENSE). Copyright (c) 2023-2026 Toraline.
