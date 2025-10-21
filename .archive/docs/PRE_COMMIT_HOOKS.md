# Pre-commit Hooks Setup

This project uses Husky to enforce code quality checks before commits.

## What Gets Checked

The pre-commit hook automatically runs:

1. **TypeScript Type Check** - Ensures no type errors
2. **ESLint** - Ensures code follows style guidelines and best practices

## Manual Build Check

While the pre-commit hook runs TypeScript and lint checks, you should manually run the build before pushing:

```bash
cd frontend
npm run build
```

## Setup

The pre-commit hooks are automatically installed when you run `npm install` in the root directory.

## Files

- `.husky/pre-commit` - The pre-commit hook script
- `frontend/package.json` - Contains Husky and lint-staged configuration

## Bypassing Hooks (Emergency Only)

If you need to bypass the hooks in an emergency:

```bash
git commit --no-verify -m "Emergency commit"
```

**Note:** Only use this in genuine emergencies. The hooks are there to maintain code quality.

## Troubleshooting

If the pre-commit hook fails:

1. **TypeScript errors** - Fix the type errors shown in the output
2. **Lint errors** - Run `npm run lint` in the frontend directory and fix the issues
3. **Build errors** - Run `npm run build` manually to see detailed error messages

## Best Practices

1. Always run `npm run build` manually before pushing to verify the production build works
2. Keep your dependencies up to date
3. Write tests for new features
4. Follow the TypeScript and ESLint guidelines
