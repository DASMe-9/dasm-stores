# Store Settings, Verification, and Checkout Readiness

## Decision

DASM Stores keeps store themes free forever. Theme work is a quality and UX surface, not a paid theme marketplace.

Store identity remains split by responsibility:

- DASM Core owns user identity, login, password reset, email/phone verification, national ID, and national address.
- DASM Services owns operational store data, products, storefront design, shipping settings, orders, and checkout data.
- The link is `stores.user_id = users.id`.

## Owner Readiness

The seller dashboard exposes `/dashboard/settings` as the single readiness page. It reads existing APIs only:

- `/api/stores/my-store`
- `/api/user/verification-status`
- `/api/user/national-address`

It does not create a new database table. It summarizes:

- store identity and publication state
- owner verification
- SPL short address status
- free theme selection
- shipping readiness
- payment and payout readiness

The displayed segment code is a derived operational label from current store fields:

`STORES-{owner_type}-{subscription_status}`

If DASM later needs a persisted commercial segment code, add it through an approved backend schema change.

## Checkout and Shipping

Checkout now sends shipping selections using the Core store API contract:

- Tryoto / OTO rates are requested through `/api/stores/public/{slug}/shipping-rates`.
- Selected Tryoto options are submitted as `shipping_rate_id`, `shipping_cost`, and `delivery_option_id`.
- Legacy fixed shipping is submitted as `shipping_config_id` plus `shipping_rate_id=flat_{id}`.
- Customer GPS coordinates are optional and stored inside `shipping_address` JSON with the order.
- SPL short address remains available in `shipping_address.short_address`.

## Boundaries

This slice intentionally avoids:

- env access
- migrations
- payment provider credential changes
- finance ledger changes
- paid theme marketplace behavior
