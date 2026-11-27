/** Server-only project and element APIs: the canvas fixture never reaches the network. */
const unavailable = async (): Promise<never> => { throw new Error('Network is unavailable in this fixture'); };
export const getUserProjects = unavailable;
export const getProjectById = unavailable;
export const getProjectPages = unavailable;
export const createProject = unavailable;
export const updateProject = unavailable;
export const deleteProject = unavailable;
const empty = async (): Promise<never[]> => [];
export const elementService = new Proxy({}, { get: () => empty });
