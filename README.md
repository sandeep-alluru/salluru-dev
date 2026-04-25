# salluru.dev — Personal Brand Landing Page

Plain HTML/CSS/JS landing page for Sandeep Alluru. No frameworks, no build step, no dependencies.

## Preview locally

Just open `index.html` in any browser:

```
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it locally to avoid any browser file-protocol quirks:

```bash
# Python (built-in)
python3 -m http.server 8080
# then visit http://localhost:8080

# Node (npx, no install)
npx serve .
# then visit http://localhost:3000
```

## File structure

```
salluru-dev/
├── index.html      # Single-page markup
├── style.css       # All styles (CSS variables for dark/light theming)
├── script.js       # Terminal animation, dark mode toggle, form handling
├── favicon.svg     # "S" letterform on gradient background
├── robots.txt      # Allow all crawlers
├── sitemap.xml     # Homepage only
├── .gitignore      # Standard static-site ignores
└── README.md       # This file
```

## Deploy to Netlify

### Option A — Drag and drop (fastest)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag the entire `salluru-dev/` folder onto the deploy dropzone
3. Done — live in ~10 seconds

### Option B — Git push (recommended for ongoing updates)

1. Push this folder to a GitHub/GitLab repo
2. In Netlify: **Add new site → Import an existing project**
3. Connect your repo
4. Build settings:
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.` (or the folder name if it's a subfolder)
5. Click **Deploy site**
6. Add your custom domain `salluru.dev` under **Domain settings**

### Custom domain DNS

Point your domain registrar's DNS to Netlify:

```
Type    Name    Value
A       @       75.2.60.5
CNAME   www     your-site-name.netlify.app
```

Netlify provisions a free SSL certificate automatically.

## Email form

Both signup forms submit to `https://sandeepalluru.beehiiv.com/subscribe` via a hidden iframe so the page never navigates away on submit. A success message is shown optimistically after ~1.2s.

To change the Beehiiv endpoint, update the `action` attribute on both `<form>` elements in `index.html`.

## Customisation

- **Colors / theming:** edit CSS variables at the top of `style.css` (`:root` for dark, `body.light` for light)
- **Social links:** search `href=` in `index.html` and replace URLs
- **Terminal lines:** edit the `LINES` array in `script.js`
- **Photo:** replace the `.photo-placeholder` div in the About section with an `<img>` tag

## Lighthouse targets

- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

The page ships zero render-blocking resources — one CSS file, one JS file (deferred via `</body>` placement), no web fonts loaded over the network (system font stack only), and under 100KB total page weight.
