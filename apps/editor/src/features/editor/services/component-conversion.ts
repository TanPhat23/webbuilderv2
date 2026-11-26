import { RealtimeRequestRejected } from "@/features/collaboration/lib/realtime/MessageDispatcher";

export class ComponentConversionUnconfirmed extends Error {
  constructor(cause: unknown) {
    super("Could not confirm the conversion. The master and any saved instance were kept.", { cause });
  }
}

/** Persist the replacement first so a failed insert cannot remove the only original. */
export async function persistComponentInstance({
  stage, removeOriginal, removeStaged,
}: {
  stage: () => Promise<void>;
  removeOriginal?: () => Promise<void>;
  removeStaged: () => Promise<void>;
}) {
  try {
    await stage();
  } catch (error) {
    if (error instanceof RealtimeRequestRejected) throw error;
    throw new ComponentConversionUnconfirmed(error);
  }

  try {
    await removeOriginal?.();
  } catch (error) {
    // If a delete lost its acknowledgement, the staged instance could be the
    // only surviving copy. Only roll it back on a definite rejection.
    if (!(error instanceof RealtimeRequestRejected)) throw new ComponentConversionUnconfirmed(error);
    try {
      await removeStaged();
    } catch (rollback) {
      throw new ComponentConversionUnconfirmed(rollback);
    }
    throw error;
  }
}
