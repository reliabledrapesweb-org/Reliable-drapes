import { describe, expect, test, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  test("initial state is empty", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  test("sets user", () => {
    const user = { id: "u1", email: "test@example.com" } as any;
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  test("sets session", () => {
    const session = { access_token: "token" } as any;
    useAuthStore.getState().setSession(session);
    expect(useAuthStore.getState().session).toEqual(session);
  });

  test("sets loading state", () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  test("sets error", () => {
    useAuthStore.getState().setError("Auth failed");
    expect(useAuthStore.getState().error).toBe("Auth failed");
  });

  test("logout clears user, session and error", () => {
    useAuthStore.getState().setUser({ id: "u1" } as any);
    useAuthStore.getState().setSession({ token: "t" } as any);
    useAuthStore.getState().setError("Previous error");

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.error).toBeNull();
  });

  test("reset clears everything including loading", () => {
    useAuthStore.getState().setUser({ id: "u1" } as any);
    useAuthStore.getState().setLoading(true);

    useAuthStore.getState().reset();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });
});
