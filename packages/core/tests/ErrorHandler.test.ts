import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorHandler } from "../src/errors/ErrorHandler";
import {
  GeneratorNotFoundError,
  UserCancelledError,
} from "../src/errors/PlopError";

describe("ErrorHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs English fallback messages by default", () => {
    const handler = new ErrorHandler({ useColors: false });
    const stderr = vi.spyOn(console, "error").mockImplementation(() => undefined);

    handler.handle(new GeneratorNotFoundError("component"));

    expect(stderr).toHaveBeenCalledWith('✖ Generator "component" not found.');
  });

  it("uses the configured translator for localizable plop errors", () => {
    const handler = new ErrorHandler({ useColors: false });
    const stderr = vi.spyOn(console, "error").mockImplementation(() => undefined);

    handler.setTranslator((key, _args, fallback) => {
      if (key === "errors.userCancelled") {
        return "Prompt annule par l'utilisateur.";
      }

      return fallback ?? key;
    });

    handler.handle(new UserCancelledError());

    expect(stderr).toHaveBeenCalledWith("⚠ Prompt annule par l'utilisateur.");
  });
});
