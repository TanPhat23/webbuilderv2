'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UpdateMetadataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateMetadataDialog({ open, onOpenChange }: UpdateMetadataDialogProps) {
  const { user, isLoaded } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const getInitialFormData = () => ({
    bio: (user?.unsafeMetadata?.bio as string) || '',
    address: (user?.unsafeMetadata?.address as string) || '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (open && user) {
      setFormData(getInitialFormData());
    }
  }, [open, user]);

  const handleUpdate = async () => {
    if (!user) return;

    if (formData.bio && formData.bio.length > 500) {
      toast.error("Bio must be less than 500 characters");
      return;
    }

    if (formData.address && formData.address.length > 100) {
      toast.error("Location must be less than 100 characters");
      return;
    }

    setIsUpdating(true);

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          bio: formData.bio || undefined,
          address: formData.address || undefined,
        },
      });

      await user.reload();

      toast.success("Additional information updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating metadata:", error);
      toast.error("Failed to update information. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData(getInitialFormData());
    onOpenChange(false);
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Additional Information</DialogTitle>
          <DialogDescription>
            Update your bio and location
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              disabled={isUpdating}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Location</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              disabled={isUpdating}
              maxLength={100}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
