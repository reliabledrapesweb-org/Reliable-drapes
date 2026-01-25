import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "./AuthForm";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock motion/react
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className}>{children}</div>
    ),
    h1: ({ children, className, ...props }: any) => (
      <h1 className={className}>{children}</h1>
    ),
    p: ({ children, className, ...props }: any) => (
      <p className={className}>{children}</p>
    ),
    form: ({ children, onSubmit, ...props }: any) => (
      <form onSubmit={onSubmit}>{children}</form>
    ),
    button: ({
      children,
      onClick,
      type,
      disabled,
      className,
      ...props
    }: any) => (
      <button
        onClick={onClick}
        type={type}
        disabled={disabled}
        className={className}
      >
        {children}
      </button>
    ),
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock signupAction
const mockSignupAction = vi.fn();
vi.mock("@/lib/actions/auth", () => ({
  signupAction: (data: any) => mockSignupAction(data),
}));

// Mock useAuthStore
const mockAuthStore = {
  setUser: vi.fn(),
  setSession: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
};

vi.mock("@/lib/store", () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock useToast
const mockAddToast = vi.fn();
const mockRemoveToast = vi.fn();
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({
    toasts: [],
    addToast: mockAddToast,
    removeToast: mockRemoveToast,
  }),
  ToastContainer: () => null,
}));

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: {
    auth: {
      signInWithPassword: (data: any) => mockSignInWithPassword(data),
      signInWithOAuth: (options: any) => mockSignInWithOAuth(options),
    },
  },
}));

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
    mockSignupAction.mockResolvedValue({ success: true });
  });

  describe("Login Mode", () => {
    test("renders login form with default title", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByText("Log into Reliable")).toBeInTheDocument();
    });

    test("renders login form with custom title", () => {
      render(<AuthForm mode="login" title="Welcome Back" />);

      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    test("renders subtitle when provided", () => {
      render(<AuthForm mode="login" subtitle="Please log in to continue" />);

      expect(screen.getByText("Please log in to continue")).toBeInTheDocument();
    });

    test("renders email and password fields", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    test("renders Log In button", () => {
      render(<AuthForm mode="login" />);

      expect(
        screen.getByRole("button", { name: /log in/i }),
      ).toBeInTheDocument();
    });

    test("renders Forgot Password link", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
      expect(screen.getByText("Forgot Password?").closest("a")).toHaveAttribute(
        "href",
        "/forgot-password",
      );
    });

    test("renders signup link", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText("Sign up")).toHaveAttribute("href", "/signup");
    });

    test("renders OAuth buttons", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByText("Continue with Google")).toBeInTheDocument();
      expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
    });

    test("does not render Full Name and Confirm Password fields", () => {
      render(<AuthForm mode="login" />);

      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/confirm password/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Signup Mode", () => {
    test("renders signup form with default title", () => {
      render(<AuthForm mode="signup" />);

      expect(
        screen.getByRole("heading", { name: "Create Account" }),
      ).toBeInTheDocument();
    });

    test("renders Full Name field", () => {
      render(<AuthForm mode="signup" />);

      expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    });

    test("renders Confirm Password field", () => {
      render(<AuthForm mode="signup" />);

      // Use the specific input ID
      expect(document.getElementById("confirm_password")).toBeInTheDocument();
    });

    test("renders Create Account button", () => {
      render(<AuthForm mode="signup" />);

      expect(
        screen.getByRole("button", { name: /create account/i }),
      ).toBeInTheDocument();
    });

    test("renders login link", () => {
      render(<AuthForm mode="signup" />);

      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByText("Log in")).toHaveAttribute("href", "/login");
    });

    test("does not render Forgot Password link", () => {
      render(<AuthForm mode="signup" />);

      expect(screen.queryByText("Forgot Password?")).not.toBeInTheDocument();
    });
  });

  describe("Password Visibility Toggle", () => {
    test("toggles password visibility when button is clicked", async () => {
      const user = userEvent.setup();
      render(<AuthForm mode="login" />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const toggleButton = screen.getByRole("button", {
        name: "Toggle password visibility",
      });

      expect(passwordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("toggles confirm password visibility in signup mode", async () => {
      const user = userEvent.setup();
      render(<AuthForm mode="signup" />);

      const confirmPasswordInput = document.getElementById(
        "confirm_password",
      ) as HTMLInputElement;
      const toggleButton = screen.getByRole("button", {
        name: "Toggle confirm password visibility",
      });

      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton);
      expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });
  });

  describe("Form Validation", () => {
    test("email field has required attribute", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "required",
      );
    });

    test("password field has required attribute", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("required");
    });

    test("full name field has required attribute in signup mode", () => {
      render(<AuthForm mode="signup" />);

      expect(screen.getByPlaceholderText("John Doe")).toHaveAttribute(
        "required",
      );
    });

    test("shows error when passwords do not match in signup mode", async () => {
      const user = userEvent.setup();
      render(<AuthForm mode="signup" />);

      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");
      await user.type(
        document.getElementById("confirm_password") as HTMLInputElement,
        "differentpassword",
      );
      await user.type(screen.getByPlaceholderText("John Doe"), "Test User");

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      expect(mockAddToast).toHaveBeenCalledWith(
        "Passwords do not match",
        "error",
      );
    });

    test("confirm password field has required attribute", () => {
      render(<AuthForm mode="signup" />);

      const confirmPasswordInput = document.getElementById("confirm_password");
      expect(confirmPasswordInput).toHaveAttribute("required");
    });
  });

  describe("Login Submission", () => {
    test("calls signInWithPassword on successful login", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
            email: "test@example.com",
            user_metadata: {},
          },
          session: {
            access_token: "token",
            refresh_token: "refresh",
            expires_at: 12345,
          },
        },
        error: null,
      });

      render(<AuthForm mode="login" />);

      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      const submitButton = screen.getByRole("button", { name: /log in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    test("shows error toast on login failure", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: {},
        error: { message: "Invalid credentials" },
      });

      render(<AuthForm mode="login" />);

      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^password$/i), "wrongpassword");

      const submitButton = screen.getByRole("button", { name: /log in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith("Login failed", "error");
      });
    });

    test("updates auth store on successful login", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
            email: "test@example.com",
            user_metadata: { full_name: "Test User" },
          },
          session: {
            access_token: "token",
            refresh_token: "refresh",
            expires_at: 12345,
          },
        },
        error: null,
      });

      render(<AuthForm mode="login" />);

      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      const submitButton = screen.getByRole("button", { name: /log in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthStore.setUser).toHaveBeenCalledWith({
          id: "user-123",
          email: "test@example.com",
          full_name: "Test User",
        });
      });
    });

    test("navigates to home on successful login", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
            email: "test@example.com",
            user_metadata: {},
          },
          session: {
            access_token: "token",
            refresh_token: "refresh",
            expires_at: 12345,
          },
        },
        error: null,
      });

      render(<AuthForm mode="login" />);

      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");

      const submitButton = screen.getByRole("button", { name: /log in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("Signup Submission", () => {
    test("calls signupAction on successful signup", async () => {
      const user = userEvent.setup();
      mockSignupAction.mockResolvedValue({
        success: true,
        requiresVerification: true,
      });

      render(<AuthForm mode="signup" />);

      await user.type(screen.getByPlaceholderText("John Doe"), "Test User");
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");
      await user.type(
        document.getElementById("confirm_password") as HTMLInputElement,
        "password123",
      );

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignupAction).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          full_name: "Test User",
        });
      });
    });

    test("shows error toast on signup failure", async () => {
      const user = userEvent.setup();
      mockSignupAction.mockResolvedValue({
        success: false,
        error: "Email already in use",
      });

      render(<AuthForm mode="signup" />);

      await user.type(screen.getByPlaceholderText("John Doe"), "Test User");
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");
      await user.type(
        document.getElementById("confirm_password") as HTMLInputElement,
        "password123",
      );

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          "Email already in use",
          "error",
        );
      });
    });

    test("redirects to OTP verification on successful signup", async () => {
      const user = userEvent.setup();
      mockSignupAction.mockResolvedValue({
        success: true,
        requiresVerification: true,
      });

      render(<AuthForm mode="signup" />);

      await user.type(screen.getByPlaceholderText("John Doe"), "Test User");
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^password$/i), "password123");
      await user.type(
        document.getElementById("confirm_password") as HTMLInputElement,
        "password123",
      );

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          "/verify-otp?email=test%40example.com",
        );
      });
    });
  });

  describe("OAuth Login", () => {
    test("initiates Google login when button is clicked", async () => {
      const user = userEvent.setup();
      render(<AuthForm mode="login" />);

      await user.click(screen.getByText("Continue with Google"));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: "google",
          }),
        );
      });
    });

    test("initiates Apple login when button is clicked", async () => {
      const user = userEvent.setup();
      render(<AuthForm mode="login" />);

      await user.click(screen.getByText("Continue with Apple"));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: "apple",
          }),
        );
      });
    });

    test("shows error toast when Google login fails", async () => {
      const user = userEvent.setup();
      mockSignInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: "OAuth failed" },
      });

      render(<AuthForm mode="login" />);

      await user.click(screen.getByText("Continue with Google"));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith("OAuth failed", "error");
      });
    });
  });

  describe("Footer Links", () => {
    test("renders Terms and Privacy links", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByText("Terms")).toHaveAttribute(
        "href",
        "/terms-of-service",
      );
      expect(screen.getByText("Privacy")).toHaveAttribute(
        "href",
        "/privacy-policy",
      );
    });

    test("renders reCAPTCHA notice", () => {
      render(<AuthForm mode="login" />);

      expect(
        screen.getByText(/secure login with recaptcha/i),
      ).toBeInTheDocument();
    });
  });
});
