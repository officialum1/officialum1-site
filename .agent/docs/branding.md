# OfficialUM1 Branding & Design Guide

## 🎨 Color Palette
- **Primary (Conversion)**: `#00ff88` (Neon Green) - Use for CTAs, Success states, and Stock indicators.
- **Secondary (Info)**: `#00c3ff` (Cyber Blue) - Use for links, G2G integration, and secondary actions.
- **Alert (Critical)**: `#ff4d4d` (Vibrant Red) - Use for Errors, Deletions, and Price Drops.
- **Accent (Premium)**: `#ffd700` (Gold) - Use for VIP features, Referrals, and Bundles.
- **Base (Dark)**: `rgba(0,0,0,0.8)` or `#0a0a0a`.

## 🖼️ UI Components
- **Backgrounds**: Glassmorphism (`backdrop-filter: blur(12px)`) with semi-transparent dark layers.
- **Typography**: 
  - Headings: `Outfit` (Sans-serif) - Bold and modern.
  - Body: `Inter` - Highly readable for data.
- **Grid Strategy**: 12-column grid system, auto-collapsing to single column on mobile.

## ✨ Animation Principles (Framer Motion)
- **Entrance**: Always use `initial={{ opacity: 0, y: 20 }}` for a "rising" effect.
- **Staggering**: Grids must use `staggerChildren: 0.1` for a premium, non-static load feel.
- **Hover**: Interactive cards should use `whileHover={{ y: -10 }}` to indicate depth.
- **Transitions**: Keep durations between `0.3s` and `0.6s` to balance speed and luxury.

## 📐 Spacing & Layout
- Page Header Padding: `150px` (Top) to clear the sticky Navbar.
- Card Border Radius: `16px` or `24px` for a rounded, friendly feel.
- Border Width: `1px solid rgba(255,255,255,0.1)`.

## 🛡️ Trust Signals
- Always display SSL/Secure Payment icons in the footer.
- Use real-time "Sales Pulse" notifications for social proof.
- Ensure all Admin interfaces are protected by `isAuthenticated()` checks.
