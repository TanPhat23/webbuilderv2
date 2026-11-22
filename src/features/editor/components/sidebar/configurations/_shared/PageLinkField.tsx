import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProjectRoutePages } from "@/features/projects/hooks/useProjects";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { ConfigField } from "./ConfigField";

export function PageLinkField({
  id, href, onChange,
}: {
  id: string;
  href: string;
  onChange: (href: string) => void;
}) {
  const { projectId, editor } = useEditorContext();
  const { data: pages } = useProjectRoutePages(projectId);
  const destinations = (pages ?? []).filter((page) => !page.DeletedAt).map((page) => ({
    name: page.Name || "Home",
    href: `?page=${encodeURIComponent(page.Id)}`,
  }));
  if (!destinations.length) return null;
  const selected = destinations.find((destination) => destination.href === href);

  return (
    <ConfigField label="Project page" htmlFor={id} vertical>
      <Select
        value={selected?.href ?? ""}
        onValueChange={onChange}
        disabled={editor.isReadOnly || editor.isLocked}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Choose a page" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {destinations.map((page) => (
              <SelectItem key={page.href} value={page.href}>{page.name}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ConfigField>
  );
}
