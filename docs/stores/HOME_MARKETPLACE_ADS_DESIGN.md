# DASM Stores Home Marketplace Ads Design

## Purpose

The public home page for `stores.dasm.com.sa` is the discovery and advertising surface for DASM Stores. It should not behave like a plain store directory. It should combine product discovery, featured stores, category browsing, order-tracking entry points, contact paths, authentication, cart access, and monetizable ad positions.

## Approved Concept

The approved visual reference is stored in this repository:

`docs/stores/assets/dasm-stores-home-marketplace-concept.png`

The implementation follows the same structure: a clean RTL header, a large animated commercial hero, search, featured product rail, featured store rail, wide banner ad, categories, stats, store directory, tracking guidance, contact links, and footer.

## Implemented Surface

Primary implementation files:

- `app/page.tsx`: DASM Stores marketplace home page.
- `components/store/StoreHeader.tsx`: individual store hero with animated ad/video-ready background.
- `app/store/[slug]/page.tsx`: individual store home content without the old promotional welcome card.
- `styles/globals.css`: animated hero scenes for the home page and store pages.

## Backend Contracts Used

The page uses existing public backend contracts only:

- `GET /api/stores/public/explore`
- `GET /api/stores/public/{slug}/products?sort=featured&per_page=2`

Product cards link to real store product detail pages, store cards link to real store pages, cart links go to each store cart, login links go to the existing auth route, and ad calls to action link to `https://ads.dasm.com.sa/advertise`.

## Ad Inventory

Current and future ad slots:

- `stores.home.hero`: main video-like advertising hero.
- `stores.home.products.inline`: sponsored product card inside featured products.
- `stores.home.banner.wide`: wide banner under featured stores.
- `stores.home.category.takeover`: category browsing sponsored placement.
- `stores.home.search.sponsoredResult`: future search result promotion.
- `stores.store.hero`: store-specific hero video or animated background.

## Boundaries

This change does not read or change env files, migrations, payment/banking code, package files, or deployment configuration.

## Follow-Ups

- Add a global featured-products API so the home page does not need to sample products per store.
- Add a global tracking resolver if DASM wants order tracking without choosing a store first.
- Add admin-controlled ad inventory records for the slots above.
- Add paid third-party theme marketplace support after the free theme/ad surface is stable.
