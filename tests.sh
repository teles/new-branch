#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(pwd)
echo "Running repository-wide CLI config tests in: $ROOT_DIR"

# --- Preserve NVM_DIR before sandboxing HOME ---
if [ -z "${NVM_DIR:-}" ]; then
  export NVM_DIR="$HOME/.nvm"
fi

# --- Sandbox git global config so we never touch the real user config ---
SANDBOX_HOME=$(mktemp -d)
export HOME="$SANDBOX_HOME"
export GIT_CONFIG_GLOBAL="$SANDBOX_HOME/.gitconfig"

# Source nvm so bash -lc subshells get the right Node version
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm use 2>/dev/null || true
fi

# Capture the correct PATH with nvm's node so subshells inherit it
export PATH

# Prepare machine-readable results (ndjson -> later converted to JSON array)
rm -f tests_results.ndjson tests_results.json
touch tests_results.ndjson
FAILS=0

run_cmd() {
  local title="$1"
  local cmd="$2"
  local expect_exit="${3:-0}"
  local expect_contains="${4:-}"

  echo
  echo "===== $title ====="
  echo "$ $cmd"

  local out
  out=$(mktemp)

  set +e
  bash -c "$cmd" >"$out" 2>&1
  local rc=$?
  set -e

  echo "--- exit: $rc"
  sed 's/^/    /' "$out" || true

  # Expectations
  if [[ "$rc" -ne "$expect_exit" ]]; then
    echo "❌ EXPECTATION FAILED: expected exit=$expect_exit, got exit=$rc"
    FAILS=$((FAILS+1))
  fi

  if [[ -n "$expect_contains" ]]; then
    if ! grep -Fq "$expect_contains" "$out"; then
      echo "❌ EXPECTATION FAILED: output does not contain: $expect_contains"
      FAILS=$((FAILS+1))
    fi
  fi

  # Append NDJSON record for machine parsing later.
  node -e '
const fs=require("fs");
const title=process.argv[1];
const rc=Number(process.argv[2]);
const path=process.argv[3];
const out=fs.readFileSync(path,"utf8");
fs.appendFileSync("tests_results.ndjson", JSON.stringify({scenario:title, exit:rc, output: out})+"\n");
' "$title" "$rc" "$out"

  rm -f "$out"
}

backup_file() {
  local f="$1"
  if [ -f "$f" ]; then
    cp -- "$f" "$f.bak"
  else
    echo "__NB_MISSING__" >"$f.bak"
  fi
}

restore_file() {
  local f="$1"
  if [ -f "$f.bak" ]; then
    if grep -q "__NB_MISSING__" "$f.bak" 2>/dev/null; then
      rm -f "$f"
      rm -f "$f.bak"
    else
      mv -f "$f.bak" "$f"
    fi
  fi
}

remove_new_branch_from_package_json() {
  node -e '
const fs=require("fs");
const p=JSON.parse(fs.readFileSync("package.json","utf8"));
delete p["new-branch"];
fs.writeFileSync("package.json", JSON.stringify(p,null,2));
'
}

# Save ALL values for a key (supports multi-valued git config via --add)
save_git_key() {
  local scope="$1" key="$2" outfile="$3"
  if git config --$scope --get-all "$key" >/dev/null 2>&1; then
    git config --$scope --get-all "$key" >"$outfile"
  else
    echo "__NB_UNSET__" >"$outfile"
  fi
}

# Restore a key exactly as it was (handles multi-valued keys)
restore_git_key() {
  local scope="$1" key="$2" infile="$3"
  if [ -f "$infile" ]; then
    if grep -q "__NB_UNSET__" "$infile" 2>/dev/null; then
      git config --$scope --unset-all "$key" || true
    else
      # Clear everything first, then re-add each saved line
      git config --$scope --unset-all "$key" || true
      while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        git config --$scope --add "$key" "$line"
      done < "$infile"
    fi
    rm -f "$infile"
  fi
}

echo "Backing up package.json and .newbranchrc.json"
backup_file package.json
backup_file .newbranchrc.json

# Backup local git config keys
save_git_key local new-branch.pattern /tmp/nb_local_pattern
save_git_key local new-branch.types /tmp/nb_local_types
save_git_key local new-branch.defaultType /tmp/nb_local_default

echo "
=== Scenario 1: package.json config only (no .newbranchrc.json, no git configs) ==="

# Inject new-branch config into package.json (preserve other fields)
node -e 'const fs=require("fs");const p=JSON.parse(fs.readFileSync("package.json","utf8"));p["new-branch"]={pattern:"pkg-{type}/{id}-{title:slugify}",types:[{value:"pkg",label:"PKG"}],defaultType:"pkg"};fs.writeFileSync("package.json",JSON.stringify(p,null,2));'

# Ensure .newbranchrc.json absent for this scenario
rm -f .newbranchrc.json

run_cmd "package.json only" "pnpm dev -- --id 123 --title 'hello world' --no-prompt" 0 "pkg-pkg/123-hello-world"

echo "
=== Scenario 2: .newbranchrc.json present (overrides package.json) ==="

cat >.newbranchrc.json <<'JSON'
{
  "pattern": "rc-{type}/{id}-{title:slugify}",
  "types": [{ "value": "rc", "label": "RC" }],
  "defaultType": "rc"
}
JSON

run_cmd ".newbranchrc.json overrides" "pnpm dev -- --id 124 --title 'hello world2' --no-prompt" 0 "rc-rc/124-hello-world2"

echo "
=== Scenario 3: local git config (repo-local) ==="

# Remove .newbranchrc.json so git/local can be used
rm -f .newbranchrc.json
remove_new_branch_from_package_json

