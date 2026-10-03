# Links

All external links for the Ripe design test task, in one place.

| What | Link | Status |
|---|---|---|
| **Landing page** (GitHub Pages) | https://nataperedrii.github.io/calories-calculator-design/ | Live |
| **Brand stylescape** | https://nataperedrii.github.io/calories-calculator-design/01-branding/stylescape.html | Live |
| **Brand directions** | https://nataperedrii.github.io/calories-calculator-design/01-branding/directions.html | Live |
| **Design system** | https://nataperedrii.github.io/calories-calculator-design/02-design-system/index.html | Live |
| **Clickable prototype** (phone frame, screen picker) | https://nataperedrii.github.io/calories-calculator-design/03-screens/index.html | Live |
| **First screen alone** (sign-in) | https://nataperedrii.github.io/calories-calculator-design/03-screens/screens/01-welcome.html | Live |
| **Flows board** | https://nataperedrii.github.io/calories-calculator-design/03-screens/flows.html | Live |
| **Video walkthrough** (Loom / FocuSee) | *To be added* | Not recorded yet |
| **Repository** | https://github.com/nataperedrii/calories-calculator-design | Live |
| **Task** | https://github.com/jito-dev/trainee-designer-apr-2026-test-task | Live |
| **Figma file** (all 46 screens as editable layers, plus tokens as variables and styles) | https://www.figma.com/design/Xo47SGfRZervjkNEHIjE0D/Ripe-%E2%80%94-calorie-calculator-screens | Shared: anyone with the link can view |

**GitHub Pages** deploys from `main`, root folder. A `.nojekyll` file makes Pages serve the files as they are.

**Checked on 3 October 2026, after the Figma update**, in a fresh browser context, like incognito:
- 53 pages answered 200: the landing page, stylescape, directions, the design system and its standalone version, the prototype, the flows board and all 46 screens.
- 0 failed requests, 0 broken images, 0 script errors.
- Every internal link resolves.
- The Figma link is on the landing page.

The links work from incognito: the site needs no sign-in and loads only the repository files and Google Fonts.

**About the Figma file.** The design was made in HTML/CSS, not in Figma. Claude Code then exported the final screens to Figma through the official Figma MCP connector: 10 calls on the free Starter plan. The file is generated, not hand-drawn. How it was made, the call log and the list of manual fixes are in [PLAN-FIGMA.md](PLAN-FIGMA.md). The file is viewable without a Figma account. Figma blocks automated browsers, so its public access was checked by hand in incognito, not by the link check above.
