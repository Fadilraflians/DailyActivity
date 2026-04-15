# Design System: Editorial Serenity

## 1. Overview & Creative North Star: "The Digital Sanctuary"
Most productivity apps feel like digital warehouses—rigid, cold, and overflowing. This design system rejects the "factory" aesthetic in favor of **The Digital Sanctuary**. Our Creative North Star is a high-end editorial experience that prioritizes "Calm Productivity." 

We break the "template" look by utilizing **intentional asymmetry** and **tonal depth**. Instead of a boxy grid, we use expansive white space and overlapping elements to create a layout that breathes. The goal is to make the user feel like they are curate-ing their life on fine, layered vellum rather than filling out a spreadsheet.

## 2. Colors & Surface Philosophy
The palette is a sophisticated blend of atmospheric blues and organic accents. We avoid high-contrast starkness to reduce cognitive load.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural definition must be achieved solely through background color shifts or tonal transitions.
- **Surface:** `#f7f9fb` (The base canvas)
- **Sectioning:** Use `surface_container_low` (`#f0f4f7`) to define large content areas against the main `surface`.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface_container` tiers to create "nested" depth:
1.  **Level 0 (Base):** `surface` (`#f7f9fb`)
2.  **Level 1 (Sections):** `surface_container` (`#eaeff2`)
3.  **Level 2 (Cards/Interaction):** `surface_container_lowest` (`#ffffff`) — This creates a "lifted" feel through brightness rather than shadows.

### The "Glass & Gradient" Rule
To elevate the experience beyond "standard UI," floating elements (like Bottom Sheets or Floating Action Buttons) must utilize **Glassmorphism**:
- **Token:** `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur.
- **Signature Textures:** For primary CTAs, apply a subtle linear gradient from `primary` (`#005bc4`) to `primary_container` (`#4388fd`) at a 135° angle. This adds a "jewel-like" depth to the "calm productivity" aesthetic.

## 3. Typography: Editorial Authority
We utilize two sans-serif families to create a sophisticated hierarchy that mimics a high-end magazine.

*   **Display & Headlines (Manrope):** Large, airy, and commanding. We use `display-lg` (3.5rem) for "Morning Greetings" and `headline-sm` (1.5rem) for task categories. The generous tracking and lowercase-heavy styling convey a modern, approachable authority.
*   **Labels & Metadata (Plus Jakarta Sans):** We use `label-md` (0.75rem) for dates and status tags. The geometric clarity of Plus Jakarta Sans ensures that even at small sizes, the UI remains hyper-readable and premium.

**The Typographic Rhythm:** Always pair a `headline-md` with a `body-md` that has a line-height of 1.6. This "breathing room" is essential for the sanctuary feel.

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "dirty." In this system, we use light and tone to imply importance.

*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` background. The slight shift in brightness provides all the "elevation" needed for standard list items.
*   **Ambient Shadows:** For high-priority elements (e.g., an active task card), use a shadow with a blur of `32px`, an offset of `y: 8`, and an opacity of 4% using the `on_surface` color (`#2c3437`). It should look like a soft glow, not a drop shadow.
*   **The "Ghost Border" Fallback:** If a boundary is strictly required for accessibility, use the `outline_variant` (`#acb3b7`) at **15% opacity**. Anything higher is considered a design failure.

## 5. Components

### Buttons
*   **Primary:** Rounded `full` (9999px). Gradient-filled (`primary` to `primary_container`). White text (`on_primary`).
*   **Tertiary (Calm):** No background. Use `primary` text. Focus on generous horizontal padding to ensure the "tap target" feels luxurious.

### Cards & Lists (The "Anti-Divider" Component)
*   **Rule:** Forbid the use of divider lines.
*   **Implementation:** Separate tasks using `16px` (the `lg` rounding scale) of vertical white space. Use a `surface_container_highest` (`#dce4e8`) background for the "Task Checkbox" area to create a subtle internal contrast within the card.

### Chips (Task Status)
*   **Style:** Use `secondary_container` (`#6ffbbe`) for "Completed" and `tertiary_container` (`#a589f8`) for "In Progress."
*   **Rounding:** Always `md` (0.75rem) to differentiate from the `full` rounding of buttons.

### Glass Input Fields
*   **Design:** `surface_container_lowest` background at 60% opacity. No border. The focus state is signaled by a 2px `primary` underline—a nod to traditional paper planning.

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins (e.g., 24px left, 32px right) for headline text to create an editorial, non-templated look.
*   **Do** use the `lg` (1rem) corner radius for most cards to maintain the "soft" brand promise.
*   **Do** prioritize "Active State" through color (`secondary` mint for success) rather than just a checkmark.

### Don't:
*   **Don't** use pure black `#000000`. Use `on_surface` (`#2c3437`) for all text to keep the contrast "calm."
*   **Don't** stack more than three levels of surface containers. It breaks the "flat-yet-deep" aesthetic.
*   **Don't** use standard "system blue." Always use the refined `primary` (`#005bc4`) which has a deeper, more professional tonal quality.