#!/usr/bin/env python3
"""
Generate programming/data/json/articles.json by scanning programming/articles/**.html

Usage:
  python3 generate_articles_json.py

Writes a sorted list of {"path": "articles/...", "title": "..."} to
programming/data/json/articles.json so the home page Articles panel can list
all articles, including those without quizzes.
"""
from __future__ import annotations
import json
import os
import re
from typing import List, Dict

ROOT = os.path.dirname(os.path.abspath(__file__))
ARTICLES_DIR = os.path.join(ROOT, 'programming', 'articles')
OUT_FILE = os.path.join(ROOT, 'programming', 'data', 'json', 'articles.json')


def extract_title(path: str) -> str:
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            chunk = f.read(8192)
        m = re.search(r'<title>(.*?)</title>', chunk, flags=re.I | re.S)
        if m:
            return re.sub(r'\s+', ' ', m.group(1).strip())
    except Exception:
        pass
    # Fallback to filename
    return os.path.splitext(os.path.basename(path))[0]


STOP = {
    'the','and','for','with','into','from','your','you','are','about','part','overview','fundamentals','guide','notes','design','api','deep','dive','internals','concepts','principles','mastery','quiz','questions'
}


def make_tags(title: str, relpath: str) -> List[str]:
    base = title.lower()
    toks = re.findall(r'[a-z0-9]+', base)
    toks = [t for t in toks if len(t) >= 3 and t not in STOP]
    # add folder/category hints
    parts = [p for p in relpath.split('/') if p]
    toks += [p for p in parts[:-1] if p not in ('articles',)]
    # de-dup
    seen = set()
    tags: List[str] = []
    for t in toks:
        if t not in seen:
            seen.add(t)
            tags.append(t)
    # ensure at least 6 generic tags
    GENERIC = ['article','reference','cheatsheet','study','notes','guide','practice','revision']
    for g in GENERIC:
        if len(tags) >= 8:
            break
        if g not in seen:
            tags.append(g); seen.add(g)
    return tags[:12]


def collect_articles() -> List[Dict[str, str]]:
    entries: List[Dict[str, str]] = []
    for root, _, files in os.walk(ARTICLES_DIR):
        for name in files:
            if not name.endswith('.html'):
                continue
            full = os.path.join(root, name)
            rel = os.path.relpath(full, os.path.join(ROOT, 'programming'))
            title = extract_title(full)
            tags = make_tags(title, rel)
            entries.append({
                'path': rel.replace('\\', '/'),
                'title': title,
                'tags': tags,
            })
    entries.sort(key=lambda x: (x['title'] or '').lower())
    return entries


def main() -> None:
    entries = collect_articles()
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f'Wrote {len(entries)} articles to {os.path.relpath(OUT_FILE, ROOT)}')


if __name__ == '__main__':
    main()
