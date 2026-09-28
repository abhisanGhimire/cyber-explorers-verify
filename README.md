# Cyber Explorers — Certificate Verification Site

**Live site:** https://abhisanghimire.github.io/cyber-explorers-verify/
**Repo:** https://github.com/abhisanGhimire/cyber-explorers-verify

A small static website that lets anyone scan the QR code on a **Cyber Explorers**
graduation certificate and instantly see that it's authentic — the student's name,
which badges they earned, when they finished, and who ran the program.

Built for the **Cyber Explorers** program (ethical hacking + AI for teens) at the
Boys & Girls Club of Worcester, but the code has nothing Worcester-specific baked in —
feel free to reuse it for any club or classroom certificate program.

No build step, no framework, no server. It's plain HTML/CSS/JS that GitHub Pages can
serve as-is.

---

## How it works

1. Each certificate you print gets a unique **Certificate ID** (e.g. `CE-2026-014`) and
   a QR code that points to:
   `https://<your-username>.github.io/<repo-name>/verify.html?id=CE-2026-014`
2. `verify.html` reads that `id` from the URL, looks it up in [`data/students.json`](data/students.json),
   and renders a certificate-style "verified" card — or a themed "not found" screen if the
   ID doesn't exist.
3. There is **no public page that lists every student.** The only way to reach someone's
   page is with their exact certificate ID (from their QR code) — so the site can be public
   on GitHub Pages without turning into a public directory of every teen in the program.
4. `index.html` is the general program landing page (missions, badges, instructor bio) plus
   a manual lookup box for typing in a certificate ID.

## Try it

Open `index.html` locally (or your deployed site) and use the demo certificate:

```
verify.html?id=CE-2026-DEMO
```

Delete the `CE-2026-DEMO` entry from `data/students.json` once you've added real students.

---

## Deploying to GitHub Pages

1. Create a **public** GitHub repository (GitHub Pages on a free account only serves
   public repos) and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial Cyber Explorers verification site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch →
   Branch: `main` / `root`** → Save.
3. Your site goes live at `https://<your-username>.github.io/<repo-name>/`.
4. Update the **"Your site's base URL"** field in the admin tool (`admin/index.html`) and
   the GitHub link in `index.html`'s footer to match.

## Adding a new student (every time someone graduates a mission)

1. **Save a photo (optional).** Drop it in `assets/img/students/` named after the
   certificate ID, e.g. `assets/img/students/CE-2026-014.jpg`. Skip this if you don't have
   one or don't have a photo release on file — a placeholder avatar is used automatically.
2. **Open `admin/index.html`** in a browser (works locally by double-clicking it, or once
   deployed at `https://.../admin/`). Fill in the form:
   - Certificate ID (pick the next number in sequence, e.g. `CE-2026-015`)
   - First name + last initial (see [Privacy](#privacy--safety) below on why not full names)
   - Hacker alias, if they used one
   - Which badges they earned, and the completion date
3. Click **Generate**. It shows you:
   - A **JSON snippet** — copy it and paste it as a new entry inside the array in
     [`data/students.json`](data/students.json)
   - A **QR code** — download it and place it on the printed certificate, pointing at
     that student's `verify.html?id=...` page
4. Commit and push:
   ```bash
   git add data/students.json assets/img/students/
   git commit -m "Add certificate for CE-2026-015"
   git push
   ```
5. GitHub Pages redeploys automatically within a minute or two.

The admin tool runs entirely in your browser — it never sends data anywhere. You still do
the actual commit/push yourself, so nothing goes public until you choose to push it.

## Editing the instructor / team info

Edit [`data/team.json`](data/team.json). Each entry needs an `id` (referenced by students
via `instructorId`), `name`, `role`, optional `photo` (path under `assets/img/team/`),
`bio`, and `contact` email. The homepage's "Meet the Instructor" section and each
certificate's sign-off strip both read from this file.

---

## Privacy & safety

Because GitHub Pages (free tier) only serves **public** repositories, anything committed
here — including this README — is visible to anyone with the link. This project was
designed with that in mind:

- **Names are shown as first name + last initial** (e.g. "Jordan M."), not full names.
- **No page lists every student.** Certificates are only reachable one at a time, by their
  exact ID from the QR code — the site can't be browsed as a roster.
- **Photos are optional.** Only add one if your program already has a signed photo/media
  release for that student, per your organization's usual policy.
- If your program needs to publish a name/photo combination you're not comfortable with
  on a public repo, consider hosting this same code on a private server instead of GitHub
  Pages, or keep photos off entirely and rely on name + badges only.

---

## Project structure

```
index.html              Landing page: about the program, missions, instructor, lookup box
verify.html              Certificate verification result page (reads ?id=...)
404.html                 Themed "signal lost" error page
admin/index.html         Local tool: build a student's JSON entry + QR code
data/students.json       The roster — one entry per student
data/team.json           Instructor / staff info
assets/css/style.css     All styling (one file, CSS custom properties for theming)
assets/js/main.js        Homepage behavior (typewriter intro, lookup form, team render)
assets/js/verify.js      Certificate lookup + render logic
assets/js/admin.js       Admin tool logic (client-side only)
assets/img/doodles/      Hand-drawn-style SVG artwork (badges, icons, mascot, stamp)
assets/img/students/     Student photos (add your own; see its README.md)
assets/img/team/         Instructor/staff photos
```

## Customizing the look

Everything themeable lives at the top of `assets/css/style.css` under `:root` — colors,
border radius, shadow offsets, and the three fonts (a bubble-letter display font, a
monospace terminal font, and a body font). Swap the Google Fonts `@import` at the top of
that file to change the typeface pairing.

## License

MIT — see [LICENSE](LICENSE). Doodle artwork in `assets/img/doodles/` is original to this
project and covered by the same license.
