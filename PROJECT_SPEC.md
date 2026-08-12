# Development Rules

## General

1. Read PROJECT_SPEC.md before making architectural decisions.

2. Follow PROJECT_SPEC.md as the source of truth for product requirements.

3. Work only on the currently requested phase.

4. Do not implement future-phase features unless explicitly requested.

5. Inspect existing code before modifying it.

6. Never rewrite working code unnecessarily.

7. Prefer the simplest maintainable implementation.

8. Do not introduce a dependency if the existing stack can solve the problem.

9. Before adding a dependency, explain why it is required.

---

## Architecture

10. Keep frontend, backend and database responsibilities clearly separated.

11. Keep business logic out of React presentation components where practical.

12. Keep database access inside appropriate backend/data-access layers.

13. Do not duplicate business logic.

14. Reuse existing components, utilities and services.

15. Do not create multiple implementations of the same functionality.

---

## Security

16. Never hardcode secrets.

17. Use environment variables for secrets and credentials.

18. Authentication must be enforced server-side.

19. Authorization must be enforced server-side.

20. Never trust frontend-only validation.

21. Validate and sanitize user-controlled input.

22. Validate uploaded files and enforce file size/type limits.

23. Do not expose sensitive database or authentication information through APIs.

---

## API

24. Use consistent REST API conventions.

25. Return appropriate HTTP status codes.

26. Handle errors centrally.

27. Do not expose internal stack traces in production responses.

28. Validate request bodies, params and query parameters.

---

## Database

29. Use Mongoose schemas.

30. Add indexes where they provide clear query benefits.

31. Do not make unnecessary database queries.

32. Never delete or modify data destructively without considering the
application workflow.

---

## Frontend

33. Keep UI components reusable.

34. Handle loading, error and empty states.

35. Do not put secrets in frontend code.

36. Keep the admin interface simple because the admin is non-technical.

37. Public pages must be responsive.

---

## SEO

38. SEO is a core requirement.

39. Public article URLs must be stable.

40. Draft articles must never be publicly indexable.

41. Do not use keyword stuffing.

42. Generate metadata from actual article content.

43. Keep sitemap data synchronized with published content.

---

## Testing

44. Do not claim a feature works without testing it.

45. After implementing a phase:

- run the application
- test the affected functionality
- run the production build
- fix errors

46. If automated tests exist, run relevant tests.

---

## Phase Discipline

47. Complete the current phase before moving to the next phase.

48. Do not silently expand the scope.

49. If a requirement conflicts with the architecture, stop and explain the
conflict before making a major architectural change.

50. At the end of each phase report:

- files created
- files modified
- dependencies added
- important architectural decisions
- tests performed
- known issues


## Reusable Article Template

The public article system must use ONE reusable article template.

Every published article must be rendered using the same template/layout.

The template structure and fixed components must remain consistent across
articles.

Article-specific data must be injected dynamically from the database.

Dynamic content includes:

- title
- slug
- cover image
- excerpt
- article content
- category
- tags
- publication date
- author
- SEO metadata
- affiliate products

Fixed layout/components include:

- header
- navigation
- breadcrumbs
- article structure
- advertisement slots
- affiliate component positions
- related articles section
- footer

Advertisement slots must have predefined positions in the article template.
Their placement should NOT change from article to article unless the template
itself is intentionally changed.

The system must NOT generate a separate custom HTML template for each article.

One reusable template must render all published articles based on their
database content.

Example:

Article A → Template + Article A data → /post/article-a
Article B → Template + Article B data → /post/article-b
Article C → Template + Article C data → /post/article-c