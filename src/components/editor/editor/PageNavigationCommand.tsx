import React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FileText } from "lucide-react";
import { usePageStore } from "@/globalstore/pagestore";

interface PageNavigationCommandProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PageNavigationCommand({
  setOpen,
  open,
}: PageNavigationCommandProps) {
  const { pages, setCurrentPage, currentPage } = usePageStore();

  const handleSelect = (page: any) => {
    setCurrentPage(page);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search pages..." />
      <CommandList>
        <CommandEmpty>No pages found.</CommandEmpty>
        <CommandGroup heading="Project Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.Id}
              value={page.Name}
              onSelect={() => handleSelect(page)}
              className={`flex items-center gap-3 ${
                currentPage?.Id === page.Id ? "bg-muted" : ""
              }`}
            >
              <FileText className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">{page.Name}</span>
                <span className="text-xs text-muted-foreground">
                  {page.Type} page
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
