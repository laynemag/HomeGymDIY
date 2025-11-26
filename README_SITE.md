This repository contains a small Node-based static-site generator used to create a lightweight documentation site from README.md files across the repo.

Usage:

1. Install dependencies:

   npm install

2. Build the site (output goes to `docs/`):

   npm run build-site

3. Commit the `docs/` folder and push to the `gh-pages` branch or enable GitHub Pages from the `docs/` folder on the repository's default branch.

Notes:

- The generator looks for files named `README` or `README.md` recursively, excluding `node_modules`, `.git`, and `docs/`.
- Pages are created under `docs/` keeping directory structure; each README becomes an index.html in the corresponding path.
- Minimal styling included; adjust `scripts/generate-site.js` to change layout.

GitHub Actions auto-publish

This repository includes an optional GitHub Actions workflow (created by the generator setup) that will automatically build the site and publish the generated `docs/` folder to the `gh-pages` branch when you push to `front-end-project`.

To use it:

- Ensure the workflow file `.github/workflows/deploy-docs.yml` is present and pushed.
- The action uses the provided `GITHUB_TOKEN` so no additional secrets are required.
- After a push, check the Actions tab for the "Deploy Docs" workflow and confirm it completed successfully. The site will publish to `https://<your-org-or-user>.github.io/<repo>/` from the `gh-pages` branch.

If you'd rather publish from the `docs/` folder on the default branch, change the Pages settings in the repository settings and/or modify the workflow to commit `docs/` back to the branch instead of using `gh-pages`.

Local development shortcut

I added an npm script `dev` that will perform a clean build and start a local HTTP server serving the generated `docs/` folder. From Git Bash (recommended) run:

```bash
# install deps (once)
npm install

# run the clean build and start server (open http://localhost:8080)
npm run dev
```

If you prefer to run the same steps manually in Git Bash, use:

```bash
npm run clean-site && npm run build-site && npx http-server docs -p 8080 -c-1
```

Note: the `dev` script uses `http-server` via npx so no global install is required. If you want a different port, pass `-p <port>` in the manual command or edit the `dev` script in `package.json`.

YAML front-matter for page metadata

You can add a small YAML front-matter block at the top of any README to provide metadata the generator will use. Place it at the very top of the file, for example:

```markdown
---
title: "Handles Overview"
nav_title: "Handles"
---

# Handles Overview

Content...
```

- `title` will be used as the page title when rendering the page (if present).
- `nav_title` will be used in the sidebar for folder labels or explicit navigation labels when available.

Recommended use cases:

- Put a README.md in a top-level folder (e.g. `handles/README.md`) and set `nav_title` to the desired folder label.
- For project-level README files (nested folders), set `title` to the clean project name if you want to control how it appears on the folder landing page.
