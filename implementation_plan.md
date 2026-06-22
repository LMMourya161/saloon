# AI Beauty Ideas Implementation Plan

## Goal Description
Add two new customer‑facing features to the Salon app:
1. **AI Beauty Career Assistant** – shows style recommendations based on a selected profession (e.g., Lawyer).
2. **Beauty Personality DNA** – a short chat‑style interaction that captures personality traits and returns a style‑personality breakdown with salon recommendations.

Both features will be presented as dedicated pages, accessible from the navbar after customer login.

## User Review Required
- **Navbar placement**: Should the new links appear for all users or only after the customer logs in? (Current route setup does not enforce auth, so we’ll show them always.)
- **Data source**: Use static mock data for now (hard‑coded recommendations) or fetch from a future API? We'll implement static placeholders.

## Open Questions
> [!IMPORTANT]
> Do you want the Personality DNA page to include a real chat UI (text input + bot responses) now, or a simple button that simulates a 2‑minute chat and displays the sample percentages?

## Proposed Changes
---
### Front‑end
#### [NEW] src/pages/CareerAssistant.jsx
- Glass‑card layout with profession selector (dropdown) and static recommendation list.
- Demo data for "Lawyer" (clean layered cut, natural highlights; avoid neon colors, high‑maintenance).

#### [NEW] src/pages/PersonalityDNA.jsx
- Simple UI: a "Start Chat" button that after a short timeout shows mock percentages and recommended salons.
- Uses same glass‑card styling and micro‑animations.

#### [MODIFY] src/components/Navbar.jsx
- Add two new `<NavLink>` items: "Career AI" and "Personality DNA".
- Apply existing styling (hover effects, active state).

#### [MODIFY] src/App.jsx
- Import the new pages.
- Add `<Route path="/career-assistant" element={<CareerAssistant triggerToast={triggerToast} isOnline={true} />} />`.
- Add `<Route path="/personality-dna" element={<PersonalityDNA triggerToast={triggerToast} isOnline={true} />} />`.

### Styling
#### [MODIFY] src/index.css (or create src/pages/styles.css if needed)
- Define `--card-bg` gradient, glassmorphism backdrop, and animations for cards.
- Ensure responsive layout (grid for cards).

## Verification Plan
### Automated Tests
- Run `npm run dev` and confirm the new routes load without console errors.
- Verify Navbar links navigate to the new pages.

### Manual Verification
- Open `/career-assistant` and select "Lawyer" – ensure recommendations match the spec.
- Open `/personality-dna`, click "Start Chat", wait for simulated response – verify percentages and placeholder salon list appear.

---
*Please review the open questions and any design decisions. Once approved, I will create the files and update the routing.*
