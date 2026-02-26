## Problem

Currently, when one user connects/disconnects a workflow from an element event, other collaborators don't see the change in real time. Their React Query cache has a 30-second stale time, so they won't see updates until either:
- 30 seconds elapse
- They manually refetch
- They navigate away and back

This is because event workflow changes are only synced via the REST API—there are no WebSocket messages for event workflow operations.

## Solution

Implement three new WebSocket message types to broadcast event workflow changes to all collaborators, and have receiving clients directly patch their React Query caches.

### Part 1: New WS Message Types
Add to `src/interfaces/websocket/ws-collab.interface.ts`:
- `EVENT_WORKFLOW_CONNECT: "event_workflow:connect"`
- `EVENT_WORKFLOW_DISCONNECT: "event_workflow:disconnect"`
- `EVENT_WORKFLOW_UPDATE: "event_workflow:update"`

With corresponding payload interfaces:
- `EventWorkflowConnectPayload` — connection created
- `EventWorkflowDisconnectPayload` — connection deleted
- `EventWorkflowUpdatePayload` — workflow canvas data changed

### Part 2: Broadcast After Mutations
In `src/hooks/editor/eventworkflow/useElementEventWorkflowMutations.ts`:
- After `useConnectElementEventWorkflow` succeeds, broadcast `event_workflow:connect` via the collaboration provider
- After `useDisconnectElementEventWorkflow` succeeds, broadcast `event_workflow:disconnect` via the collaboration provider

In `src/hooks/editor/eventworkflow/useEventWorkflowMutations.ts`:
- After `useUpdateEventWorkflow` succeeds, broadcast `event_workflow:update` via the collaboration provider

### Part 3: Handle Incoming Messages
In `src/providers/collaborationprovider.tsx`:
- Add listeners for the three new message types
- For `event_workflow:connect`: patch the React Query cache to append the new connection
- For `event_workflow:disconnect`: patch the React Query cache to remove the connection
- For `event_workflow:update`: invalidate the workflows list query so fresh canvas data is fetched

### Part 4: Automatic Re-Registration (Already Wired!)
No changes needed. The `useElementEvents` hook already watches `connections` in its dependency array, so when the cache updates, handlers automatically re-register.

## Data Flow (After Fix)


## Files to Modify

1. `src/interfaces/websocket/ws-collab.interface.ts` — Add new message types and payloads
2. `src/providers/collaborationprovider.tsx` — Add message handlers + cache patching logic
3. `src/hooks/editor/eventworkflow/useElementEventWorkflowMutations.ts` — Broadcast connect/disconnect
4. `src/hooks/editor/eventworkflow/useEventWorkflowMutations.ts` — Broadcast update

## Benefits

- ✅ Real-time event binding updates across collaborators
- ✅ No polling or wasted network calls
- ✅ Handlers re-register automatically (already via React Query reactivity)
- ✅ Full consistency between all users on the page

## References

- Previous discussion: Element Events WebSocket Handling
- Related: `useElementEvents.ts`, `useElementConnections()`, React Query cache patterns