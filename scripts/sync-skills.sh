#!/usr/bin/env bash
# Copies the core (rules, scripts, skill template, skills of the packs that are on)
# from the boilerplate into a project, and records the version.
#
#   From a project:          make sync-skills
#   First time in a project: bash /path/to/monorepo-boilerplate/scripts/sync-skills.sh /path/to/project
#
# Never touches the project's AGENTS.md, Makefile or its project-only skills.
set -euo pipefail

src="${BOILERPLATE_DIR:-$HOME/code/repos/monorepo-boilerplate}"
dest="${1:-$(git rev-parse --show-toplevel)}"
src="$(cd "$src" && pwd)"; dest="$(cd "$dest" && pwd)"
[ -f "$src/agent/CORE_VERSION" ] || { echo "Boilerplate not found in $src. Set BOILERPLATE_DIR." >&2; exit 1; }

if [ "$src" = "$dest" ]; then
  echo "This is the boilerplate itself; nothing to copy."
  (cd "$dest" && bash scripts/skills-catalog.sh)
  exit 0
fi

cd "$dest"
mkdir -p agent/rules agent/skills agent/templates scripts .githooks docs/workflow

# Entry files, only when the project has none.
if [ ! -f AGENTS.md ]; then cp "$src/agent/templates/AGENTS.md" AGENTS.md; echo "created AGENTS.md from the template: fill the project profile"; fi
[ -f CLAUDE.md ] || printf '@AGENTS.md\n' > CLAUDE.md

# Rules, templates, scripts.
cp "$src"/agent/rules/*.md agent/rules/
cp -R "$src"/agent/templates/. agent/templates/
cp "$src/agent/core.mk" agent/core.mk
for s in profile.sh worktree.sh guard-main-checkout.sh check-secrets.sh init-local-docs.sh skills-catalog.sh sync-skills.sh doctor.sh; do
  cp "$src/scripts/$s" "scripts/$s"; chmod +x "scripts/$s"
done
cp "$src/.githooks/pre-commit" .githooks/pre-commit; chmod +x .githooks/pre-commit

# Workflow documents and tool configuration: copied only when the project has none.
for f in docs/workflow/working-pattern.md docs/workflow/sources-of-truth.md docs/workflow/status-skills.md .mcp.json .cursor/mcp.json .claude/settings.json; do
  if [ ! -e "$f" ]; then mkdir -p "$(dirname "$f")"; cp "$src/$f" "$f"; echo "created $f"; fi
done

# Skills of the packs that are on in this project's profile.
packs="$(bash scripts/profile.sh get packs core)"
list="agent/.synced-skills"; new_list="$(mktemp)"
for dir in "$src"/agent/skills/*/; do
  name="$(basename "$dir")"; file="$dir/SKILL.md"
  [ -f "$file" ] || continue
  pack="$(awk '/^[ \t]*pack: /{sub(/^[ \t]*pack:[ \t]*/, ""); print; exit}' "$file")"
  case ",${packs// /}," in *",$pack,"*) ;; *) continue ;; esac
  rm -rf "agent/skills/$name"; cp -R "$dir" "agent/skills/$name"
  echo "$name" >> "$new_list"
done
# A skill that was synced before and no longer comes from the boilerplate is removed.
if [ -f "$list" ]; then
  while IFS= read -r old; do
    grep -qx "$old" "$new_list" || { rm -rf "agent/skills/$old"; echo "removed $old (no longer in the core or its pack is off)"; }
  done < "$list"
fi
sort "$new_list" > "$list"; rm -f "$new_list"

# One skills folder, read by both tools.
for tool in .claude .cursor; do
  mkdir -p "$tool"
  if [ -L "$tool/skills" ]; then :
  elif [ -e "$tool/skills" ]; then echo "WARNING: $tool/skills is a real folder. Move its skills into agent/skills/, delete it, and run this again."
  else ln -s ../agent/skills "$tool/skills"; echo "linked $tool/skills -> agent/skills"
  fi
done

cp "$src/agent/CORE_VERSION" agent/CORE_VERSION
grep -q 'agent/core.mk' Makefile 2>/dev/null || echo "NOTE: add this line to the project's Makefile: -include agent/core.mk"
grep -qx 'local-docs/' .gitignore 2>/dev/null || echo "NOTE: add this line to .gitignore: local-docs/"
bash scripts/skills-catalog.sh
echo "Synced core $(cat agent/CORE_VERSION) into $dest ($(wc -l < "$list" | tr -d ' ') skills; packs: $packs)"
