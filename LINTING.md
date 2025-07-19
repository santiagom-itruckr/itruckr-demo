# Linting and Code Formatting Setup

This project uses a comprehensive set of tools to ensure code quality, consistency, and maintainability.

## Tools Overview

### ESLint
- **Purpose**: JavaScript/TypeScript linting and code quality enforcement
- **Configuration**: `eslint.config.js`
- **Plugins**: React, TypeScript, Import, Accessibility, Prettier integration

### Prettier
- **Purpose**: Code formatting and style consistency
- **Configuration**: `.prettierrc`
- **Integration**: Works with ESLint to avoid conflicts

### TypeScript
- **Purpose**: Static type checking and strict type enforcement
- **Configuration**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **Strict Mode**: Enabled with additional strict rules

### Husky + lint-staged
- **Purpose**: Pre-commit hooks to ensure code quality
- **Configuration**: `.husky/pre-commit`, `package.json` lint-staged section

## Available Scripts

```bash
# Linting
npm run lint          # Check for linting errors
npm run lint:fix      # Fix auto-fixable linting errors

# Formatting
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are properly formatted

# Type checking
npm run type-check    # Run TypeScript type checking

# Combined checks
npm run build         # Type check + build (includes linting)
```

## Pre-commit Hooks

The project uses Husky to run automatic checks before each commit:

1. **ESLint**: Checks for code quality issues and auto-fixes what it can
2. **Prettier**: Formats code according to project standards
3. **TypeScript**: Ensures type safety

## VSCode Integration

The project includes VSCode settings (`.vscode/settings.json`) that:

- Enable format on save
- Set Prettier as the default formatter
- Configure ESLint auto-fix on save
- Enable import organization on save
- Set consistent editor settings

### Recommended Extensions

Install the recommended extensions for the best development experience:

- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag
- Path Intellisense

## Configuration Files

### ESLint Rules

The ESLint configuration includes:

- **React Rules**: JSX best practices, hooks rules, component patterns
- **TypeScript Rules**: Type safety, unused variables, strict typing
- **Import Rules**: Import organization, duplicate detection, unresolved imports
- **Accessibility Rules**: ARIA attributes, semantic HTML, keyboard navigation
- **General Rules**: Console warnings, debugger prevention, code quality

### Prettier Configuration

- **Semicolons**: Required
- **Quotes**: Single quotes
- **Line Length**: 80 characters
- **Indentation**: 2 spaces
- **Trailing Commas**: ES5 compatible
- **JSX Quotes**: Single quotes

### TypeScript Strict Rules

- `strict: true` - Enables all strict type checking options
- `noUnusedLocals` - Error on unused local variables
- `noUnusedParameters` - Error on unused parameters
- `noImplicitReturns` - Error on functions that don't return explicitly
- `noImplicitOverride` - Require explicit override keyword
- `noPropertyAccessFromIndexSignature` - Prevent unsafe property access
- `noUncheckedIndexedAccess` - Require bounds checking for indexed access
- `exactOptionalPropertyTypes` - Strict optional property types

## EditorConfig

The project includes `.editorconfig` to ensure consistent coding styles across different editors and IDEs.

## Troubleshooting

### Common Issues

1. **ESLint/Prettier Conflicts**: The configuration is set up to avoid conflicts. If you see conflicts, run `npm run lint:fix` and `npm run format`.

2. **TypeScript Errors**: Run `npm run type-check` to see detailed type errors.

3. **Pre-commit Hook Failing**: The hook will show you exactly what's wrong. Fix the issues and try committing again.

### Disabling Hooks (Temporary)

If you need to bypass the pre-commit hooks temporarily:

```bash
git commit --no-verify -m "Your commit message"
```

**Note**: This should only be used in emergencies. The hooks are there to maintain code quality.

## Best Practices

1. **Always run linting before committing**: Use `npm run lint:fix` to auto-fix issues
2. **Format your code**: Use `npm run format` to ensure consistent formatting
3. **Check types**: Run `npm run type-check` to catch type errors early
4. **Follow the rules**: The ESLint rules are designed to catch common mistakes and enforce best practices
5. **Use TypeScript strictly**: Take advantage of the strict type checking to write safer code

## Adding New Rules

To add new ESLint rules:

1. Edit `eslint.config.js`
2. Add the rule to the appropriate section
3. Test with `npm run lint`
4. Update this documentation if needed

To modify Prettier settings:

1. Edit `.prettierrc`
2. Test with `npm run format:check`
3. Update this documentation if needed