git config --local --unset-all new-branch.pattern || true
git config --local --unset-all new-branch.types || true
git config --local new-branch.pattern "local-{type}/{id}-{title:slugify}"
git config --local --add new-branch.types "local:Local"

run_cmd "git local config" "pnpm dev -- --id 125 --title 'hello world3' --no-prompt" 0 "local-local/125-hello-world3"

# Clean local git keys
git config --local --unset-all new-branch.pattern || true
git config --local --unset-all new-branch.types || true

echo "
=== Scenario 4: global git config ==="

# Remove any local keys to ensure global is used
git config --local --unset-all new-branch.pattern || true
git config --local --unset-all new-branch.types || true
remove_new_branch_from_package_json

git config --global --unset-all new-branch.pattern || true
git config --global --unset-all new-branch.types || true
git config --global new-branch.pattern "global-{type}/{id}-{title:slugify}"
git config --global --add new-branch.types "global:Global"

run_cmd "git global config" "pnpm dev -- --id 126 --title 'hello world4' --no-prompt" 0 "global-global/126-hello-world4"


echo "
=== Scenario 5: CLI --pattern overrides everything ==="

run_cmd "cli pattern override" "pnpm dev -- --pattern 'cli-{id}' --id 999 --no-prompt" 0 "cli-999"


echo "
=== Scenario 6: --no-prompt fails when required value missing ==="

run_cmd "no-prompt missing id" "pnpm dev -- --pattern '{type}/{id}' --no-prompt" 1 'Missing required value: "id"'

echo "
=== Scenario 7: transform — replace (first occurrence) ==="

run_cmd "replace first occurrence" "pnpm dev -- --pattern '{title:replace:foo:bar}' --title 'foo-baz-foo' --no-prompt" 0 "bar-baz-foo"

echo "
=== Scenario 8: transform — replaceAll (all occurrences) ==="

run_cmd "replaceAll all occurrences" "pnpm dev -- --pattern '{title:replaceAll:foo:bar}' --title 'foo-baz-foo' --no-prompt" 0 "bar-baz-bar"

echo "
=== Scenario 9: transform — remove (all occurrences) ==="

run_cmd "remove substring" "pnpm dev -- --pattern '{title:remove:temp}' --title 'my-temp-branch-temp' --no-prompt" 0 "my--branch-"

echo "
=== Scenario 10: transform — stripAccents ==="

run_cmd "stripAccents diacritics" "pnpm dev -- --pattern '{title:stripAccents;slugify}' --title 'José café' --no-prompt" 0 "jose-cafe"

echo "
=== Scenario 11: transform — ifEmpty (fallback when empty) ==="

run_cmd "ifEmpty uses fallback" "pnpm dev -- --pattern '{title:remove:all;ifEmpty:no-title}' --title 'all' --no-prompt" 0 "no-title"

run_cmd "ifEmpty keeps value" "pnpm dev -- --pattern '{title:ifEmpty:no-title}' --title 'hello' --no-prompt" 0 "hello"

echo "
=== Scenario 12: transform — before (prefix if not empty) ==="

run_cmd "before adds prefix" "pnpm dev -- --pattern '{title:before:hotfix-}' --title 'fix-123' --no-prompt" 0 "hotfix-fix-123"

run_cmd "before skips empty" "pnpm dev -- --pattern '{title:remove:all;before:hotfix-}' --title 'all' --no-prompt" 1 "Invalid git branch name"

echo "
=== Scenario 13: transform — after (suffix if not empty) ==="

run_cmd "after adds suffix" "pnpm dev -- --pattern '{title:after:-wip}' --title 'feature' --no-prompt" 0 "feature-wip"

run_cmd "after skips empty" "pnpm dev -- --pattern '{title:remove:all;after:-wip}' --title 'all' --no-prompt" 1 "Invalid git branch name"

echo "
=== Scenario 14: --list-transforms ==="

run_cmd "list-transforms shows table" "pnpm dev -- --list-transforms" 0 "Available transforms"

echo "
=== Scenario 15: --print-config ==="

# With a config file present, prints source and pattern
echo '{"pattern":"{type}/{title}"}' > .newbranchrc.json
run_cmd "print-config shows source" "pnpm dev -- --print-config" 0 ".newbranchrc.json"
restore_file .newbranchrc.json

echo "
=== Scenario 16: --explain ==="

run_cmd "explain shows pipeline breakdown" "pnpm dev -- --explain --pattern '{type}/{title:slugify}' --type feat --title 'Hello World' --no-prompt" 0 "Pipeline"

echo "
=== Cleanup: restore package.json, .newbranchrc.json and git configs ==="

# Restore git configs (local only)
restore_git_key local new-branch.pattern /tmp/nb_local_pattern
restore_git_key local new-branch.types /tmp/nb_local_types
restore_git_key local new-branch.defaultType /tmp/nb_local_default

# Restore files
restore_file .newbranchrc.json
restore_file package.json

# Cleanup sandbox
rm -rf "$SANDBOX_HOME"

echo "Done. Review outputs above."

# Convert NDJSON to a single JSON file for easy copy/paste
if [ -f tests_results.ndjson ]; then
  node -e 'const fs=require("fs");const p="tests_results.ndjson";const out="tests_results.json";const content=fs.readFileSync(p,"utf8");const lines=content.split("\n").filter(Boolean);const arr=lines.map(JSON.parse);fs.writeFileSync(out,JSON.stringify(arr,null,2));console.log("Wrote "+out);';
  rm -f tests_results.ndjson
else
  echo "No results file produced"
fi

echo
if [[ "$FAILS" -gt 0 ]]; then
  echo "❌ FAILURES: $FAILS"
  exit 1
fi

echo "✅ All scenarios passed"
exit 0
