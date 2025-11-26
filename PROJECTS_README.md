# Projects Configuration

This `projects.json` file is the **single source of truth** for all DIY projects, costs, and parts lists used throughout the site.

## Structure

Each project object contains:

```json
{
  "id": "unique-project-id",
  "name": "Display Name",
  "category": "Handles|Voltra Mounts|Rack Attachments|Miscellaneous",
  "creator": "Creator Name",
  "difficulty": "Easy|Medium|Hard",
  "material": "Material Description",
  "cost": 100,
  "notes": "Optional notes about the project",
  "parts": [
    {
      "name": "Part Name",
      "qty": 1,
      "source": "Where to buy (Amazon, SendCutSend, etc)",
      "url": "https://link-to-part",
      "estimatedCost": 25
    }
  ]
}
```

## Fields Explained

| Field        | Required | Notes                                                                   |
| ------------ | -------- | ----------------------------------------------------------------------- |
| `id`         | Yes      | Unique identifier (use kebab-case)                                      |
| `name`       | Yes      | Display name on the site                                                |
| `category`   | Yes      | One of: Handles, Voltra Mounts, Rack Attachments, Miscellaneous         |
| `creator`    | Yes      | Name of person who designed/documented it                               |
| `difficulty` | Yes      | Easy, Medium, or Hard (affects user decision-making)                    |
| `material`   | Yes      | What it's made of (affects selection)                                   |
| `cost`       | Yes      | Total manufacturing/sourcing cost. If 0, will auto-calculate from parts |
| `notes`      | No       | Important details, warnings, or special requirements                    |
| `parts`      | Yes      | Array of parts needed (can be empty)                                    |

### Parts Fields

| Field           | Required | Notes                                                           |
| --------------- | -------- | --------------------------------------------------------------- |
| `name`          | Yes      | Part name (be specific, e.g., "M10 1.5 Hex Nut" not just "Nut") |
| `qty`           | Yes      | Quantity needed                                                 |
| `source`        | Yes      | Supplier name (used to group in BOM Builder)                    |
| `url`           | Yes      | Direct link to product (can be empty string "")                 |
| `estimatedCost` | Yes      | Approximate cost per unit for BOM calculation                   |

## How It's Used

### 1. **Cost Comparison Table** (`/cost-comparison/`)

- Automatically generated from this file
- Displays: name, creator, category, cost, difficulty, material
- Sortable by any column

### 2. **BOM Builder** (`/bom/`)

- Users select projects
- Parts are combined and deduplicated automatically
- Grouped by supplier for easy shopping
- Shows total cost and provides direct links

### 3. **Console Output**

When running `npm run build-site`, you'll see:

```
Loaded 6 projects from projects.json
  - Project Name: calculated cost $65.00 from parts
```

If cost = 0 and there are parts with estimatedCost, it calculates the total.

## Best Practices for Maintaining

### ✅ DO:

- Keep IDs unique and descriptive (e.g., `tranman-voltra-mount` not `project1`)
- Use consistent capitalization for sources (Amazon, Home Depot, SendCutSend)
- Update `estimatedCost` when prices change
- Include specific part specs in names (e.g., "M5 x 0.8 Countersunk Hex Bolts" not "Bolts")
- Keep notes brief but informative

### ❌ DON'T:

- Leave URLs as empty string unless the part is free/downloadable
- Use generic part names without specifications
- Mix capitalization for the same source (SendCutSend vs sendcutsend)
- Leave estimated costs as 0 unless the part is truly free

## Adding a New Project

1. Add a new object to the `projects` array
2. Ensure all required fields are present
3. Add parts with realistic estimated costs
4. Run `npm run build-site` to verify it loads
5. Check the cost calculation in console output

Example:

```json
{
  "id": "myname-new-gadget",
  "name": "MyName's New Gadget",
  "category": "Handles",
  "creator": "Your Name",
  "difficulty": "Medium",
  "material": "Stainless Steel",
  "cost": 0,
  "notes": "This is a cool new gadget",
  "parts": [
    {
      "name": "Steel Bracket",
      "qty": 1,
      "source": "SendCutSend",
      "url": "https://sendcutsend.com",
      "estimatedCost": 45
    }
  ]
}
```

## Updating Costs

When a part price changes:

1. Update `estimatedCost` for that part
2. If using auto-calculated cost (cost = 0), the total updates automatically
3. If using fixed cost, manually update the `cost` field
4. Run `npm run build-site` to regenerate pages

## Troubleshooting

**Build fails with JSON error**: Check for trailing commas or mismatched quotes
**Projects not showing on site**: Verify `category` exactly matches one of the allowed values
**BOM showing wrong quantity**: Check that you're not accidentally duplicating part names across projects (it will combine them)
