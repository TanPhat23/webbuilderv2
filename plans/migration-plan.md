src/
├── app/                        ← routing only, thin pages/layouts
│   ├── (routes)/
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
│
├── features/
│   ├── editor/
│   │   ├── components/         ← from components/editor/
│   │   ├── hooks/              ← from hooks/editor/
│   │   ├── services/           ← element.ts, elementEventWorkflow.ts, eventWorkflow.service.ts, image.ts
│   │   ├── store/              ← element-store, event-*-store, image-store, selection-store, mouse-store, custom-element-store
│   │   ├── lib/                ← lib/code/, lib/monaco/, lib/yjs/, lib/events/, lib/customcomponents/, lib/utils/element/, lib/utils/workflow/
│   │   ├── schema/             ← schema/zod/element.ts, eventWorkflow.ts, image.ts, imageupload.ts, workflowCanvas.ts + schema/elementEventWorkflowSchemas.ts, eventSchemas.ts
│   │   ├── interfaces/         ← editor, elements, events, eventWorkflow, image, custom-element, snapshot interfaces
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── components/         ← from components/dashboard/
│   │   ├── hooks/              ← hooks/features/useDashboard.ts, useProjects.ts
│   │   ├── services/           ← services/project.ts
│   │   ├── actions/            ← app/actions/projectAction.ts, pageAction.ts
│   │   ├── schema/             ← schema/zod/project.ts, page.ts
│   │   ├── interfaces/         ← project.interface.ts, page.interface.ts
│   │   └── index.ts
│   │
│   ├── analytics/
│   │   ├── components/         ← from components/analytics/
│   │   ├── hooks/              ← hooks/features/useAnalytics.ts
│   │   └── index.ts
│   │
│   ├── marketplace/
│   │   ├── components/         ← from components/marketplace/
│   │   ├── hooks/              ← hooks/features/useMarketplace.ts
│   │   ├── services/           ← services/marketplace.ts
│   │   ├── schema/             ← schema/marketplace.ts, schema/zod/ (none specific)
│   │   ├── interfaces/         ← market.interface.ts
│   │   └── index.ts
│   │
│   ├── collaboration/
│   │   ├── components/         ← from components/collaboration/
│   │   ├── hooks/              ← hooks/features/useCollaborators.ts, useInvitations.ts
│   │   ├── services/           ← services/collaborator.ts, services/invitation.ts
│   │   ├── interfaces/         ← collaboration.interface.ts
│   │   └── index.ts
│   │
│   ├── comments/
│   │   ├── hooks/              ← hooks/useCommentManager.ts, useElementComments.ts, hooks/features/useComments.ts
│   │   ├── services/           ← services/comment.ts, services/elementcomment.ts
│   │   ├── lib/                ← lib/comments.ts
│   │   ├── store/              ← globalstore/element-comment-store.ts
│   │   ├── interfaces/         ← comment.interface.ts, elementcomment.interface.ts
│   │   └── index.ts
│   │
│   ├── notifications/
│   │   ├── components/         ← from components/notificationspage/
│   │   ├── hooks/              ← hooks/features/useNotifications.ts
│   │   ├── services/           ← services/notification.ts
│   │   ├── interfaces/         ← notification.interface.ts
│   │   └── index.ts
│   │
│   ├── subscription/
│   │   ├── components/         ← from components/checkoutpage/
│   │   ├── hooks/              ← hooks/subscription/
│   │   ├── services/           ← services/subscription.ts, services/token.ts
│   │   ├── lib/                ← lib/vnpay-config.ts, lib/vnpay-utils.ts
│   │   ├── constants/          ← constants/pricing.ts
│   │   ├── data/               ← data/subscription.ts
│   │   ├── interfaces/         ← subscription.interface.ts
│   │   └── index.ts
│   │
│   ├── cms/
│   │   ├── hooks/              ← hooks/cms/
│   │   ├── services/           ← services/cms.ts
│   │   ├── schema/             ← schema/zod/cms.ts
│   │   ├── interfaces/         ← cms.interface.ts
│   │   └── index.ts
│   │
│   ├── auth/
│   │   ├── data/               ← data/rbac.ts
│   │   ├── lib/                ← lib/rbac/
│   │   ├── constants/          ← constants/rbac.ts
│   │   └── index.ts
│   │
│   ├── profile/
│   │   ├── components/         ← from components/profilepage/
│   │   ├── hooks/              ← hooks/features/useUsers.ts
│   │   ├── services/           ← services/user.ts
│   │   ├── schema/             ← schema/zod/user.ts, setting.ts
│   │   ├── interfaces/         ← profile.interface.ts
│   │   └── index.ts
│   │
│   ├── preview/
│   │   ├── components/         ← from components/preview/
│   │   └── index.ts
│   │
│   ├── chat/
│   │   ├── components/         ← from components/chat/
│   │   ├── hooks/              ← hooks/useChat.ts
│   │   ├── interfaces/         ← chat.interface.ts, interfaces/websocket/
│   │   └── index.ts
│   │
│   ├── landing/
│   │   ├── components/         ← from components/landingpage/
│   │   └── index.ts
│   │
│   ├── project-settings/
│   │   ├── components/         ← from components/projectsettings/
│   │   ├── lib/                ← lib/utils/projectsettings/
│   │   └── index.ts
│   │
│   └── help/
│       ├── components/         ← from components/helppage/
│       └── index.ts
│
├── components/
│   └── ui/                     ← shadcn components only (stays)
│
├── lib/
│   ├── prisma.ts               ← stays (shared DB client)
│   ├── utils.ts                ← stays (shared cn utility)
│   └── utils/                  ← lib/utils/errors/, hooks/, icons/, query/, urlbuilder.ts, element-tree-helper.ts
│
├── globalstore/
│   ├── page-store.ts           ← stays (shared across editor + dashboard)
│   ├── project-store.ts        ← stays (shared)
│   ├── event-mode-store.ts     ← stays or moves to editor
│   └── selectors/              ← stays
│
├── providers/                  ← stays (global providers)
├── types/                      ← stays (global types)
├── constants/
│   ├── direction.ts            ← stays (generic)
│   ├── elements.ts             ← moves to features/editor/constants/
│   ├── endpoints.ts            ← moves to features/editor/constants/ or shared
│   ├── events.ts               ← moves to features/editor/constants/
│   ├── eventWorkflows.ts       ← moves to features/editor/constants/
│   ├── comments.ts             ← moves to features/comments/constants/
│   ├── previewComponents.ts    ← moves to features/preview/constants/
│   └── viewports.ts            ← stays (shared UI)
│
└── data/
    ├── page.ts                 ← moves to features/dashboard/data/
    └── project.ts              ← moves to features/dashboard/data/