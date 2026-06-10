export {
  setupAuth,
  isAuthenticated,
  getSession,
  getUser,
  getUserId,
  requireAuth,
  requireAdmin,
  requireStrictAdmin,
  requireClient,
  requireFreelancer,
  requireKyc,
  requireAny,
  requireOwnership,
  isAdmin,
  isClient,
  isFreelancer,
  clearProfileCache,
  type SessionUser,
} from "./replitAuth";
export { authStorage, type IAuthStorage } from "./storage";
export { registerAuthRoutes } from "./routes";
