"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectionStore } from "@/globalstore/selection-store";
import apiClient from "@/services/apiclient";
import { URLBuilder } from "@/lib/utils/urlbuilder";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { CheckCircle } from "lucide-react";

interface SaveElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveElementDialog({
  open,
  onOpenChange,
}: SaveElementDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedElementName, setSavedElementName] = useState("");

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }

    const selectedElement =
      SelectionStore.getState().selectedElement ||
      SelectionStore.getState().hoveredElement;

    if (!selectedElement) {
      setError("No element selected to save.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await apiClient.post(
        new URLBuilder("api")
          .setPath(API_ENDPOINTS.CUSTOM_ELEMENTS.CREATE)
          .build(),
        {
          name: trimmedName,
          description: description.trim() || undefined,
          structure: selectedElement,
          defaultProps: {},
          isPublic,
          version: "1.0.0",
        },
      );

      setName("");
      setDescription("");
      setIsPublic(false);
      onOpenChange(false);

      setSavedElementName(trimmedName);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Error saving element:", error);
      if (
        error.message?.includes("409") ||
        error.message?.includes("already exists")
      ) {
        setError(
          "An element with this name already exists. Please choose a different name.",
        );
      } else if (error.message?.includes("400")) {
        setError("Invalid data provided. Please check your input.");
      } else {
        setError("Failed to save element. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setIsPublic(false);
    setError("");
    onOpenChange(false);
  };

  return (
    <>
      {/* Main Save Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Element</DialogTitle>
            <DialogDescription>
              Save this element as a reusable custom component.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                className="col-span-3"
                placeholder="Enter element name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="public" className="text-right">
                Public
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="public"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label
                  htmlFor="public"
                  className="text-sm text-muted-foreground"
                >
                  Make this element public for others to use
                </Label>
              </div>
            </div>
            {error && (
              <div className="col-span-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || name.trim().length < 2 || isLoading}
            >
              {isLoading ? "Saving..." : "Save Element"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-green-900 text-center">
              Success!
            </DialogTitle>
            <DialogDescription className="text-center">
              Element "{savedElementName}" has been saved successfully as a
              custom component.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-center mx-auto">
            <Button onClick={() => setShowSuccessDialog(false)}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
