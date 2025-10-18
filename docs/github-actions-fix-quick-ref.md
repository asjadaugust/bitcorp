# GitHub Actions Fix - Quick Reference

## Changes Made

### 1. frontend/next.config.ts
```typescript
// Added type assertion to resolve TS2345 error
export default withNextIntl(nextConfig) as NextConfig;
```

### 2. frontend/tsconfig.json
```json
{
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.test.tsx", 
    "**/__tests__/**",
    "src/setupTests.ts"
  ]
}
```

### 3. docker/frontend/Dockerfile.prod
```dockerfile
# Updated to use workspace package-lock.json structure
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
RUN npm ci
```

### 4. .gitignore
```diff
- package-lock.json
- package-lock.json.*
+ # package-lock.json should be committed
```

### 5. frontend/package.json
```diff
- "prepare": "husky"
+ # Removed - prepare script is only at root
```

## Verification Commands

```bash
# Install dependencies (from root)
npm install --include=dev

# Type check
npm run type-check --workspace=frontend

# Lint
npm run lint --workspace=frontend

# Build
npm run build --workspace=frontend

# Commit (will run pre-commit hooks)
git commit -m "your message"
```

## Expected GitHub Actions Results

✅ Backend job: Pass (Python linting and imports)
✅ Frontend job: Pass (type-check, lint, build)
✅ Integration job: Pass (full build test)

## If CI Still Fails

1. Check that package-lock.json is committed
2. Verify all changes are pushed
3. Check GitHub Actions logs for specific error
4. Ensure no cached build artifacts causing issues

## Common Issues

**"Cannot find package-lock.json"**
- Ensure .gitignore allows package-lock.json
- Commit and push package-lock.json from root

**"ESLint not found"**
- Run `npm install --include=dev` from root
- Workspaces install dev dependencies at root level

**"Type errors in test files"**
- Ensure tsconfig.json excludes test files
- Test files are checked by Jest, not tsc

## Next Steps

- Monitor GitHub Actions run
- If passing, merge PR
- If failing, check logs and iterate

## Documentation

Full details: `docs/github-actions-fix-summary.md`
