import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const releaseBundle = resolve(".github/actions/release-bun-cli/dist/index.js");

const dispatchBundle = resolve(
  ".github/actions/build-arch-package/dist/index.js",
);

const version = "20260101.0";

const sha = "0123456789abcdef0123456789abcdef01234567";

const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), "github-action-runtime-"));
  const bin = join(root, "bin");
  mkdirSync(bin);
  mkdirSync(join(root, "assets"));
  writeFileSync(join(root, "assets", "asset with spaces.tar.gz"), "asset");
  writeFileSync(join(root, "assets", "SHA256SUMS"), "checksum");
  writeFileSync(join(root, "assets", ".hidden"), "hidden");
  writeFileSync(
    join(bin, "gh"),
    `#!/bin/bash
set -euo pipefail
printf '%s\\0' "$@" >> "$GH_TRACE"
printf '\\0' >> "$GH_TRACE"
printf '%s\\n' "$PWD" "$GH_TOKEN" "$GITHUB_TOKEN" "$INHERITED_VALUE" >> "$GH_CONTEXT"
if [[ "$1" == api ]]; then cat > "$GH_BODY"; fi
if [[ "$1" == api && "$GH_FAIL" != api ]]; then exit 0; fi
printf '%s stdout\\n' "$2"
printf '%s stderr\\n' "$2" >&2
if [[ "$2" == "$GH_FAIL" || "$1" == "$GH_FAIL" ]]; then exit 17; fi
if [[ "$2" == edit && -n "$GH_ADD_ASSET" ]]; then touch "$GH_ADD_ASSET"; fi
`,
  );
  chmodSync(join(bin, "gh"), 0o755);

  const env = {
    ...process.env,
    LC_ALL: "C",
    PATH: `${bin}:${process.env.PATH}`,
    GH_TOKEN: "fixture-gh-token",
    GITHUB_TOKEN: "fixture-github-token",
    GH_CONFIG_DIR: join(root, "gh-config"),
    GH_TRACE: join(root, "trace"),
    GH_CONTEXT: join(root, "context"),
    GH_BODY: join(root, "body"),
    GH_FAIL: "",
    GH_ADD_ASSET: "",
    INHERITED_VALUE: "inherited",
    INPUT_STAGE: "publish-release",
    INPUT_ASSETROOT: "assets",
    INPUT_RELEASEVERSION: version,
    INPUT_SOURCESHA: sha,
    INPUT_EXISTINGRELEASE: "false",
    INPUT_PRERELEASE: "true",
  };

  return {
    root,
    env,
    git: (args: string[]) =>
      execFileSync("git", args, { cwd: root, encoding: "utf8", env }).trim(),
    run: (runtime: string, bundle: string) =>
      spawnSync(runtime, [bundle], {
        cwd: root,
        env,
        encoding: "utf8",
        timeout: 10_000,
      }),
    calls: () =>
      existsSync(env.GH_TRACE)
        ? readFileSync(env.GH_TRACE, "utf8")
            .split("\0\0")
            .filter(Boolean)
            .map((call) => call.split("\0"))
        : [],
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
};

const initRepo = (test: ReturnType<typeof fixture>) => {
  test.git(["init", "-b", "main"]);
  test.git([
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "commit",
    "--allow-empty",
    "-m",
    "fixture",
  ]);
  test.env.INPUT_SOURCESHA = test.git(["rev-parse", "HEAD"]);
};

