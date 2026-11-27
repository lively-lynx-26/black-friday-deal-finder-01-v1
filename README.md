[![black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/lively-lynx-26/black-friday-deal-finder-01-v1/rank.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/lively-lynx-26/black-friday-deal-finder-01-v1/reward.svg)](https://make.fun/c/black-friday-deal-finder-01)

# Deal Scout — Black Friday 2026

A working Black Friday deal finder for [make.fun's Black Friday deal finder bounty](https://make.fun/c/black-friday-deal-finder-01): 56 real deals, checked on Black Friday itself (Nov 27, 2026), each with its product, store, store link, sale price, usual price, discount and check time — plus an honest signal on whether it is really a deal.

## What it does

- **56 deals across 12 stores** (Amazon, Best Buy, Walmart, Target, Costco, Newegg, B&H Photo, HexClad, Hoka, Reolink, Sam's Club) in 12 categories: Audio, TVs, Laptops, Tablets, Wearables, Gaming, Smart home, Kitchen, Home, Toys, Fashion, Tools, Accessories.
- **Search and filters that work**: full-text search, category, store, minimum discount (25/40/50%+), and sorting by biggest discount, best verdict, or price.
- **An honest "really a deal" signal on every card**: NEW LOW (11 deals, with the evidence), STRONG PRICE (40), ROUTINE SALE (5) — a small cut is called routine, not dressed up.
- **A page for every deal** with the full facts, the evidence for its verdict, and a cross-store comparison when the same product is cheaper elsewhere (MacBook Air M5: Amazon $989.10 vs Best Buy $1,049).
- **Phone layout**: the grid, toolbar and deal pages reflow to one column on a phone.

## How the deals were checked

Every price was read on Nov 27, 2026 (Black Friday) at the store or in a deals source that names the store — Best Buy's Black Friday release, CNN Underscored, Mashable, 9to5Toys, TradingView/Benzinga, USA Today, ProductBible, Target's release, and others. Each deal card names its source and check time. No price was invented: if no store or named source showed a price, the product is not listed.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

The site is plain static files under `app/` — no build step, no network request. `main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
