# Design System Specification: Editorial Efficiency

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Maître d’"**

This design system rejects the "SaaS-template" aesthetic in favor of a high-end, editorial experience. It balances the authoritative precision required by B2B restaurant owners with the appetizing, sensory-driven needs of a consumer-facing menu. 

To break the "standard" digital look, we utilize **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid, boxed-in grids, we use breathing room (negative space) and layered surfaces to guide the eye. The transition between the dashboard (Business) and the menu (Consumer) is bridged by a shared philosophy of "Quiet Luxury"—where the interface disappears to let the data and the food become the hero.

---

## 2. Colors: Tonal Sophistication
Our palette uses deep, forest-inspired greens to establish trust and "terracotta" earth tones to stimulate appetite. 

### The "No-Line" Rule
**Designers are strictly prohibited from using 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` card sitting on a `surface` background creates a natural boundary that feels organic, not engineered.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-stock paper.
- **Base Layer:** `surface` (#f9f9f8)
- **Secondary Sectioning:** `surface-container-low` (#f3f4f3)
- **Primary Interaction Cards:** `surface-container-lowest` (#ffffff)
- **Elevated Modals:** `surface-container-highest` (#e1e3e2)

### The "Glass & Gradient" Rule
To avoid a flat, "cheap" feel, use **Glassmorphism** for floating elements (like mobile navigation bars or headers) using semi-transparent surface colors with a `backdrop-filter: blur(20px)`. 
*   **Signature Texture:** Use a subtle linear gradient for Primary CTAs, transitioning from `primary` (#003629) to `primary-container` (#1b4d3e) at a 135-degree angle. This adds "soul" and a tactile, premium depth.

---

## 3. Typography: The Editorial Scale
We pair the geometric precision of **Inter** for utility with the characterful, high-fashion personality of **Epilogue** for display.

| Level | Token | Font | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Epilogue | 3.5rem | 700 | Hero headers, Editorial moments |
| **Headline**| `headline-md` | Epilogue | 1.75rem | 600 | Menu Categories, Dashboard Cards |
| **Title** | `title-lg` | Inter | 1.375rem | 600 | Item Names, Section Headers |
| **Body** | `body-lg` | Inter | 1rem | 400 | Descriptions, Long-form data |
| **Label** | `label-md` | Inter | 0.75rem | 500 | Metadata, Allergen tags |

**Editorial Note:** Use `tertiary` (#551d00) for `headline` elements in consumer views to create a warm, appetizing contrast against the `primary` green used in business contexts.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "pop"; we use them to mimic natural light.

*   **The Layering Principle:** Always stack from dark to light or light to dark. Never place two identical surface tokens adjacent to one another.
*   **Ambient Shadows:** When a floating effect is required (e.g., a "Add to Cart" mobile button), use a shadow: `0px 12px 32px rgba(25, 28, 28, 0.06)`. Note the 6% opacity—it should be felt, not seen.
*   **The "Ghost Border" Fallback:** If accessibility requires a border (e.g., an input field), use `outline-variant` (#c0c9c3) at **20% opacity**. Never use a 100% opaque border.
*   **Glassmorphism:** For mobile "Quick Action" menus, use `surface_container_lowest` at 80% opacity with a 12px backdrop blur.

---

## 5. Components

### Buttons & CTAs
*   **Primary:** Rounded `md` (0.75rem). Background: Primary-to-Container Gradient. Text: `on-primary` (#ffffff).
*   **Tertiary (Appetite CTA):** Used for "Order Now." Background: `tertiary` (#551d00). This provides a sharp, sophisticated "pop" against the green dashboard.

### Cards & Lists (The No-Divider Rule)
**Forbid the use of divider lines.** 
*   Separate list items using `1rem` of vertical whitespace.
*   In the Dashboard, use alternating background tints (`surface` vs `surface-container-low`) for row zebra-striping rather than lines.

### Input Fields & Selectors
*   **The "Soft Input":** Background should be `surface-container-low`. Upon focus, the background transitions to `surface-container-lowest` with a "Ghost Border" of `primary` at 40% opacity. 

### Allergen Icons
*   **Style:** Minimalist line-art using the `primary` color. 
*   **Container:** Encased in a `secondary-fixed` (#d1e4fb) circular chip to ensure visibility without breaking the sophisticated color palette.

### Mobile Navigation (Customer View)
*   **The "Floating Dock":** A bottom-anchored navigation bar using Glassmorphism. Large tap targets (minimum 48x48px) with `title-sm` labels for high legibility in low-light restaurant environments.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins (e.g., a larger left margin for titles) to create an editorial, "magazine" feel.
*   **Do** use `primary-fixed-dim` (#9ed1bd) for subtle background highlights in the dashboard to reduce eye strain.
*   **Do** embrace white space. If a layout feels "empty," increase the typography size rather than adding more boxes.

### Don't:
*   **Don't** use pure black (#000000) for text. Use `on-surface` (#191c1c) to maintain a soft, premium look.
*   **Don't** use standard Material Design drop shadows. If a component looks like it's "floating" on a gray cloud, it’s too heavy.
*   **Don't** use high-contrast borders. If a user can see the line, the line is too loud. Use tone to define shape.