# Contributing

Ape Portal appreciates your interest in contributing to our repository! Please review the guidelines below to be most effective.

# Development

## Setup

To develop locally, clone the repo and install all dependencies.

```bash
git clone https://github.com/yuga-labs/ape-portal.git
cd ape-portal
npm ci
```

## Preview (simple)

Use vite to run a local HTTP server with a basic implementation of the Portal:

```bash
npm run dev
```

## Preview by installing to a host React app

Alternatively, you can use `npm link` to install a locally built version of this library to some other local project.

From the consuming app, either run `npm install <path_to_this_folder>`, or `npm link @yuga-labs/ape-portal-public`. If you opt for the latter, you must run `npm link` from this folder first, to install this package into the global npm store. For more information, see [ape-portal-playground README](https://github.com/yuga-labs/ape-widget-playground/blob/94cf1feb36fbd782b0b462859f61da7f99f2f19c/README.md#local-development-ape-portal).

Bear in mind that any changes to this local dependency will not be reflected in your consumer app until you perform `npm run build` here.

## Husky

Husky is installed and will automatically lint and build the project before you commit. If you want to skip this, use the `--no-verify` flag when committing.

## Tests

To keep a test runner active that will automatically re-test when files are changed, use:

```bash
npx vitest
```

To run tests once:

```
npm test
```

See [package.json](./package.json) scripts prefixed with `test` for other options:

- Check coverage: `npm run test:coverage`
- Run tests with vitest web server UI showing results and coverage: `npm run test:ui`
- Update snapshots: `npm run test:update`

## Build

To build the package:

```bash
npm run build
```

# Branch workflow

We work exclusively out of the `main` branch.

Stale branches will be deleted if there is not an active pull request attached. "Active" is defined as some activity in the last 2 weeks.

# Engineering Guidelines and Standards

To maintain a high-quality codebase, please adhere to the following guidelines when contributing to this project:

1. **Code Testability**

   - Code should be testable and include **unit tests** where reasonable.
   - Strive for high code coverage to ensure that the code behaves as expected under various conditions.
   - Use testing frameworks appropriate to the project's stack and structure.

2. **TypeScript Best Practices**

   - Follow TypeScript best practices:
     - Ensure **strict type-checking** is enabled and avoid using `any` unless absolutely necessary.
     - Use **interfaces** and **types** effectively to define clear and maintainable type structures.
     - Maintain clean, readable, and idiomatic TypeScript code.
   - Avoid unnecessary complexity in types and always prefer readability.

3. **Security**

   - Prioritize security by writing **secure code** that does not introduce vulnerabilities.
   - Regularly update dependencies and avoid using libraries with known vulnerabilities.
   - Be mindful of potential security risks, such as **SQL injection**, **XSS**, and other common vulnerabilities.
   - Do not include sensitive information such as secrets, tokens, or API keys in the codebase.

4. **Dependency Management**

   - Avoid introducing new libraries unless absolutely necessary.
   - When introducing a new library, provide a strong justification for its inclusion, focusing on:
     - Reducing the number of external dependencies.
     - Assessing the maintenance, security, and performance impact.
   - Make sure the new library is well-maintained and secure.

5. **Code Quality**

   - Follow **DRY** (Don't Repeat Yourself) and **SOLID** principles where applicable.
   - Ensure the code is easy to understand, modular, and maintainable.
   - Refactor legacy code to improve readability and maintainability when appropriate.
   - Document complex or non-obvious sections of the code for future maintainers.

6. **Code Reviews**
   - All code must go through a code review process.
   - Be open to feedback and strive for improvements that make the codebase better for everyone.
   - Final approval and merge will be at the discretion of Yuga Labs engineering.

# Publishing

Releases and publishing are handled by CI.

[Create a new release](https://github.com/yuga-labs/ape-portal/releases/new) on GitHub. It must include a tag prefixed with `v`, eg. `v1.0.0`. Publish the release, and CI (GitHub actions) will take care of the rest.

Release tags should follow [semver](https://semver.org/).

Releases published from GH actions will push a release tag for the specified version to the npm registry.
