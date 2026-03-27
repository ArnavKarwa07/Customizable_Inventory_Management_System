# Contributing Guidelines

## Customizable Inventory Management System

Welcome to the Customizable Inventory Management System! This document provides guidelines for contributing to the project.

---

## 1. Getting Started

### Prerequisites

- Git configured with your name and email
- Node.js 18+ (frontend)
- Python 3.11+ (backend)
- Docker & Docker Compose (optional)
- Familiarity with Git workflow

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/ArnavKarwa07/Customizable_Inventory_Management_System.git
cd Customizable_Inventory_Management_System

# Follow setup in README.md
```

---

## 2. Branch Strategy

### Branching Convention

```
main/              - Production-ready code
develop/           - Development/staging
feature/           - New features
  └─ feature/auth-improvements
bugfix/            - Bug fixes
  └─ bugfix/search-filtering
hotfix/            - Production hotfixes
  └─ hotfix/critical-bug
docs/              - Documentation updates
  └─ docs/api-guide
chore/             - Dependencies, configs
  └─ chore/update-dependencies
```

### Naming Rules

- Use lowercase with hyphens
- Be descriptive: `feature/inventory-bulk-import` ✅ not `feature/new-feature` ❌
- Reference issue: `feature/fix-issue-123-search-timeout`

### Branch Lifecycle

```
1. Create from develop:
   git checkout -b feature/description develop

2. Work on feature:
   git add .
   git commit -m "feat: description"

3. Push to GitHub:
   git push origin feature/description

4. Create Pull Request to develop

5. After merge:
   git checkout develop
   git pull origin develop
   git branch -d feature/description
```

---

## 3. Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Test additions or changes
- **chore**: Dependencies, build scripts, etc

### Scope

- Optional but recommended
- Examples: auth, inventory, products, orders, db, api
- Example: `feat(inventory): add stock transfer`

### Subject

- Imperative mood: "add" not "added"
- Lowercase first letter
- No period at end
- Max 50 characters
- Direct and concise

### Body

- Explain why, not what
- Line wrap at 72 characters
- Example:

```
feat(auth): implement JWT refresh token rotation

Rotates refresh tokens on each use to prevent token reuse attacks.
Tokens expire after 7 days of inactivity. Store previous token
to allow grace period for network retries.

Closes #123
```

### Examples

```
✅ feat(inventory): add low stock alerts
✅ fix(orders): resolve partial receipt calculation bug
✅ docs(api): update order endpoints documentation
✅ refactor(db): optimize product search queries
✅ test(auth): add token expiration tests

❌ fixed bug
❌ Added new feature
❌ WIP: Still working on this
❌ asdf
```

---

## 4. Code Style & Linting

### Frontend (TypeScript/React)

#### ESLint & Prettier

```bash
cd frontend

# Format code
pnpm format

# Lint check
pnpm lint

# Fix linting issues
pnpm lint --fix
```

#### Code Style Rules

- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Spacing**: 2 spaces indentation
- **Line length**: Max 100 characters
- **Imports**: Alphabetically sorted, grouped by type

#### File Naming

- Components: PascalCase (`ProductCard.tsx`)
- Utilities: camelCase (`formatPrice.ts`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- Directories: kebab-case (`product-management/`)

### Backend (Python)

#### Black & Isort

```bash
cd backend

# Format code
black app/

# Sort imports
isort app/

# Lint check
flake8 app/

# Type checking
mypy app/
```

#### Code Style Rules

- **PEP 8** adherence required
- **Line length**: 88 characters (Black default)
- **Imports**: Use isort with Black profile
- **Type hints**: Required for all functions and variables
- **Docstrings**: Google style for complex functions

#### File Naming

- Files: snake_case (`user_service.py`)
- Classes: PascalCase (`UserService`)
- Functions/methods: snake_case (`get_user_by_id()`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)

### Example PR Check

```bash
# Frontend
pnpm lint
pnpm format --check
pnpm test

