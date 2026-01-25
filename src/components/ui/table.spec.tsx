import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";

describe("Table Components", () => {
  describe("Table", () => {
    test("renders table element", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    test("applies custom className", () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByRole("table")).toHaveClass("custom-table");
    });

    test("is wrapped in overflow container", () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const table = screen.getByRole("table");
      expect(table.parentElement).toHaveClass("overflow-auto");
    });
  });

  describe("TableHeader", () => {
    test("renders thead element", () => {
      render(
        <Table>
          <TableHeader data-testid="header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      );
      expect(screen.getByTestId("header").tagName).toBe("THEAD");
    });
  });

  describe("TableBody", () => {
    test("renders tbody element", () => {
      render(
        <Table>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId("body").tagName).toBe("TBODY");
    });
  });

  describe("TableFooter", () => {
    test("renders tfoot element", () => {
      render(
        <Table>
          <TableFooter data-testid="footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>,
      );
      expect(screen.getByTestId("footer").tagName).toBe("TFOOT");
    });
  });

  describe("TableRow", () => {
    test("renders tr element", () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId("row").tagName).toBe("TR");
    });

    test("applies hover styles", () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId("row")).toHaveClass("hover:bg-muted/50");
    });
  });

  describe("TableHead", () => {
    test("renders th element", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      );
      expect(screen.getByTestId("head").tagName).toBe("TH");
    });

    test("applies font-medium class", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      );
      expect(screen.getByTestId("head")).toHaveClass("font-medium");
    });
  });

  describe("TableCell", () => {
    test("renders td element", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell content</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId("cell").tagName).toBe("TD");
    });

    test("applies padding class", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId("cell")).toHaveClass("p-4");
    });
  });

  describe("TableCaption", () => {
    test("renders caption element", () => {
      render(
        <Table>
          <TableCaption>Table caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByText("Table caption").tagName).toBe("CAPTION");
    });
  });

  describe("Full Table composition", () => {
    test("renders complete table structure", () => {
      render(
        <Table>
          <TableCaption>Product List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Product A</TableCell>
              <TableCell>$100</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Product B</TableCell>
              <TableCell>$200</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>$300</TableCell>
            </TableRow>
          </TableFooter>
        </Table>,
      );

      expect(screen.getByText("Product List")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Product A")).toBeInTheDocument();
      expect(screen.getByText("Total")).toBeInTheDocument();
    });
  });
});
