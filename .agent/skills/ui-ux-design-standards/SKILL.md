---
description: Comprehensive UI/UX design standards for Otomuhasebe (Next.js 16 + MUI v7). Covers density, empty states, and visual language.
---

# UI/UX Design Standards - Otomuhasebe

**Role:** Senior Lead UI/UX Engineer
**Tech Stack:** Next.js 16, MUI v7, Tailwind CSS (optional/utility)

Every frontend component, page, and interaction must strictly adhere to the following **three design pillars**.

---

## 1. Advanced Density & Spatial Hierarchy

**Goal:** Create a breathable, modern data management interface that reduces cognitive load.

### Whitespace Strategy
- **Generous Spacing:** Prioritize `spacing={3}` (24px) or `spacing={4}` (32px) for main layout containers (`Grid`, `Stack`, `Box`).
- **Standard:** Use the `PageContainer` component which enforces responsive padding.

### MUI DataGrid Optimization
- **Density:** Set `density="comfortable"` as the **absolute default**.
- **Visual Noise Reduction:**
    - Row borders should be subtle: `borderBottom: '1px solid #F1F5F9'`.
    - Header background: `#F8FAFC` (Cool Gray).
- **Contextual Actions:**
    - "Edit", "Delete", and other row actions must be **hidden by default**.
    - Show them only on **hover** (`opacity: 1` on row hover) with a smooth transition (`0.2s ease-in-out`).

### Surface Aesthetics
- **No Elevation:** Use `elevation={0}` for all Cards and Papers.
- **Modern Border-Only Look:**
    - Border: `1px solid #E2E8F0`
    - Radius: `borderRadius: 16px` (Global standard)
    - Shadow: `none` or `ambient` (`0 4px 20px 0 rgba(0,0,0,0.05)`).

---

## 2. Professional Empty States & Feedback Loops

**Goal:** Eliminate "dead ends" in the user journey.

### Dynamic Empty States
- **Forbidden:** Never display a blank page or raw "No Data" text.
- **Required Component:** Use `<EmptyState />` for all null/empty data scenarios.
    - **Visual:** Minimalist, tech-oriented SVG illustration (grey/muted tones).
    - **Text:** Clear, supportive description (e.g., "You haven't created any invoices yet.").
    - **Action:** Prominent Primary CTA (e.g., "Create Invoice").

### Skeleton Loading
- **High-Fidelity:** Replace circular spinners with `MuiSkeleton`.
- **Match Layout:** Skeletons must mimic the actual content structure (e.g., Table rows, Card shapes).
- **Animation:** Use the "wave" or "shimmer" effect for perceived performance.

---

## 3. Typography & High-Tech Visual Language

**Goal:** Ensure an enterprise-grade, high-tech aesthetic.

### Typography
- **Font Family:** `Inter` (Primary), `JetBrains Mono` (Code/Data).
- **Hierarchy:**
    - **Headers:** `fontWeight: 700` (h1-h4), `fontWeight: 600` (h5-h6). Letter spacing `-0.025em`.
    - **Body:** `0.875rem` (14px) is standard for data tables and inputs.
    - **Metadata:** Use `text.secondary` (Slate 500) for timestamps and descriptions.

### Visual Language
- **Soft Shadows:** Avoid dark, muddy shadows. Use **Ambient Shadows**:
    `box-shadow: 0 4px 20px 0 rgba(0,0,0,0.05)`
- **Color Palette:**
    - **Primary Text:** `#0F172A` (Dark Slate)
    - **Secondary Text:** `#64748B` (Slate 500)
    - **Background:** `#F8FAFC` (Cool Gray - **Mandatory for page background**)
    - **Card Background:** `#FFFFFF` (White)
    - **Border:** `#E2E8F0` (Light Slate)

---

## Implementation Checklist

Before marking a frontend task as complete, verify:
- [ ] Is the background `#F8FAFC`?
- [ ] Are DataGrids set to `comfortable` density?
- [ ] Do row actions appear only on hover?
- [ ] Are all Cards `elevation={0}` with `1px solid #E2E8F0` border?
- [ ] Is there a polished `<EmptyState />` for no data?
- [ ] Are loading states handled with `<Skeleton />`?
- [ ] Is the font `Inter`?
