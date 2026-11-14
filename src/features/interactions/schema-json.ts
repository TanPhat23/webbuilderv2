// src/features/interactions/schema-json.ts
/**
 * The interaction format as JSON Schema, published at
 * /interactions.schema.json for agents and MCP clients. Regenerate with
 * `bun run interactions:schema`; a unit test fails when it is stale.
 */
import { z } from "zod";
import { IX_ID_RE, NAME_RE, InteractionHead, VERBS, VERB_SCHEMAS } from "./schema";
import { VariableSchema } from "./logic";

const STEP_REF = { $ref: "#/$defs/step" };

const toJson = (schema: z.ZodType) => {
  const out = z.toJSONSchema(schema, { io: "input" }) as Record<string, any>;
  delete out.$schema;
  return out;
};

export function buildJsonSchema(): Record<string, unknown> {
  const steps = VERBS.map((verb) => {
    const js = toJson(VERB_SCHEMAS[verb]);
    if (verb === "if") {
      js.properties.then = { type: "array", items: STEP_REF };
      js.properties.else = { type: "array", items: STEP_REF };
    }
    return js;
  });
  const interaction = toJson(InteractionHead);
  interaction.properties.do = { type: "array", items: STEP_REF };
  interaction.allOf = [
    {
      if: { required: ["key"] },
      then: { properties: { on: { enum: ["keydown", "keyup"] } } },
    },
    {
      if: { required: ["once"] },
      then: { properties: { on: { const: "visible" } } },
    },
  ];
  const variable = toJson(VariableSchema);
  variable.allOf = [
    ["string", "string"], ["number", "number"], ["boolean", "boolean"],
    ["object", ["object", "null"]], ["list", "array"],
  ].map(([kind, type]) => ({
    if: { properties: { type: { const: kind } }, required: ["type"] },
    then: { properties: { default: { type } } },
  }));
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "interactions.schema.json",
    title: "Element interactions (settings.interactions)",
    description: "Validating this schema checks document structure. Expression syntax also requires validateInteractionMap.",
    "x-template-validation": {
      validator: "validateInteractionMap",
      module: "src/features/interactions/schema.ts",
      blockingLevels: ["error", "incomplete"],
      description: "Strict agent writes must reject errors and incomplete issues, including malformed {{ ... }} expressions. Editor drafts may allow incomplete issues.",
    },
    type: "object",
    propertyNames: { pattern: IX_ID_RE.source },
    additionalProperties: { $ref: "#/$defs/interaction" },
    $defs: {
      step: { oneOf: steps },
      interaction,
      variable,
      logic: {
        type: "object", additionalProperties: false, required: ["v", "variables", "flows"],
        properties: {
          v: { const: 1 },
          variables: { type: "object", propertyNames: { pattern: NAME_RE.source, not: { enum: ["__proto__", "constructor", "prototype"] } }, additionalProperties: { $ref: "#/$defs/variable" } },
          flows: { type: "object", propertyNames: { pattern: NAME_RE.source }, additionalProperties: {
            type: "object", additionalProperties: false, required: ["do"],
            properties: { do: { type: "array", items: STEP_REF } },
          } },
        },
      },
    },
  };
}
