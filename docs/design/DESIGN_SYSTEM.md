# Design System & UI Kit

**Status**: Active
**Version**: 1.0.0
**Philosophy**: "Premium, Calm, Hypnotic, Structured."
The Resonate interface is designed to feel like a sophisticated tool for thought—airy, precise, and responsive.

---

## 1. Color Palette

### Primary Colors
Used for actions, highlights, and the core brand identity.
- **Azure Blue**: `#2563EB` (Tailwind `blue-600`) - Primary Action / Brand Color.
- **Azure Light**: `#DBEAFE` (Tailwind `blue-100`) - Background highlights.
- **Azure Dark**: `#1E40AF` (Tailwind `blue-800`) - Hover states.

### Neutrals (Slate)
Used for text, borders, and UI chrome. We strictly use the **Slate** scale for a cool, technical neutral.
- **Slate 900**: `#0F172A` - Main Headings / Dark Backgrounds.
- **Slate 600**: `#475569` - Body Text.
- **Slate 400**: `#94A3B8` - Muted Text / Icons.
- **Slate 200**: `#E2E8F0` - Borders / Dividers.
- **Slate 50**: `#F8FAFC` - Page Backgrounds.

### Semantic Colors
- **Success**: `emerald-500` - "Score >= 8.0".
- **Error**: `red-500` - "Validation Failed".
- **Warning**: `amber-500` - "Drift Detected".

---

## 2. Typography

**Font Family**: `Inter` (or System Sans).
**Weights**:
- **Bold (700)**: Headings.
- **SemiBold (600)**: Buttons, Navigation.
- **Regular (400)**: Body text.

### Type Scale
- **H1**: `text-4xl` / `font-bold` / `tracking-tight` (Hero / Page Titles)
- **H2**: `text-2xl` / `font-bold` (Section Headers)
- **H3**: `text-lg` / `font-semibold` (Card Titles)
- **Body**: `text-base` / `leading-relaxed` (Standard Reading)
- **Small**: `text-sm` / `text-slate-500` (Metadata)

---

## 3. UI Components

### Buttons
**Secondary (Outline)**
- **Use for**: Secondary actions (e.g., "Documentation", "Cancel").
- **Classes**: `px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-medium`

**Primary (Filled)**
- **Use for**: Main calls to action (e.g., "Get Started", "Save Identity").
- **Classes**: `px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-semibold`

### Cards
- **Use for**: Grouping content (Identity Modules, Features).
- **Classes**: `bg-white p-6 rounded-xl shadow-sm border border-slate-200`
- **Interactive**: `hover:shadow-md transition-shadow`

### Inputs (Textarea / Text)
- **Default**: `w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20`
- **Active**: `focus:ring-2 transition-colors`

---

## 4. Animation & Motion
We use `framer-motion` for fluid feedback.

- **Micro-interactions**: Buttons scale down slightly on click (`scale: 0.98`).
- **Page Transitions**: Fade in (`opacity: 0` -> `1`).
- **Lists**: Staggered entrance for items.
- **The "Resonate" Pulse**: A custom keyframe animation for the loader and active states.

```css
@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}
```
