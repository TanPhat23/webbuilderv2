import { createFileRoute } from "@tanstack/react-router";
import { codeGenerator } from "@/features/editor/lib/code/generator";

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

          const code = await codeGenerator.generateToJSX(elements);
          return Response.json({ code }, { status: 200 });
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