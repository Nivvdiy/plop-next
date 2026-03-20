import type { PromptHandler } from "./types";
import { inputPromptHandler } from "./inputPrompt";
import { numberPromptHandler } from "./numberPrompt";
import { confirmPromptHandler } from "./confirmPrompt";
import { selectPromptHandler } from "./selectPrompt";
import { rawlistPromptHandler } from "./rawlistPrompt";
import { expandPromptHandler } from "./expandPrompt";
import { searchPromptHandler } from "./searchPrompt";
import { checkboxPromptHandler } from "./checkboxPrompt";
import { editorPromptHandler } from "./editorPrompt";
import { passwordPromptHandler } from "./passwordPrompt";
import { PromptHandlerRegistry } from "./PromptHandlerRegistry";

const builtInPromptHandlers: PromptHandler[] = [
  inputPromptHandler,
  numberPromptHandler,
  confirmPromptHandler,
  selectPromptHandler,
  rawlistPromptHandler,
  expandPromptHandler,
  searchPromptHandler,
  checkboxPromptHandler,
  editorPromptHandler,
  passwordPromptHandler,
];

/** Register all built-in @inquirer prompt handlers into a registry instance. */
export function registerBuiltInPromptHandlers(registry: PromptHandlerRegistry): void {
  for (const handler of builtInPromptHandlers) {
    registry.register(handler);
  }
}