# Backend
black --check app/
isort --check app/
mypy app/
pytest --cov=app tests/
```

---

## 5. Pull Request Process

### Before Creating PR

- [ ] Code is locally tested
- [ ] All tests passing
- [ ] Linting passed
- [ ] No merge conflicts
- [ ] Commit history clean (squash if needed)
- [ ] Branch is up to date with base branch

### PR Title Format

```
<type>(<scope>): <description>

Examples:
✅ feat(inventory): implement stock transfer between warehouses
✅ fix(auth): resolve token refresh race condition
✅ docs(readme): update installation instructions
```

### PR Description Template

```markdown
## Summary

Brief description of changes.

## Changes

- Change 1
- Change 2
- Change 3

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe testing performed:

- Unit tests added: ✓
- Integration tests passed: ✓
- Manual testing: ✓

## Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Performance impact assessed
- [ ] Security review passed

## Screenshots (if applicable)

[Add screenshots here]

## Related Issues

Closes #123
Relates to #456
```

### PR Review Process

1. **Automated Checks**
   - GitHub Actions runs tests
   - Linting passes
   - Code coverage maintained

2. **Code Review (1-2 reviewers)**
   - Functionality reviewed
   - Code quality checked
   - Performance considered
   - Security assessed

3. **Approval & Merge**
   - At least 1 approval required
   - Discussions resolved
   - CI passing
   - Merge by author or team lead

4. **Post-Merge**
   - Verify on staging
   - Close related issues
   - Delete branch

---

## 6. Testing Requirements

### Frontend Testing

#### Unit Tests (Jest)

```bash
cd frontend

# Run tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test:coverage
```

#### Requirements

- Test critical components
- Test custom hooks
- Mock API calls
- Coverage target: >75%

#### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Backend Testing

#### Unit Tests (Pytest)

```bash
cd backend

# Run tests
pytest

# Watch mode
pytest-watch

# Coverage report
pytest --cov=app tests/
```

#### Requirements

- Test all business logic
- Test edge cases
- Mock external dependencies
- Coverage target: >80%

#### Example Test

```python
import pytest
from app.services.user_service import UserService

class TestUserService:
    def test_create_user(self, db_session):
        service = UserService(db_session)
        user = service.create_user(
            email="test@example.com",
            password="SecurePass123!"
        )
        assert user.email == "test@example.com"
        assert user.password_hash is not None

    def test_duplicate_email_raises_error(self, db_session):
        service = UserService(db_session)
        service.create_user(email="test@example.com", password="pwd")

        with pytest.raises(ValueError):
            service.create_user(email="test@example.com", password="pwd2")
```

### E2E Testing

#### Playwright Tests

```bash
cd frontend

# Run E2E tests
pnpm e2e

# Debug mode
pnpm e2e --debug

# Update snapshots
pnpm e2e --update-snapshots
```

#### Test Coverage

- [ ] User login workflow
- [ ] Product CRUD operations
- [ ] Inventory adjustments
- [ ] Order workflow
- [ ] Report generation

---

## 7. Documentation

### Code Comments

- Use when "why" is not obvious
- Avoid over-commenting
- Keep comments updated
- Use JSDoc for functions

#### Example

```typescript
/**
 * Calculates available inventory accounting for reservations.
 * @param total - Total quantity on hand
 * @param reserved - Quantity reserved for pending orders
 * @returns Available quantity for immediate use
 */
function calculateAvailable(total: number, reserved: number): number {
  return Math.max(0, total - reserved);
}
```

### API Documentation

- Auto-generated from FastAPI docstrings
- Update docstrings when changing endpoints
- Include parameter descriptions
- Document error responses

```python
@app.post("/api/v1/inventory/adjust-stock")
async def adjust_stock(
    inventory_id: int,
    quantity: int,
    reason: str,
    current_user: User = Depends(get_current_user)
) -> InventoryResponse:
    """
    Adjust stock quantity for an inventory item.

    Args:
        inventory_id: ID of inventory to adjust
        quantity: Quantity change (positive or negative)
        reason: Reason for adjustment (cycle_count, damage, shrinkage, etc)

    Returns:
        Updated inventory object

    Raises:
        HTTPException: 400 if reason invalid or 404 if not found
    """
