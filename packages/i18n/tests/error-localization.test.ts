import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorHandler, GeneratorNotFoundError, PlopNextCore } from "@plop-next/core";
import { PlopNextI18n } from "../src/PlopNextI18n";

describe("error localization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the active plopfile locale through core.t", () => {
    const core = new PlopNextCore();
    new PlopNextI18n(core);
    core.useI18n({ force: "fr" });

    const handler = new ErrorHandler({ useColors: false });
    handler.setTranslator((key, args, fallback) => core.t(key, args, fallback));

    const stderr = vi.spyOn(console, "error").mockImplementation(() => undefined);

    handler.handle(new GeneratorNotFoundError("component"));

    expect(stderr).toHaveBeenCalledWith('✖ Générateur "component" introuvable.');
  });
});
