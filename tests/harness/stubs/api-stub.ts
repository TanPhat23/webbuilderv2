/** Server-only project and element APIs: the harness never reaches the network. */
const unstubbed = (name: string) => async (): Promise<never> => {
  throw new Error(`harness: unstubbed request to ${name}`);
};
export const getUserProjects = unstubbed('getUserProjects');
export const getProjectById = unstubbed('getProjectById');
export const getProjectPages = unstubbed('getProjectPages');
export const createProject = unstubbed('createProject');
export const updateProject = unstubbed('updateProject');
export const deleteProject = unstubbed('deleteProject');
const empty = async (): Promise<never[]> => [];
export const elementService = new Proxy({}, { get: () => empty });
