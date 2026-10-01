import { describe, expect, it } from "vitest";
import { Annotations } from "../src/action/Annotations.js";
import {
  checksumFor,
  renderPkgbuild,
} from "../src/actions/prepare-arch-bin/workflow.js";

const x86_64 = "a".repeat(64);

const aarch64 = "b".repeat(64);

const template = [
  "pkgname=notes-bin",
  "pkgver=0.1.0",
  "sha256sums=('SKIP' 'SKIP')",
  "sha256sums_x86_64=('SKIP')",
  "sha256sums_aarch64=('SKIP')",
].join("\n");

const messageOf = (result: string | Annotations.ActionFailure) =>
  result instanceof Annotations.ActionFailure ? result.message : result;

describe("prepare-arch-bin", () => {
  it("renders the version and both tarball checksums", () => {
    expect(
      renderPkgbuild(template, { version: "20260101.0", x86_64, aarch64 }),
    ).toBe(
      [
        "pkgname=notes-bin",
        "pkgver=20260101.0",
        "sha256sums=('SKIP' 'SKIP')",
        `sha256sums_x86_64=('${x86_64}')`,
        `sha256sums_aarch64=('${aarch64}')`,
      ].join("\n"),
    );
  });

  it("rejects a template missing a rendered line", () => {
    expect(
      messageOf(
        renderPkgbuild("pkgver=0.1.0\nsha256sums_x86_64=('SKIP')", {
          version: "20260101.0",
          x86_64,
          aarch64,
        }),
      ),
    ).toContain("no sha256sums_aarch64= line");
  });

  it("reads a checksum by exact asset name", () => {
    const checksums = `${x86_64}  tool-20260101.0-linux-x86_64.tar.gz\n${aarch64}  tool-20260101.0-linux-aarch64.tar.gz.sig\n`;

    expect(checksumFor(checksums, "tool-20260101.0-linux-x86_64.tar.gz")).toBe(
      x86_64,
    );

    expect(
      messageOf(checksumFor(checksums, "tool-20260101.0-linux-aarch64.tar.gz")),
    ).toContain("no entry");
  });
});
