# Release the Bootstrap backend

Use Node.js 24 and npm from the repository root.

```sh
npm ci
npm run build
npm pack ./dist/package
```

`dist/package` contains the public package manifest, compiled view and test adapter modules, declarations, CSS, and licenses. Each public `.vue` subpath resolves to its own ESM entry. The package shares Vue and Core with the application through peer dependencies and uses Bootstrap `6.0.0-alpha.1` as an external dependency.

The [release workflow](../.github/workflows/publish.yml) checks the packed exports and installs the tarball under `@uninterface/backend`. It type-checks and builds a fresh consumer and runs Chromium checks in development and production.

For the first release, run **Publish Bootstrap to npm** with **stage** unchecked. From the extracted `uninterface-backend-bootstrap-npm-package` artifact, use an npm maintainer account to verify and stage the tarball.

```sh
sha512sum --check SHA512SUMS &&
  npm stage publish ./backend-bootstrap.tgz --access public --tag pre-release
npm stage list @uninterface/backend-bootstrap
npm stage approve <stage-id>
```

After the first release, configure npm Trusted Publishing for `uninterface/backend-bootstrap`, workflow `publish.yml`, and environment `npm`. Enable `npm publish` for Git tag releases and `npm stage publish` for manual staging. Push a Git tag that matches the full package version with a `v` prefix. Versions such as `6.0.0` go to `latest`, and SemVer prereleases such as `6.0.0-alpha1` go to `pre-release`.
