import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { B as Button, J as Dialog, K as DialogContent, L as DialogHeader, M as DialogTitle, N as DialogDescription, O as Label, I as Input, Q as DialogFooter, V as useUserProjects } from "./prisma-Cq49YOYM.js";
import { Link } from "@tanstack/react-router";
import { Edit2, Loader2, Mail, AtSign, MapPin, Calendar, User, Edit, Upload, Activity, X, FileText, Heart, Star, TrendingUp, Download } from "lucide-react";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription, e as CardFooter } from "./card-LOcGasZb.js";
import "clsx";
import { toast } from "sonner";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { u as useMarketplaceItems } from "./useMarketplace-8BTY40FU.js";
import { motion } from "framer-motion";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-vyaRObia.js";
import { T as Textarea } from "./textarea-BDhK7YnG.js";
import { useUser } from "@clerk/react";
import { u as useCreateProfileUpdateNotification } from "./notification.service-DgEbN2NO.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function ProfileHero({
  profile,
  stats,
  onEditClick
}) {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      children: /* @__PURE__ */ jsxs(Card, { className: "relative overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:shadow-lg transition-all duration-300", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-4 sm:p-6 lg:p-8 relative", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6", children: [
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "relative group",
              whileHover: { scale: 1.05 },
              transition: { duration: 0.3 },
              children: /* @__PURE__ */ jsxs(Avatar, { className: "h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-4 border-background shadow-xl", children: [
                /* @__PURE__ */ jsx(AvatarImage, { src: profile.avatar, alt: profile.name }),
                /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary/20 text-primary text-2xl sm:text-3xl lg:text-4xl font-bold", children: profile.initials })
              ] })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center sm:text-left w-full", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2", children: profile.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4", children: profile.bio }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start", children: stats.map((stat) => /* @__PURE__ */ jsxs("div", { className: "text-center min-w-[60px]", children: [
              /* @__PURE__ */ jsx("p", { className: "text-lg sm:text-xl lg:text-2xl font-bold", children: stat.value }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: stat.label })
            ] }, stat.label)) })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              className: "gap-2 w-full sm:w-auto mt-2 sm:mt-0",
              size: "sm",
              onClick: onEditClick,
              children: [
                /* @__PURE__ */ jsx(Edit2, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "sm:inline", children: "Edit Profile" })
              ]
            }
          )
        ] }) })
      ] })
    }
  );
}
function UpdateMetadataDialog({
  open,
  onOpenChange
}) {
  const { user, isLoaded } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const getInitialFormData = () => ({
    bio: user?.unsafeMetadata?.bio || "",
    address: user?.unsafeMetadata?.address || ""
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
          bio: formData.bio || void 0,
          address: formData.address || void 0
        }
      });
      await user.reload();
      toast.success("Additional information updated successfully!");
      onOpenChange(false);
    } catch (error) {
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
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: "Additional Information" }),
      /* @__PURE__ */ jsx(DialogDescription, { children: "Update your bio and location" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "bio", children: "Bio" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            id: "bio",
            value: formData.bio,
            onChange: (e) => setFormData({ ...formData, bio: e.target.value }),
            placeholder: "Tell us about yourself...",
            rows: 4,
            disabled: isUpdating,
            maxLength: 500
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          formData.bio.length,
          "/500 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "address", children: "Location" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "address",
            value: formData.address,
            onChange: (e) => setFormData({ ...formData, address: e.target.value }),
            placeholder: "e.g., San Francisco, CA",
            disabled: isUpdating,
            maxLength: 100
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          onClick: handleCancel,
          disabled: isUpdating,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(Button, { onClick: handleUpdate, disabled: isUpdating, children: isUpdating ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Saving..."
      ] }) : "Save Changes" })
    ] })
  ] }) });
}
function PersonalInfoCard({ profile }) {
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
  const infoItems = [
    { icon: Mail, label: "Email", value: profile.email },
    { icon: AtSign, label: "Username", value: profile.username || "Not set" },
    { icon: MapPin, label: "Location", value: profile.address },
    { icon: Calendar, label: "Joined", value: profile.joinDate }
  ];
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.1 },
      children: [
        /* @__PURE__ */ jsxs(Card, { className: "bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "px-4 sm:px-6 pb-3", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-base sm:text-lg lg:text-xl flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(User, { className: "h-4 w-4 sm:h-5 sm:w-5 text-primary" }),
              "Personal Information"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs sm:text-sm", children: "Your basic account details" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "px-4 sm:px-6 space-y-3 sm:space-y-4", children: infoItems.map((item, index) => /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors w-full",
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: index * 0.05 },
              children: [
                /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10 shrink-0", children: /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4 text-primary" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: item.label }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: item.value })
                ] })
              ]
            },
            item.label
          )) }),
          /* @__PURE__ */ jsx(CardFooter, { className: "px-4 sm:px-6 pt-2", children: /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              className: "w-full gap-2",
              onClick: () => setIsMetadataDialogOpen(true),
              children: [
                /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
                "Update Bio & Location"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(
          UpdateMetadataDialog,
          {
            open: isMetadataDialogOpen,
            onOpenChange: setIsMetadataDialogOpen
          }
        )
      ]
    }
  );
}
function RecentActivitiesCard({ projects = [], templates = [] }) {
  const recentActivities = useMemo(() => {
    const activities = [];
    const recentProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 2);
    recentProjects.forEach((project) => {
      const timeDiff = Date.now() - new Date(project.updatedAt).getTime();
      const hours = Math.floor(timeDiff / (1e3 * 60 * 60));
      const days = Math.floor(timeDiff / (1e3 * 60 * 60 * 24));
      let timeStr = "";
      if (days > 0) {
        timeStr = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (hours > 0) {
        timeStr = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else {
        timeStr = "Just now";
      }
      activities.push({
        action: `Updated project "${project.name}"`,
        time: timeStr,
        icon: Edit2
      });
    });
    const recentTemplates = [...templates].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 2);
    recentTemplates.forEach((template) => {
      const timeDiff = Date.now() - (template.createdAt ? new Date(template.createdAt).getTime() : Date.now());
      const hours = Math.floor(timeDiff / (1e3 * 60 * 60));
      const days = Math.floor(timeDiff / (1e3 * 60 * 60 * 24));
      let timeStr = "";
      if (days > 0) {
        timeStr = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (hours > 0) {
        timeStr = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else {
        timeStr = "Just now";
      }
      activities.push({
        action: `Published template "${template.title}"`,
        time: timeStr,
        icon: Upload
      });
    });
    return activities.slice(0, 4);
  }, [projects, templates]);
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.2 },
      children: /* @__PURE__ */ jsxs(Card, { className: "bg-secondary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "px-4 sm:px-6 pb-3", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-base sm:text-lg lg:text-xl flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 sm:h-5 sm:w-5 text-primary" }),
            "Recent Activities"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs sm:text-sm", children: "Your latest actions and updates" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "px-4 sm:px-6 space-y-3 sm:space-y-4", children: recentActivities.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
          /* @__PURE__ */ jsx(Activity, { className: "h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No recent activities" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Start creating projects to see activities here" })
        ] }) : recentActivities.map((activity, index) => /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: "flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer",
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: index * 0.1 },
            children: [
              /* @__PURE__ */ jsx("div", { className: "p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0", children: /* @__PURE__ */ jsx(activity.icon, { className: "h-3 w-3 sm:h-4 sm:w-4 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-medium truncate", children: activity.action }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5 sm:mt-1", children: activity.time })
              ] })
            ]
          },
          index
        )) }),
        /* @__PURE__ */ jsx(CardFooter, { className: "px-4 sm:px-6 pt-2 pb-4 sm:pb-6", children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            className: "w-full text-xs sm:text-sm h-9 sm:h-10",
            children: "View All Activities"
          }
        ) })
      ] })
    }
  );
}
function EditProfileDialog({
  open,
  onOpenChange
}) {
  const { user, isLoaded } = useUser();
  const createProfileNotification = useCreateProfileUpdateNotification();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const getInitialFormData = () => ({
    firstName: user?.unsafeMetadata?.firstName || user?.firstName || "",
    lastName: user?.unsafeMetadata?.lastName || user?.lastName || "",
    username: user?.unsafeMetadata?.username || user?.username || ""
  });
  const [formData, setFormData] = useState(getInitialFormData());
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const usernameError = formData.username && !/^[a-zA-Z0-9_]{3,20}$/.test(formData.username) ? "Username must be 3-20 characters, letters, numbers, and underscores only" : null;
  useEffect(() => {
    if (open && user) {
      setFormData(getInitialFormData());
    }
  }, [open, user]);
  const handleImageChange = (e) => {
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
        setImagePreview(reader.result);
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
          firstName: formData.firstName || void 0,
          lastName: formData.lastName || void 0,
          username: formData.username || void 0
        }
      });
      await user.reload();
      const updates = [];
      if (formData.firstName) updates.push(`first name`);
      if (formData.lastName) updates.push(`last name`);
      if (formData.username) updates.push(`username`);
      if (imageFile) updates.push(`profile picture`);
      const description = updates.length > 0 ? `You updated your ${updates.join(", ")}.` : "You updated your profile information.";
      await createProfileNotification.mutateAsync({ description });
      toast.success("Profile updated successfully!");
      onOpenChange(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
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
  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase();
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[500px] max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: "Edit Profile" }),
      /* @__PURE__ */ jsx(DialogDescription, { children: "Update your profile information and avatar" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
        /* @__PURE__ */ jsxs(Avatar, { className: "h-24 w-24 border-4 border-background shadow-lg", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: currentImage, alt: user.fullName || "User" }),
          /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary/20 text-primary text-2xl font-bold", children: initials || "U" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: () => document.getElementById("avatar-upload")?.click(),
              disabled: isUpdating,
              children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
                imagePreview ? "Change Photo" : "Upload Photo"
              ]
            }
          ),
          imagePreview && /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              onClick: handleRemoveImage,
              disabled: isUpdating,
              children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "avatar-upload",
            type: "file",
            accept: "image/*",
            className: "hidden",
            onChange: handleImageChange,
            disabled: isUpdating
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Recommended: Square image, at least 400x400px (max 10MB)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "firstName", children: "First Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "firstName",
              value: formData.firstName,
              onChange: (e) => setFormData({ ...formData, firstName: e.target.value }),
              placeholder: "Enter your first name",
              disabled: isUpdating
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "lastName", children: "Last Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "lastName",
              value: formData.lastName,
              onChange: (e) => setFormData({ ...formData, lastName: e.target.value }),
              placeholder: "Enter your last name",
              disabled: isUpdating
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "username", children: "Username" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "username",
              value: formData.username,
              onChange: (e) => setFormData({ ...formData, username: e.target.value }),
              placeholder: "Enter your username",
              disabled: isUpdating,
              className: usernameError ? "border-red-500" : ""
            }
          ),
          usernameError && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500", children: usernameError })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              value: user.primaryEmailAddress?.emailAddress || "",
              disabled: true,
              className: "bg-muted"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Email cannot be changed here. Please update it in your account settings." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          onClick: handleCancel,
          disabled: isUpdating,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleUpdateProfile,
          disabled: isUpdating || !formData.firstName.trim() && !formData.lastName.trim() && !formData.username.trim() || !!usernameError,
          children: isUpdating ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            isUploadingImage ? "Uploading..." : "Saving..."
          ] }) : "Save Changes"
        }
      )
    ] })
  ] }) });
}
function SubscriptionCard() {
  return null;
}
function ProfileContent() {
  const { user, isLoaded } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects();
  const { data: allMarketplaceItems = [], isLoading: templatesLoading } = useMarketplaceItems();
  const userTemplates = useMemo(() => {
    if (!user?.id) return [];
    return allMarketplaceItems.filter((item) => item.authorId === user.id);
  }, [allMarketplaceItems, user?.id]);
  const profile = useMemo(() => {
    if (!user) return null;
    const createdAt = user.createdAt ? new Date(user.createdAt) : /* @__PURE__ */ new Date();
    const joinDate = createdAt.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
    const metaFirstName = user.unsafeMetadata?.firstName || user.firstName || "";
    const metaLastName = user.unsafeMetadata?.lastName || user.lastName || "";
    const metaUsername = user.unsafeMetadata?.username || user.username || "";
    const fullName = `${metaFirstName} ${metaLastName}`.trim();
    return {
      name: fullName || user.fullName || "User",
      email: user.primaryEmailAddress?.emailAddress || "Not provided",
      address: user.unsafeMetadata?.address || "Not provided",
      bio: user.unsafeMetadata?.bio || "No bio yet",
      joinDate,
      avatar: user.imageUrl || "",
      initials: `${metaFirstName[0] || ""}${metaLastName[0] || ""}`.toUpperCase() || "U",
      username: metaUsername
    };
  }, [user]);
  const stats = useMemo(
    () => [
      {
        label: "Projects",
        value: projectsLoading ? "..." : projects.length.toString(),
        icon: FileText,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
      },
      {
        label: "Templates",
        value: templatesLoading ? "..." : userTemplates.length.toString(),
        icon: Heart,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10"
      },
      {
        label: "Shared",
        value: templatesLoading ? "..." : userTemplates.filter((t) => t.featured).length.toString(),
        icon: Star,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10"
      },
      {
        label: "Activity",
        value: "100%",
        icon: TrendingUp,
        color: "text-green-500",
        bgColor: "bg-green-500/10"
      }
    ],
    [projects.length, projectsLoading, userTemplates, templatesLoading]
  );
  const handleDownload = () => {
    if (!user) return;
    const data = {
      name: user.fullName,
      email: user.primaryEmailAddress?.emailAddress,
      username: user.username,
      createdAt: user.createdAt,
      metadata: user.unsafeMetadata
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-data-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  if (!isLoaded) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin mx-auto text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading profile..." })
    ] }) });
  }
  if (!user || !profile) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Unable to load profile" }),
      /* @__PURE__ */ jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Back to Dashboard" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-4 p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "My Profile" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm sm:text-base text-muted-foreground mt-1", children: "View and manage your personal information" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleDownload, className: "gap-2 w-full sm:w-auto", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          "Export Data"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: stats.map((stat) => /* @__PURE__ */ jsxs(
        Card,
        {
          className: "hover:shadow-lg transition-shadow duration-300",
          children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: stat.label }),
              /* @__PURE__ */ jsx(stat.icon, { className: `h-4 w-4 ${stat.color}` })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stat.value }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground font-medium", children: [
                "Your ",
                stat.label.toLowerCase(),
                " count"
              ] })
            ] })
          ]
        },
        stat.label
      )) }),
      /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(
        ProfileHero,
        {
          profile,
          stats,
          onEditClick: () => setIsEditDialogOpen(true)
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsx(PersonalInfoCard, { profile }),
        /* @__PURE__ */ jsx(SubscriptionCard, {}),
        /* @__PURE__ */ jsx(RecentActivitiesCard, { projects, templates: userTemplates })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-4", children: /* @__PURE__ */ jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2", children: [
        /* @__PURE__ */ jsxs(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            className: "h-4 w-4",
            children: [
              /* @__PURE__ */ jsx("path", { d: "m12 19-7-7 7-7" }),
              /* @__PURE__ */ jsx("path", { d: "M19 12H5" })
            ]
          }
        ),
        "Back to Dashboard"
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      EditProfileDialog,
      {
        open: isEditDialogOpen,
        onOpenChange: setIsEditDialogOpen
      }
    )
  ] });
}
const SplitComponent = ProfileContent;
export {
  SplitComponent as component
};
