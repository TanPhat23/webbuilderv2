import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function MarketplaceHero() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { search?: string };
  const [searchQuery, setSearchQuery] = useState(search.search || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/marketplace",
      search: searchQuery.trim() ? { search: searchQuery.trim() } : {},
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    navigate({ to: "/marketplace", search: {} });
  };

  return (
    <section className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Template Marketplace</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Discover and download professionally designed templates for your projects.
        </p>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleClearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </form>
      </div>
    </section>
  );
}