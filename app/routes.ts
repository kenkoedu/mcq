import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("by-year", "routes/by-year.tsx"),
  route("by-topic", "routes/by-topic.tsx"),
  route("exercise-generator", "routes/exercise-generator.tsx"),
  route("admin", "routes/admin.tsx"),
] satisfies RouteConfig;
