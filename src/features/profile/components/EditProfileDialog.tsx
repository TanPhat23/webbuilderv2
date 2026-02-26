"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateProfileUpdateNotification } from "@/features/notifications";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const { user, isLoaded } = useUser();
  const createProfileNotification = useCreateProfileUpdateNotification();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const getInitialFormData = () => ({
    firstName:
      (user?.unsafeMetadata?.firstName as string) || user?.firstName || "",
    lastName:
      (user?.unsafeMetadata?.lastName as string) || user?.lastName || "",
    username:
      (user?.unsafeMetadata?.username as string) || user?.username || "",
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const usernameError =
    formData.username && !/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)
      ? "Username must be 3-20 characters, letters, numbers, and underscores only"
      : null;

  useEffect(() => {
    if (open && user) {
      setFormData(getInitialFormData());
    }
  }, [open, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validate username
    if (formData.username && !/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      toast.error(
        "Username must be 3-20 characters, letters, numbers, and underscores only"
      );
      return;
    }

    setIsUpdating(true);

    try {
      if (imageFile) {
        setIsUploadingImage(true);
        await user.setProfileImage({ file: imageFile });
        setIsUploadingImage(false);
        toast.success("Profile image updated successfully!");
      }

      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          username: formData.username || undefined,
        },
      });

      await user.reload();

      // Create notification for profile update
      const updates = [];
      if (formData.firstName) updates.push(`first name`);
      if (formData.lastName) updates.push(`last name`);
      if (formData.username) updates.push(`username`);
      if (imageFile) updates.push(`profile picture`);

      const description = updates.length > 0
        ? `You updated your ${updates.join(', ')}.`
        : 'You updated your profile information.';

      await createProfileNotification.mutateAsync({ description });

      toast.success("Profile updated successfully!");
      onOpenChange(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error("Error updating profile:", error);

      // Handle specific Clerk errors
      if (error.errors?.[0]?.code === "username_exists") {
        toast.error("This username is already taken");
      } else if (error.errors?.[0]?.code === "form_param_format_invalid") {
        toast.error("Invalid format for one of the fields");
      } else if (error.errors?.[0]?.code === "form_param_nil") {
        toast.error("Required fields cannot be empty");
      } else {
        toast.error(error.errors?.[0]?.message || "Failed to update profile");
      }
    } finally {
      setIsUpdating(false);
      setIsUploadingImage(false);
    }
  };

  const handleCancel = () => {
    setFormData(getInitialFormData());
    setImageFile(null);
    setImagePreview(null);
    onOpenChange(false);
  };

  if (!isLoaded || !user) {
    return null;
  }

  const currentImage = imagePreview || user.imageUrl;
  const initials = `${formData.firstName?.[0] || ""}${
    formData.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and avatar
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={currentImage} alt={user.fullName || "User"} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
                disabled={isUpdating}
              >
                <Upload className="h-4 w-4 mr-2" />
                {imagePreview ? "Change Photo" : "Upload Photo"}
              </Button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={isUpdating}
            />

            <p className="text-xs text-muted-foreground text-center">
              Recommended: Square image, at least 400x400px (max 10MB)
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Enter your first name"
                disabled={isUpdating}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Enter your last name"
                disabled={isUpdating}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter your username"
                disabled={isUpdating}
                className={usernameError ? "border-red-500" : ""}
              />
              {usernameError && (
                <p className="text-xs text-red-500">{usernameError}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Please update it in your account
                settings.
              </p>
            </div>
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
            onClick={handleUpdateProfile}
            disabled={
              isUpdating ||
              (!formData.firstName.trim() &&
                !formData.lastName.trim() &&
                !formData.username.trim()) ||
              !!usernameError
            }
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploadingImage ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
