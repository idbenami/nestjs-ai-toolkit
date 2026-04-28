# Contributing to nestjs-ai-toolkit

Thank you for considering contributing to `nestjs-ai-toolkit`! Whether it's fixing a bug, adding a feature, or improving documentation — all contributions are welcome.

## Quick Start

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Create a branch for your changes
4. Make your changes
5. Run tests: `npm test`
6. Push your changes
7. Open a pull request

## Development Guide

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/nestjs-ai-toolkit.git

# Install dependencies
npm install

# Run tests to verify setup
npm test
```

### Running Tests

```bash
# Run full test suite
npm test

# Run tests in watch mode
npm run test:dev
```

### Testing Your Changes

The best way to test your changes is to use the package in a real NestJS application. Here's a quick way to do that:

1. Create a new NestJS app:

```bash
nest new test-app
```

2. Link your local `nestjs-ai-toolkit`:

```bash
# In nestjs-ai-toolkit directory
npm link

# In your test app directory
npm link nestjs-ai-toolkit
```

3. Use it in your test app:

```typescript
import { Module } from '@nestjs/common';
import { AiToolsModule } from 'nestjs-ai-toolkit';

@Module({
  imports: [AiToolsModule],
})
export class AppModule {}
```

## Guidelines

### When submitting a PR:

- Make sure tests pass
- Add tests if you're adding a feature
- Update README if needed
- Update types if you're changing interfaces

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as follows:

- `feat: <description>`

  - New features that add functionality
  - Triggers **MINOR** version bump (1.1.0 → 1.2.0)
  - Example: `feat: add optional filter to tool discovery`

- `fix: <description>`

  - Bug fixes and patches
  - Triggers **PATCH** version bump (1.1.1 → 1.1.2)
  - Example: `fix: resolve duplicate registration when module is imported twice`

- `feat!: <description>`

  - Changes that break backward compatibility
  - Triggers **MAJOR** version bump (1.0.0 → 2.0.0)
  - Example: `feat!: change ToolRegistryService API to async`

- `docs: <description>`

  - Documentation changes only
  - **No version bump**
  - Example: `docs: improve API reference section`

- `test: <description>`

  - Adding or modifying tests
  - **No version bump**
  - Example: `test: add unit tests for ToolRegistryService`

- `refactor: <description>`

  - Code changes that neither fix bugs nor add features
  - **No version bump**
  - Example: `refactor: simplify AiToolsExplorer registration flow`

- `chore: <description>`
  - Maintenance tasks, dependency updates, etc
  - **No version bump**
  - Example: `chore: bump peer dependency on ai`

## Need Help?

- [Open an issue](https://github.com/idbenami/nestjs-ai-toolkit/issues)
- Ask questions in PRs

Don't worry too much about getting everything perfect. We're happy to help guide you through the process and fix any issues along the way.
