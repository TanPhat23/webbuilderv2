import { LayoutTemplate, Plus, Sparkles } from "lucide-react";
import { useAddElement } from "@/features/editor";
import { useEditorContext } from "@/providers/editorprovider";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { customComps } from "@/features/editor/lib/customcomponents/customComponents";

type Template = (typeof customComps)[number];

const TEMPLATE_NAMES = ["Navbar", "Hero", "Features"];

const templates: Template[] = TEMPLATE_NAMES.map((name) =>
  customComps.find((c) => c.name === name),
).filter((c): c is Template => Boolean(c));

const tile =
  "flex w-32 flex-col items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Shown on the canvas when the current page has no elements. */
export default function EmptyPageStarter({
  onAddSection,
}: {
  onAddSection: () => void;
}) {
  const addElement = useAddElement();
  const { pageId } = useEditorContext();

  const insertTemplate = (template: Template) => {
    const element = ElementFactory.getInstance().createElementFromTemplate({
      element: template,
      pageId,
    });
    if (element) addElement(element);
  };

  // Not selectPanel: re-selecting an already open AI panel would collapse it.
  const openAI = () =>
    useEditorChromeStore.setState({ activePanel: "ai", panelOpen: true });

  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-5 p-8 text-center">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Start this page
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a starting block, or drag anything from Insert.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={tile} onClick={onAddSection}>
          <Plus className="h-4 w-4" />
          Blank section
        </button>
        {templates.map((t) => (
          <button
            key={t.name}
            type="button"
            className={tile}
            onClick={() => insertTemplate(t)}
          >
            <LayoutTemplate className="h-4 w-4" />
            {t.name}
          </button>
        ))}
        <button type="button" className={tile} onClick={openAI}>
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </button>
      </div>
    </div>
  );
}
