import { createFileRoute } from "@tanstack/react-router";
import { codeGenerator, type InteractionLogic } from "@/features/editor/lib/code/generator";
import { codegenRequestErrors } from "@/features/interactions/codegen/validate";

export const Route = createFileRoute("/api/generate-code")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const elements = body?.elements;

          if (!Array.isArray(elements)) {
            return Response.json(
              { error: "Invalid payload: `elements` must be an array." },
              { status: 400 },
            );
          }

          if (elements.length > 5000) {
            return Response.json(
              { error: "Payload too large" },
              { status: 413 },
            );
          }

          // Interactions and the optional logic become source code: refuse
          // anything malformed. Incomplete (draft) steps are allowed and skipped.
          const issues = codegenRequestErrors(elements, body?.logic);
          if (issues.length) {
            return Response.json(
              { error: "Invalid interactions or logic.", issues },
              { status: 400 },
            );
          }
          // Optional: the variables and flows the elements' interactions use.
          let logic: InteractionLogic | undefined;
          if (body?.logic !== undefined && body.logic !== null) {
            logic = { variables: body.logic.variables ?? {}, flows: body.logic.flows ?? {} };
          }

          const code = await codeGenerator.generateToJSX(elements, logic);
          const interactions = codeGenerator.generateInteractions(elements, logic);
          return Response.json({ code, interactions }, { status: 200 });
        } catch (err) {
          console.error("Server code generation failed:", err);
          return Response.json(
            { error: "Code generation failed on the server." },
            { status: 500 },
          );
        }
      },
    },
  },
});