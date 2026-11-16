# Como fazer um release da biblioteca

[English](releasing.md) | **Português**

Os passos para publicar uma versão nova de `@toraline.tech/ui` e `@toraline.tech/tokens` no npm. Uma pessoa faz os passos. Um agente pode fazer os passos 1 a 6 quando alguém pede. Um agente nunca faz o passo 7 nem o passo 9, e nunca lida com um token do npm nem com um login.

## Contexto que você precisa antes de ler

- **Registro do npm**: o servidor público em https://www.npmjs.com que guarda pacotes. `npm install` baixa os pacotes dele.
- **Publicar**: enviar uma versão de um pacote para o registro. Uma versão publicada nunca pode ser mudada.
- **Os dois pacotes**: `@toraline.tech/tokens` (tokens e temas) e `@toraline.tech/ui` (componentes). Eles sempre têm a mesma versão e são sempre publicados juntos.
- **Números de versão**: a biblioteca está em `0.x`. Uma versão que começa com `0` diz: isto é para testar nos apps da própria Toraline, e qualquer coisa ainda pode mudar. A `1.0.0` vem depois do rebrand completo. Uma versão com um traço, por exemplo `0.2.0-beta.0`, é um **pré-release**: um teste de uma versão antes de ela ser publicada.
- **Tag do npm** (também chamada dist-tag): um nome no registro que aponta para uma versão. `npm install @toraline.tech/ui` instala a versão para a qual a tag `latest` aponta. Um pré-release recebe a tag `next`, então só `npm install @toraline.tech/ui@next` instala esse pré-release.
- **Tarball**: o arquivo `.tgz` que contém um pacote. É exatamente o que o npm publica.
- **Workflow**: uma lista de passos que o GitHub executa nas máquinas dele. O workflow de release é `.github/workflows/release.yml`, mostrado no GitHub como "Release".
- **Secret do repositório**: um valor salvo nas configurações do repositório no GitHub. Um workflow pode usar o valor, e ninguém consegue ler o valor de volta.
- **Token de acesso do npm**: um valor parecido com uma senha, criado em npmjs.com, que deixa um workflow publicar por uma conta do npm.
- **Autenticação de dois fatores (2FA)**: o código de 6 dígitos de um aplicativo no seu celular que o npm pede quando você entra na conta ou publica.
- **Provenance**: uma nota assinada que o npm mostra na página de um pacote. Ela diz qual commit e qual workflow geraram o pacote.
- **O pacote antigo**: `@toraline/toraline-ui`, versões 0 e 1. Nada neste documento muda esse pacote. Veja [O pacote antigo](#o-pacote-antigo).

## Configuração feita uma vez

Faça isto uma vez, antes do primeiro release. Só o dono da organização `@toraline.tech` no npm pode fazer.

1. Entre em https://www.npmjs.com com a conta que é dona da organização `toraline.tech`.
2. Crie um token de acesso: sua foto > **Access Tokens** > **Generate New Token** > **Granular Access Token**. Dê a ele a permissão **Read and write** para pacotes, para a organização `toraline.tech`. Copie o token. O npm mostra o token uma vez.
3. No GitHub, abra o repositório `Toraline/toraline-ui` > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
4. Name: `NPM_PUBLISH_TOKEN`. Secret: cole o token. Pressione **Add secret**.

Não verificado: os nomes exatos dos botões em npmjs.com, e por quanto tempo o npm deixa um token valer. Quando o token acaba, o workflow falha no passo de publicação, e você repete os passos 2 a 4.

Não mude nem apague o secret `npm_token`. O workflow do pacote antigo usa esse secret.

## Passos de um release

Os exemplos usam `0.1.1` como a versão nova.

1. **Escolha a versão.**

   | O que mudou | Exemplo |
   |---|---|
   | Uma correção, ou algo novo que não quebra nenhum app | `0.1.0` vira `0.1.1` |
   | Uma mudança que quebra um app (uma prop ou um token com outro nome, um componente removido) | `0.1.1` vira `0.2.0` |
   | Um teste de uma versão antes de ela ser publicada | `0.2.0-beta.0` |
   | O rebrand completo está pronto | `1.0.0` |

2. **Comece um ticket e o worktree dele**, como para qualquer mudança (`make worktree TICKET=<n> SLUG=release-<version>`). Os passos 3 a 5 acontecem ali.

3. **Defina a versão.** Na raiz do worktree:

   ```bash
   make version VERSION=0.1.1
   ```

   O comando escreve a versão em `packages/tokens/package.json` e `packages/ui/package.json`, escreve a mesma versão como a dependência de `@toraline.tech/ui` em `@toraline.tech/tokens`, e atualiza `package-lock.json`.

4. **Escreva a lista de mudanças.** Abra `CHANGELOG.md`. Adicione uma seção acima da mais nova:

   ```markdown
   ## 0.1.1 (2026-11-20)

   - `@toraline.tech/ui`: <what an app developer sees that is new or different>.
   - `@toraline.tech/tokens`: <the same for the tokens>.
   ```

   Escreva o que muda para um app, não os nomes dos commits. Coloque primeiro uma mudança que quebra um app, com o que o app precisa mudar. O título da seção tem a data do release, no seu horário local: a data do seu calendário quando você inicia o release. Uma pessoa em Brasília (UTC-3) que faz o release às 22:24 de 2026-11-15 escreve `2026-11-15`, também quando o npm registra `2026-11-16T01:24Z`. Todo horário que uma máquina escreve (npm, GitHub, um log) é em UTC, e não é copiado para o título.

5. **Verifique, depois olhe dentro dos tarballs.**

   ```bash
   make check
   make pack
   ```

   `make check` precisa terminar sem erro. Ele também falha quando as duas versões são diferentes ou quando `CHANGELOG.md` não tem uma seção para a versão.

   `make pack` imprime os arquivos de cada pacote e escreve os tarballs em `.pack/tarballs/`. Leia as duas listas:

   - Cada uma tem `package.json`, `README.md`, `README.pt-BR.md`, uma pasta `css/` e uma pasta `dist/`.
   - Nenhum nome de arquivo tem `.test.`, `template` ou `.map`.
   - Os números são próximos destes: `@toraline.tech/tokens` 17 arquivos, 36 kB; `@toraline.tech/ui` 177 arquivos, 149 kB (versão `0.3.0`, com os dois arquivos README). Um componente novo adiciona cerca de 4 arquivos.

6. **Faça o commit, abra o pull request para `main`, e faça o merge** depois que `Check` passar no GitHub. Daqui em diante o branch `main` tem a versão.

7. **Publique. Uma pessoa faz este passo, nunca um agente.**

   1. No GitHub abra **Actions** > **Release** > **Run workflow**.
   2. **Use workflow from**: escolha o branch `main`.
   3. **version**: digite a versão, por exemplo `0.1.1`.
   4. Deixe a caixa **publish** desmarcada. Pressione **Run workflow**. Esta é a execução de teste: ela faz tudo, menos enviar os pacotes. Espere a marca verde.
   5. Execute o workflow de novo com os mesmos valores e a caixa **publish** marcada.

   O workflow escolhe a tag do npm sozinho: `next` para uma versão com um traço, `latest` para uma versão sem traço.

   Quando uma execução falha depois que `@toraline.tech/tokens` foi publicado e antes que `@toraline.tech/ui` fosse, corrija a causa e execute de novo com a mesma versão. O workflow pula um pacote cuja versão já está no npm.

8. **Verifique o resultado.** Em um terminal, em qualquer pasta:

   ```bash
   npm view @toraline.tech/ui@0.1.1 version
   npm view @toraline.tech/tokens@0.1.1 version
   npm view @toraline.tech/ui dist-tags
   npm view @toraline.tech/tokens dist-tags
   ```

   - O npm precisa de alguns minutos depois de uma publicação. Em 2026-11-15 levou cerca de 5 minutos. Até lá esses comandos respondem `404 Not Found`. O workflow espera até 10 minutos pelo mesmo motivo.
   - Os dois primeiros comandos imprimem a versão.
   - `dist-tags` mostra `latest: '0.1.1'`. Para uma versão com um traço mostra `next`.

   Depois instale a versão em um app: `npm install @toraline.tech/ui @toraline.tech/tokens`, e abra uma página com um Button.

9. **Marque o commit com uma tag do git** (uma pessoa faz este passo):

   ```bash
   git fetch origin
   git tag v0.1.1 origin/main
   git push origin v0.1.1
   ```

   **Não crie um "Release" na página do GitHub para uma tag da biblioteca nova.** Criar um release no GitHub inicia o workflow do pacote antigo (veja abaixo). Uma tag simples do git não inicia nada.

10. **Atualize a versão na documentação**, nos dois idiomas: a frase com a versão atual e a data dela em `README.md`, `docs/guide.md`, `packages/ui/README.md` e `packages/tokens/README.md`, e os nomes dos tarballs no guia 1 de `docs/guide.md`. Um agente pode fazer este passo, em um pull request.

## Publicar da sua própria máquina

Use isto só quando o GitHub Actions não pode ser usado. Os pacotes ficam então sem provenance.

1. Esteja no branch `main`, sem nada fora de um commit, depois de `git pull`.
2. `npm login` (o npm pede sua senha e seu código de 2FA).
3. Execute, com a versão real e com `next` ou `latest` como no passo 7:

   ```bash
   make check
   TORALINE_RELEASE=0.1.1 npm publish --workspace @toraline.tech/tokens --tag latest --access public
   TORALINE_RELEASE=0.1.1 npm publish --workspace @toraline.tech/ui --tag latest --access public
   ```

   O npm pede um código de 2FA para cada comando.

`npm publish` sem `TORALINE_RELEASE`, em outro branch, com mudanças fora de um commit, ou com a tag errada para com uma mensagem que diz qual desses está errado. Esta é a proteção contra uma publicação por acidente (`scripts/check-packages.mjs`).

## Como desfazer um release errado

Uma versão publicada não pode ser mudada, e o número dela não pode ser usado de novo, nem depois de ela ser removida.

1. **A correção normal: publique uma versão nova** com a correção (`0.1.2`), com os passos acima.
2. **Avise sobre a versão errada** (uma pessoa com acesso ao npm executa isto):

   ```bash
   npm deprecate @toraline.tech/ui@0.1.1 "Broken: use 0.1.2"
   npm deprecate @toraline.tech/tokens@0.1.1 "Broken: use 0.1.2"
   ```

   A versão continua no npm. Todo mundo que instala a versão vê a mensagem.
3. **Quando uma tag aponta para a versão errada**, aponte a tag de volta:

   ```bash
   npm dist-tag add @toraline.tech/ui@0.1.0 latest
   npm dist-tag add @toraline.tech/tokens@0.1.0 latest
   ```

4. **Remover uma versão (`npm unpublish`) é limitado pelas regras do npm.** É permitido nas primeiras 72 horas, quando nenhum outro pacote público depende da versão. `@toraline.tech/ui` depende de `@toraline.tech/tokens`, então essa versão de `@toraline.tech/ui` precisa ser removida primeiro. Depois de 72 horas é permitido só quando o pacote teve menos de 300 downloads na última semana, tem um dono, e nenhum outro pacote público depende dele. Não pode ser desfeito. Quando toda versão de um pacote é removida, o npm bloqueia versões novas dele por 24 horas. Use isto só para uma versão que tem um segredo dentro. As regras: https://docs.npmjs.com/policies/unpublish

## O pacote antigo

`@toraline/toraline-ui` é publicado pelo workflow `.github/workflows/npm-publish.yml`, chamado "Node.js Package". Este ticket não mudou esse workflow.

- Ele inicia quando alguém cria um **Release** na página do repositório no GitHub. Ele executa o arquivo `npm-publish.yml` do commit para o qual a tag do release aponta.
- Em `old-package` ele executa `npm ci`, `npm test` e `npm publish` na raiz do repositório, com Node 16 e o secret `npm_token`.
- Para fazer um release do pacote antigo: em `old-package`, aumente `version` em `package.json` para acima da versão mais nova no npm, faça o merge, depois crie um Release no GitHub cuja tag está em `old-package`.
- Um Release no GitHub cuja tag está em `main` executa a cópia desse workflow em `main`, que trabalha dentro de `legacy/` e tenta publicar o pacote antigo dali. É por isso que o passo 9 proíbe um Release no GitHub para a versão 2.

Encontrado em 2026-11-15, não mudado: o npm tem `@toraline/toraline-ui` 1.1.5, publicado em 2023-04-27. O `package.json` em `old-package` (e `legacy/package.json` em `main`) diz 0.1.35, que já está no npm. O branch `v1` diz 1.1.5. Então um release a partir de `old-package` como ele está hoje falha, porque a 0.1.35 existe. `gh release list` não mostrou nenhum Release do GitHub no repositório.

## Status

**Feito**
- O build dos pacotes gera tarballs que um app Next.js 16.4.6 novo instala e renderiza (verificado em 2026-11-15, veja `docs/decisions.md`).
- `make pack`, `make version`, a proteção em `npm publish`, o arquivo do workflow, `CHANGELOG.md` com a seção `0.1.0`.

- A versão `0.1.0` dos dois pacotes está no npm, publicada pelo workflow "Release" em 2026-11-15. A versão `0.2.0` veio em seguida em 2026-11-15 e a versão `0.3.0` em 2026-11-15 (as datas são no horário local de Brasília, de onde os releases foram iniciados; o npm registra a `0.3.0` em 2026-11-16 01:24 UTC).

**Não feito**
- Os pacotes não têm licença.
- O Trusted Publishing não está configurado. O workflow ainda usa o secret `NPM_PUBLISH_TOKEN`.

**O que você precisa fazer**
1. Escolha uma licença, ou decida continuar publicando sem nenhuma.
