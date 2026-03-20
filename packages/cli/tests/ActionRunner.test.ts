import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ActionRunner } from "../src/ActionRunner";
import { PlopNextCore } from "@plop-next/core";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("ActionRunner", () => {
  let core: PlopNextCore;
  let runner: ActionRunner;
  let tmpDir: string;

  beforeEach(async () => {
    core = new PlopNextCore();
    runner = new ActionRunner(core);
    tmpDir = await mkdtemp(join(tmpdir(), "plopnext-test-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  // ── add ──────────────────────────────────────────────────────────

  it("add creates a new file with template content", async () => {
    const path = join(tmpDir, "hello.txt");
    const result = await runner.run("add", { type: "add", path, template: "Hello {{name}}!" }, { name: "World" });
    const content = await readFile(path, "utf8");
    expect(content).toBe("Hello World!");
    expect(result.message).toContain(path);
  });

  it("add creates parent directories as needed", async () => {
    const path = join(tmpDir, "a", "b", "c.txt");
    await runner.run("add", { type: "add", path, template: "nested" }, {});
    const content = await readFile(path, "utf8");
    expect(content).toBe("nested");
  });

  it("add throws if the file already exists", async () => {
    const path = join(tmpDir, "exists.txt");
    await runner.run("add", { type: "add", path, template: "first" }, {});
    await expect(
      runner.run("add", { type: "add", path, template: "second" }, {}),
    ).rejects.toThrow();
  });

  // ── modify ───────────────────────────────────────────────────────

  it("modify replaces a pattern in an existing file", async () => {
    const path = join(tmpDir, "file.txt");
    await runner.run("add", { type: "add", path, template: "foo bar foo" }, {});
    await runner.run("modify", { type: "modify", path, pattern: /foo/g, template: "baz" }, {});
    const content = await readFile(path, "utf8");
    expect(content).toBe("baz bar baz");
  });

  it("modify throws if file does not exist", async () => {
    const path = join(tmpDir, "missing.txt");
    await expect(
      runner.run("modify", { type: "modify", path, pattern: /x/, template: "y" }, {}),
    ).rejects.toThrow();
  });

  // ── append ───────────────────────────────────────────────────────

  it("append adds content to an existing file", async () => {
    const path = join(tmpDir, "log.txt");
    await runner.run("add", { type: "add", path, template: "line1\n" }, {});
    await runner.run("append", { type: "append", path, template: "line2\n" }, {});
    const content = await readFile(path, "utf8");
    expect(content).toBe("line1\nline2\n");
  });

  it("append creates the file if it does not exist", async () => {
    const path = join(tmpDir, "new.txt");
    await runner.run("append", { type: "append", path, template: "first\n" }, {});
    const content = await readFile(path, "utf8");
    expect(content).toBe("first\n");
  });

  // ── unknown type ─────────────────────────────────────────────────

  it("throws on unknown action type", async () => {
    await expect(
      runner.run("unknown", { type: "unknown", path: "/tmp/x" }, {}),
    ).rejects.toThrow();
  });

  // ── interpolation ────────────────────────────────────────────────

  it("leaves unresolved placeholders unchanged", async () => {
    const path = join(tmpDir, "tmpl.txt");
    await runner.run("add", { type: "add", path, template: "{{a}} {{b}}" }, { a: "hello" });
    const content = await readFile(path, "utf8");
    expect(content).toBe("hello {{b}}");
  });
});
