import { z } from 'zod';

const pathId = z.string().regex(/^[A-Za-z0-9_-]+$/);
export const deletePageInputSchema = z.object({ projectId: pathId, pageId: pathId });
