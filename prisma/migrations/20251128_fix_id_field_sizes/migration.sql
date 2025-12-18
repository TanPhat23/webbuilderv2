-- Fix ID field sizes - change from VARCHAR(36) to TEXT for flexibility

-- Element
ALTER TABLE "Element" ALTER COLUMN "Id" TYPE text;

-- Image
ALTER TABLE "Image" ALTER COLUMN "ImageId" TYPE text;

-- Project
ALTER TABLE "Project" ALTER COLUMN "Id" TYPE text;

-- Page
ALTER TABLE "Page" ALTER COLUMN "Id" TYPE text;

-- EventWorkflow
ALTER TABLE "EventWorkflow" ALTER COLUMN "Id" TYPE text;

-- Setting
ALTER TABLE "Setting" ALTER COLUMN "Id" TYPE text;

-- Snapshot
ALTER TABLE "Snapshot" ALTER COLUMN "Id" TYPE text;

-- User
ALTER TABLE "User" ALTER COLUMN "Id" TYPE text;

-- Subscription
ALTER TABLE "Subscription" ALTER COLUMN "Id" TYPE text;

-- ContentType
ALTER TABLE "ContentType" ALTER COLUMN "Id" TYPE text;

-- ContentField
ALTER TABLE "ContentField" ALTER COLUMN "Id" TYPE text;

-- ContentFieldValue
ALTER TABLE "ContentFieldValue" ALTER COLUMN "Id" TYPE text;

-- ContentItem
ALTER TABLE "ContentItem" ALTER COLUMN "Id" TYPE text;

-- MarketplaceItem
ALTER TABLE "MarketplaceItem" ALTER COLUMN "Id" TYPE text;

-- Category
ALTER TABLE "Category" ALTER COLUMN "Id" TYPE text;

-- Tag
ALTER TABLE "Tag" ALTER COLUMN "Id" TYPE text;

-- CustomElementType
ALTER TABLE "CustomElementType" ALTER COLUMN "Id" TYPE text;

-- CustomElement
ALTER TABLE "CustomElement" ALTER COLUMN "Id" TYPE text;

-- Invitation
ALTER TABLE "Invitation" ALTER COLUMN "Id" TYPE text;

-- Collaborator
ALTER TABLE "Collaborator" ALTER COLUMN "Id" TYPE text;

-- Comment
ALTER TABLE "Comment" ALTER COLUMN "Id" TYPE text;

-- CommentReaction
ALTER TABLE "CommentReaction" ALTER COLUMN "Id" TYPE text;

-- ElementComment
ALTER TABLE "ElementComment" ALTER COLUMN "Id" TYPE text;

-- ElementEventWorkflow
ALTER TABLE "ElementEventWorkflow" ALTER COLUMN "Id" TYPE text;

-- Notification
ALTER TABLE "Notification" ALTER COLUMN "Id" TYPE text;
