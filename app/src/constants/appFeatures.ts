/**
 * Pricing-table capabilities live on **`user_subscription_capabilities`** (one row / user).
 * Use boolean columns directly, e.g. `row.feat_remove_background` in SQL or `featRemoveBackground` in Drizzle.
 *
 * **Catalog:** plan ↔ feature in `features` + `plan_features`; webhooks merge into the user row (`plan_id`).
 *
 * Type-safe flag names: {@link UserPlanFeatureFlagKey} in `src/libs/persistence/users/userEntitlements.ts`.
 *
 * | Marketing (pricing card)        | DB column (Drizzle camelCase)   |
 * |----------------------------------|----------------------------------|
 * | Unused credits roll over         | `featUnusedCreditsRollover`      |
 * | Generate AI art                  | `featAiArt`                      |
 * | Remove backgrounds               | `featRemoveBackground`           |
 * | Priority enhancement             | `featPriorityEnhancement`        |
 * | Chat support                     | `featChatSupport`                |
 * | Early access to new features     | `featEarlyAccess`                |
 * | Upgrade / downgrade / cancel     | `featFlexPlanChange`             |
 * | API / automation tier (Max)      | `featApiAccess`                  |
 *
 * Numeric limits on the same row: `monthlyCreditAllowance`, `maxBankedCredits`, `maxOutputMegapixels`,
 * `cloudStorageMonths`, `maxInputMegapixels`, `maxInputFileMb`.
 */
export const PLAN_FEATURE_DOCS_VERSION = 1 as const;
