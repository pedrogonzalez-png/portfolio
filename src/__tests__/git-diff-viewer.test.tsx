import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { GitDiffViewer } from "../components/GitDiffViewer";
import { diffLineKind } from "../services/gitDiffLines";
import type { GitChangeDetail } from "../services/githubReadonly";

const detail: GitChangeDetail = {
  kind:"commit", title:"Fix verified", refLabel:"a".repeat(40),
  url:"https://github.com/pedrogonzalez-png/jogo-site/commit/" + "a".repeat(40),
  additions:4, deletions:2, fileCount:2, truncated:false,
  files:[
    {filename:"src/main.js",status:"modified",additions:3,deletions:2,
      patch:"@@ -1 +1 @@\n-old code\n+new code\n context",patchTruncated:false},
    {filename:"README.md",status:"modified",additions:1,deletions:0,
      patch:"@@ -1 +1 @@\n+<img src=x onerror=alert(1)>",patchTruncated:false}
  ]
};
describe("read-only structured Git diff",()=>{
  it("categorizes hunks, additions and removals without executing code",()=>{
    expect(diffLineKind("@@ -1 +1 @@")).toBe("hunk");
    expect(diffLineKind("-old")).toBe("remove");
    expect(diffLineKind("+new")).toBe("add");
    expect(diffLineKind(" unchanged")).toBe("context");
  });
  it("navigates files, colors patch lines and escapes untrusted text",()=>{
    const {container}=render(<GitDiffViewer detail={detail} onClose={()=>{}}/>);
    expect(screen.getByRole("region",{name:"Visualizador de diff Git"})).toBeInTheDocument();
    expect(container.querySelector(".git-patch-remove")).toHaveTextContent("-old code");
    expect(container.querySelector(".git-patch-add")).toHaveTextContent("+new code");
    fireEvent.click(within(screen.getByRole("navigation",{name:"Arquivos alterados"}))
      .getByRole("button",{name:/README\.md/}));
    expect(container.querySelector(".git-diff-patch")).toHaveTextContent("<img src=x onerror=alert(1)>");
    expect(container.querySelector("img")).toBeNull();
  });
});
