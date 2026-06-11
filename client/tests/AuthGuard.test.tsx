// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "@/components/AuthGuard";

// Mock useAuth hook so we can control auth state without Firebase
const mocks = vi.hoisted(() => ({
  isAuthenticated: false,
  isLoading: true,
  hasResolved: false,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: mocks.isAuthenticated ? { id: "u1", email: "test@test.com" } : null,
    isAuthenticated: mocks.isAuthenticated,
    isLoading: mocks.isLoading,
    hasResolved: mocks.hasResolved,
    logout: vi.fn(),
    isLoggingOut: false,
  }),
}));

vi.mock("@/components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock("@/components/Footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/protected", vi.fn()],
}));

describe("AuthGuard loading state", () => {
  it("shows a spinner while Firebase auth is initializing (isLoading=true)", async () => {
    mocks.isLoading = true;
    mocks.hasResolved = false;
    mocks.isAuthenticated = false;

    render(<AuthGuard><div data-testid="protected-content">Secret</div></AuthGuard>);

    // Spinner should be visible — the animate-spin class on the Loader2 icon
    const spinner = screen.getByRole("main");
    expect(spinner.className).toContain("items-center");
    expect(spinner.className).toContain("justify-center");

    // Protected content must NOT be visible during the loading phase
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });

  it("shows a spinner while hasResolved is false", async () => {
    mocks.isLoading = false;
    mocks.hasResolved = false;
    mocks.isAuthenticated = false;

    render(<AuthGuard><div data-testid="protected-content">Secret</div></AuthGuard>);

    // Still showing spinner because hasResolved is false
    const spinner = screen.getByRole("main");
    expect(spinner.className).toContain("items-center");

    // Protected content must NOT be visible
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });

  it("does NOT flash the login card when auth resolves to authenticated", async () => {
    mocks.isLoading = false;
    mocks.hasResolved = true;
    mocks.isAuthenticated = true;

    render(<AuthGuard><div data-testid="protected-content">Secret</div></AuthGuard>);

    // Protected content should be visible immediately
    expect(screen.queryByTestId("protected-content")).not.toBeNull();

    // Login card should NOT appear
    expect(screen.queryByText("Sign in to access this page.")).toBeNull();
  });

  it("shows the login card when auth resolves to unauthenticated", async () => {
    mocks.isLoading = false;
    mocks.hasResolved = true;
    mocks.isAuthenticated = false;

    render(<AuthGuard><div data-testid="protected-content">Secret</div></AuthGuard>);

    // Protected content should NOT be visible
    expect(screen.queryByTestId("protected-content")).toBeNull();

    // Login card headline should be visible
    expect(screen.queryByText("Sign in to access this page.")).not.toBeNull();
  });
});
