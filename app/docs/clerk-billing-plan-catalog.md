# Clerk Billing — catalog (paste into Clerk Dashboard)

Plans are **not** created in Git: open [Clerk Dashboard](https://dashboard.clerk.com) → **Billing** → create **Products / Plans**, then paste **names, descriptions, and prices** from the tables below. The app’s `<PricingTable />` reflects whatever you configure there.

UI source: mock pricing (Vietnamese labels + USD prices). This file is the canonical copy doc; nothing is mirrored into `src/constants/` unless you add a custom UI catalog yourself.

---

## Header & tabs (app display — i18n)

| Key (mock) | Vietnamese (locale copy) | English (suggested) |
|------------|--------------------------|-------------------|
| Hero | Hãy để chúng tôi nâng cấp hình ảnh của bạn | Let us upgrade your images. |
| Tab 1 | Đăng ký | Register / Subscribe |
| Tab 2 | Dành cho doanh nghiệp | For businesses |
| Tab 3 | Trả theo nhu cầu | Pay as you go |

---

## **Subscribe** group (individual) — 3 plans

### Starter

| Field | Value |
|-------|--------|
| Credits / period | **100** / month |
| **Annual** price (shown / month) | **USD 9**/month |
| **Monthly** price | **USD 12**/month |
| Max unused credits (pool rollover) | **600** |
| Upscale / output cap | **256 MP** |
| Cloud storage | **3 months** |
| Input | **64 MP or 50 MB** |
| Watermark | None |
| AI art | Yes |
| Remove background | Yes |
| Enhancement | Priority |
| Support | Chat |
| Early access | Yes |
| Flexibility | Upgrade / downgrade / cancel anytime |

**Feature bullets (paste into Clerk plan features / description):**

```text
Unused credits roll over while subscribed (up to 600 unused credits)
Outputs up to 256 MP
Cloud storage for 3 months
No watermark
Creating AI art
Remove background
Priority enhancement
Chat support
Early access to new features
Input images up to 64 MP or 50 MB
Upgrade, downgrade, or cancel anytime
```

---

### Pro — **Most popular**

| Field | Value |
|-------|--------|
| Badge | **Most popular** (EN) / **Phổ biến nhất** (VI) |
| Credits / period | **300** / month |
| Annual price | **USD 24**/month |
| Monthly price | **USD 32**/month |
| Max unused credits | **1800** |
| Upscale cap | **350 MP** |
| Cloud storage | **6 months** |
| (Same as Starter for AI art, BG removal, priority, chat, early access, flexibility) |

**Feature bullets:**

```text
Unused credits roll over while subscribed (up to 1800 unused credits)
Outputs up to 350 MP
Cloud storage for 6 months
No watermark
Creating AI art
Remove background
Priority enhancement
Chat support
Early access to new features
Input images up to 64 MP or 50 MB
Upgrade, downgrade, or cancel anytime
```

---

### Max

| Field | Value |
|-------|--------|
| Credits / period | **500** / month |
| Annual price | **USD 34**/month |
| Monthly price | **USD 45**/month |
| Max unused credits | **3000** |
| Upscale cap | **512 MP** |
| Enhancement priority | **Highest** |
| Cloud storage | **6 months** |

**Feature bullets:**

```text
Unused credits roll over while subscribed (up to 3000 unused credits)
Outputs up to 512 MP
Cloud storage for 6 months
No watermark
Creating AI art
Remove background
Highest enhancement priority
Chat support
Early access to new features
Input images up to 64 MP or 50 MB
Upgrade, downgrade, or cancel anytime
```

---

## Clerk setup checklist

1. Create **two billing intervals** per plan if Clerk supports monthly + annual: **$12 / $9**, **$32 / $24**, **$45 / $34** for Starter / Pro / Max.
2. Suggested **slug / internal name**: `personal_starter`, `personal_pro`, `personal_max`.
3. After creation, store **Plan ID** if webhooks need to grant credits in the DB.

---

## **Business** & **Pay as you go** groups

Keep in sync with `CreditsPage` in `en.json` / `fr.json` (business 1k / 2.5k / 5k, custom API, PAYG 20 / 50 / 120 credits). Add matching **Products** in Clerk when you enable those tabs in a custom UI.

---

## Visual (mock)

- Top: dark background; page body / cards: **white**; CTA & popular badge: **blue–violet** (~`#5A67F2` in mock; app uses brand violet `#8b5cf6` / `#7c3aed` in `ClerkAppearance`).
