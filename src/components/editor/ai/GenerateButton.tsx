import { Button } from "@/components/ui/button";
import { useElementStore } from "@/globalstore/elementstore";
import { EditorElement } from "@/types/global.type";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import React from "react";
import { z } from "zod";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { GetAIUrl } from "@/lib/utils/geturl";

export default function GenerateButton() {
    const { addElement } = useElementStore();
    const { object, submit, isLoading, stop } = useObject({
        api: GetAIUrl(API_ENDPOINTS.AI.GENERATE_CONTENT),
        schema: z.unknown(),
    });

    // Use useEffect to add the generated element when object changes
    const addedIds = React.useRef<Set<string>>(new Set());

    React.useEffect(() => {
        if (object && Array.isArray(object) && !isLoading) {
            for (const element of object as EditorElement[]) {
                if (
                    element &&
                    element.id &&
                    !addedIds.current.has(element.id)
                ) {
                    addElement(element);
                    addedIds.current.add(element.id);
                }
            }
        }
    }, [object, isLoading, addElement]);

    const handleGenerate = () => {
        try {
            submit({
                prompt: "Generate a landing page",
                elements: [],
            });
        } catch (error) {
            // Optionally handle error here
            console.error("AI generation failed:", error);
        }
    };

    return (
        <Button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleGenerate}
            disabled={isLoading}
        >
            {isLoading ? "Generating..." : "Generate AI Content"}
        </Button>
    );
}
