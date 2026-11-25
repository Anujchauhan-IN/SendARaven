#!/usr/bin/env bash
set -euo pipefail

mode="${1:-compatible}"
if [[ "${mode}" != "compatible" && "${mode}" != "exact" ]]; then
  echo "Usage: $0 [compatible|exact]" >&2
  exit 2
fi

local_versions_file="$(mktemp)"
remote_versions_file="$(mktemp)"
history_file="$(mktemp)"
trap 'rm -f "${local_versions_file}" "${remote_versions_file}" "${history_file}"' EXIT

find supabase/migrations -maxdepth 1 -type f -name '*_*.sql' -print \
  | sed -E 's#^.*/([0-9]+)_.*#\1#' \
  | grep -E '^[0-9]{1,20}$' \
  | sort -u > "${local_versions_file}"

if [[ ! -s "${local_versions_file}" ]]; then
  echo "No versioned repository migrations were found." >&2
  exit 1
fi

supabase migration list --remote -o json > "${history_file}"
cat "${history_file}"

node - "${history_file}" "${remote_versions_file}" <<'NODE'
const fs = require('node:fs');
const [historyPath, outputPath] = process.argv.slice(2);
const parsed = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

if (!Array.isArray(parsed?.migrations)) {
  throw new Error('Supabase migration list JSON did not contain a migrations array.');
}

const versions = [];
for (const row of parsed.migrations) {
  if (typeof row?.local !== 'string' || typeof row?.remote !== 'string') {
    throw new Error('Supabase migration list JSON contained an invalid migration row.');
  }
  if (row.remote !== '') {
    if (!/^[0-9]{1,20}$/.test(row.remote)) {
      throw new Error(`Invalid hosted migration version: ${row.remote}`);
    }
    versions.push(row.remote);
  }
}

fs.writeFileSync(outputPath, [...new Set(versions)].sort().join('\n') + (versions.length ? '\n' : ''));
NODE

unknown_remote="$(comm -23 "${remote_versions_file}" "${local_versions_file}")"
if [[ -n "${unknown_remote}" ]]; then
  echo "Hosted migration history contains versions absent from Git:" >&2
  printf '%s\n' "${unknown_remote}" >&2
  exit 1
fi

if [[ "${mode}" == "exact" ]] && ! diff -u "${local_versions_file}" "${remote_versions_file}"; then
  echo "Hosted migration history does not exactly match Git." >&2
  exit 1
fi

echo "Migration history verification passed (${mode})."
