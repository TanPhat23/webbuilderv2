// tests/interactions-expression.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  evaluate,
  interpolate,
  parseExpression,
  templateErrors,
  templateRefs,
  ExpressionError,
} from "../src/features/interactions/runtime/expression";

const scope = {
  vars: { count: 2, user: { name: "Ada", tags: ["a", "b"] }, empty: "" },
  steps: { signup: { ok: true, status: 201, data: { id: 7 } } },
  event: { value: "hi" },
};

test("literals, property access and arithmetic", () => {
  assert.equal(evaluate("1 + 2 * 3", scope), 7);
  assert.equal(evaluate("(1 + 2) * 3", scope), 9);
  assert.equal(evaluate("vars.count % 2", scope), 0);
  assert.equal(evaluate("vars.user.name", scope), "Ada");
  assert.equal(evaluate("vars.user.tags[1]", scope), "b");
  assert.equal(evaluate("vars.user['name']", scope), "Ada");
  assert.equal(evaluate("vars.user.tags.length", scope), 2);
  assert.equal(evaluate("'a' + vars.count", scope), "a2");
  assert.equal(evaluate("-vars.count", scope), -2);
});

test("comparison, logic and ternary", () => {
  assert.equal(evaluate("steps.signup.ok && steps.signup.status == 201", scope), true);
  assert.equal(evaluate("vars.empty || 'fallback'", scope), "fallback");
  assert.equal(evaluate("!steps.signup.ok", scope), false);
  assert.equal(evaluate("vars.count > 1 ? 'many' : 'one'", scope), "many");
  assert.equal(evaluate("vars.count >= 3 ? 'a' : vars.count == 2 ? 'b' : 'c'", scope), "b");
  assert.equal(evaluate("vars.count === 2", scope), true);
  assert.equal(evaluate("'2' == 2", scope), false, "equality is strict");
  assert.equal(evaluate("'b' < 'c'", scope), true);
  assert.equal(evaluate("1 < 'c'", scope), false, "mixed types never compare true");
});

test("missing paths are undefined, never throw", () => {
  assert.equal(evaluate("vars.nope.deeper", scope), undefined);
  assert.equal(evaluate("nothing", scope), undefined);
  assert.equal(evaluate("vars.user.toString", scope), undefined, "no prototype members");
});

test("interpolate keeps the type of a whole expression and stringifies mixed text", () => {
  assert.deepEqual(interpolate("{{ steps.signup.data }}", scope), { id: 7 });
  assert.equal(interpolate("  {{ vars.count }} ", scope), 2);
  assert.equal(interpolate("Hi {{ vars.user.name }}, you have {{ vars.count }}", scope), "Hi Ada, you have 2");
  assert.equal(interpolate("{{ vars.user }}!", scope), '{"name":"Ada","tags":["a","b"]}!');
  assert.equal(interpolate("{{ a }} and {{ b }}", {}), " and ");
  assert.equal(interpolate("no braces", scope), "no braces");
});

test("hostile input is rejected, not executed", () => {
  assert.throws(() => parseExpression("constructor.constructor('x')()"), ExpressionError);
  assert.throws(() => parseExpression("vars.__proto__"), ExpressionError);
  assert.throws(() => parseExpression("vars['constructor']"), ExpressionError);
  assert.throws(() => parseExpression("vars.prototype"), ExpressionError);
  assert.throws(() => parseExpression("alert(1)"), /function calls are not supported/);
  assert.throws(() => parseExpression("x = 1"), ExpressionError);
  assert.throws(() => parseExpression("(".repeat(5000) + "1" + ")".repeat(5000)), ExpressionError);
  assert.throws(() => parseExpression("'" + "a".repeat(10_000) + "'"), /longer than 2000/);
  // A computed key that only resolves to a blocked name at runtime is undefined.
  assert.equal(evaluate("vars[event.value]", { vars: {}, event: { value: "__proto__" } }), undefined);
});

test("syntax errors carry a readable message", () => {
  assert.throws(() => parseExpression("1 +"), /unexpected end of expression/);
  assert.throws(() => parseExpression("'open"), /unterminated string/);
  assert.throws(() => parseExpression("a ? b"), /expected ":"/);
  assert.throws(() => parseExpression("a b"), /unexpected "b"/);
});

test("templateErrors reports each bad expression and unclosed braces", () => {
  assert.deepEqual(templateErrors("fine {{ a.b }}"), []);
  assert.equal(templateErrors("{{ 1 + }}").length, 1);
  assert.match(templateErrors("hello {{ vars.")[0], /unclosed \{\{/);
  assert.equal(templateErrors("{{}}").length, 1);
});

test("templateRefs lists member chains rooted at identifiers", () => {
  assert.deepEqual(
    templateRefs("{{ steps.signup.ok && vars.user.tags[0] }} {{ el.abc.value }}"),
    [["steps", "signup", "ok"], ["vars", "user", "tags", "0"], ["el", "abc", "value"]],
  );
  assert.deepEqual(templateRefs("{{ vars[event.value] }}"), [["vars"], ["event", "value"]]);
  assert.deepEqual(templateRefs("{{ broken + }}"), []);
});
