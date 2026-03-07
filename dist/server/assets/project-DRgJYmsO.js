import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { p as projectService } from "./project.service-Bci2lGYe.js";
import { v4 } from "uuid";
import { z } from "zod";
import { a as auth } from "./auth-BkVoR3zB.js";
import { c as createServerFn } from "../server.js";
import "@clerk/backend/internal";
import "./index-CSLGDVeV.js";
import "@clerk/shared/error";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
const ProjectIdSchema = z.object({
  projectId: z.string()
});
const CreateProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional()
});
const UpdateProjectSchema = z.object({
  projectId: z.string(),
  updates: z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    published: z.boolean().optional(),
    subdomain: z.string().nullable().optional(),
    styles: z.record(z.string(), z.unknown()).nullable().optional()
  })
});
async function getAuthToken() {
  const {
    userId,
    getToken
  } = await auth();
  if (!userId) throw new Error("User not authenticated");
  const token = await getToken();
  if (!token) throw new Error("Failed to retrieve auth token");
  return {
    userId,
    token
  };
}
const getUserProjects_createServerFn_handler = createServerRpc({
  id: "088e3590a036a69f21ef706f3dee067be8532815f9549ae63682971a715860c9",
  name: "getUserProjects",
  filename: "src/features/projects/api/project.ts"
}, (opts) => getUserProjects.__executeServer(opts));
const getUserProjects = createServerFn({
  method: "GET"
}).handler(getUserProjects_createServerFn_handler, async () => {
  const {
    token
  } = await getAuthToken();
  return projectService.getUserProjects(token);
});
const getProjectById_createServerFn_handler = createServerRpc({
  id: "80f93c8c77588990ba7445942bf00878b1aeea698b58d866a46b06be45d44db9",
  name: "getProjectById",
  filename: "src/features/projects/api/project.ts"
}, (opts) => getProjectById.__executeServer(opts));
const getProjectById = createServerFn({
  method: "GET"
}).inputValidator((data) => ProjectIdSchema.parse(data)).handler(getProjectById_createServerFn_handler, async ({
  data
}) => {
  const {
    token
  } = await getAuthToken();
  return projectService.getProjectById(data.projectId, token);
});
const createProject_createServerFn_handler = createServerRpc({
  id: "470aa1ecade0f8858e74189813ff09c3015246b20c18f8a0cccded1f6efcc41d",
  name: "createProject",
  filename: "src/features/projects/api/project.ts"
}, (opts) => createProject.__executeServer(opts));
const createProject = createServerFn({
  method: "POST"
}).inputValidator((data) => CreateProjectSchema.parse(data)).handler(createProject_createServerFn_handler, async ({
  data
}) => {
  const {
    userId,
    token
  } = await getAuthToken();
  const project = {
    id: data.id ?? v4(),
    name: data.name,
    description: data.description ?? null,
    subdomain: null,
    published: false,
    ownerId: userId,
    styles: null,
    header: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    deletedAt: null,
    views: 0
  };
  return projectService.createProject(project, token);
});
const updateProject_createServerFn_handler = createServerRpc({
  id: "72a6c6d49e7228b011ab970eb137fcbed93ac6e064228074fbe75ca13e50ec3f",
  name: "updateProject",
  filename: "src/features/projects/api/project.ts"
}, (opts) => updateProject.__executeServer(opts));
const updateProject = createServerFn({
  method: "POST"
}).inputValidator((data) => UpdateProjectSchema.parse(data)).handler(updateProject_createServerFn_handler, async ({
  data
}) => {
  const {
    token
  } = await getAuthToken();
  return projectService.updateProjectPartial(data.projectId, data.updates, token);
});
const deleteProject_createServerFn_handler = createServerRpc({
  id: "a088bdb405b9acad39183cfb0565c78327ac0eecbeb1aa4d1ddb71559389d79f",
  name: "deleteProject",
  filename: "src/features/projects/api/project.ts"
}, (opts) => deleteProject.__executeServer(opts));
const deleteProject = createServerFn({
  method: "POST"
}).inputValidator((data) => ProjectIdSchema.parse(data)).handler(deleteProject_createServerFn_handler, async ({
  data
}) => {
  const {
    token
  } = await getAuthToken();
  await projectService.deleteProject(data.projectId, token);
  return {
    success: true
  };
});
const getProjectPages_createServerFn_handler = createServerRpc({
  id: "439af23a6a8749f42db8230f866c47df2417a4ab285f06482b72a52ded6d637b",
  name: "getProjectPages",
  filename: "src/features/projects/api/project.ts"
}, (opts) => getProjectPages.__executeServer(opts));
const getProjectPages = createServerFn({
  method: "GET"
}).inputValidator((data) => ProjectIdSchema.parse(data)).handler(getProjectPages_createServerFn_handler, async ({
  data
}) => {
  const {
    token
  } = await getAuthToken();
  return projectService.getProjectPages(data.projectId, token);
});
export {
  createProject_createServerFn_handler,
  deleteProject_createServerFn_handler,
  getProjectById_createServerFn_handler,
  getProjectPages_createServerFn_handler,
  getUserProjects_createServerFn_handler,
  updateProject_createServerFn_handler
};
