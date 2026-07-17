import type { TestUser } from "./types";

export const AUTHENTICATED_USERS = [
  {
    id: "user-primary-0001",
    email: "primary@example.test",
    name: "Primary Test User",
  },
  {
    id: "user-secondary-0002",
    email: "secondary@example.test",
    name: "Secondary Test User",
  },
] as const satisfies readonly TestUser[];
