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
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect((window as Window & { hacked?: boolean }).hacked).toBeUndefined();
  });

  it("renders basic inline text emphasis as React elements only", () => {
    render(<SafeMarkdownPreview content="**Important** and \x60read-only\x60" />);
    expect(screen.getByText("Important")).toBeInTheDocument();
    expect(screen.getByText("read-only")).toBeInTheDocument();
  });
});
