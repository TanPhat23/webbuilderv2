-- Add field size constraints and improve performance

-- Element table improvements - only alter if not already done
ALTER TABLE "Element" ALTER COLUMN "Content" TYPE text;
ALTER TABLE "Element" ALTER COLUMN "Href" TYPE varchar(2048);
ALTER TABLE "Element" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Element" ALTER COLUMN "Name" TYPE varchar(255);
ALTER TABLE "Element" ALTER COLUMN "Src" TYPE varchar(2048);
ALTER TABLE "Element" ALTER COLUMN "Styles" TYPE jsonb USING "Styles"::jsonb;
ALTER TABLE "Element" ALTER COLUMN "TailwindStyles" TYPE text;

-- Add missing indexes on Element (skip if IsLocked doesn't exist in table)
CREATE INDEX IF NOT EXISTS "Element_Type_idx" ON "Element"("Type");
CREATE INDEX IF NOT EXISTS "Element_Order_idx" ON "Element"("Order");
CREATE INDEX IF NOT EXISTS "Element_PageId_Order_idx" ON "Element"("PageId", "Order");
CREATE INDEX IF NOT EXISTS "Element_ParentId_Order_idx" ON "Element"("ParentId", "Order");
CREATE INDEX IF NOT EXISTS "Element_PageId_Type_idx" ON "Element"("PageId", "Type");

-- Image table improvements
ALTER TABLE "Image" ALTER COLUMN "ImageId" TYPE varchar(36);
ALTER TABLE "Image" ALTER COLUMN "ImageLink" TYPE varchar(2048);
ALTER TABLE "Image" ALTER COLUMN "ImageName" TYPE varchar(255);
CREATE INDEX IF NOT EXISTS "Image_DeletedAt_idx" ON "Image"("DeletedAt");
CREATE INDEX IF NOT EXISTS "Image_UserId_DeletedAt_idx" ON "Image"("UserId", "DeletedAt");

-- Project table improvements
ALTER TABLE "Project" ALTER COLUMN "Description" TYPE text;
ALTER TABLE "Project" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Project" ALTER COLUMN "Name" TYPE varchar(255);
ALTER TABLE "Project" ALTER COLUMN "Subdomain" TYPE varchar(63);
ALTER TABLE "Project" ALTER COLUMN "Styles" TYPE jsonb USING "Styles"::jsonb;
ALTER TABLE "Project" ALTER COLUMN "Header" TYPE jsonb USING "Header"::jsonb;

-- Add missing indexes on Project
CREATE INDEX IF NOT EXISTS "Project_Published_idx" ON "Project"("Published");
CREATE INDEX IF NOT EXISTS "Project_Subdomain_idx" ON "Project"("Subdomain");
CREATE INDEX IF NOT EXISTS "Project_CreatedAt_idx" ON "Project"("CreatedAt");
CREATE INDEX IF NOT EXISTS "Project_DeletedAt_idx" ON "Project"("DeletedAt");
CREATE INDEX IF NOT EXISTS "Project_OwnerId_Published_idx" ON "Project"("OwnerId", "Published");
CREATE INDEX IF NOT EXISTS "Project_OwnerId_DeletedAt_Published_idx" ON "Project"("OwnerId", "DeletedAt", "Published");

-- Page table improvements
ALTER TABLE "Page" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Page" ALTER COLUMN "Name" TYPE varchar(255);
ALTER TABLE "Page" ALTER COLUMN "Type" TYPE varchar(50);
ALTER TABLE "Page" ALTER COLUMN "Styles" TYPE jsonb USING "Styles"::jsonb;

-- Add missing indexes on Page
CREATE INDEX IF NOT EXISTS "Page_Type_idx" ON "Page"("Type");
CREATE INDEX IF NOT EXISTS "Page_ProjectId_Type_idx" ON "Page"("ProjectId", "Type");

-- EventWorkflow table improvements
ALTER TABLE "EventWorkflow" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "EventWorkflow" ALTER COLUMN "Name" TYPE varchar(255);
ALTER TABLE "EventWorkflow" ALTER COLUMN "Description" TYPE text;
ALTER TABLE "EventWorkflow" ALTER COLUMN "CanvasData" TYPE jsonb USING "CanvasData"::jsonb;

-- Add missing indexes on EventWorkflow
CREATE INDEX IF NOT EXISTS "EventWorkflow_Enabled_idx" ON "EventWorkflow"("Enabled");
CREATE INDEX IF NOT EXISTS "EventWorkflow_ProjectId_Enabled_idx" ON "EventWorkflow"("ProjectId", "Enabled");

-- Setting table improvements
ALTER TABLE "Setting" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Setting" ALTER COLUMN "Name" TYPE varchar(255);
ALTER TABLE "Setting" ALTER COLUMN "SettingType" TYPE varchar(100);
ALTER TABLE "Setting" ALTER COLUMN "Settings" TYPE jsonb USING "Settings"::jsonb;
DROP INDEX IF EXISTS "IX_Settings_ElementId";

-- Snapshot table improvements
ALTER TABLE "Snapshot" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Snapshot" ALTER COLUMN "Elements" TYPE jsonb USING "Elements"::jsonb;
ALTER TABLE "Snapshot" ALTER COLUMN "Name" TYPE varchar(255);

-- Add missing indexes on Snapshot
CREATE INDEX IF NOT EXISTS "Snapshot_ProjectId_Type_idx" ON "Snapshot"("ProjectId", "Type");
CREATE INDEX IF NOT EXISTS "Snapshot_CreatedAt_idx" ON "Snapshot"("CreatedAt");

-- Subscription table improvements
ALTER TABLE "Subscription" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Subscription" ALTER COLUMN "PlanId" TYPE varchar(100);
ALTER TABLE "Subscription" ALTER COLUMN "BillingPeriod" TYPE varchar(50);
ALTER TABLE "Subscription" ALTER COLUMN "Status" TYPE varchar(50);
ALTER TABLE "Subscription" ALTER COLUMN "Currency" TYPE varchar(10);
ALTER TABLE "Subscription" ALTER COLUMN "BankCode" TYPE varchar(50);
ALTER TABLE "Subscription" ALTER COLUMN "CardType" TYPE varchar(50);
ALTER TABLE "Subscription" ALTER COLUMN "Email" TYPE varchar(255);
ALTER TABLE "Subscription" ALTER COLUMN "TransactionNo" TYPE varchar(100);

-- ContentType table improvements
ALTER TABLE "ContentType" ALTER COLUMN "Description" TYPE text;
ALTER TABLE "ContentType" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "ContentType" ALTER COLUMN "Name" TYPE varchar(255);

-- ContentField table improvements
ALTER TABLE "ContentField" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "ContentField" ALTER COLUMN "Name" TYPE varchar(255);
ALTER TABLE "ContentField" ALTER COLUMN "Type" TYPE varchar(100);

-- ContentFieldValue table improvements
ALTER TABLE "ContentFieldValue" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "ContentFieldValue" ALTER COLUMN "Value" TYPE text;

-- ContentItem table improvements
ALTER TABLE "ContentItem" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "ContentItem" ALTER COLUMN "Slug" TYPE varchar(255);
ALTER TABLE "ContentItem" ALTER COLUMN "Title" TYPE varchar(500);

-- MarketplaceItem table improvements
ALTER TABLE "MarketplaceItem" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "MarketplaceItem" ALTER COLUMN "Title" TYPE varchar(500);
ALTER TABLE "MarketplaceItem" ALTER COLUMN "Description" TYPE text;
ALTER TABLE "MarketplaceItem" ALTER COLUMN "Preview" TYPE varchar(2048);
ALTER TABLE "MarketplaceItem" ALTER COLUMN "TemplateType" TYPE varchar(50);
ALTER TABLE "MarketplaceItem" ALTER COLUMN "AuthorName" TYPE varchar(255);

-- Add missing indexes on MarketplaceItem
CREATE INDEX IF NOT EXISTS "MarketplaceItem_CreatedAt_idx" ON "MarketplaceItem"("CreatedAt");
CREATE INDEX IF NOT EXISTS "MarketplaceItem_Downloads_idx" ON "MarketplaceItem"("Downloads");
CREATE INDEX IF NOT EXISTS "MarketplaceItem_Likes_idx" ON "MarketplaceItem"("Likes");
CREATE INDEX IF NOT EXISTS "MarketplaceItem_Views_idx" ON "MarketplaceItem"("Views");
CREATE INDEX IF NOT EXISTS "MarketplaceItem_Featured_TemplateType_idx" ON "MarketplaceItem"("Featured", "TemplateType");
CREATE INDEX IF NOT EXISTS "MarketplaceItem_TemplateType_Downloads_idx" ON "MarketplaceItem"("TemplateType", "Downloads");

-- Category table improvements
ALTER TABLE "Category" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Category" ALTER COLUMN "Name" TYPE varchar(100);

-- Tag table improvements
ALTER TABLE "Tag" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Tag" ALTER COLUMN "Name" TYPE varchar(100);

-- CustomElementType table improvements
ALTER TABLE "CustomElementType" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "CustomElementType" ALTER COLUMN "Name" TYPE varchar(255);
ALTER TABLE "CustomElementType" ALTER COLUMN "Description" TYPE text;
ALTER TABLE "CustomElementType" ALTER COLUMN "Category" TYPE varchar(100);
ALTER TABLE "CustomElementType" ALTER COLUMN "Icon" TYPE varchar(255);

-- CustomElement table improvements
ALTER TABLE "CustomElement" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "CustomElement" ALTER COLUMN "Name" TYPE varchar(255);
ALTER TABLE "CustomElement" ALTER COLUMN "Description" TYPE text;
ALTER TABLE "CustomElement" ALTER COLUMN "Structure" TYPE jsonb USING "Structure"::jsonb;
ALTER TABLE "CustomElement" ALTER COLUMN "DefaultProps" TYPE jsonb USING "DefaultProps"::jsonb;

-- Invitation table improvements
ALTER TABLE "Invitation" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Invitation" ALTER COLUMN "Email" TYPE varchar(255);
ALTER TABLE "Invitation" ALTER COLUMN "Token" TYPE varchar(255);
ALTER TABLE "Invitation" ALTER COLUMN "Status" TYPE varchar(50);

-- Add missing indexes on Invitation
CREATE INDEX IF NOT EXISTS "Invitation_Email_idx" ON "Invitation"("Email");
CREATE INDEX IF NOT EXISTS "Invitation_ExpiresAt_idx" ON "Invitation"("ExpiresAt");
CREATE INDEX IF NOT EXISTS "Invitation_ProjectId_Status_idx" ON "Invitation"("ProjectId", "Status");

-- Collaborator table improvements
ALTER TABLE "Collaborator" ALTER COLUMN "Id" TYPE varchar(36);

-- Comment table improvements
ALTER TABLE "Comment" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Comment" ALTER COLUMN "Content" TYPE text;
ALTER TABLE "Comment" ALTER COLUMN "Status" TYPE varchar(50);

-- Add missing indexes on Comment
CREATE INDEX IF NOT EXISTS "Comment_ParentId_idx" ON "Comment"("ParentId");
CREATE INDEX IF NOT EXISTS "Comment_Status_idx" ON "Comment"("Status");
CREATE INDEX IF NOT EXISTS "Comment_ItemId_Status_idx" ON "Comment"("ItemId", "Status");
CREATE INDEX IF NOT EXISTS "Comment_ItemId_ParentId_idx" ON "Comment"("ItemId", "ParentId");
CREATE INDEX IF NOT EXISTS "Comment_CreatedAt_idx" ON "Comment"("CreatedAt");

-- CommentReaction table improvements
ALTER TABLE "CommentReaction" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "CommentReaction" ALTER COLUMN "Type" TYPE varchar(50);

-- ElementComment table improvements
ALTER TABLE "ElementComment" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "ElementComment" ALTER COLUMN "Content" TYPE text;

-- Add missing indexes on ElementComment
CREATE INDEX IF NOT EXISTS "ElementComment_Resolved_idx" ON "ElementComment"("Resolved");
CREATE INDEX IF NOT EXISTS "ElementComment_ElementId_Resolved_idx" ON "ElementComment"("ElementId", "Resolved");

-- ElementEventWorkflow table improvements
ALTER TABLE "ElementEventWorkflow" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "ElementEventWorkflow" ALTER COLUMN "EventName" TYPE varchar(100);

-- Notification table improvements
ALTER TABLE "Notification" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "Notification" ALTER COLUMN "Type" TYPE varchar(100);
ALTER TABLE "Notification" ALTER COLUMN "Title" TYPE varchar(500);
ALTER TABLE "Notification" ALTER COLUMN "Description" TYPE text;

-- User table improvements
ALTER TABLE "User" ALTER COLUMN "Email" TYPE varchar(255);
ALTER TABLE "User" ALTER COLUMN "FirstName" TYPE varchar(100);
ALTER TABLE "User" ALTER COLUMN "Id" TYPE varchar(36);
ALTER TABLE "User" ALTER COLUMN "ImageUrl" TYPE varchar(2048);
ALTER TABLE "User" ALTER COLUMN "LastName" TYPE varchar(100);
