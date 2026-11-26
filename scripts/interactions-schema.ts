import { mkdirSync, writeFileSync } from "node:fs";
import { buildJsonSchema } from "../apps/editor/src/features/interactions/schema-json";

mkdirSync("apps/editor/public", { recursive: true });
writeFileSync(
  "apps/editor/public/interactions.schema.json",
  JSON.stringify(buildJsonSchema(), null, 2) + "\n",
);
console.log("wrote apps/editor/public/interactions.schema.json");
