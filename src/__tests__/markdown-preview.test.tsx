import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SafeMarkdownPreview } from "../components/SafeMarkdownPreview";

describe("safe Markdown preview", () => {
  it("renders headings, lists, and code without executing untrusted HTML", () => {
    const tick = String.fromCharCode(96).repeat(3);
    const markdown = [
      "# Real README",
      "",
      "- A small project",
      "",
      tick + "javascript",
      "console.log('test')",
      tick,
      "",
      "<img src=x onerror=alert(1)>",
      "<script>window.hacked = true</script>",
    ].join("\n");
    const { container } = render(<SafeMarkdownPreview content={markdown} />);
    expect(screen.getByRole("heading", { name: "Real README" })).toBeInTheDocument();
    expect(screen.getByText("console.log('test')")).toBeInTheDocument();
    expect(container.querySelector(".safe-markdown")).toHaveTextContent("<img src=x onerror=alert(1)>");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect((window as Window & { hacked?: boolean }).hacked).toBeUndefined();
  });

  it("renders basic inline text emphasis as React elements only", () => {
    const tick = String.fromCharCode(96);
    render(<SafeMarkdownPreview content={"**Important** and " + tick + "read-only" + tick} />);
    expect(screen.getByText("Important")).toBeInTheDocument();
    expect(screen.getByText("read-only")).toBeInTheDocument();
  });
});
