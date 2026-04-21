---
title: Contributing
description: How to contribute to rimelight/playground
---

## Getting Started

To start contributing to this project, follow these steps from the monorepo root:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the development server for playground**:
   ```bash
   pnpm --filter playground dev
   ```

4. **Open the site**: Navigate to `http://localhost:4321` in your browser.

## Guidelines

- **Code Style**: Please follow the existing code style. We use Prettier for formatting.
- **Components**: Use existing components from the `src/components` directory or Rimelight UI whenever possible.
- **Monorepo**: Remember that changes to `@rimelight/ui` will be reflected here in real-time during development.

## Submitting Changes

1. Create a new branch for your changes.
2. Commit your changes with descriptive messages.
3. Push your branch and open a Pull Request.
