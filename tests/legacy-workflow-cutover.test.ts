import { test } from "node:test";
import assert from "node:assert/strict";
import { unmigratedConnections } from "../src/features/eventworkflows/utils/migrationCutover";

test("only migrated legacy links are suppressed", () => {
 const links = [{id:"a",workflowId:"w"},{id:"b",workflowId:"w"},{id:"c",workflowId:"x"}];
 assert.deepEqual(unmigratedConnections(links, {migratedWorkflowLinks:{a:true,b:false}}).map(x=>x.id),["b","c"]);
 assert.deepEqual(unmigratedConnections(links, null), links);
 assert.deepEqual(unmigratedConnections(links, {migratedWorkflowLinks:["a"]}), links);
});

test("migration markers are not exported as DOM attributes", async () => {
 const { codeGenerator } = await import("../src/features/editor/lib/code/generator");
 const elements = [{id:"e",type:"Input",settings:{migratedWorkflowLinks:{a:true},placeholder:"name"}}] as never;
 const code = await codeGenerator.generateToJSX(elements);
 assert.doesNotMatch(code,/migratedWorkflowLinks/);
 assert.match(code,/placeholder="name"/);
});
