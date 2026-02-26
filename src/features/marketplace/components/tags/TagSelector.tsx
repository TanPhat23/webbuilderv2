"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X, Search } from "lucide-react";
import { Tag } from "@/features/marketplace";

interface TagSelectorProps {
  selectedExistingTags: string[];
  onToggleExistingTag: (tagName: string) => void;
  customTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  existingTags?: Tag[];
  isTagsLoading: boolean;
}

export function TagSelector({
  selectedExistingTags,
  onToggleExistingTag,
  customTags,
  onAddTag,
  onRemoveTag,
  existingTags,
  isTagsLoading,
}: TagSelectorProps) {
  const [tagInput, setTagInput] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const filteredExistingTags = useMemo(() => {
    if (!existingTags) return [];
    if (!tagSearch.trim()) return existingTags;
    return existingTags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
    );
  }, [existingTags, tagSearch]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !customTags.includes(trimmedTag)) {
      if (customTags.length < 10) {
        onAddTag(trimmedTag);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onRemoveTag(tagToRemove);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected Tags Summary */}
      {(selectedExistingTags.length > 0 || customTags.length > 0) && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md">
          {selectedExistingTags.map((tagName) => (
            <Badge
              key={`existing-${tagName}`}
              variant="default"
              className="cursor-pointer text-xs"
              onClick={() => onToggleExistingTag(tagName)}
            >
              {tagName}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {customTags.map((tag) => (
            <Badge
              key={`custom-${tag}`}
              variant="secondary"
              className="cursor-pointer text-xs"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Existing Tags */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Existing Tags
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
          <div className="max-h-20 overflow-y-auto space-y-1">
            {isTagsLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
            ) : filteredExistingTags.length > 0 ? (
              filteredExistingTags.slice(0, 5).map((tag, index) => (
                <div
                  key={`tag-${tag.id || index}`}
                  className="flex items-center space-x-2 hover:bg-muted/50 rounded px-2 py-1"
                >
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedExistingTags.includes(tag.name)}
                    onCheckedChange={() => onToggleExistingTag(tag.name)}
                    className="h-3 w-3"
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="text-xs cursor-pointer flex-1"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                No tags found
              </p>
            )}
          </div>
        </div>

        {/* Custom Tags */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Custom Tags
          </Label>
          <div className="flex gap-1">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="h-8 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || customTags.length >= 10}
              className="h-8 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedExistingTags.length + customTags.length}/10 tags
          </p>
        </div>
      </div>
    </div>
  );
}
