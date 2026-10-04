import { defineConfig } from "oxlint";
import effectRulesConfig from "@timmo001/oxlint-rules/configs/recommended-effect";

export default defineConfig({
  extends: [effectRulesConfig],
  options: {
    typeAware: true,
    maxWarnings: 0,
  },
  ignorePatterns: [".github/actions/**/dist/**"],
});
