import { describe, expect, test, beforeEach } from "vitest";
import { useAdminPreferencesStore } from "./adminPreferencesStore";

describe("Admin Preferences Store", () => {
  beforeEach(() => {
    useAdminPreferencesStore.getState().resetToDefaults();
  });

  test("initializes with default values", () => {
    const state = useAdminPreferencesStore.getState();
    expect(state.themeMode).toBe("light");
    expect(state.accentColor).toBe("purple");
    expect(state.sidebarLayout).toBe("default");
  });

  test("updates theme mode", () => {
    useAdminPreferencesStore.getState().setThemeMode("dark");
    expect(useAdminPreferencesStore.getState().themeMode).toBe("dark");
  });

  test("updates accent color", () => {
    useAdminPreferencesStore.getState().setAccentColor("blue");
    expect(useAdminPreferencesStore.getState().accentColor).toBe("blue");
  });

  test("updates sidebar layout", () => {
    useAdminPreferencesStore.getState().setSidebarLayout("compact");
    expect(useAdminPreferencesStore.getState().sidebarLayout).toBe("compact");
  });

  test("toggles sidebar", () => {
    const initialState = useAdminPreferencesStore.getState().sidebarCollapsed;
    useAdminPreferencesStore.getState().toggleSidebar();
    expect(useAdminPreferencesStore.getState().sidebarCollapsed).toBe(
      !initialState,
    );
  });

  test("resets to defaults", () => {
    useAdminPreferencesStore.getState().setThemeMode("dark");
    useAdminPreferencesStore.getState().setAccentColor("red");

    useAdminPreferencesStore.getState().resetToDefaults();

    const state = useAdminPreferencesStore.getState();
    expect(state.themeMode).toBe("light");
    expect(state.accentColor).toBe("purple");
  });
});
