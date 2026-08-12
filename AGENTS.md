# Project Specification — Content Publishing Blog Platform

## 1. Project Overview

We are building a production-oriented content publishing platform for a
single non-technical admin.

The main purpose is to publish SEO-focused articles that can rank in search
engines and generate revenue through advertising and affiliate links.

The system must make publishing extremely simple for the admin.

The admin should NOT need to understand coding, HTML, Markdown, databases,
APIs or deployment.

---

## 2. Core Workflow

The complete workflow is:

Admin
→ Login
→ Dashboard
→ Create Article
→ Enter article information
→ Save Draft or Publish
→ Backend validates content
→ Store article in MongoDB
→ Public website renders the article using a reusable template
→ Article gets its own stable SEO-friendly URL

Example:

Admin creates:

Title:
Best Phones Under ₹15,000

Slug:

best-phones-under-15000

After publishing:

https://DOMAIN/post/best-phones-under-15000

The article must be dynamically rendered from database content.

Individual articles must NOT require manually creating separate HTML pages.

---

## 3. Technology Stack

Use the following stack(MERN) unless there is a strong technical reason to change it

### Frontend

React
Vite
Tailwind CSS

### Backend

Node.js
Express.js

### Database

MongoDB
Mongoose

### Authentication

Secure cookie-based authentication(JWT ro which is suitable for thisi project).

Do not store sensitive authentication credentials insecurely in localStorage.

### Image Storage

Cloudinary

### Rich Text

Use a mature React-compatible rich-text editor.

Before adding a dependency, verify that an existing dependency cannot already
solve the requirement.

### Validation

Use server-side validation for every important input.

### API

REST API.

---

## 4. Main Users

There is initially only ONE admin user.

The admin is non-technical.

Do not build unnecessary multi-user/team functionality in the initial version.

---

## 5. Admin Features

Admin must be able to:

- Login
- Logout
- View dashboard
- Create article
- Edit article
- Delete article
- Save article as draft
- Publish article
- Unpublish article
- Upload cover image
- Add article title
- Add article content
- Add category
- Add tags
- Add SEO title
- Add SEO description
- Preview article before publishing

The admin interface must be simple and understandable.

---

## 6. Article Data

Each article should support:

- title
- slug
- excerpt
- cover image
- rich text content
- category
- tags
- status
- SEO title
- SEO description
- publication date
- updated date
- created date

Status:

- draft
- published

Only published articles are publicly accessible.

---

## 7. Public Website

Required public pages:

/
 
/post/:slug

/category/:slug

/search

/404

Public article template should contain:

- Header
- Breadcrumbs
- Article title
- Category
- Publication date
- Cover image
- Article content
- Advertisement slots
- Affiliate product blocks
- Related articles
- Affiliate disclosure
- Footer

The article template must be reusable.

One template must render all articles based on database content.

---

## 8. SEO

SEO is a primary requirement.

Every public article must support:

- unique title tag
- meta description
- canonical URL
- Open Graph metadata
- social preview image
- Article structured data / JSON-LD
- semantic heading hierarchy
- image alt text
- clean URL
- sitemap inclusion
- robots.txt

Generate:

- robots.txt
- XML sitemap

Draft articles must NOT appear in the sitemap.

Deleted/unpublished articles must not remain as valid public URLs.

Do not use keyword stuffing.

Do not generate fake SEO claims.

---

## 9. Affiliate System

The platform must support affiliate product blocks.

An admin should be able to add a product containing:

- product name
- product image
- short description
- affiliate URL
- CTA text

Example:

Product:
Example Phone

CTA:
Check Price

The affiliate block should be reusable inside articles.

Affiliate disclosure must be visible where appropriate.

---
## 10. Advertisement System

Create reusable advertisement slots.

Initial positions:

- after article title
- inside article
- before related articles
- bottom of article

During development, use placeholder ad components.

Do not hardcode advertising credentials.

Actual advertising provider configuration should be added later.

---

## 11. Related Articles

Public articles should show related articles based on relevant metadata,
such as category and/or tags.

Do not use an expensive or complicated recommendation system initially.

---

## 12. Security Requirements

Security is important because the application will be publicly accessible.

Implement:

- secure authentication
- password hashing
- server-side authorization
- input validation
- protection against common injection attacks
- XSS protection where applicable
- secure file upload validation
- file size limits
- rate limiting where appropriate
- secure CORS configuration
- environment variables for secrets
- centralized error handling

Never expose:

- passwords
- password hashes
- authentication secrets
- database credentials
- API keys

to the frontend.

---

## 13. Performance

The public article pages are intended for search traffic.

Prioritize:

- fast page rendering
- optimized images
- lazy loading where appropriate
- efficient database queries
- useful database indexes
- avoiding unnecessary API requests

Do not prematurely optimize.

---

## 14. Initial Scope

The initial product is NOT:

- a social network
- a multi-author CMS
- an ecommerce platform
- a newsletter platform
- a forum
- a complex analytics platform
- an AI content-generation platform

Do not implement these unless explicitly requested later.

---

## 15. Development Philosophy

Build the smallest complete production-quality system.

Prefer simple and maintainable architecture over unnecessary complexity.

Every major feature must have a clear reason to exist.

Do not create abstractions just for the sake of abstraction.

Do not add dependencies without justification.

Do not rewrite working code unnecessarily.

The application should be understandable by another developer who joins the
project later.