# Release the Bootstrap backend

Use Node.js 24 and npm from the repository root.

```sh
npm ci
npm run build
npm pack ./dist/package
```

`dist/package` contains the public package manifest, compiled view and test adapter modules, declarations, CSS, and licenses. Each public `.vue` subpath resolves to its own ESM entry. The package shares Vue and Core with the application through peer dependencies and uses Bootstrap `6.0.0-alpha.1` as an external dependency.

The release workflow in `.github/workflows/publish.yml` checks the packed exports and installs the tarball under `@uninterface/backend`. It type-checks and builds a fresh consumer and runs Chromium checks in development and production.

For maintainers, push a Git tag with the full package version and a `v` prefix. The workflow sends stable versions to `latest` and SemVer prereleases to `pre-release`. npm Trusted Publishing uses the `publish.yml` workflow and the GitHub `npm` environment.