```

### README Updates

- Update when adding features
- Keep setup instructions current
- Document breaking changes
- Link to detailed documentation

---

## 8. Security Guidelines

### Password & Secrets

- **Never** commit passwords or keys
- Use `.env.example` for template
- Use `.env` (git-ignored) for local development
- Rotate secrets regularly

### Dependencies

- Keep dependencies updated
- Review dependency licenses
- Check for vulnerabilities:

  ```bash
  # Frontend
  pnpm audit

  # Backend
  pip-audit
  ```

### Code Security

- Never concatenate user input into queries (use ORM/parameterized)
- Validate all inputs
- Sanitize outputs
- Use HTTPS in production
- Hash passwords with bcrypt

---

## 9. Performance Guidelines

### Frontend

- Use lazy loading for routes
- Implement code splitting
- Optimize images
- Monitor bundle size
- Test on slow networks

### Backend

- Use async/await appropriately
- Cache expensive operations
- Index database queries
- Monitor query performance
- Batch operations when possible

---

## 10. Accessibility

### WCAG 2.1 AA Compliance

- [ ] Keyboard navigation
- [ ] Color contrast (4.5:1)
- [ ] Alt text for images
- [ ] Semantic HTML
- [ ] ARIA labels where needed
- [ ] Focus indicators visible

### Testing Accessibility

```bash
# Frontend
pnpm test:a11y

# Manual test with screen reader
# Test with keyboard navigation
```

---

## 11. Deployment Guidelines

### Staging Deployment

- Automatic on PR merge to develop
- Test thoroughly before marking ready
- Create staging test checklist

### Production Deployment

- Manual deployment from main branch
- Requires 2 approvals
- Change log required
- Rollback plan documented
- Team lead approval needed

---

## 12. Getting Help

### Resources

- Documentation: `/docs` and `.md` files
- GitHub Issues: Open issues or discussions
- Team Slack: Ask team members
- Architecture Decisions: See `/docs/ADRs`

### Code Review Questions

- Ask in PR comments
- Be specific about questions
- Reference line numbers
- Pro tip: Comment with a thread

---

## 13. Code of Conduct

### Team Norms

- ✅ **Respectful** - Treat everyone with respect
- ✅ **Collaborative** - Help each other succeed
- ✅ **Communicative** - Share blockers early
- ✅ **Owner Mentality** - Care about code quality
- ✅ **Learning Mindset** - Embrace feedback

### Review Best Practices

- ✅ Give constructive feedback
- ✅ Ask questions, don't demand
- ✅ Acknowledge good work
- ✅ Respond to reviews quickly
- ✅ Separate person from code

---

## 14. Checklist for Contributors

Before submitting a PR:

### Code Quality

- [ ] Follows style guide
- [ ] Types correct (TS/Python)
- [ ] Linting passes
- [ ] No console errors/warnings
- [ ] Handles errors gracefully
- [ ] Input validated

### Testing

- [ ] Tests written (unit/integration)
- [ ] Tests passing locally
- [ ] Coverage maintained (>80%)
- [ ] Manual testing done
- [ ] Edge cases tested

### Documentation

- [ ] Code commented where needed
- [ ] API docs updated (if applicable)
- [ ] README updated (if needed)
- [ ] Commit messages clear
- [ ] PR description complete

### Performance & Security

- [ ] No performance degradation
- [ ] No security issues introduced
- [ ] Dependencies checked for vulnerabilities
- [ ] Secrets not committed
- [ ] Database changes optimized

---

## 15. Common Issues & Solutions

### Issue: "Permission denied" on commit hooks

```bash
chmod +x .git/hooks/pre-commit
```

### Issue: Tests failing locally but passing in CI

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
pnpm install
```

### Issue: Branch conflicts with develop

```bash
git fetch origin
git rebase origin/develop
# Fix conflicts in editor
git add .
git rebase --continue
```

---

**Last Updated**: March 2026  
**Maintainer**: Development Team  
**Questions?** Open a GitHub Discussion

Thank you for contributing! 🎉
