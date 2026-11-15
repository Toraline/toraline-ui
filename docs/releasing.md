# How to release version 2

The steps to publish a new version of `@toraline.tech/ui` and `@toraline.tech/tokens` to npm. A person does them. An agent may do steps 1 to 6 when asked. An agent never does step 7 or step 9, and never handles an npm token or a login.

## Context you need before reading

- **npm registry**: the public server at https://www.npmjs.com that stores packages. `npm install` downloads from it.
- **Publish**: send one version of a package to the registry. A published version can never be changed.
- **The two packages**: `@toraline.tech/tokens` (tokens and themes) and `@toraline.tech/ui` (components). They always have the same version and are always published together.
- **Pre-release**: a version with a dash, for example `2.0.0-beta.0`. It is for testing. A **full release** has no dash, for example `2.0.0`.
- **npm tag** (also called dist-tag): a name on the registry that points to one version. `npm install @toraline.tech/ui` installs the version that the tag `latest` points to. A pre-release gets the tag `next`, so only `npm install @toraline.tech/ui@next` installs it.
- **Tarball**: the `.tgz` file that holds one package. It is exactly what npm publishes.
- **Workflow**: a list of steps that GitHub runs on its own machines. The release workflow is `.github/workflows/release.yml`, shown on GitHub as "Release version 2".
- **Repository secret**: a value saved in the settings of the repository on GitHub. A workflow can use it, and nobody can read it back.
- **npm access token**: a password-like value, made on npmjs.com, that lets a workflow publish for an npm account.
- **Two-factor authentication (2FA)**: the 6-digit code from an app on your phone that npm asks for when you sign in or publish.
- **Provenance**: a signed note that npm shows on the page of a package. It says which commit and which workflow built it.
- **The old package**: `@toraline/toraline-ui`, versions 0 and 1. Nothing in this document changes it. See [The old package](#the-old-package).

## One-time setup

Do this once, before the first release. Only the owner of the npm organization `@toraline.tech` can do it.

1. Sign in on https://www.npmjs.com with the account that owns the organization `toraline.tech`.
2. Create an access token: your picture > **Access Tokens** > **Generate New Token** > **Granular Access Token**. Give it **Read and write** permission for packages, for the organization `toraline.tech`. Copy the token. npm shows it once.
3. On GitHub, open the repository `Toraline/toraline-ui` > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
4. Name: `NPM_PUBLISH_TOKEN`. Secret: paste the token. Press **Add secret**.

Not verified: the exact names of the buttons on npmjs.com, and how long npm lets a token live. When the token ends, the workflow fails at the publish step, and you repeat steps 2 to 4.

Do not change or delete the secret `npm_token`. The workflow of the old package uses it.

## Steps of a release

The examples use `2.0.0-beta.1` as the new version.

1. **Choose the version.**

   | What changed | Example |
   |---|---|
   | Another test version before `2.0.0` | `2.0.0-beta.0` becomes `2.0.0-beta.1` |
   | The first full release | `2.0.0` |
   | After `2.0.0`: a fix | `2.0.0` becomes `2.0.1` |
   | After `2.0.0`: something new that breaks no app | `2.0.1` becomes `2.1.0` |
   | After `2.0.0`: a change that breaks an app | `2.1.0` becomes `3.0.0` |

   The first release needs no new number: the packages already have `2.0.0-beta.0`. Skip step 3 for it.

2. **Start a ticket and its worktree**, as for any change (`make worktree TICKET=<n> SLUG=release-<version>`). Steps 3 to 5 happen there.

3. **Set the version.** From the root of the worktree:

   ```bash
   make version VERSION=2.0.0-beta.1
   ```

   It writes the version in `packages/tokens/package.json` and `packages/ui/package.json`, writes the same version as the dependency of `@toraline.tech/ui` on `@toraline.tech/tokens`, and updates `package-lock.json`.

4. **Write the change list.** Open `CHANGELOG.md`. Add a section above the newest one:

   ```markdown
   ## 2.0.0-beta.1 (2026-11-20)

   - `@toraline.tech/ui`: <what an app developer sees that is new or different>.
   - `@toraline.tech/tokens`: <the same for the tokens>.
   ```

   Write what changes for an app, not the names of commits. Put a change that breaks an app first, with what the app must change. For the first release, replace `(not published yet)` in the section `2.0.0-beta.0` with the date.

5. **Check, then look inside the tarballs.**

   ```bash
   make check
   make pack
   ```

   `make check` must end with no error. It also fails when the two versions differ or when `CHANGELOG.md` has no section for the version.

   `make pack` prints the files of each package and writes the tarballs into `.pack/tarballs/`. Read the two lists:

   - Each has `package.json`, `README.md`, a folder `css/` and a folder `dist/`.
   - No file name has `.test.`, `template` or `.map`.
   - The numbers are close to these: `@toraline.tech/tokens` 14 files, 13 kB; `@toraline.tech/ui` 42 files, 19 kB. A new component adds about 4 files.

6. **Commit, open the pull request to `v2`, and merge it** after `Check` passes on GitHub. From here on the branch `v2` has the version.

7. **Publish. A person does this step, never an agent.**

   1. On GitHub open **Actions** > **Release version 2** > **Run workflow**.
   2. **Use workflow from**: choose the branch `v2`.
   3. **version**: type the version, for example `2.0.0-beta.1`.
   4. Leave the box **publish** off. Press **Run workflow**. This is the test run: it does everything except send the packages. Wait for the green check mark.
   5. Run the workflow again with the same values and the box **publish** on.

   The workflow picks the npm tag by itself: `next` for a version with a dash, `latest` for a version without.

   When a run fails after `@toraline.tech/tokens` was published and before `@toraline.tech/ui` was, fix the cause and run it again with the same version. It skips a package whose version is already on npm.

8. **Check the result.** In a terminal, anywhere:

   ```bash
   npm view @toraline.tech/ui@2.0.0-beta.1 version
   npm view @toraline.tech/tokens@2.0.0-beta.1 version
   npm view @toraline.tech/ui dist-tags
   npm view @toraline.tech/tokens dist-tags
   ```

   - The first two commands print the version.
   - For a pre-release, `dist-tags` shows `next: '2.0.0-beta.1'`. For a full release it shows `latest`.
   - Only after the very first release: look at whether `dist-tags` also shows `latest` with the pre-release. It is not verified what npm does for the first version of a new package. If `latest` is there, tell the app developers to install with `@next` or with the exact version until `2.0.0` exists. npm does not let you remove the tag `latest`.

   Then install it in an app: `npm install @toraline.tech/ui@next @toraline.tech/tokens@next`, and open a page with a Button.

9. **Mark the commit with a git tag** (a person does this step):

   ```bash
   git fetch origin
   git tag v2.0.0-beta.1 origin/v2
   git push origin v2.0.0-beta.1
   ```

   **Do not create a "Release" on the GitHub page for a version 2 tag.** Creating a GitHub release starts the workflow of the old package (see below). A plain git tag starts nothing.

10. **After the first release only**: remove the sentences that say the packages are not published from `docs/guide.md`, `README.md`, `packages/ui/README.md` and `packages/tokens/README.md`.

## Publishing from your own machine

Use this only when GitHub Actions cannot be used. The packages then have no provenance.

1. Be on the branch `v2`, with nothing uncommitted, after `git pull`.
2. `npm login` (npm asks for your password and your 2FA code).
3. Run, with the real version and with `next` or `latest` as in step 7:

   ```bash
   make check
   TORALINE_RELEASE=2.0.0-beta.1 npm publish --workspace @toraline.tech/tokens --tag next --access public
   TORALINE_RELEASE=2.0.0-beta.1 npm publish --workspace @toraline.tech/ui --tag next --access public
   ```

   npm asks for a 2FA code for each command.

`npm publish` without `TORALINE_RELEASE`, on another branch, with uncommitted changes, or with the wrong tag stops with a message that says which of these is wrong. This is the guard against a publish by accident (`scripts/check-packages.mjs`).

## How to undo a wrong release

A published version cannot be changed, and its number cannot be used again, even after it is removed.

1. **The normal fix: publish a new version** with the correction (`2.0.0-beta.2`), with the steps above.
2. **Warn about the wrong version** (a person with npm access runs this):

   ```bash
   npm deprecate @toraline.tech/ui@2.0.0-beta.1 "Broken: use 2.0.0-beta.2"
   npm deprecate @toraline.tech/tokens@2.0.0-beta.1 "Broken: use 2.0.0-beta.2"
   ```

   The version stays on npm. Everyone who installs it sees the message.
3. **When a tag points to the wrong version**, point it back:

   ```bash
   npm dist-tag add @toraline.tech/ui@2.0.0-beta.0 next
   npm dist-tag add @toraline.tech/tokens@2.0.0-beta.0 next
   ```

4. **Removing a version (`npm unpublish`) is limited by npm's rules.** It is allowed in the first 72 hours, when no other public package depends on the version. `@toraline.tech/ui` depends on `@toraline.tech/tokens`, so that version of `@toraline.tech/ui` must be removed first. After 72 hours it is allowed only when the package had fewer than 300 downloads in the last week, has one owner, and no other public package depends on it. It cannot be undone. When every version of a package is removed, npm blocks new versions of it for 24 hours. Use it only for a version that has a secret inside. The rules: https://docs.npmjs.com/policies/unpublish

## The old package

`@toraline/toraline-ui` is released by the workflow `.github/workflows/npm-publish.yml`, named "Node.js Package". This ticket did not change it.

- It starts when someone creates a **Release** on the GitHub page of the repository. It runs the file `npm-publish.yml` of the commit that the release's tag points to.
- On `main` it runs `npm ci`, `npm test` and `npm publish` at the repository root, with Node 16 and the secret `npm_token`.
- To release the old package: on `main`, raise `version` in `package.json` above the newest version on npm, merge, then create a GitHub Release whose tag is on `main`.
- A GitHub Release whose tag is on `v2` runs the copy of that workflow on `v2`, which works inside `legacy/` and tries to publish the old package from there. That is why step 9 forbids a GitHub Release for version 2.

Found on 2026-11-15, not changed: npm has `@toraline/toraline-ui` 1.1.5, published on 2023-04-27. `package.json` on `main` (and `legacy/package.json` on `v2`) says 0.1.35, which is already on npm. The branch `v1` says 1.1.5. So a release from `main` as it is today fails, because 0.1.35 exists. `gh release list` showed no GitHub Release in the repository.

## Status

**Done**
- The packages build into tarballs that a new Next.js 16.4.6 app installs and renders (checked on 2026-11-15, see `docs/decisions.md`).
- `make pack`, `make version`, the guard on `npm publish`, the workflow file, `CHANGELOG.md` with the section `2.0.0-beta.0`.

**Not done**
- Nothing is published. The names `@toraline.tech/ui` and `@toraline.tech/tokens` are still free on npm.
- The workflow "Release version 2" has never run.
- The packages have no license.

**What you must do**
1. Choose a license, or decide to publish with none.
2. Do the [One-time setup](#one-time-setup).
3. Merge the branch of TOR-999 into `v2`.
4. Do steps 7 to 10 of [Steps of a release](#steps-of-a-release) for `2.0.0-beta.0`.
