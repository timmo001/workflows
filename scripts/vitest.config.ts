import { defineConfig } from "vitest/config";

export default defineConfig({
  ssr: {
    resolve: { conditions: ["bun", "node", "import", "default"] },
  },
  test: {
    server: { deps: { inline: ["@timmo001/effect-gh"] } },
  },
});
