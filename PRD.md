# Product Requirements Document (PRD)
## tylerharker.com - Personal Portfolio & Technical Blog

**Document Version:** 1.0  
**Last Updated:** January 26, 2026  
**Product Owner:** Tyler Harker

---

## 1. Executive Summary

**tylerharker.com** is a personal portfolio and technical blog website for Tyler Harker, a Software Engineer specializing in .NET, distributed systems, and cloud architecture. The platform showcases professional experience, open-source projects, work history, and technical blog articles to establish thought leadership and provide a central hub for professional presence online.

---

## 2. Product Overview

### 2.1 Purpose
To create a professional, modern portfolio website that:
- Showcases professional expertise and career progression
- Demonstrates technical knowledge through blog articles
- Highlights open-source contributions and projects
- Provides a professional first impression and networking platform

### 2.2 Target Audience
- Potential employers and recruiters
- Colleagues and industry peers
- Developers interested in technical articles
- Open-source community members

### 2.3 Success Metrics
- Blog article engagement (page views, time on page)
- GitHub project visibility and external traffic
- Professional networking connections generated
- Search engine visibility for technical topics

---

## 3. Core Features

### 3.1 Homepage / About Section
**Status:** Core Feature  
**Description:** Professional introduction page featuring:
- Profile name, title, and bio
- Professional headline highlighting expertise areas (.NET, distributed systems, cloud architecture)
- Quick navigation to other sections
- GitHub profile link

**Key Information Displayed:**
- Full name: Tyler Harker
- Title: Software Engineer
- Bio: "Passionate software engineer with expertise in .NET, distributed systems, and cloud architecture. I enjoy building tools and libraries that help developers be more productive."

### 3.2 Work Experience Page
**Status:** Core Feature  
**Description:** Comprehensive work history and professional progression
- Company name and link
- Job titles and roles with date ranges
- Role-specific descriptions
- Project work under each position
- Technologies used

**Current Data:**
- Techfabric LLC (2018-present)
  - Engineering Manager (2024-02 to present)
  - Senior Software Engineer (2018-07 to 2024-02)
  - Multiple client projects (e.g., LexisNexis)

### 3.3 Projects Page
**Status:** Core Feature  
**Description:** Showcase of open-source and notable projects
- Project name and description
- Technologies used
- Key features and capabilities
- Links to GitHub, NuGet (for .NET packages), and project documentation
- Blog article links related to projects

**Current Projects:**
- TGHarker.Orleans.Search - .NET library for Orleans grain search with PostgreSQL integration

### 3.4 Technical Blog
**Status:** Core Feature  
**Description:** Long-form technical content
- Blog post listings with cards showing title, description, and metadata
- Individual blog post pages with full content
- Support for:
  - Tags and categorization
  - Published date and timestamps
  - Featured articles highlighting
  - Code syntax highlighting via react-syntax-highlighter
  - Mermaid diagram integration for architecture visualizations
  - Dynamic content rendering

**Current Content:**
- "Building a Search Library for Microsoft Orleans" (featured, published 2026-01-24)

### 3.5 Navigation
**Status:** Core Feature  
**Description:** Primary navigation menu with links to:
1. About (/)
2. Work Experience (/work-experience)
3. Projects (/projects)
4. Technical Blog (/blog)
5. Individual blog posts (/blog/[slug])

---

## 4. Technical Architecture

### 4.1 Technology Stack
- **Framework:** Next.js 16.1.4
- **Runtime:** React 19.2.3 with React DOM 19.2.3
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Content Rendering:**
  - react-syntax-highlighter (v16.1.0) - Code syntax highlighting
  - mermaid (v11.12.2) - Diagram rendering
  - @xyflow/react (v12.10.0) - Flow diagram support
- **Tooling:**
  - ESLint 9 for code quality
  - Babel plugin for React Compiler optimization
  - PostCSS 4

### 4.2 Data Structure
Data is organized in TypeScript files under `/data`:
- `profile.ts` - Author profile and navigation links
- `experience.ts` - Work history and positions
- `projects.ts` - Project showcases
- `blog.ts` - Blog posts with markdown content

