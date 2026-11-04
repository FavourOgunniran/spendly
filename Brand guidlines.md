# Dashly — Brand Guidelines & Design System Specification

## 1. Brand Identity & Overview
**Dashly** is a high-performance, luxury productivity and project management platform built for modern teams. The visual language blends timeless editorial refinement with tactical digital utility, inspiring clarity, momentum, and focus.

- **Brand Slogan**: *Plan, Prioritize, and Accomplish.*
- **Core Personality**: Authoritative, Refined, Energizing, Frictionless, Tactile.
- **Visual Signature**: Deep dark-forest greens paired with vibrant mint accents, crisp white cards, clean geometric typography, subtle diagonal hatched patterns, and organic silk topography textures.
- **Theme Modes**: Full **Light Sage Canvas Mode** and **Deep Forest Dark Mode**.

---

## 2. Color Palette & Design Tokens

### Light Theme Palette
| Token Name | Hex Code | HSL / CSS Value | Description & Usage |
| :--- | :--- | :--- | :--- |
| `--brand-forest-dark` | `#154432` | `hsl(157, 53%, 17%)` | Primary brand color. Used for prominent active cards, primary buttons, headers, and brand accents. |
| `--brand-forest-hover` | `#103627` | `hsl(157, 54%, 14%)` | Hover state for dark forest elements and interactive buttons. |
| `--brand-forest-active`| `#0c2a1e` | `hsl(157, 55%, 11%)` | Active/Pressed state for buttons and selected menu indicators. |
| `--brand-forest-deep`  | `#091e15` | `hsl(157, 54%, 8%)`  | Deepest forest tone, used for dark container backdrops (Time Tracker, Mobile Banner). |
| `--brand-mint` | `#41ab79` | `hsl(152, 45%, 46%)` | Vibrant energizing mint. Used for secondary highlights, live indicators, and progress bars. |
| `--brand-mint-light` | `#e6f6ee` | Mint tint background for badges, pill tags, and subtle active states. |
| `--brand-mint-text` | `#1d734c` | High-contrast readable mint for typography on light backgrounds. |
| `--bg-page` | `#edf0ee` | Outer canvas page background (warm sage-slate). |
| `--bg-dashboard` | `#fcfdfc` | Interior container background for main dashboard canvas. |
| `--bg-card` | `#ffffff` | Pure white surface for content cards and modular widgets. |
| `--border-light` | `#e5ebe7` | Card and component borders. |
| `--text-primary` | `#121915` | Primary headings, values, and strong text. |
| `--text-secondary`| `#586860` | Body text, labels, and secondary metadata. |
| `--text-muted` | `#829289` | Timestamps, subtitles, shortcuts, and helper notes. |

### Dark Theme Palette (`[data-theme="dark"]`)
| Token Name | Hex Code | Description & Usage |
| :--- | :--- | :--- |
| `--brand-forest-dark` | `#1e5a43` | Rich emerald forest button and active container fills. |
| `--brand-mint` | `#4ade80` | High-visibility luminous mint accent for active states and indicators. |
| `--brand-mint-light` | `#163627` | Subtle dark mint tint for pill backgrounds. |
| `--brand-mint-text` | `#6ee7b7` | High-contrast glow mint for text elements. |
| `--bg-page` | `#0b1410` | Deep midnight forest outer canvas. |
| `--bg-dashboard` | `#101c16` | Dashboard inner container canvas. |
| `--bg-card` | `#15251e` | Deep obsidian forest card surfaces. |
| `--bg-subtle` | `#1a2e26` | Dark input backgrounds and inactive button fills. |
| `--bg-hover` | `#1e362c` | Subtle hover fill for menu and row items. |
| `--border-light` | `#223b30` | Luminous dark forest borders. |
| `--text-primary` | `#f2f7f4` | High-clarity crisp white-mint typography. |
| `--text-secondary`| `#a6bfae` | Secondary body text and labels. |
| `--text-muted` | `#759281` | Muted metadata and helper notes. |

---

## 3. Typography Hierarchy
Dashly uses **Plus Jakarta Sans** as its primary typeface across all viewports.

- **Display / H1**: `26px - 28px` | Weight: `800` (Bold) | Letter Spacing: `-0.6px`
- **Section Headings / H2**: `18px - 20px` | Weight: `700` | Letter Spacing: `-0.4px`
- **Widget Headings / H3**: `15px - 16px` | Weight: `700` | Letter Spacing: `-0.2px`
- **Stat Values**: `28px - 34px` | Weight: `800` | Line Height: `1.1`
- **Body & Item Names**: `13px - 14px` | Weight: `500` - `600` | Line Height: `1.4`
- **Badges, Captions & Meta**: `10.5px - 11.5px` | Weight: `700` | Letter Spacing: `0.4px` (Uppercase when section labeling)

---

## 4. Textural & Graphic Elements

### 1. Hatched Diagonal Striped Patterns (`-45deg`)
- Applied to pending states in charts, progress gauge slices, and tactile accents.
- Light version: `#cfd7d1` on `#f2f5f3`
- Dark version: `#254234` on `#15281f`

### 2. Silk Topography Wave Accents
- Organic topography SVG contour lines and dark layered wave shapes.
- Used in the **Sidebar Mobile Download card** and the **Live Time Tracker widget**.
- Provides a luxury, organic depth to dark surfaces.

### 3. Solid Flat Button Philosophy
- Primary actions use solid flat forest / mint accents with crisp pill radius (`--radius-full`).
- Secondary actions use clean bordered pill shapes.
- No heavy artificial CSS linear gradients on main action buttons.

---

## 5. UI Layout & Elevation Principles
- **Outer Shell**: Floating rounded card (`--radius-2xl: 32px`) centered within viewport on `--bg-page` canvas.
- **Theme Switcher**: Segmented toggle in the Sidebar (`☀️ Light` / `🌙 Dark`) with state persistence in `localStorage`.
- **Card Radii Scale**:
  - Small pills & badges: `9999px` (Full pill)
  - Interactive inputs: `10px - 14px`
  - Widget boxes: `18px - 22px`
  - Modal sheets: `24px - 32px`
- **Elevation & Shadows**:
  - `--shadow-card`: `0 4px 20px -2px rgba(18, 25, 21, 0.04), 0 2px 6px -1px rgba(18, 25, 21, 0.02)`
  - `--shadow-float`: `0 12px 36px -4px rgba(18, 25, 21, 0.08)`
  - `--shadow-modal`: `0 24px 48px -12px rgba(18, 25, 21, 0.18)`

---

## 6. Logo & Iconography
- **Logo Mark**: The Dashly continuous loop ribbon mark, presented in a mint square container (`#e6f6ee`) with dark forest line stroke (`#154432`).
- **Brand Name**: Typeset in bold Plus Jakarta Sans (`20px / 800`).
- **Icons**: Clean geometric 1.75px stroke SVG icons, matched to the design token colors.
