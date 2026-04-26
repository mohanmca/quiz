#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="/Users/mohannarayanaswamy/git/gohiringtrends/dist"
ZIP_GLOB="hiringtrends-site-*.zip"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${SCRIPT_DIR}/programming/hiringtrends"
ZIP_PATH="${1:-}"

if [[ -z "$ZIP_PATH" ]]; then
  shopt -s nullglob
  zips=("${SOURCE_DIR}"/${ZIP_GLOB})
  shopt -u nullglob

  if (( ${#zips[@]} == 0 )); then
    echo "No ${ZIP_GLOB} files found in ${SOURCE_DIR}" >&2
    exit 1
  fi

  ZIP_PATH="${zips[0]}"
  for candidate in "${zips[@]}"; do
    if [[ "$candidate" -nt "$ZIP_PATH" ]]; then
      ZIP_PATH="$candidate"
    fi
  done
fi

if [[ ! -f "$ZIP_PATH" ]]; then
  echo "Zip file not found: ${ZIP_PATH}" >&2
  exit 1
fi

while IFS= read -r entry; do
  case "$entry" in
    /*|../*|*/../*)
      echo "Refusing unsafe archive entry: ${entry}" >&2
      exit 1
      ;;
  esac
done < <(unzip -Z1 "$ZIP_PATH")

unzip -tq "$ZIP_PATH" >/dev/null

tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/hntrends.XXXXXX")"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

unzip -q "$ZIP_PATH" -d "$tmp_dir"

mkdir -p "$TARGET_DIR"
shopt -s dotglob nullglob
existing=("${TARGET_DIR}"/*)
if (( ${#existing[@]} > 0 )); then
  rm -rf -- "${existing[@]}"
fi

cp -R "$tmp_dir"/. "$TARGET_DIR"/

echo "Updated ${TARGET_DIR} from ${ZIP_PATH}"
