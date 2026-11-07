---
name: SEO description suggestions
description: Keep automated meta-description recommendations compatible and stable after applying them.
---

When a meta description is both too long and missing a CTA, generate one combined replacement that is at most 160 characters and retains the CTA. Do not offer separate shortening and CTA suggestions that undo each other. When shortening an existing description, preserve a trailing CTA.

**Why:** independent rules previously alternated between adding a CTA beyond the length limit and trimming that CTA back off, so both recommendations returned after each application.

**How to apply:** keep the SEO analyzer's length and CTA checks coordinated; test that applying the suggested text removes both warnings on the next analysis.
