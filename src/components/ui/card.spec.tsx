import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./card";

describe("Card Components", () => {
  describe("Card", () => {
    test("renders with children", () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    test("applies custom className", () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveClass("custom-class");
    });

    test("has data-slot attribute", () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
    });
  });

  describe("CardHeader", () => {
    test("renders with children", () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    test("has data-slot attribute", () => {
      render(<CardHeader data-testid="header">Content</CardHeader>);
      expect(screen.getByTestId("header")).toHaveAttribute(
        "data-slot",
        "card-header",
      );
    });
  });

  describe("CardTitle", () => {
    test("renders with children", () => {
      render(<CardTitle>My Title</CardTitle>);
      expect(screen.getByText("My Title")).toBeInTheDocument();
    });

    test("has data-slot attribute", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      expect(screen.getByTestId("title")).toHaveAttribute(
        "data-slot",
        "card-title",
      );
    });

    test("applies font-semibold class", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      expect(screen.getByTestId("title")).toHaveClass("font-semibold");
    });
  });

  describe("CardDescription", () => {
    test("renders with children", () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    test("has data-slot attribute", () => {
      render(<CardDescription data-testid="desc">Desc</CardDescription>);
      expect(screen.getByTestId("desc")).toHaveAttribute(
        "data-slot",
        "card-description",
      );
    });

    test("applies muted text class", () => {
      render(<CardDescription data-testid="desc">Desc</CardDescription>);
      expect(screen.getByTestId("desc")).toHaveClass("text-muted-foreground");
    });
  });

  describe("CardContent", () => {
    test("renders with children", () => {
      render(<CardContent>Main content</CardContent>);
      expect(screen.getByText("Main content")).toBeInTheDocument();
    });

    test("has data-slot attribute", () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId("content")).toHaveAttribute(
        "data-slot",
        "card-content",
      );
    });

    test("applies padding class", () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId("content")).toHaveClass("px-6");
    });
  });

  describe("CardFooter", () => {
    test("renders with children", () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    test("has data-slot attribute", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId("footer")).toHaveAttribute(
        "data-slot",
        "card-footer",
      );
    });

    test("applies flex class", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId("footer")).toHaveClass("flex");
    });
  });

  describe("CardAction", () => {
    test("renders with children", () => {
      render(<CardAction>Action button</CardAction>);
      expect(screen.getByText("Action button")).toBeInTheDocument();
    });

    test("has data-slot attribute", () => {
      render(<CardAction data-testid="action">Action</CardAction>);
      expect(screen.getByTestId("action")).toHaveAttribute(
        "data-slot",
        "card-action",
      );
    });
  });

  describe("Full Card composition", () => {
    test("renders complete card structure", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Product</CardTitle>
            <CardDescription>A great product</CardDescription>
            <CardAction>
              <button>Edit</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Product details here</p>
          </CardContent>
          <CardFooter>
            <button>Buy Now</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText("Product")).toBeInTheDocument();
      expect(screen.getByText("A great product")).toBeInTheDocument();
      expect(screen.getByText("Product details here")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Buy Now" }),
      ).toBeInTheDocument();
    });
  });
});
