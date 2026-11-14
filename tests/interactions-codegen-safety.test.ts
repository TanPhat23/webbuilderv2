// /api/generate-code turns user-controlled element settings into source code.
// Every reproduced injection must be rejected by validation, and toCode must
// stay inert even if validation is bypassed.
import assert from "node:assert/strict";
import { test } from "node:test";
import path from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { toCode, type CodegenElement, type CodegenInput } from "../src/features/interactions/codegen/interactions";
import { codegenRequestErrors } from "../src/features/interactions/codegen/validate";

const LS = " ";
const PS = " ";
const el = (interactions: Record<string, unknown>, extra: Partial<CodegenElement> = {}): CodegenElement => ({ id: "el_btn", name: "Btn", settings: { interactions }, ...extra });

const payloads: Record<string, CodegenElement> = {
  "toast kind": el({ ix_aaaaaaaa: { on: "click", do: [{ toast: "hi", kind: "info(1);alert(2);toast.info" }] } }),
  "event name escaping the header comment": el({ ix_aaaaaaaa: { on: "click */ alert(1); /*", do: [{ toast: "hi" }] } }),
  "U+2028 in an interaction id": el({ [`ix_aaaaaaaa${LS}alert(1)${LS}`]: { on: "click", do: [{ set: "missing", to: "1" }] } }),
  "U+2029 in a variable name": el({ ix_aaaaaaaa: { on: "click", do: [{ set: `x${PS}alert(1)${PS}`, to: "1" }] } }),
  "U+2028 in a flow name": el({ ix_aaaaaaaa: { on: "click", do: [{ run: `f${LS}alert(1)${LS}` }] } }),
  "U+2028 in an element name and id": el({ ix_aaaaaaaa: { on: "click", do: [{ toast: "hi" }] } }, { id: `el_btn${LS}alert(1)//`, name: `Btn${LS}alert(1)//` }),
};

/** Names of every function called anywhere in the generated module. */
function calledNames(code: string): Set<string> {
  const file = ts.createSourceFile("interactions.ts", code, ts.ScriptTarget.ES2022, true);
  const names = new Set<string>();
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) names.add(node.expression.getText(file));
    ts.forEachChild(node, visit);
  };
  visit(file);
  return names;
}

/** Loads the module in the fake DOM, fires every listener and records `alert` calls. */
async function runAndFire(code: string): Promise<string[]> {
  const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const alerts: string[] = [];
  const listeners: Array<(e: unknown) => void> = [];
  const nodes = ["el_btn", `el_btn${LS}alert(1)//`].map((id) => ({
    dataset: { elementId: id }, style: {}, setAttribute() {}, removeEventListener() {},
    addEventListener: (_t: string, f: (e: unknown) => void) => void listeners.push(f),
  }));
  const toast = new Proxy({}, { get: () => () => {} });
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require: () => ({ toast }),
    alert: (m: unknown) => void alerts.push(String(m)),
    info: (m: unknown) => void alerts.push(`info ${m}`),
    document: { querySelectorAll: () => nodes },
    window: { location: { href: "https://x.test/" } },
    HTMLFormElement: class {}, FormData: class {}, IntersectionObserver: class { observe() {} disconnect() {} },
    console: { ...console, error() {} }, setTimeout, clearTimeout, Object, JSON, Promise, Number, String, Boolean, Set, Map, Proxy, Error,
  };
  runInNewContext(js, sandbox);
  (sandbox.exports as { bindInteractions(): void }).bindInteractions();
  for (const f of listeners) f({ target: { tagName: "DIV", closest: () => null }, type: "click", preventDefault() {}, stopPropagation() {} });
  await new Promise((r) => setTimeout(r, 20));
  return alerts;
}

// Element names and ids are ordinary element data; only the generator's comment helper guards them.
const elementData = new Set(["U+2028 in an element name and id"]);

for (const [name, element] of Object.entries(payloads)) {
  if (!elementData.has(name)) test(`generate-code rejects the ${name} payload`, () => {
    const errors = codegenRequestErrors([element]);
    assert.ok(errors.length > 0, "expected a validation error");
    assert.ok(errors.every((i) => i.level === "error"));
  });

  test(`toCode keeps the ${name} payload inert`, async () => {
    const input: CodegenInput = { elements: [element], variables: { count: { type: "number", default: 0 } }, flows: { f: { do: [] } } };
    const code = toCode(input);
    const commentLines = code.split("\n").filter((l) => { const t = l.trimStart(); return t.startsWith("//") || t.startsWith("/**") || t.startsWith("*"); });
    assert.ok(commentLines.every((l) => !l.includes(LS) && !l.includes(PS)), "no line separators inside comments");
    const called = calledNames(code);
    assert.ok(!called.has("alert") && !called.has("info"), `unexpected calls: ${[...called].join(", ")}`);
    assert.deepEqual(await runAndFire(code), []);
  });
}

test("generate-code rejects malformed interactions in nested elements but not incomplete ones", () => {
  const nested = (interactions: unknown): unknown[] => [{ id: "root", settings: {}, elements: [{ id: "child", settings: { interactions } }] }];
  assert.ok(codegenRequestErrors(nested({ ix_aaaaaaaa: { on: "click", do: [{ show: 5 }] } })).length > 0);
  assert.deepEqual(codegenRequestErrors(nested({ ix_aaaaaaaa: { on: "click", do: [{ show: "" }, { toast: "{{ vars.count + }}" }] } })), []);
  assert.ok(codegenRequestErrors(nested("nope")).length > 0);
});

test("generate-code accepts incomplete logic and rejects malformed logic", () => {
  assert.deepEqual(codegenRequestErrors([], { variables: {}, flows: { draft: { do: [{ show: "" }] } } }), []);
  assert.ok(codegenRequestErrors([], { variables: { n: { type: "number", default: "x" } }, flows: {} }).length > 0);
});

test("incomplete steps generate code that type-checks and is skipped", async () => {
  const input: CodegenInput = {
    elements: [el({ ix_aaaaaaaa: { on: "click", do: [{ show: "" }, { animate: "el_btn" }, { if: "x" }, { toast: "x", kind: "" }, { toast: "{{ vars.count + }}" }] }, ix_bbbbbbbb: { do: [] } })],
    variables: { count: { type: "number", default: 0 } },
    flows: { draft: { do: [{ set: "", to: "" }, { call: "api", method: "GET", url: "" }] } },
  };
  const code = toCode(input);
  assert.match(code, /incomplete animate step, skipped/);
  assert.deepEqual(diagnose(code), []);
  assert.deepEqual(await runAndFire(code), []);
});

function diagnose(code: string): string[] {
  const file = path.resolve("tests/__generated__/interactions.ts");
  const options: ts.CompilerOptions = {
    strict: true, noUnusedLocals: true, noUnusedParameters: true, noEmit: true, skipLibCheck: true,
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"], types: [],
  };
  const host = ts.createCompilerHost(options);
  const { getSourceFile, fileExists, readFile } = host;
  host.getSourceFile = (name, ...rest) => (name === file ? ts.createSourceFile(name, code, options.target!) : getSourceFile(name, ...rest));
  host.fileExists = (name) => name === file || fileExists(name);
  host.readFile = (name) => (name === file ? code : readFile(name));
  return ts.getPreEmitDiagnostics(ts.createProgram([file], options, host)).map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "));
}
