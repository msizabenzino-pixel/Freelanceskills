---
name: SERVICE_CATEGORIES shape
description: SERVICE_CATEGORIES from @shared/categories is an array of objects, not strings — critical to use cat.id/cat.name everywhere.
---

# SERVICE_CATEGORIES is an Object Array

`SERVICE_CATEGORIES` exported from `shared/categories.ts` is:
```typescript
[{ id: "programming", name: "Programming & Tech", icon: "Code", color: "bg-blue-500", subcategories: [...] }, ...]
```

NOT a string array like `["Programming & Tech", "Design", ...]`.

**Why:** The shape was changed to support richer category metadata (icons, colors, subcategories) but some components were written assuming the old string-array shape.

**How to apply:** Whenever mapping SERVICE_CATEGORIES for a Select or list:
```tsx
// ✅ Correct
{SERVICE_CATEGORIES.map((cat) => (
  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
))}

// ❌ Wrong — causes React error #31 (object rendered as child)
{SERVICE_CATEGORIES.map((cat) => (
  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
))}
```

Category `value` stored in DB/form is the `id` string (e.g. `"programming"`, `"design"`, `"marketing"`), not the display name.

SKILL_SUGGESTIONS keys must match these ids: `"programming"`, `"engineering"`, `"design"`, `"writing"`, `"marketing"`, `"business"`, `"events"`, `"education"`, `"ai_services"`, etc.
