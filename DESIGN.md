---
name: Scholarly Modernity
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#414754'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bc0'
  primary: '#005bbf'
  on-primary: '#ffffff'
  primary-container: '#1a73e8'
  on-primary-container: '#ffffff'
  inverse-primary: '#adc7ff'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd400'
  on-secondary-container: '#6e5c00'
  tertiary: '#9e4300'
  on-tertiary: '#ffffff'
  tertiary-container: '#c55500'
  on-tertiary-container: '#0e0200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783100'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built for a contemporary library ecosystem, balancing the weight of academic tradition with the efficiency of modern digital tools. The brand personality is scholarly, reliable, and accessible. It aims to evoke a sense of clarity and intellectual calm, ensuring that the vast information architecture of a library remains navigable and unintimidating.

The design style is **Corporate / Modern**, leaning heavily into functional minimalism. It utilizes generous whitespace to reduce cognitive load, precise typography to establish hierarchy, and a restrained color palette to keep the focus on content (books, resources, and research data). The aesthetic is "quiet" to allow the library’s collection to be the primary visual driver.

## Colors

The palette is anchored by a trustworthy **Primary Blue (#1A73E8)**, used for primary actions, links, and brand identification. **Accent Yellow (#FFD700)** is used sparingly as a "highlighter" color to draw attention to status indicators (like "New Arrival" or "Available Now") and secondary call-to-actions.

**White (#FFFFFF)** serves as the primary canvas, supported by a very light gray background for subtle sectioning. Text utilizes a deep charcoal for high legibility, avoiding pure black to reduce eye strain during long reading sessions.

## Typography

The design system utilizes **Inter** across all levels to maintain a systematic and utilitarian feel. The type scale is designed for high readability in information-dense environments. 

Headlines use tighter letter spacing and heavier weights to command attention, while body text uses a standard weight with comfortable line heights to facilitate long-form reading of book descriptions and articles. Small labels often use medium or semi-bold weights to ensure they remain legible even at reduced sizes on metadata tags.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop, centered within the viewport at a maximum width of 1280px to prevent line lengths from becoming too long for comfortable reading. 

The layout follows an 8px square-grid rhythm. On desktop, a 12-column system is used with 24px gutters. For mobile devices, the layout collapses to a single column with 16px side margins. Vertical spacing (stacking) is prioritized to separate distinct logical groups, such as the search interface from the featured collections.

## Elevation & Depth

To maintain a "clean and professional" look, depth is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. 

1.  **Level 0 (Base):** The main background color (#FFFFFF).
2.  **Level 1 (Surfaces):** Subtle gray backgrounds (#F9FAFB) used for search bars or sidebars to differentiate them from the main content.
3.  **Level 2 (Interactive):** Cards and buttons use a very fine 1px border (#E5E7EB).
4.  **Level 3 (Pop-overs):** Dropdown menus and modals use a soft, ambient shadow (0px 4px 20px rgba(0, 0, 0, 0.05)) to suggest they are floating above the grid without feeling heavy.

## Shapes

The design system uses a **Soft** shape language. This subtly rounds off the corners of cards, buttons, and input fields to make the interface feel modern and approachable without losing its professional, "institutional" edge. Sharp corners are avoided to prevent a sterile or harsh feeling, but excessive roundness is avoided to maintain a serious, scholarly tone.

## Components

### Books & Resource Cards
Cards are the primary vessel for information. They feature a vertical stack: a book cover image at the top, followed by a Title (Headline-SM), Author (Label-MD in muted text), and an Availability Tag (Label-SM using the Accent Yellow background).

### Prominent Search Bar
The central feature of the library. It is oversized with a height of 56px, a Level 1 surface background, and a 1px border that turns Primary Blue on focus. It includes a clear "Search" icon on the left and a filter "Category" dropdown on the right.

### Navigation
The header is clean and persistent. It uses a simple horizontal list of links in Label-MD. The active state is indicated by a 2px Primary Blue bottom border, ensuring clear location awareness.

### Buttons
*   **Primary:** Solid Primary Blue with White text. Bold and square-ish (rounded-sm).
*   **Secondary:** White background with Primary Blue border and text.
*   **Ghost:** Transparent background with Primary Blue text, used for less urgent actions like "View More Details."

### Input Fields & Controls
Checkboxes and radio buttons for filtering search results use the Primary Blue for checked states. Input fields use a clear Label-MD positioned above the field for maximum accessibility.