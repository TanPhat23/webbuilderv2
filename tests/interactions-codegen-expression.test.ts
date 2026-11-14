import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { compileExpression, expressionRuntime } from "../src/features/interactions/codegen/expression";
import { evaluate } from "../src/features/interactions/runtime/expression";

test("compiled expressions match interpreter semantics", () => {
  const scope = { value: "7", num: 7, nested: { x: 2 }, key: "constructor", missing: null, flag: false };
  for (const expression of ["value == num", "value < num", "value + num", "num - value", "nested.x * 3", "nested[key]", "missing.x", "flag && nested.x", "flag ? 1 : nested.x", "!flag", "-value"]) {
    const compiled = compileExpression(expression);
    const javascript = ts.transpile(`${expressionRuntime}\n(${compiled})`, { target: ts.ScriptTarget.ES2022 });
    const result = runInNewContext(javascript, { scope });
    assert.deepEqual(result, evaluate(expression, scope), expression);
  }
});

test("compiler rejects unsupported and dangerous syntax", () => {
  assert.throws(() => compileExpression("nested.constructor"));
  assert.throws(() => compileExpression("alert(1)"));
});
