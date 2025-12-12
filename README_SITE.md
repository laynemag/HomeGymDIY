# HomeGymDIY Site Generator

This repository contains a Node-based static-site generator that creates a lightweight documentation site from README.md files and project metadata across the repo.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the site (output goes to `docs/`):

   ```bash
   npm run build-site
   ```

3. The site is automatically deployed to GitHub Pages on push to `front-end-project` branch via GitHub Actions.

## Project Structure

The site generator creates several types of pages:

- **Folder landing pages** — `handles/`, `voltra_mounts/`, `rack_attachments/`, `misc/` directories with their README content
- **Dynamic feature pages** — Generated from project data:
  - `/cost-comparison/` — Sortable table of all projects with costs
  - `/bom/` — Interactive Bill of Materials builder
  - `/requests/` — Community part requests page with GitHub issue integration

## Projects Configuration (`projects.json`)

The `projects.json` file is the **single source of truth** for all DIY projects, costs, and parts lists.

### Why It Exists

- **Centralized data** — All project metadata is in one place, making it easy to maintain
- **Multiple uses** — Powers the cost comparison table, BOM builder, and ensures consistency across the site
- **Easy updates** — No need to manually edit HTML; just update JSON and rebuild
- **Auto-calculations** — Automatically calculates total project cost from individual part costs

### Key Features

- **Auto cost calculation** — If you set `cost: 0`, it automatically calculates total from parts' `estimatedCost`
- **Flexible sourcing** — Group parts by supplier (SendCutSend, Amazon, Home Depot, etc.)
- **Rich metadata** — Category, difficulty, material, and creator information for better organization

### Using projects.json

When you run `npm run build-site`, you'll see output like:

```
Loaded 6 projects from projects.json
  - Tranman Open D Handles: calculated cost $65.00 from parts
  - Tranman Low Profile Fixed Mount: using fixed cost $54.70
```

**See `PROJECTS_README.md` for complete documentation on:**

- Full JSON schema and required fields
- How to add new projects
- Best practices for part names and costs
- Troubleshooting JSON errors and data validation

## File Organization

- The generator looks for files named `README` or `README.md` recursively, excluding `node_modules`, `.git`, and `docs/`.
- Pages are created under `docs/` keeping directory structure; each README becomes an index.html in the corresponding path.
- The `projects.json` file is loaded during build to populate cost tables, BOM data, and feature pages.
- All assets (images, design files, etc.) are automatically copied to `docs/` and linked correctly.

## GitHub Actions Auto-Publish

This repository includes a GitHub Actions workflow (`.github/workflows/deploy-docs.yml`) that automatically builds the site and publishes it to GitHub Pages when you push to `front-end-project`.

**Status**: After a push, check the Actions tab for the "Deploy Docs" workflow and confirm it completed successfully. The site publishes to `https://laynemag.github.io/HomeGymDIY/`.

## Local Development

Run a clean build and start a local HTTP server:

```bash
npm run dev
```

Then open http://localhost:8080 in your browser.

Alternatively, run manually:

```bash
npm run clean-site && npm run build-site && npx http-server docs -p 8080 -c-1
```

Note: The `dev` script uses `http-server` via npx, so no global install is required. Change the port with `-p <port>` if needed.

## YAML Front-Matter for Page Metadata

You can add YAML front-matter at the top of any README to control how it displays. Place it at the very top of the file:

```markdown
---
title: "Custom Page Title"
nav_title: "Sidebar Label"
nav_order: 1
---

# Your Content
```

### Metadata Fields

| Field       | Purpose                                                     |
| ----------- | ----------------------------------------------------------- |
| `title`     | Page title (used in browser tab and as main heading)        |
| `nav_title` | Sidebar navigation label (if different from title)          |
| `nav_order` | Sort order in sidebar (numeric; lower numbers appear first) |

### Best Practices

- **Top-level folders** (e.g., `handles/README.md`) — Set `nav_title` to the folder display name
- **Nested projects** — Set `title` to the project name if you want a different display than the filename
- **Custom ordering** — Use `nav_order` to control sidebar appearance (e.g., `nav_order: 1` for featured projects)

## Styling & Theme

The site includes both **light and dark modes** with a professional gradient logo. All styling is embedded in the generated HTML for simplicity. Users can toggle between themes using the button in the top-right corner, and their preference is saved to localStorage.

To customize colors or layout, edit the CSS in the `layout()` function in `scripts/generate-site.js` (search for the `<style>` tag).

## Asset Copying

The generator automatically copies all referenced files to `docs/` when building:

- **Images** (.png, .jpg, .gif, etc.) — Wrapped in `<figure>` tags with captions
- **Design files** (.step, .dxf, .stl, etc.) — Available for download
- **Other files** — PDFs, documents, etc.

Make sure linked files exist in the source tree or you'll see warnings in the build output.

## Common Tasks

### Add a New Project

1. Add an entry to `projects.json` (see `PROJECTS_README.md` for full schema)
2. Create a folder and README.md if you want a dedicated page
3. Run `npm run build-site`
4. Commit and push to `front-end-project`

### Update Project Costs

1. Edit the part costs in `projects.json`
2. If using auto-calculated cost (cost = 0), run `npm run build-site` — it updates automatically
3. If using fixed cost, manually update the `cost` field
4. Commit and push

### Add a New Category Folder

1. Create a new top-level folder (e.g., `my-category/`)
2. Add a `README.md` with YAML front-matter (include `nav_title` for sidebar label)
3. Organize projects inside
4. Run `npm run build-site`

## Troubleshooting

| Issue                       | Solution                                                            |
| --------------------------- | ------------------------------------------------------------------- |
| Build fails with JSON error | Check `projects.json` for trailing commas or mismatched quotes      |
| Pages not showing on site   | Verify README.md exists and is spelled correctly (case-sensitive)   |
| Assets showing 404 errors   | Check that linked files exist; rebuild and check build output       |
| Dark mode logo shows as box | CSS clipping should work in modern browsers; try hard refresh       |
| Projects not in cost table  | Ensure `category` in projects.json matches exactly (case-sensitive) |
| BOM builder not working     | Clear browser cache; ensure projects.json is valid JSON             |

## Contributing

When adding new projects or making changes:

1. Follow the existing folder and README structure
2. Update `projects.json` with accurate costs and part information
3. Include design files (.STEP, .DXF, .STL) in the project folder
4. Test locally with `npm run dev` before pushing
5. Check the site at https://laynemag.github.io/HomeGymDIY/ after deploy to confirm changes
6. Reference `PROJECTS_README.md` for detailed project data guidelines
