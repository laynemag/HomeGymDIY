const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');

// Config
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs');
const IGNORED_DIRS = ['.git', 'node_modules', 'docs'];

// Determine base URL: use /HomeGymDIY/ for GitHub Pages (production), or / for local dev
const BASE_URL = process.env.GITHUB_ACTIONS ? '/HomeGymDIY/' : '/';

function findReadmes(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORED_DIRS.includes(e.name)) continue;
      results = results.concat(findReadmes(full));
    } else if (e.isFile() && /^README(?:\.md)?$/i.test(e.name)) {
      results.push(full);
    }
  }
  return results;
}

function relUrl(from, to) {
  const r = path.relative(path.dirname(from), to).replace(/\\/g, '/');
  return r || './';
}

function sanitizeTitle(title) {
  return title.replace(/\s+/g, ' ').trim();
}

function layout(title, navHtml, contentHtml) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    body{font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;line-height:1.6;margin:0;padding:0;color:#111}
    header{background:#0f172a;color:#fff;padding:16px 20px}
    a.logo{color:#fff;text-decoration:none;font-weight:700}
  .wrap{display:flex;gap:20px}
  /* make the sidebar wider and sticky so navigation is prominent */
  nav{width:320px;background:#f8fafc;padding:22px;border-right:1px solid #e6eef6;height:calc(100vh - 64px);box-sizing:border-box;overflow:auto;position:sticky;top:64px}
  main{flex:1;padding:28px;max-width:980px}
    .readme-content img{max-width:100%;height:auto}
    .readme-figure{margin:20px 0;text-align:center;border:1px solid #e5e7eb;border-radius:6px;padding:12px;background:#fafafa;display:flex;flex-direction:column;align-items:center}
    .readme-figure img{display:block;width:100%;max-width:600px;max-height:600px;height:auto;margin:0 auto 8px;border-radius:4px;object-fit:contain}
    .readme-figure figcaption{font-size:13px;color:#666;font-style:italic;margin:8px 0 0 0;word-wrap:break-word}
  .nav-list{list-style:none;padding:0;margin:0;padding-left:14px}
  .nav-list li{margin:8px 0}
  /* make links in the sidebar larger and bolder for prominence */
  .nav-list a{color:#0f172a;text-decoration:none;font-size:16px;font-weight:600;display:block;padding:6px 4px;border-radius:4px}
  .nav-list a:hover{background:#eef6ff;color:#0b2b4a;text-decoration:none}
  .nav-list a.active{font-weight:700;color:#0b2b4a;background:#e6f0ff}
  .nav-folder-heading{margin-top:18px;margin-bottom:8px;font-size:18px;font-weight:800;color:#0b2b4a;letter-spacing:0.4px}
  .nav-folder-heading:first-child{margin-top:0}
    footer{padding:14px 20px;font-size:13px;color:#6b7280}
    @media (max-width:900px){nav{position:static;width:100%;height:auto;border-right:none} .wrap{flex-direction:column}}
  </style>
</head>
<body>
  <header>
    <div style="display:flex;align-items:center;justify-content:space-between">
      <a class="logo" href="/">HomeGymDIY</a>
      <div style="font-size:13px;opacity:0.9">Generated site</div>
    </div>
  </header>
  <div class="wrap">
    <nav>
      ${navHtml}
    </nav>
    <main>
      ${contentHtml}
    </main>
  </div>
  <footer>
    Generated from repository README files.
  </footer>
</body>
</html>`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function extractImagePathsFromMarkdown(md) {
  const imgs = [];
  if (!md) return imgs;
  const re = /!\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    let img = m[1].split(/\s+/)[0];
    img = img.replace(/^<|>$/g, '').replace(/^['"]|['"]$/g, '');
    imgs.push(img);
  }
  return imgs;
}

function extractAllFilePathsFromMarkdown(md) {
  const files = [];
  if (!md) return files;
  // Extract image paths: ![alt](path)
  const imgRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = imgRe.exec(md)) !== null) {
    let path = m[1].split(/\s+/)[0];
    path = path.replace(/^<|>$/g, '').replace(/^['"]|['"]$/g, '');
    files.push(path);
  }
  // Extract link paths: [text](path)
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((m = linkRe.exec(md)) !== null) {
    let path = m[2].split(/\s+/)[0];
    path = path.replace(/^<|>$/g, '').replace(/^['"]|['"]$/g, '');
    // Skip URLs and already-added paths
    if (!path.toLowerCase().startsWith('http') && !path.toLowerCase().startsWith('//') && !files.includes(path)) {
      files.push(path);
    }
  }
  return files;
}

function copyAssetsForMarkdown(md, page, copied, missing) {
  const files = extractAllFilePathsFromMarkdown(md);
  for (const filePath of files) {
    if (!filePath) continue;
    
    // Decode URL-encoded filenames (e.g., "scs%20d%20handle.step" -> "scs d handle.step")
    const decodedPath = decodeURIComponent(filePath);
    
    const lower = decodedPath.toLowerCase();
    if (lower.startsWith('http:') || lower.startsWith('https:') || lower.startsWith('//') || lower.startsWith('data:')) continue;
    // resolve source
    let source;
    if (decodedPath.startsWith('/')) {
      source = path.join(ROOT, decodedPath.replace(/^\//, ''));
    } else {
      source = path.join(path.dirname(page.src), decodedPath);
    }
    // normalize and ensure within repo
    const relFromRoot = path.relative(ROOT, source);
    if (relFromRoot.startsWith('..')) {
      missing.push({ page: page.src, file: decodedPath, reason: 'outside repo' });
      continue;
    }
    const dest = path.join(OUT, relFromRoot);
    if (copied.has(dest)) continue;
    if (fs.existsSync(source)) {
      // Skip if source is a directory
      const stat = fs.statSync(source);
      if (stat.isDirectory()) continue;
      
      ensureDir(path.dirname(dest));
      try {
        fs.copyFileSync(source, dest);
        copied.add(dest);
      } catch (e) {
        missing.push({ page: page.src, file: decodedPath, reason: e.message });
      }
    } else {
      missing.push({ page: page.src, file: decodedPath, reason: 'not found' });
    }
  }
}

function wrapImagesInFigures(html) {
  // wrap all img tags in figure tags with the readme-figure class
  return html.replace(/<img\s+([^>]*?)alt="([^"]*)"\s*\/?>/g, (match, attrs, alt) => {
    const figcap = alt ? `<figcaption>${alt}</figcaption>` : '';
    return `<figure class="readme-figure"><img ${attrs}alt="${alt}" />${figcap}</figure>`;
  });
}

function slugify(relPath) {
  // convert path to URL-friendly slug
  return relPath.replace(/\\/g, '/').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_\-/.]/g, '').toLowerCase();
}

function main() {
  console.log('Scanning repository for README.md files...');
  const readmes = findReadmes(ROOT).filter(f => !f.startsWith(path.join(ROOT, 'docs')));
  if (readmes.length === 0) {
    console.log('No README files found.');
    return;
  }

  // Map each to an output HTML path and extract a friendly title
  const pages = readmes.map(f => {
    const rel = path.relative(ROOT, path.dirname(f)).replace(/\\/g, '/');
    const display = rel || '.';
    const outName = slugify(path.join(rel || '.', 'index.html'));
    const outPath = path.join(OUT, outName);
    const url = (rel ? rel.replace(/\\/g, '/') + '/' : '');
    // read file and extract YAML front-matter (if present) and first heading (H1..H3) as title
    const raw = fs.readFileSync(f, 'utf8');
    let md = raw;
    let meta = {};
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (fm) {
      try {
        meta = yaml.load(fm[1]) || {};
      } catch (e) {
        console.warn('Failed to parse front-matter for', f, e.message);
      }
      md = raw.slice(fm[0].length);
    }
    const titleMatch = md.match(/^#{1,3}\s+(.+)$/m);
    const title = (meta && (meta.nav_title || meta.title)) || (titleMatch ? sanitizeTitle(titleMatch[1]) : (md.split(/\r?\n/).find(l => l.trim()) || display));
    return { src: f, rel, display, outPath, url, title, md, meta };
  });

  // ensure output dir
  ensureDir(OUT);

  // Build nav HTML showing only top-level folders (and root)
  const topFolders = new Set();
  pages.forEach(p => {
    if (!p.rel || p.rel === '.') return;
    const top = p.rel.split('/')[0];
    topFolders.add(top);
  });

  const topList = Array.from(topFolders).sort((a, b) => {
    // sort by nav_order if defined, otherwise alphabetically
    const pageA = pages.find(p => p.rel === a);
    const pageB = pages.find(p => p.rel === b);
    const orderA = (pageA && pageA.meta && pageA.meta.nav_order) !== undefined ? pageA.meta.nav_order : Infinity;
    const orderB = (pageB && pageB.meta && pageB.meta.nav_order) !== undefined ? pageB.meta.nav_order : Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });
  const navItems = [`<li><a href="${BASE_URL}">Home</a></li>`].concat(topList.map(f => {
    // look for a folder README meta to provide a nicer label
    const folderPage = pages.find(p => p.rel === f);
    const label = (folderPage && (folderPage.meta && (folderPage.meta.nav_title || folderPage.meta.title))) || sanitizeTitle(f.replace(/[-_]/g, ' '));
    return `<li><a href="${BASE_URL}${f}/">${label}</a></li>`;
  })).join('\n');
  const navItems2 = [`<li><a href="${BASE_URL}requests/">Project Requests</a></li>`].join('\n');
  const navHtml = `<div class="nav-folder-heading">Sections</div><ul class="nav-list">${navItems}</ul><div class="nav-folder-heading">Community</div><ul class="nav-list">${navItems2}</ul>`;

  // create root index page (show repo README if present)
  const rootPage = pages.find(p => p.rel === '.' || p.rel === '');
  const copied = new Set();
  const missing = [];

  if (rootPage) {
    copyAssetsForMarkdown(rootPage.md, rootPage, copied, missing);
  }
  const rootContentIntro = rootPage ? marked(rootPage.md) : '<p>Auto-generated site index of README files.</p>';
  const indexContent = `<h1>HomeGymDIY</h1>${rootContentIntro}`;
  fs.writeFileSync(path.join(OUT, 'index.html'), layout('HomeGymDIY', navHtml, indexContent), 'utf8');

  // For each top folder, generate a folder landing page that lists projects inside the folder
  for (const f of topList) {
    const folderIntroPage = pages.find(p => p.rel === f);
    if (folderIntroPage) {
      copyAssetsForMarkdown(folderIntroPage.md, folderIntroPage, copied, missing);
    }
    let introHtml = '';
    if (folderIntroPage) {
      // Strip the first H1 from markdown if it exists (since we'll use the frontmatter title instead)
      let mdContent = folderIntroPage.md.replace(/^#\s+.+\n/, '');
      introHtml = marked(mdContent);
    } else {
      introHtml = `<p>Contents of ${f}</p>`;
    }
    introHtml = wrapImagesInFigures(introHtml);
    // Get the title from frontmatter, or fall back to folder name
    const folderTitle = (folderIntroPage && folderIntroPage.meta && (folderIntroPage.meta.nav_title || folderIntroPage.meta.title)) || sanitizeTitle(f.replace(/[-_]/g, ' '));
    // find sub-pages under this folder (exclude the folder README itself)
    const subpages = pages.filter(p => p.rel !== f && p.rel.startsWith(f + '/'))
      .sort((a, b) => a.title.localeCompare(b.title));
    const listHtml = subpages.length ? '<ul>' + subpages.map(sp => `\n<li><a href="/${sp.url}">${sp.title}</a></li>`).join('') + '\n</ul>' : '<p>No projects found.</p>';
    const contentHtml = `<h1>${folderTitle}</h1>${introHtml}<h2>Projects</h2>${listHtml}`;
    const outFolderIndex = path.join(OUT, f, 'index.html');
    ensureDir(path.dirname(outFolderIndex));
    fs.writeFileSync(outFolderIndex, layout(folderTitle, navHtml, contentHtml), 'utf8');
    console.log('Wrote folder index', outFolderIndex);
  }

  // write individual README pages for nested projects (skip top-level folder README which is represented by folder index)
  for (const p of pages) {
    // skip root README (already used for index) and top-level folder READMEs (we created folder index pages)
    if (!p.rel || p.rel === '.') {
      // root already handled
      continue;
    }
    if (p.rel.split('/').length === 1) {
      // top-level folder README — already represented by folder index
      continue;
    }
    // copy any local assets referenced by this page
    copyAssetsForMarkdown(p.md, p, copied, missing);
    let html = marked(p.md || fs.readFileSync(p.src, 'utf8'));
    html = wrapImagesInFigures(html);
    const title = p.title || p.display;
    const contentHtml = `<article class="readme-content">${html}</article>`;
    ensureDir(path.dirname(p.outPath));
    fs.writeFileSync(p.outPath, layout(title, navHtml, contentHtml), 'utf8');
    console.log('Wrote', p.outPath);
  }

  if (missing.length) {
    console.warn('\nWarning: some referenced assets were not found or failed to copy:');
    for (const m of missing) {
      console.warn('-', m.file, 'referenced in', m.page, '->', m.reason);
    }
  }

  // Generate requests page
  const requestsContent = `<h1>Project Requests</h1>
<p>Have an idea for a project? Submit a request below!</p>
<div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:24px 0">
  <h2>Submit a Request</h2>
  <form id="request-form">
    <div style="margin-bottom:16px">
      <label for="part-name" style="display:block;font-weight:600;margin-bottom:6px">Part Name</label>
      <input type="text" id="part-name" name="part-name" placeholder="e.g., Weighted Dip Belt Attachment" required style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;font-family:inherit">
    </div>
    <div style="margin-bottom:16px">
      <label for="description" style="display:block;font-weight:600;margin-bottom:6px">Description</label>
      <textarea id="description" name="description" placeholder="Describe the part, its purpose, and any relevant details..." rows="4" required style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;font-family:inherit"></textarea>
    </div>
    <div style="margin-bottom:16px">
      <label for="category" style="display:block;font-weight:600;margin-bottom:6px">Category</label>
      <select id="category" name="category" required style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;font-family:inherit">
        <option value="">-- Select a category --</option>
        <option value="Handles">Handles</option>
        <option value="Voltra Mounts">Voltra Mounts</option>
        <option value="Rack Attachments">Rack Attachments</option>
        <option value="Miscellaneous">Miscellaneous</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <button type="submit" style="background:#0f172a;color:#fff;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:16px">Submit Request</button>
  </form>
</div>

<h2 style="margin-top:40px">Open Requests</h2>
<div id="issues-list" style="margin-top:16px">
  <p style="color:#666">Loading requests...</p>
</div>

<script>
  const BASE_URL = '${BASE_URL}';
  const REPO = 'laynemag/HomeGymDIY';
  
  document.getElementById('request-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const partName = document.getElementById('part-name').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    
    const title = encodeURIComponent(\`Part Request: \${partName}\`);
    const body = encodeURIComponent(\`**Category:** \${category}\\n\\n\${description}\`);
    const labels = 'request';
    
    // Open GitHub issue creation page with pre-filled fields
    window.open(\`https://github.com/\${REPO}/issues/new?title=\${title}&body=\${body}&labels=\${labels}\`, '_blank');
    
    // Reset form
    this.reset();
  });
  
  // Fetch and display open requests
  async function loadRequests() {
    try {
      const response = await fetch(\`https://api.github.com/repos/\${REPO}/issues?labels=request&state=open&per_page=50\`);
      const issues = await response.json();
      
      const container = document.getElementById('issues-list');
      
      if (!Array.isArray(issues) || issues.length === 0) {
        container.innerHTML = '<p style="color:#666">No open requests yet. Be the first to submit one!</p>';
        return;
      }
      
      let html = '<ul style="list-style:none;padding:0;margin:0">';
      for (const issue of issues) {
        const createdDate = new Date(issue.created_at).toLocaleDateString();
        const category = issue.body.match(/\\*\\*Category:\\*\\*\\s*(.+?)\\n/) ? issue.body.match(/\\*\\*Category:\\*\\*\\s*(.+?)\\n/)[1] : 'Uncategorized';
        html += \`<li style="border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:12px;background:#fff">
          <h3 style="margin:0 0 8px 0;color:#0f172a"><a href="https://github.com/\${REPO}/issues/\${issue.number}" target="_blank" style="color:#0f172a;text-decoration:none">\${issue.title}</a></h3>
          <p style="margin:0 0 8px 0;color:#666;font-size:14px">Category: <strong>\${category}</strong> | Created: \${createdDate} | <a href="https://github.com/\${REPO}/issues/\${issue.number}" target="_blank" style="color:#0b7ada;text-decoration:none">#\${issue.number}</a></p>
          <div style="font-size:14px;color:#444;line-height:1.5">\${issue.body.replace(/\\*\\*Category:\\*\\*.+?\\n/, '').substring(0, 200)}...</div>
        </li>\`;
      }
      html += '</ul>';
      container.innerHTML = html;
    } catch (error) {
      console.error('Error loading requests:', error);
      document.getElementById('issues-list').innerHTML = '<p style="color:#d32f2f">Failed to load requests. Please try again later.</p>';
    }
  }
  
  loadRequests();
</script>`;

  const requestsPath = path.join(OUT, 'requests');
  ensureDir(requestsPath);
  fs.writeFileSync(path.join(requestsPath, 'index.html'), layout('Part Requests', navHtml, requestsContent), 'utf8');
  console.log('Wrote', path.join(requestsPath, 'index.html'));

  console.log('Site generated to', OUT);
}

main();