### 4.3 Component Structure
- **Layout Components:** Header, Footer
- **Blog Components:** BlogContent, BlogPostCard, MermaidDiagram, ArchitectureDiagram
- **Experience Components:** ExperienceCard, ProjectTimeline
- **Project Components:** ProjectCard

### 4.4 App Routes
- `/` - Homepage (About)
- `/work-experience` - Experience page
- `/projects` - Projects page
- `/blog` - Blog listing
- `/blog/[slug]` - Individual blog post

---

## 5. Feature Details

### 5.1 Blog Content Capabilities
- **Markdown Support:** Blog content stored as markdown strings in TypeScript
- **Code Highlighting:** Integration with react-syntax-highlighter for code blocks
- **Diagrams:** Support for Mermaid diagrams and custom architecture diagrams
- **Metadata:**
  - Slug (URL identifier)
  - Title and description
  - Published date
  - Tags for categorization
  - Featured flag for highlighting important posts

### 5.2 Project Showcase Details
Each project includes:
- Project ID and name
- Short and long descriptions
- Technology tags
- Feature list
- External links (GitHub, NuGet, documentation)
- Related blog post references

### 5.3 Experience Display
- Company information with external link
- Multiple positions per company showing career progression
- Date ranges (start and end dates)
- Position-specific descriptions
- Projects completed under each role with detailed information

---

## 6. Design & UX

### 6.1 Design Principles
- Clean, professional aesthetic
- Emphasis on readability
- Responsive design (mobile-first approach via Tailwind CSS)
- Consistent typography and spacing
- Accessibility considerations

### 6.2 Layout Structure
- Header navigation (persistent across pages)
- Main content area
- Footer

### 6.3 Responsive Design
- Mobile-optimized layout
- Tailwind CSS breakpoints for responsive behavior

---

## 7. Content Management

### 7.1 Blog Post Management
- Blog posts defined in TypeScript data files
- Markdown content embedded in JavaScript objects
- Metadata includes: slug, title, description, publishedAt, tags, featured status
- Static content with no CMS integration

### 7.2 Data Organization
- Profile data (single source of truth for author info)
- Navigation links defined in profile data
- Experience, projects, and blog posts as typed arrays

---

## 8. Deployment & Infrastructure

### 8.1 Hosting
- Configured for Vercel deployment (Next.js native platform)
- CNAME configuration for custom domain (tylerharker.com)

### 8.2 Build & Development
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Production:** `npm start`
- **Linting:** `npm run lint`

---

## 9. Future Enhancements (Out of Scope - V2+)

Potential improvements for future versions:
- Search functionality for blog posts
- Comment system on blog posts
- Analytics integration
- Dark mode theme
- RSS feed for blog
- Dynamic content management system (CMS)
- Social media integration
- Email newsletter signup
- Project showcase with live demos
- Speaking engagements timeline

---

## 10. Success Criteria & Metrics

### 10.1 Functional Requirements
- [x] All pages load and render correctly
- [x] Navigation between sections works seamlessly
- [x] Blog posts display with proper formatting
- [x] Code syntax highlighting renders correctly
- [x] Responsive design works on mobile devices
- [x] All external links are functional

### 10.2 Performance Targets
- Page load time < 3 seconds on 4G
- Lighthouse performance score > 90
- Mobile responsiveness across all screen sizes

### 10.3 Content Goals
- Minimum 10 technical blog posts
- Showcase 3-5 major projects
- Complete work history display
- Professional SEO optimization

---

## 11. Assumptions & Constraints

### 11.1 Assumptions
- Author (Tyler Harker) maintains content updates
- Blog posts are static markdown content
- All external links remain current and accessible
- Next.js App Router used for routing

### 11.2 Constraints
- No real-time data updates
- No user authentication or personalized content
- Static content generation model
- No direct CMS integration (data manual edits required)

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| Orleans | Microsoft Orleans framework for distributed actor-model systems |
| NuGet | .NET package manager |
| Mermaid | Diagram and flowchart rendering library |
| Source Generators | C# compile-time code generation feature |
| Grain | An Orleans actor/entity unit |
| Slug | URL-friendly identifier for blog posts |

---

## 13. Approval & Sign-Off

- **Product Owner:** Tyler Harker
- **Created:** January 26, 2026
- **Version:** 1.0
- **Status:** Active

---

