import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

type Violation = {
  file: string;
  line: number;
  column: number;
  text: string;
};

const THIS_FILE = fileURLToPath(import.meta.url);
const FRONTEND_ROOT = path.resolve(path.dirname(THIS_FILE), '..');
const SCAN_TARGETS = [
  path.join(FRONTEND_ROOT, 'App.tsx'),
  path.join(FRONTEND_ROOT, 'components'),
];
const ALLOWED_LITERAL_TEXT = new Set([
  'CloudLanguage',
]);
const USER_FACING_ATTR_NAMES = new Set(['aria-label', 'title', 'placeholder']);

function collectTsxFiles(targetPath: string): string[] {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return targetPath.endsWith('.tsx') ? [targetPath] : [];

  const files: string[] = [];
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsxFiles(fullPath));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.tsx')) continue;
    if (entry.name.endsWith('.test.tsx')) continue;
    files.push(fullPath);
  }
  return files;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function isLikelyUserFacingText(text: string): boolean {
  const normalized = normalizeText(text);
  if (normalized.length < 2) return false;
  if (/^&[a-z]+;$/i.test(normalized)) return false;
  if (/^\/[a-z0-9/_-]+$/i.test(normalized)) return false;
  if (!/\p{L}/u.test(normalized)) return false;
  if (ALLOWED_LITERAL_TEXT.has(normalized)) return false;
  return true;
}

function getStringValue(node: ts.JsxAttribute): string {
  if (!node.initializer) return '';
  if (ts.isStringLiteral(node.initializer)) {
    return normalizeText(node.initializer.text);
  }
  if (
    ts.isJsxExpression(node.initializer)
    && node.initializer.expression
    && ts.isStringLiteral(node.initializer.expression)
  ) {
    return normalizeText(node.initializer.expression.text);
  }
  return '';
}

function scanFile(filePath: string): Violation[] {
  const source = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations: Violation[] = [];

  const pushViolation = (node: ts.Node, rawText: string) => {
    const text = normalizeText(rawText);
    if (!isLikelyUserFacingText(text)) return;
    const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    violations.push({
      file: path.relative(FRONTEND_ROOT, filePath),
      line: pos.line + 1,
      column: pos.character + 1,
      text,
    });
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      pushViolation(node, node.getText(sourceFile));
    }

    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name)) {
      const attributeName = node.name.text;
      if (USER_FACING_ATTR_NAMES.has(attributeName)) {
        const value = getStringValue(node);
        if (value) pushViolation(node, value);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return violations;
}

describe('Locale Guard', () => {
  it('does not allow hardcoded user-facing text outside i18n config', () => {
    const files = SCAN_TARGETS.flatMap(collectTsxFiles);
    const violations = files.flatMap(scanFile);
    if (violations.length > 0) {
      const details = violations
        .map((entry) => `${entry.file}:${entry.line}:${entry.column} -> "${entry.text}"`)
        .join('\n');
      throw new Error(`Found hardcoded user-facing text. Move these strings to appI18n.ts:\n${details}`);
    }
    expect(violations).toHaveLength(0);
  });
});

