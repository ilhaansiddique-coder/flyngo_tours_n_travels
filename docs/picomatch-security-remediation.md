# Picomatch release blocker — 18 November 2026

The full dependency audit stopped CI on GHSA-fc5q-39xc-vjpf
(CVE-2026-112366). This is separate from the earlier dated audit results in
`dependency-security-review.md`. Upstream picomatch still has no patched release:
4.0.7 and earlier are affected.

## Remediation

Both application manifests override **every** transitive `picomatch` dependency
with the exact npm alias `npm:@ryotsu/picomatch@4.0.7-a`. This is a third-party
security fork, not an official upstream release. The lockfiles pin the downloaded
archive and its SHA-512 integrity. No audit exceptions, severity changes or
`continue-on-error` were added. No lifecycle/install scripts or runtime
dependencies are supplied by this fork.

Sources reviewed:

- [Advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
- [Fork source](https://github.com/ryotsu-kankichi/secured-picomatch)
- [Fork changelog](https://github.com/ryotsu-kankichi/secured-picomatch/blob/master/CHANGELOG.md)

The published fork archive was compared against the original 4.0.7 archive.
Runtime differences are confined to `lib/parse.js` and `lib/constants.js`:
single-branch repeated wildcards are collapsed when equivalent, and unsupported
complex forms are treated literally; additional fixes address POSIX bracket
negation/punctuation and globstar newline/extension handling. The entry points,
scanner, matching API, utilities and license are unchanged. The advisory's
`+(*a)` attack followed by a failing suffix timed out against the original
package in an isolated process, and completed against the fork.

## Compatibility and verification

This deliberately replaces old 2.x copies as well as 4.x copies with the fork's
4.x API. Node 22 is already required by the project. Captured substrings and
unsupported complex extglobs can change. Do not set `maxExtglobRecursion: false`:
that explicitly disables the parser's safeguards.

CI retains the full `npm audit --audit-level=high` for each application and adds
`node ../scripts/verify-glob-security.cjs` after it. The script checks every
installed copy against the reviewed package name, version and archive integrity;
exercises matching, ignore rules, braces, extglobs, negation, scan/parse/makeRe;
and tests malicious repeated wildcards in child processes with a hard timeout.
Both clean installations contain seven copies and pass these checks. Both full
audits report zero findings at the time of this change. These checks supplement
the required unit, PostgreSQL, browser and production-build release gates.

Local Node 22 verification passed: 268 backend unit tests, 48 real PostgreSQL
integration tests, 31 frontend unit tests, all 36 Chromium/Firefox browser
checks, both lints and both production builds. PostgreSQL fixtures were confined
to the disposable localhost test databases. A failed Windows sandbox build cache
was archived before the clean frontend build; no application workaround or build
command change was needed.

This is a temporary dependency decision with a maintenance cost: review upstream
releases and replace the alias with an official patched release once its source,
audit results and project regressions pass. Do not remove the override merely
because npm reports zero advisories for the differently named fork. Scanner
results alone do not establish that a security fix works. The reproduction and
bounded regressions are retained for that reason.

No schema changes, production data changes or application-facing API changes are
required. Fresh installs/images must use the committed lockfiles to receive the
replacement.
