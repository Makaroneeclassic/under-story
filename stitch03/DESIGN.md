---
name: Serene Architectural Minimalism
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#474741'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#777770'
  outline-variant: '#c8c7be'
  surface-tint: '#5f5f59'
  primary: '#5f5f59'
  on-primary: '#ffffff'
  primary-container: '#f2f0e9'
  on-primary-container: '#6d6d67'
  inverse-primary: '#c8c6c0'
  secondary: '#5d6055'
  on-secondary: '#ffffff'
  secondary-container: '#e2e4d6'
  on-secondary-container: '#63665b'
  tertiary: '#615e54'
  on-tertiary: '#ffffff'
  tertiary-container: '#f4f0e2'
  on-tertiary-container: '#6f6d62'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2dc'
  primary-fixed-dim: '#c8c6c0'
  on-primary-fixed: '#1b1c18'
  on-primary-fixed-variant: '#474742'
  secondary-fixed: '#e2e4d6'
  secondary-fixed-dim: '#c5c8bb'
  on-secondary-fixed: '#1a1d14'
  on-secondary-fixed-variant: '#45483e'
  tertiary-fixed: '#e7e2d5'
  tertiary-fixed-dim: '#cac6ba'
  on-tertiary-fixed: '#1d1c14'
  on-tertiary-fixed-variant: '#49473d'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-xl:
    fontFamily: Libre Caslon Text
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.15em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  section-gap: 120px
---

## Brand & Style

The brand identity is rooted in the concept of "unfolding experiences"—a serene, architectural journey that prioritizes light, shadow, and proportion. The target audience seeks an elevated, sophisticated environment that feels both timeless and modern. The UI must evoke an emotional response of tranquility and quiet luxury, mirroring the physical venue's limestone textures and circular motifs.

The design style is a blend of **Minimalism** and **Modern Corporate**, focusing on high-quality editorial layouts. It utilizes generous whitespace (the "understory" of the design) to allow high-end photography to breathe. Architectural curves and circular motifs should be integrated into the UI through subtle container shapes and image treatments, reflecting the venue's skylights and winding paths.

## Colors

The palette is derived from natural mineral tones and architectural materials. 

*   **Primary (Cream/Beige):** Used for the main backgrounds to create a warm, gallery-like atmosphere.
*   **Secondary (Olive/Moss):** A deep, muted green used for subtle accents, icons, or specialized headers, rooting the brand in its natural surroundings.
*   **Tertiary (Sand/Warm Grey):** Used for UI elements like borders, dividers, and secondary button backgrounds.
*   **Neutral (Charcoal):** Reserved for primary typography and high-contrast call-to-actions to ensure legibility and a sense of authority.

The system is strictly light-mode to maintain the feeling of an airy, sun-drenched pavilion.

## Typography

The typography system relies on the tension between a classic, literary serif and a functional, geometric sans-serif. 

**Libre Caslon Text** is used for all major headlines to provide an authoritative, editorial feel. It should be typeset with slightly tighter letter spacing for large displays to emphasize its architectural structure.

**DM Sans** provides a clean, neutral counterpoint for body text. It is set with generous line-heights to ensure a relaxed reading rhythm.

**Work Sans** is used sparingly for labels, captions, and navigation elements. When used in all-caps with wide tracking, it evokes the technical precision of an architect's floor plan.

## Layout & Spacing

The design system employs a **Fluid Grid** with exaggerated outer margins on desktop to create a "frame" effect for content. 

*   **Desktop:** 12-column grid with 80px side margins. 
*   **Mobile:** 4-column grid with 20px side margins.
*   **Philosophy:** Vertical spacing is intentional and aggressive. Large gaps between sections (120px+) are used to simulate the feeling of walking through an open-air venue. Elements should often be offset or asymmetrical to mimic the organic flow of the venue's floor plans.

Use "Safe Areas" for text over photography, ensuring that the interplay of light and shadow in the imagery is never obscured by UI elements.

## Elevation & Depth

To maintain a minimalist and sophisticated aesthetic, depth is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

*   **Surface Layers:** Use slight variations of the primary cream color to distinguish between the background and elevated containers (e.g., a card might be #F9F8F5 against a background of #F2F0E9).
*   **Outlines:** Use thin, 1px borders in the Tertiary color (#D1CDC0). These "ghost borders" provide structure without visual weight.
*   **Shadows:** When necessary for functional depth (like dropdowns), use "Ambient Shadows"—extremely diffused, low-opacity (5-8%) shadows with a slight warm tint to match the beige palette.

## Shapes

The shape language is inspired by the venue's circular skylights and curved walls. While the primary layout containers are rectangular for architectural stability, specific interactive elements and focal points utilize **soft curves**.

*   **Primary Buttons & Fields:** Use `rounded-md` (0.5rem) to provide a soft, approachable touch.
*   **Feature Imagery:** High-impact images can be masked into perfect circles or "stadium" pill shapes to reference the architectural motifs.
*   **Dividers:** Use thin, horizontal lines that may occasionally terminate in a small circular dot, echoing the floor plan's tree markers.

## Components

### Buttons
Primary buttons are solid charcoal (#2C2C2C) with white text, featuring a subtle 0.5rem corner radius. Secondary buttons use a transparent background with a thin Tertiary border and Charcoal text. On hover, they should transition to a soft Sand (#D1CDC0) fill.

### Input Fields
Fields should be minimalist, consisting of a bottom-border only or a very light-toned background fill. The label should be in `label-caps` (Work Sans) positioned above the input area.

### Cards
Cards for venue spaces or "Stories" use the Tonal Layering technique. They should have no shadow but a 1px Tertiary border. The header inside the card should always be Serif (Libre Caslon).

### Chips & Tags
Used for amenities or capacity labels. These are pill-shaped with a Sand background and Charcoal text in `label-caps`.

### Floor Plan Interactive
Specialized components should allow users to toggle between "Linden", "Willow", and "Mistle" halls. These toggles should use circular icons that fill with the Olive secondary color when active.

### Lists
Lists of amenities or services should use small, custom-styled bullet points (small circles or thin horizontal dashes) to maintain the architectural drawing aesthetic.