describe.each(["node", "bun"])("GitHub action bundles on %s", (runtime) => {
  it.each(["true", "false"])(
    "creates a release with prerelease=%s and literal asset arguments",
    (prerelease) => {
      const test = fixture();

      try {
        initRepo(test);
        test.env.INPUT_PRERELEASE = prerelease;
        writeFileSync(join(test.root, "assets", "newline\nasset"), "asset");
        const result = test.run(runtime, releaseBundle);
        expect(result.error).toBeUndefined();
        expect(result.status).toBe(0);
        expect(test.calls()).toEqual([
          [
            "release",
            "create",
            version,
            "assets/SHA256SUMS",
            "assets/asset with spaces.tar.gz",
            "assets/newline\nasset",
            "--target",
            test.env.INPUT_SOURCESHA,
            "--title",
            version,
            "--notes",
            `Rolling release ${version} from commit ${test.env.INPUT_SOURCESHA}.`,
            ...(prerelease === "true" ? ["--prerelease"] : []),
          ],
        ]);
        expect(result.stdout).toBe("create stdout\n");
        expect(result.stderr).toBe("create stderr\n");
        expect(readFileSync(test.env.GH_CONTEXT, "utf8")).toBe(
          `${test.root}\nfixture-gh-token\nfixture-github-token\ninherited\n`,
        );
      } finally {
        test.cleanup();
      }
    },
  );

  it("uploads to an explicitly existing release without a local tag or edit", () => {
    const test = fixture();

    try {
      test.env.INPUT_EXISTINGRELEASE = "true";
      const result = test.run(runtime, releaseBundle);
      expect(result.status).toBe(0);
      expect(test.calls()).toEqual([
        ["release", "view", version],
        [
          "release",
          "upload",
          version,
          "assets/SHA256SUMS",
          "assets/asset with spaces.tar.gz",
          "--clobber",
        ],
      ]);
      expect(result.stdout).toBe("upload stdout\n");
      expect(result.stderr).toBe("view stderr\nupload stderr\n");
    } finally {
      test.cleanup();
    }
  });

  it("checks the tag before probing, then edits before enumerating upload assets", () => {
    const test = fixture();

    try {
      initRepo(test);
      test.git(["tag", version]);
      test.env.INPUT_PRERELEASE = "false";
      test.env.GH_ADD_ASSET = "assets/after-edit";
      const result = test.run(runtime, releaseBundle);
      expect(result.status).toBe(0);
      expect(test.calls()).toEqual([
        ["release", "view", version],
        [
          "release",
          "edit",
          version,
          "--target",
          test.env.INPUT_SOURCESHA,
          "--title",
          version,
          "--notes",
          `Rolling release ${version} from commit ${test.env.INPUT_SOURCESHA}.`,
          "--prerelease=false",
        ],
        [
          "release",
          "upload",
          version,
          "assets/SHA256SUMS",
          "assets/after-edit",
          "assets/asset with spaces.tar.gz",
          "--clobber",
        ],
      ]);
      expect(result.stdout).toBe("edit stdout\nupload stdout\n");
      expect(result.stderr).toBe("edit stderr\nupload stderr\n");
    } finally {
      test.cleanup();
    }
  });

  it("creates after a same-commit release probe exits nonzero", () => {
    const test = fixture();

    try {
      initRepo(test);
      test.git(["tag", version]);
      test.env.GH_FAIL = "view";
      const result = test.run(runtime, releaseBundle);
      expect(result.status).toBe(0);
      expect(test.calls().map((call) => call[1])).toEqual(["view", "create"]);
      expect(result.stdout).toBe("create stdout\n");
      expect(result.stderr).toBe("create stderr\n");
    } finally {
      test.cleanup();
    }
  });

  it.each(["view", "create", "edit", "upload"])(
    "stops on %s failure without retrying a mutation",
    (command) => {
      const test = fixture();

      try {
        initRepo(test);

        if (command === "edit") test.git(["tag", version]);

        if (command === "view" || command === "upload")
          test.env.INPUT_EXISTINGRELEASE = "true";
        test.env.GH_FAIL = command;
        const result = test.run(runtime, releaseBundle);
        expect(result.status).toBe(1);
        expect(test.calls().map((call) => call[1])).toEqual(
          command === "edit" || command === "upload"
            ? ["view", command]
            : [command],
        );
        expect(result.stdout).toContain("::error title=Command failed::");
        expect(result.stdout).toContain(`${command} stderr`);
        expect(result.stderr).toContain(`${command} stderr\n`);
      } finally {
        test.cleanup();
      }
    },
  );

  it("rejects a mismatched tag before invoking gh", () => {
    const test = fixture();

    try {
      initRepo(test);
      test.git(["tag", version]);
      test.env.INPUT_SOURCESHA = sha;
      const result = test.run(runtime, releaseBundle);
      expect(result.status).toBe(1);
      expect(test.calls()).toEqual([]);
      expect(result.stdout).toContain(
        `::error title=Command failed::Release tag ${version} already points to another commit.`,
      );
      expect(result.stderr).toBe(
        `Release tag ${version} already points to another commit.\n`,
      );
    } finally {
      test.cleanup();
    }
  });

  it("retains Bash's unmatched asset glob", () => {
    const test = fixture();

    try {
      test.env.INPUT_EXISTINGRELEASE = "true";
      test.env.INPUT_ASSETROOT = "missing assets";
      const result = test.run(runtime, releaseBundle);
      expect(result.status).toBe(0);
      expect(test.calls()[1]).toEqual([
        "release",
        "upload",
        version,
        "missing assets/*",
        "--clobber",
      ]);
    } finally {
      test.cleanup();
    }
  });

  it.each([false, true])(
    "sends a single dispatch POST with JSON on stdin (failure=%s)",
    (fail) => {
      const test = fixture();

      try {
        const env = Object.assign(test.env, {
          INPUT_STAGE: "dispatch",
          INPUT_PACKAGENAME: "example-git",
          INPUT_SOURCEREPOSITORY: "timmo001/example",
          INPUT_SOURCERUNID: "123",
          INPUT_ARTIFACTNAME: 'candidate "quote"\n$(touch should-not-exist)',
          GH_FAIL: fail ? "api" : "",
        });

        const result = test.run(runtime, dispatchBundle);
        expect(result.error).toBeUndefined();
        expect(result.status).toBe(fail ? 1 : 0);
        expect(test.calls()).toEqual([
          [
            "api",
            "--method",
            "POST",
            "repos/timmo001/arch-repo/dispatches",
            "--input",
            "-",
          ],
        ]);
        expect(readFileSync(env.GH_BODY, "utf8")).toBe(
          JSON.stringify({
            event_type: "publish-package",
            client_payload: {
              artifact_name: env.INPUT_ARTIFACTNAME,
              source_repository: env.INPUT_SOURCEREPOSITORY,
              source_run_id: env.INPUT_SOURCERUNID,
              source_sha: sha,
            },
          }),
        );
        expect(existsSync(join(test.root, "should-not-exist"))).toBe(false);
        expect(result.stderr).toBe(fail ? "--method stderr\n" : "");

        if (fail) {
          expect(result.stdout).toContain("--method stdout\n");
          expect(result.stdout).toContain(
            "::error title=Command failed::--method stderr",
          );
        } else expect(result.stdout).toBe("");
      } finally {
        test.cleanup();
      }
    },
  );
});
