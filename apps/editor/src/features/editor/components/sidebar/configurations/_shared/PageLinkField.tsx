import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProjectRoutePages } from "@/features/projects/hooks/useProjects";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import {
  effectivePageSlug,
  hasDynamicSegments,
  pageRoutePath,
} from "@webbuilder/site-runtime/routing";
import { ConfigField } from "./ConfigField";

function buildDynamicTemplateHref(slug: string): string {
  if (!slug) return "/{{slug}}";
  if (!hasDynamicSegments(slug)) return `/${slug}/{{slug}}`;
  const parts = slug.split("/").map((part) => {
    if (part.startsWith(":") && part.length > 1) {
      return `{{${part.slice(1)}}}`;
    }
    if (part.startsWith("*")) {
      const name = part.length > 1 ? part.slice(1) : "slug";
      return `{{${name}}}`;
    }
    return part;
  });
  return `/${parts.join("/")}`;
}

export function PageLinkField({
  id, href, onChange,
}: {
  id: string;
  href: string;
  onChange: (href: string) => void;
}) {
  const { projectId, editor } = useEditorContext();
  const { data: pages } = useProjectRoutePages(projectId);
  const destinations = (pages ?? []).filter((page) => !page.DeletedAt).map((page) => {
    const slug = effectivePageSlug({ name: page.Name, slug: page.Slug });
    const routePath = pageRoutePath({ name: page.Name, slug: page.Slug });
    const queryHref = `?page=${encodeURIComponent(page.Id)}`;
    const valueHref = page.Type === "dp" ? buildDynamicTemplateHref(slug) : queryHref;
    return {
      name: page.Name || "Home",
      routePath,
      href: valueHref,
      legacyQueryHref: queryHref,
    };
  });
  if (!destinations.length) return null;
  const selected = destinations.find(
    (destination) => destination.href === href || destination.legacyQueryHref === href,
  );

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
              <SelectItem key={page.legacyQueryHref} value={page.href}>
                <span>{page.name}</span>
                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                  {page.routePath}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ConfigField>
  );
}
