type Request = (method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown) => Promise<unknown>;

function idOf(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const id = (value as { id?: unknown }).id;
  return typeof id === 'string' && id ? id : undefined;
}

/** Creates only resources owned by this test; never deletes the existing user. */
export async function createCollaborationFixture(request: Request, name: string, email: string, projectID: string) {
  const users = await request('GET', `/api/v1/users/search?q=${encodeURIComponent(email)}`);
  const matches = Array.isArray(users) ? users.filter((user) => typeof user?.email === 'string' && user.email.toLowerCase() === email.toLowerCase()) : [];
  const userID = matches.length === 1 ? idOf(matches[0]) : undefined;
  if (!userID) throw new Error('The second test user must exist in the test database.');
  let collaboratorID: string | undefined;
  let projectAttempted = false;
  const cleanup = async () => {
    let failure: unknown;
    if (collaboratorID) {
      try { await request('DELETE', `/api/v1/collaborators/${encodeURIComponent(collaboratorID)}`); } catch (error) { failure = error; }
    }
    if (projectAttempted) {
      try { await request('DELETE', `/api/v1/projects/${encodeURIComponent(projectID)}`); } catch (error) { failure ??= error; }
    }
    if (failure) throw failure;
  };
  try {
    projectAttempted = true;
    // The current collaborator service only accepts published projects. The
    // test API is restricted to loopback and must use an isolated database.
    const project = await request('POST', '/api/v1/projects', { id: projectID, name, published: true });
    if (idOf(project) !== projectID) throw new Error('Test project was not created with the requested ID.');
    const pages = await request('GET', `/api/v1/projects/${encodeURIComponent(projectID)}/pages`);
    const pageID = Array.isArray(pages) ? idOf(pages[0]) : undefined;
    if (!pageID) throw new Error('The test project has no page.');
    const collaborator = await request('POST', '/api/v1/collaborators', { projectId: projectID, userId: userID, role: 'editor' });
    collaboratorID = idOf(collaborator);
    if (!collaboratorID) throw new Error('The test collaborator was not created.');
    return { editorPath: `/editor/${encodeURIComponent(projectID)}?page=${encodeURIComponent(pageID)}`, cleanup };
  } catch (error) {
    try { await cleanup(); } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], `Provisioning failed and temporary project ${projectID} could not be cleaned up.`);
    }
    throw error;
  }
}
