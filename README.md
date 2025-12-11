# HomeGymDIY

Community-built catalog of DIY attachments, rack accessories, and fabrication notes for home gym lifters.

## Table of Contents

- [Browse the Site](#-browse-the-site)
- [Request a Part](#-request-a-part)
- [Repository & Site Structure](#-repository--site-structure)
- [Fabrication Services](#-fabrication-services)
- [Contribution Guidelines](#-contribution-guidelines)

## 🌐 Browse the Site

Prefer a friendlier UI? Visit **[laynemag.github.io/HomeGymDIY](https://laynemag.github.io/HomeGymDIY/)** to search, filter, preview images, and download files. The site is generated directly from the README files in this repo, so keeping them tidy keeps the website accurate.

---

## 📋 Request a Part

Need a custom bracket, pulley mount, or printed accessory?

1. [Create a GitHub account](https://github.com/signup) if you do not already have one.
2. Open the **[Issues](https://github.com/laynemag/HomeGymDIY/issues)** tab and click **New issue** → **Part Request**.
3. Fill out the template (function, materials, dimensions, mounting method, reference photos/links, contact info) and drag in any sketches.
4. Submit. We will continue the conversation in the issue thread, and the request is auto-labeled `request` for tracking.

---

## 📁 Repository & Site Structure

| Folder | Description | Site Nav |
| --- | --- | --- |
| `Home/` | Landing page content, site overview, tools | nav order 0 |
| `handles/` | Cable attachment handles, grips, pull-down accessories | nav order 1 |
| `voltra_mounts/` | Voltra mounting plates, belt squat bases, pulley brackets | nav order 2 |
| `rack_attachments/` | MagStrap upgrades, shelves, storage hooks | nav order 3 |
| `misc/` | Utility hooks, bench add-ons, 3D printed protectors | nav order 4 |

Each folder README begins with YAML front matter (title, nav_title, nav_order) so the generator can build the sidebar. Keep creator names at the beginning of project titles and follow the shared section order (Images → Files → Specs → Notes → Credits) for consistent rendering.

---

## 🏭 Fabrication Services

Most metal projects are cut through **SendCutSend** with bending, tapping, and powder-coating options. Some designs note **Oshcut** or local fab shops when tighter bends near holes or specialty materials are needed. Always capture:

- Material grade/thickness and finish
- Hole diameters, spacing, and tolerances
- Tapping/countersink or hardware requirements
- Bend radii and clearance notes
- Quote screenshots (tracked in `SCS_SCREENSHOTS_NEEDED.md`) when possible

3D printed parts should include filament type, infill, and hardware where applicable.

---

## 🤝 Contribution Guidelines

1. **Credit the creator** in the title and dedicated credits subsection.
2. **Document fabrication details** (material, thickness, bends/taps, finish, hardware sourcing, cost references).
3. **Commit all source files** (.STEP, .DXF, .STL/.3MF, Fusion archives, BOM spreadsheets, etc.).
4. **Update `projects.json`** when a project should appear in the cost table or BOM builder (see `README_SITE.md` and `PROJECTS_README.md`).
5. **Run `npm run build-site`** (or `npm run dev`) to verify the site before opening a pull request; check the published site after merge.
6. **Follow HomeGym Discord safety rules**—document load limits, prototype status, and any risks.

Thanks for helping fellow lifters build better gear!