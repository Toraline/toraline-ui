# Security

How to report a vulnerability in this repository, and what happens after a report.

## Context you need before reading

- **Vulnerability**: a mistake in the code that lets a person read, change or break something that they must not.
- **This repository**: `Toraline/toraline-ui`. It holds the two npm packages `@toraline.tech/ui` (React components) and `@toraline.tech/tokens` (design tokens and themes), their catalog, and the workflows that check and publish them.
- **Private vulnerability reporting**: a form of GitHub. Only the maintainers of the repository can read what you write in it.

## Report a vulnerability

Do not open a public issue or a public pull request for a vulnerability. Everyone can read them.

1. Open https://github.com/Toraline/toraline-ui/security/advisories/new. The same form is on the page of the repository: the tab **Security**, then the button **Report a vulnerability**.
2. Write what you found:
   - the package and its version, for example the output of `npm ls @toraline.tech/ui @toraline.tech/tokens`;
   - the file and the line, or the component and its props;
   - the steps that show the problem;
   - what an attacker could do with it.
3. Press **Submit report**.

Never put a real key, a real password or real personal data into a report. An invented value is enough to show a problem.

When the button **Report a vulnerability** is not on the page, the form is turned off. Then open a public issue with only this sentence: "I want to report a vulnerability privately." Give no detail in that issue. A maintainer turns the form on and answers there.

## What happens next

- One person maintains this repository in their free time. There is no promised answer time.
- The maintainer answers in the report on GitHub, and asks there when something is not clear.
- A fix is published as a new version of both packages on npm, with a line in `CHANGELOG.md`.
- The report is made public after the fix is published, with your name when you want that.

## Which versions get a fix

Only the newest version of `@toraline.tech/ui` and `@toraline.tech/tokens` on npm.

The old package `@toraline/toraline-ui` (the folder `legacy/` and the branch `old-package`) gets no fix.

## What is not in scope

- **An app that uses the library.** Report a problem of such an app to its owner. Report it here only when the cause is in the files of this repository.
- **A package that this repository uses**, for example React or Storybook. Report it to the maintainers of that package. You can still tell us, so that the version here is raised.

## For the maintainers

The form works only when it is turned on: on GitHub, the repository `Toraline/toraline-ui` > **Settings** > **Advanced Security** (on some accounts the page is named **Code security**) > **Private vulnerability reporting** > **Enable**. On 2026-11-16 it was off.
