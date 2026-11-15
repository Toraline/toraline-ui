# Validate comments: reference

Used by `SKILL.md` in this folder. `<owner>`, `<repo>` and `<number>` identify the pull request; get the first two with `gh repo view --json owner,name`.

## Commands for the three comment sources

Review threads (comments tied to a line of code), with their resolved state:

```bash
gh api graphql -F owner=<owner> -F repo=<repo> -F number=<number> -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          isResolved isOutdated path line
          comments(first: 50) { nodes { author { login } body createdAt url } }
        }
      }
    }
  }
}'
```

Review bodies (the text at the top of a review):

```bash
gh api "repos/<owner>/<repo>/pulls/<number>/reviews" --paginate \
  --jq '.[] | select(.body != "") | {login: .user.login, type: .user.type, state, body, submitted_at, html_url}'
```

Timeline comments (general comments, not tied to code). GitHub's API serves them under the path `issues`:

```bash
gh api "repos/<owner>/<repo>/issues/<number>/comments" --paginate \
  --jq '.[] | {login: .user.login, type: .user.type, body, created_at, html_url}'
```

An author is an automatic tool when `type` is `Bot` or the login ends with `[bot]`.

Current content of one file on the pull request's branch:

```bash
gh api "repos/<owner>/<repo>/contents/<path>?ref=<head-branch>" --jq '.content' | base64 -d
```

## Structure of `comments-v<n>.md`

```markdown
# Pull request #<number>, <title>: open comments, checked

- **Ticket:** <PREFIX>-<n>, <Linear URL>
- **Pull request:** <URL> (author: <login>)
- **Merges into:** `<base>` | **Branch:** `<head>` | **Commit checked:** `<short hash>` (<date>)
- **Open comments:** <N> (<n> review threads, <n> review bodies, <n> timeline comments) | **Skipped as resolved:** <n>
- **Checked on:** <YYYY-MM-DD>

## Context you need before reading

One line per term used below: what the thing is in plain words, then its name. Say who each commenter is: a person or an automatic tool.

## What this pull request does

Two to four plain sentences: what a person sees that is new, then what the system does.

## Summary

| # | Who | Where | Verdict | What to do | Size / Risk | Pushed |
|---|---|---|---|---|---|---|

- **Size:** S (under 1 hour), M (half a day), L (more). **Risk** of making the change: Low, Medium, High.
- **Pushed:** `No`, `Yes (<short hash>)`, `Partial`, or `n/a` when there is nothing to push. `/fix-pr` updates this column.

## Comments

### Comment <N>: <verdict>

- **Who:** <login> (person / automatic tool), <date>
- **Where:** `<path>` line <n> on the commit checked, or "review body", or "timeline comment"
- **Author replied:** No / Yes: "<quote>"

**Exact comment**

> The full original text, as written. For a thread, every message in order, with author and date.

**What the comment says:** two or three plain sentences. No code.

**What a person sees:** who does what, what they see on screen, what goes wrong if the comment is right, and whether it happens today.

**What the code does:** plain sentences. File, function and field names only in parentheses, after the plain sentence. State the lines read. If the author gave a reason, say whether it is true in the code.

**Verdict and why:** the verdict, then the evidence in two or three sentences.

**What to do:** Fix now / Follow-up ticket / Dismiss / Answer / Already done, resolve thread. Then the fix, in words.

**Draft reply**

> Two to four plain sentences, ready to paste. For "Wrong" or "Dismiss": what the code does, naming the file once. For "Right": what will change. No code.

## Open questions

One bullet per thing the person must decide.

## Status

- **Done:** <counts per verdict>
- **Not done:** <what was not verified, and why>
- **What you must do:** <the next action, in one line>
```
