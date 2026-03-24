# Design System Rules — Nedriva

## Component Structure

```
src/components/
├── ui/                  # Atomic/gốc — reusable primitives, no app-specific business logic
│   ├── Button.tsx       # Unified button (primary, secondary, outline)
│   ├── Input.tsx       # Labeled text/number input
│   ├── Checkbox.tsx    # Checkbox control
│   ├── Switch.tsx      # Toggle switch
│   ├── Slider.tsx      # Range slider
│   ├── Tabs.tsx        # Tab navigation
│   ├── SegmentedControl.tsx  # Pill-style option selector
│   ├── PillGroup.tsx   # Button-group selector
│   ├── DropZone.tsx    # Drag-and-drop file upload area
│   ├── PaginationBar.tsx     # Pagination with summary
│   ├── ActionsDropdown.tsx   # HeroUI dropdown menu
│   ├── FaqAccordion.tsx     # FAQ accordion
│   ├── InfoTooltip.tsx      # Info tooltip
│   └── SelectableList.tsx   # Grouped selectable list
│
├── common/              # Composed/page-level — app-specific business logic & design tokens
│   ├── TestimonialCard.tsx  # User testimonial with rating stars
│   ├── FeatureCard.tsx      # Feature highlight card
│   ├── ToolCard.tsx         # Tool preview card
│   ├── UseCaseCard.tsx      # Use-case with before/after image
│   ├── StepCard.tsx         # Step-by-step instruction card
│   ├── Badge.tsx           # Label badge with variants
│   ├── Card.tsx            # Reusable card container
│   ├── Section.tsx         # Page section wrapper
│   ├── Container.tsx      # Max-width container
│   ├── SectionHeader.tsx   # Section header with badge + title
│   ├── GradientText.tsx    # Text with gradient background
│   ├── StatsRow.tsx        # Stats display row
│   ├── Divider.tsx         # Horizontal divider
│   ├── GridOverlay.tsx     # Decorative grid background
│   ├── GlowBlob.tsx        # Decorative glow blob
│   ├── SocialIconButton.tsx # Social platform icon button
│   └── BeforeAfterCompare.tsx # Draggable before/after compare
│
├── referral/             # Referral feature — tables, modals, tracking
├── pages/                # Page-level section components
│   ├── marketing/         # Landing page sections
│   ├── boost/             # Boost tool pages
│   └── pricing-plans/     # Pricing page
├── layout/               # SiteHeader, SiteFooter, BoostHeader
├── analytics/            # PostHog tracking
├── providers/            # React context providers
├── index.tsx             # Re-export all common/ primitives
```

### `ui/` vs `common/`

- **`ui/`** — Atomic components, no app-specific business logic. Usable anywhere.
- **`common/`** — Components with app-specific business logic or design tokens (marketing cards, section wrappers...). Small page sections also go here.

## Design Tokens (global.css)

### Colors
```css
--color-page: #09080f /* Main background */ --color-surface: #13111c /* Card, panel */
  --color-elevated: #1c1828 /* Modal, dropdown */ --color-brand: #8b5cf6 /* Primary violet */
  --color-brand-light: #a78bfa /* Light violet */ --color-accent: #d946ef /* Fuchsia */
  --color-accent-light: #f0abfc --color-foreground: #ffffff /* Headings */ --color-muted: #a1a1b5
  /* Body text */ --color-subtle: #6b6b80 /* Hints, meta */;
```

### Border Radius
```css
rounded-[20px]   /* Main card */
rounded-xl        /* Buttons, inputs */
rounded-full      /* Pills, badges */
```

### Shadows
```css
shadow-[0_4px_24px_rgba(0,0,0,0.4)]     /* Card default */
shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_30px_rgba(139,92,246,0.15)]  /* Card hover */
```

### Gradients
```css
--gradient-cta: linear-gradient(135deg, #7c3aed, #a855f7, #d946ef)
  --gradient-brand: linear-gradient(135deg, #6d28d9, #8b5cf6, #a855f7)
  --gradient-text: linear-gradient(90deg, #c4b5fd, #f0abfc);
```

## Component Patterns

### Badge
```tsx
<span className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
```
- Variants: brand, success, warning, error, info, accent
- Colors: `border-{color}/30 bg-{color}/10-15 text-{color}-light/400`

### Card
```tsx
<div className="rounded-[20px] border border-white/5 bg-[#13111c] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
```
- Hover: `hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_30px_rgba(139,92,246,0.15)]`

### Button Primary
```tsx
<button className="h-12 rounded-full bg-gradient-cta px-8 text-base font-semibold text-white shadow-cta hover:scale-[1.03]">
```

### Button Secondary
```tsx
<button className="h-10 rounded-xl px-5 text-sm font-medium text-[#a1a1b5] hover:bg-white/5 hover:text-white">
```

### Section Header
```tsx
<div className="mb-14 max-w-2xl text-center">
  <Badge>{badge}</Badge>
  <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
    Title <GradientText>Gradient</GradientText>
  </h2>
  <p className="mt-5 text-lg text-[#a1a1b5]">{subtitle}</p>
</div>
```

## Animation
```tsx
// Fade up animation
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-60px' }}
  transition={{ duration: 0.45, delay: index * 0.06 }}
>
```

## Usage Guidelines

1. **Always use unified components** from `common/index.tsx`:
   - Layout: `Section`, `Container`
   - Text: `Badge`, `SectionHeader`, `GradientText`
   - Data: `StatsRow`, `Divider`
   - Decoratives: `GridOverlay`, `GlowBlob`
   - Cards: `TestimonialCard`, `FeatureCard`, `ToolCard`, `UseCaseCard`, `StepCard`, `Card`
   - Icons: import directly from `lucide-react` when needed

2. **Card hover effect**:
   ```tsx
   className="transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_30px_rgba(139,92,246,0.15)]"
   ```

3. **Icon containers**:
   ```tsx
   <div className="size-12 rounded-xl bg-violet-500/15 text-violet-400">
     {icon}
   </div>
   ```

4. **Border colors**:
   - Default: `border-white/5`
   - Hover: `border-{color}/30`
   - Active: `border-{color}/50`

5. **Text colors**:
   - Headings: `text-white`
   - Body: `text-[#a1a1b5]`
   - Hints: `text-[#6b6b80]`
   - Accent: `text-violet-400`, `text-fuchsia-400`, etc.
