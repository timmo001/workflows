import { defineConfig } from "oxlint";
import effectRulesConfig from "@timmo001/oxlint-rules/configs/recommended-effect";

export default defineConfig({
  extends: [effectRulesConfig],
  ignorePatterns: [".github/actions/**/dist/**"],
});
