import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("landing/page.tsx"),

  ...prefix("login", [
    index("auth/login.tsx"),
    route("email-sent", "auth/email-sent.tsx"),
    route("verify", "auth/verify.ts"),
  ]),

  ...prefix("dashboard", [
    route("/logout", "auth/logout.tsx"),
    layout("dashboard/layout.tsx", [route("/home", "dashboard/page.tsx")]),
  ]),

  route("test", "test.tsx"),
  route("llm-talk", "llm-talk.tsx"),
  route("chat", "landing/chat.tsx"),
] satisfies RouteConfig;
