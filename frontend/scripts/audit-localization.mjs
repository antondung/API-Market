import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
const catalog = JSON.parse(fs.readFileSync("src/i18n/vi.json", "utf8"));
const missing = new Set();
const normalize = (text) => text.replace(/\s+/g, " ").trim();
function visitDirectory(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory() && !["test", "i18n"].includes(entry.name))
      visitDirectory(file);
    else if (file.endsWith(".tsx")) {
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      function visit(node) {
        if (
          ts.isCallExpression(node) &&
          /^(?:t|actions\.text|actions\.recordText)$/.test(
            node.expression.getText(source),
          )
        ) {
          const argument = node.arguments.at(-1);
          if (argument && ts.isStringLiteral(argument)) {
            const key = normalize(argument.text);
            if (/[A-Za-z]/.test(key) && !catalog[key])
              missing.add(`${file}: ${key}`);
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
}
visitDirectory("src");
for (const [key, value] of Object.entries(catalog)) {
  if (!value.trim()) missing.add(`Empty translation: ${key}`);
  if (
    JSON.stringify(key.match(/\{\{\d+\}\}/g)?.sort() || []) !==
    JSON.stringify(value.match(/\{\{\d+\}\}/g)?.sort() || [])
  )
    missing.add(`Interpolation mismatch: ${key}`);
}
if (missing.size) {
  console.error([...missing].join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Translation check passed: ${Object.keys(catalog).length} entries; no missing static labels, empty translations or mismatched variables.`,
  );
