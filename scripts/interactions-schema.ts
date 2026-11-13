// scripts/interactions-schema.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { buildJsonSchema } from "../src/features/interactions/schema-json";

mkdirSync("public", { recursive: true });
writeFileSync("public/interactions.schema.json", JSON.stringify(buildJsonSchema(), null, 2) + "\n");
console.log("wrote public/interactions.schema.json");
