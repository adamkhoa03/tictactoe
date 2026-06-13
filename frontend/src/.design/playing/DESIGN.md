---
name: Lumina Tic-Tac-Toe
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424754'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#b10e6b'
  on-tertiary: '#ffffff'
  tertiary-container: '#d23284'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-game-piece:
    fontFamily: Quicksand
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-status:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  game-board-gap: 12px
  element-gap: 16px
  section-margin: 40px
---

## Brand & Style
The design system centers on a **Modern Playful** aesthetic, blending high-energy gaming vibes with a sophisticated **Glassmorphic** interface. The target audience is casual gamers seeking a premium, visually stimulating experience. The UI should feel lightweight, airy, and reactive, evoking a sense of digital "flow." 

Key style attributes:
- **Luminosity:** Use of glowing accents to differentiate the game pieces (X and O) from the functional UI.
- **Translucency:** Frosted glass panels create depth without clutter, allowing vibrant background gradients to peek through.
- **Responsiveness:** Every interaction must feel tactile through subtle lifts and glow shifts.

## Colors
The palette is built on high-vibrancy cool tones. 
- **Energetic Blue (#3B82F6):** Primary brand color, used for Player 1 (X) and critical action buttons.
- **Vibrant Purple (#8B5CF6):** Secondary color, used for Player 2 (O) and secondary UI highlights.
- **Pink Accent (#EC4899):** Reserved for "Win" states and special celebrations.
- **Neutral System:** Utilizes a range of clean whites and slate grays for readability. The background should be a subtle gradient to enhance the glassmorphism effects.

## Typography
The system uses a pairing of **Quicksand** and **Nunito Sans** to maximize friendliness and legibility. 
- **Quicksand** is used for headlines, game pieces, and prominent labels to leverage its rounded terminals.
- **Nunito Sans** handles body text and multi-language support (English/Vietnamese), ensuring that diacritics in Vietnamese are rendered clearly and do not disrupt line heights.
- Game pieces (X and O) use the `display-game-piece` style with an added outer glow effect (drop-shadow) matching their respective player color.

## Layout & Spacing
This design system uses a **Fluid Center** layout. The game board remains centered both vertically and horizontally.
- **Grid:** The 3x3 game board uses a CSS grid with a fixed gap (`game-board-gap`). On mobile, the board scales down to fit the screen width minus `container-padding`.
- **Responsive Behavior:** 
    - **Desktop:** Side panels (Leaderboard/Chat) appear to the left and right of the board.
    - **Tablet/Mobile:** Panels stack vertically or hide behind drawer menus to prioritize the game board.
- **Rhythm:** An 8px base unit ensures consistent spacing between buttons and status indicators.

## Elevation & Depth
Depth is created through **Backdrop Blurs** rather than traditional heavy shadows.
- **Surface Level 0:** The animated gradient background.
- **Surface Level 1 (Panels):** `glass_fill` with a 12px backdrop-blur and a 1px `glass_stroke`.
- **Surface Level 2 (Active States/Modals):** Increased opacity and a soft ambient shadow (color-tinted to Blue or Purple) to indicate focus.
- **The Board Tiles:** Subtle inset shadows to create a "pressed" feel for empty slots, and a neon outer glow for occupied slots.

## Shapes
A **Rounded (0.5rem base)** shape language is used to maintain the playful, approachable atmosphere.
- **Game Board Tiles:** Use `rounded-lg` (1rem) to feel like soft, touchable blocks.
- **Buttons:** Use `rounded-xl` or full pill shapes for a modern gaming feel.
- **Panels:** Use `rounded-xl` (1.5rem) to soften the large frosted containers.

## Components
- **Game Tiles:** Interactive cells with a `hover:scale(1.05)` transition. When occupied, they display 'X' (Blue glow) or 'O' (Purple glow).
- **Glass Buttons:** Semi-transparent buttons with a white border. On hover, they "lift" via a subtle shadow and increase in opacity.
- **Status Indicators:** Small circular badges for "Online/Offline" status. The "Current Turn" indicator should pulse gently with the active player's color.
- **Multi-language Toggle:** A clean, pill-shaped switcher in the top corner using `label-bold` typography.
- **Scoreboard Chips:** Compact, rounded labels showing win/loss counts, utilizing the secondary color for visual separation.
- **Input Fields:** For player names—minimalist with a bottom-only border that glows when focused.