# playwright-ts — UI Test Automation Framework

> A production-style **Playwright + TypeScript** end-to-end test automation framework built around the **Page Object Model (POM)**, **fixture-based dependency injection**, and a strict **three-layer separation** of concerns — testing the [SauceDemo](https://www.saucedemo.com) e-commerce web application.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Getting Started](#getting-started)
6. [Project Structure](#project-structure)
7. [Architecture](#architecture)
   - 7.1 [Three-Layer Design](#three-layer-design)
   - 7.2 [Page Object Model](#page-object-model)
   - 7.3 [Fixtures & Dependency Injection](#fixtures--dependency-injection)
   - 7.4 [Authentication Flow](#authentication-flow)
   - 7.5 [Helpers vs. Fixtures vs. POMs](#helpers-vs-fixtures-vs-poms)
8. [Test Organization](#test-organization)
   - 8.1 [Playwright Projects](#playwright-projects)
   - 8.2 [Test Suites](#test-suites)
   - 8.3 [Test Entry Styles](#test-entry-styles)
9. [Test Cases](#test-cases)
10. [Test Data](#test-data)
11. [Configuration](#configuration)
12. [Running Tests](#running-tests)
13. [Reporting](#reporting)
14. [Coding Standards & Conventions](#coding-standards--conventions)
15. [Design Principles](#design-principles)
16. [Known Limitations](#known-limitations)
17. [Troubleshooting](#troubleshooting)
18. [Bugs Encountered/Found](#bugs-encounteredfound)
19. [Documentation](#documentation)
20. [License](#license)

---

## Overview

This framework is an end-to-end (E2E) UI test suite for the SauceDemo practice web application — a mock e-commerce store. It covers the full user journey: **authentication → product browsing → cart management → checkout → order confirmation**, plus session/menu handling and data-integrity checks.

The framework is deliberately engineered to industry standards:

| Concern | How it's handled |
|---|---|
| **Maintainability** | Page Object Model — selectors and actions live in `pages/`, never in specs |
| **Test isolation** | Playwright fixtures (`test.extend()`) inject page objects per test |
| **Data-driven testing** | All expected values, credentials and catalog facts live in `data/` |
| **Auth reuse** | A dedicated `setup` project logs in once and shares `storageState` |
| **Type safety** | Strict TypeScript (`strict: true`), zero implicit `any` |
| **Readability** | Specs read as user stories: Arrange → Act → Assert |
| **Reliability** | Falsifiable guards, scope-safe locators, no debug noise in CI output |

**Suite status (last verified Sun Nov 8 2026):** 45 test cases → **147 test runs passing** across 6 projects (1 setup + 10 login + 15 inventory + 5 cart + 10 checkout + 4 menu), 0 flaky / 0 retries, `fullyParallel: true` + `workers: 4`, `npm run typecheck` clean.

---

## Features

- ✅ **Page Object Model** — 5 POM classes (`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`, `MenuPage`)
- ✅ **Fixture-based DI** — page objects injected and auto-navigated by `fixtures/page.fixture.ts`
- ✅ **Storage-state authentication** — login runs once in a `setup` project; authenticated suites reuse the session
- ✅ **Unauthenticated / authenticated project split** — login tests can never be poisoned by a pre-existing session
- ✅ **Data-driven expected values** — credentials, error strings, catalog, prices and tax rate live in `data/`
- ✅ **Journey helpers** — shared multi-step flows extracted at spec level (`startCheckoutAtStepOne`, `submitValidDetails`, …)
- ✅ **Money math in integer cents** — exact `toBe` assertions, no float drift, no `toBeCloseTo`
- ✅ **Poll-based async assertions** — image-load checks poll `complete && naturalWidth > 0`
- ✅ **Strict locator scoping** — CSS class scopes where testids are shared across components
- ✅ **Cross-browser projects** — Desktop Chrome, Firefox, WebKit and Mobile Chrome all run the authenticated suite (45 cases → 147 runs)
- ✅ **HTML + list reporters, trace-on-failure** for failure diagnostics — every failure keeps a trace, not just retries
- ✅ **Strict TypeScript** with `npm run typecheck` gate
- ✅ **Zero `console.log` noise** in project code

---

## Technology Stack

| Layer | Tool / Version |
|---|---|
| Test runner | `@playwright/test` `^1.61.1` |
| Language | TypeScript `^5.9.3` (strict mode) |
| Runtime | Node.js `20.x` |
| Transpile / types | `typescript@5`, `@types/node` `^25.9.5` |
| Reporter | Playwright HTML reporter (built-in) |
| Application under test | [SauceDemo](https://www.saucedemo.com) — `https://www.saucedemo.com` |

---

## Prerequisites

- **Node.js** ≥ 20 (tested on 20.9)
- **npm** ≥ 9
- Internet access (the application under test is a hosted public site — there is no local `webServer`)
- Playwright browsers installed (`npx playwright install` — Chromium, Firefox and WebKit; see [Running Tests](#running-tests))

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (first run only — installs Chromium, Firefox & WebKit)
npx playwright install

# 3. Verify types are clean
npm run typecheck

# 4. Run the full suite
npm test
```

Expected result: **147/147 passing** (45 test cases across 6 projects — usually 4–10 min, depending on how `saucedemo.com` is behaving), then open the report with:

```bash
npm run report
```

---

## Project Structure

```
playwright-ts/
├── playwright.config.ts          # Playwright configuration (projects, baseURL, reporters)
├── tsconfig.json                 # Strict TypeScript config
├── package.json                  # npm scripts & dependencies
│
├── auth/
│   └── auth.setup.ts             # Setup project: logs in once → writes storageState
├── config/
│   └── auth.ts                   # STORAGE_STATE path constant
│
├── pages/                        # PAGE OBJECTS (layer 2 — "how")
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   └── MenuPage.ts
│
├── fixtures/
│   └── page.fixture.ts           # test.extend() DI: injects + auto-navigates POMs
│
├── data/                         # TEST DATA (layer 3 — "expected values")
│   ├── loginData.ts
│   ├── inventoryData.ts
│   └── checkoutData.ts
│
├── tests/
│   ├── unauthenticated/          # Runs WITHOUT a stored session
│   │   └── login.spec.ts         # 10 tests
│   └── authenticated/            # Runs WITH storageState from setup
│       ├── inventory.spec.ts     # 15 tests
│       ├── cart.spec.ts          # 5 tests
│       ├── checkout.spec.ts      # 10 tests
│       └── menu.spec.ts          # 4 tests
│
├── playwright/                   # Generated auth state (gitignored)
│   └── .auth/standardUser.json
│
├── playwright-report/            # HTML report output (gitignored)
├── test-results/                 # Traces/videos on failure (gitignored)
│
├── PROGRESS.md                   # Day-by-day build & learning journal
└── TODO.md                       # Task tracker / backlog
```

---

## Architecture

### Three-Layer Design

The framework enforces a strict three-layer rule. Every piece of test knowledge has exactly one home:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — SPEC  (tests/**/*.spec.ts)                          │
│  "WHAT happens" — orchestrates the user story                  │
│  Arrange → Act → Assert · one test = one user story            │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2 — PAGE OBJECT  (pages/*.ts)                           │
│  "HOW it happens" — locators, actions, expectX() guards        │
│  Holds: selectors · click/fill/read methods · page invariants  │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3 — TEST DATA  (data/*.ts)                              │
│  "EXPECTED VALUES" — credentials, URLs, counts, prices, errors │
│  Never hardcoded in specs or POMs                              │
└─────────────────────────────────────────────────────────────────┘
```

> **Rule of thumb:** if a testid string appears in a spec file, it's in the wrong file.

**Where does a value live?**

| Location | Use for |
|---|---|
| Test-local `const` | Values used by exactly one test (default) |
| `data/*.ts` | Facts that never change — expected text, counts, URLs, credentials |
| POM method/reader | Reads needed by 2+ tests, or page invariants (`expectLoaded()`) |
| Spec-level helper | Multi-step journeys used by 2+ tests in **one** spec |
| `helpers/` (future) | Journeys shared across **two or more** specs (YAGNI until then) |
| ❌ Module-level `let` | Never — parallel workers would race on shared mutable state |

### Page Object Model

Each page/route is a class that owns its locators and exposes intent-named methods:

| POM | Responsibilities |
|---|---|
| `LoginPage` | `login()`, `expectError()` |
| `InventoryPage` | `goto()`, `expectLoaded()`, `addToCart()`, `removeFromCart()`, `expectCartBadgeCount()`, `expectNoCartBadge()`, sorting (`sortProducts`, `sortByNameZToA`, `sortByPriceHighToLow`, `expectSortedNames`, `expectSortedPrices`), product details (`openProductDetails`, `expectDetailsDescription`, `addToCartFromDetails`, `backToProducts`), `verifyAllProductImagesLoaded()`, `openCart()` |
| `CartPage` | `goto()`, `getCartItemByName()`, `expectItemInCart()`, `expectItemPriceInCart()`, `expectCartEmpty()`, `removeItem()`, `clickCheckoutButton()`, `clickContinueShopButton()` |
| `CheckoutPage` | `goto()`, `expectLoaded()`, field fills, `clickContinueBtn/CancelBtn/FinishBtn/BackHomeBtn`, `expectError()`, `expectItemInCheckOut()`, `expectCheckoutCompleteMessage()`, money readers (`getItemPrices`, `getItemTotal`, `getTax`, `getTotal`) |
| `MenuPage` | `openSidebarMenu()`, `selectX()` for the 4 sidebar links, `expectSidebarMenu()`, `expectAboutPageLoaded()`, `expectLogout()` |

**POM design rules used throughout:**

- A POM **never imports another POM** — knowledge flows backwards from the destination, not forwards to the front door.
- Actions may self-guard small state flips (`addToCart()` asserts the button flipped to "Remove"); the **spec asserts the business outcome**.
- POMs **read** values and return them; the **spec computes and asserts** derived values (e.g. sums, sorting transforms).
- When an expected value is *passed in*, the POM may assert it (`expectSortedPrices(expected)`). When it's *derived from other page values*, the POM only reads.

### Fixtures & Dependency Injection

`fixtures/page.fixture.ts` extends Playwright's `test` with five typed fixtures:

```ts
export const test = base.extend<{
    loginPage     : LoginPage;
    inventoryPage : InventoryPage;
    cartPage      : CartPage;
    checkoutPage  : CheckoutPage;
    menuPage      : MenuPage;
}>({ /* ... */ });
```

| Fixture | Behavior | Rationale |
|---|---|---|
| `loginPage` | constructs **+ navigates** to `/` | Every login test starts at the login page |
| `inventoryPage` | constructs **+ navigates** to `/inventory.html` (guarded by `expectLoaded`) | Most suites start here |
| `cartPage` | **construct-only** — no navigation | Journey tests must *travel* to the cart themselves |
| `checkoutPage` | **construct-only** — no navigation | Validation tests go straight to the form; journey tests ride in |
| `menuPage` | **construct-only** — no navigation | Menu tests must prove `inventoryPage.expectLoaded()` first |

**Why construct-only for some?** A fixture that navigates hides the path the test claims to verify. Fixtures for *per-test objects*; plain helpers for *steps inside a test*.

### Authentication Flow

```
┌──────────────┐   logs in once    ┌──────────────────────────────────┐
│ setup project│ ────────────────► │ playwright/.auth/standardUser.json│
│auth.setup.ts │   saves session   │        (storageState)            │
└──────────────┘                   └───────────────┬──────────────────┘
                                                   │ consumed by
                     ┌─────────────────────────────┼──────────────────────┐
                     ▼                             ▼                      ▼
        chromium-unauthenticated        chromium-authenticated      (future: firefox…)
        tests/unauthenticated/**        tests/authenticated/**
        NO storageState                 storageState + dependencies: ['setup']
```

- `auth/auth.setup.ts` logs in as `standard_user`, asserts the inventory URL, then writes `storageState`.
- `config/auth.ts` exports the single source of truth for that path: `STORAGE_STATE = 'playwright/.auth/standardUser.json'`.
- The `chromium-authenticated` project declares `dependencies: ['setup']`, so Playwright guarantees the session exists **before** any authenticated test runs.
- The `chromium-unauthenticated` project has **no** `storageState` — login tests start clean, which is essential because they test login itself.

### Helpers vs. Fixtures vs. POMs

| Concept | What it is | Lifecycle |
|---|---|---|
| **POM** | A room: holds locators & actions for one page | Permanent, shared across all specs |
| **Fixture** | A helper with setup baked in, handed to any test that destructures it | Per-test object, provided by Playwright |
| **Spec helper** | A plain typed `async` function above `test.describe` — a *route* between rooms | Starts local to one spec; graduates to `helpers/` only when a **second** spec needs it |

Current spec helpers (in `checkout.spec.ts`):

- `startCheckoutAtStepOne(inventoryPage, cartPage, checkoutPage)` — the 7-line cart → checkout journey
- `submitValidDetails(checkoutPage)` — fill valid details → Continue → assert step-two URL
- `addtoCartTwoItems(inventoryPage, cartPage, checkoutPage)` — fixed 2-item cart journey

---

## Test Organization

### Playwright Projects

Configured in `playwright.config.ts`:

| Project | Test match | Storage state | Dependencies | Purpose |
|---|---|---|---|---|
| `setup` | `auth/auth.setup.ts` | — | — | Creates the shared session once |
| `chromium-unauthenticated` | `tests/unauthenticated/**/*.spec.ts` | none | — | Tests that must start logged **out** |
| `chromium-authenticated` | `tests/authenticated/**/*.spec.ts` | `STORAGE_STATE` | `setup` | Tests that require a logged-**in** session — Desktop Chrome (`devices['Desktop Chrome']`) |
| `firefox` | `tests/authenticated/**/*.spec.ts` | `STORAGE_STATE` | `setup` | Same authenticated suite on Desktop Firefox (`devices['Desktop Firefox']`) |
| `webkit` | `tests/authenticated/**/*.spec.ts` | `STORAGE_STATE` | `setup` | Same authenticated suite on Desktop Safari (`devices['Desktop Safari']`) |
| `Mobile Chrome` | `tests/authenticated/**/*.spec.ts` | `STORAGE_STATE` | `setup` | Same authenticated suite on Pixel 5 (`devices['Pixel 5']`) |

Projects 4–6 re-run the 34 authenticated cases in three more engines: **45 test cases → 147 test runs** per `npm test`.

### Test Suites

| # | Suite | File | Project | Tests | Scope |
|---|---|---|---|---|---|
| 1 | Setup | `auth/auth.setup.ts` | `setup` | 1 | Session creation |
| 2 | Login | `tests/unauthenticated/login.spec.ts` | `chromium-unauthenticated` | 10 | Credentials, error paths, route guard |
| 3 | Inventory | `tests/authenticated/inventory.spec.ts` | `chromium-authenticated` | 15 | Catalog, cart badge, sorting, details, data integrity |
| 4 | Cart | `tests/authenticated/cart.spec.ts` | `chromium-authenticated` | 5 | Cart contents, remove, continue/checkout navigation |
| 5 | Checkout | `tests/authenticated/checkout.spec.ts` | `chromium-authenticated` | 10 | Validation, happy path, cancel, totals math |
| 6 | Menu | `tests/authenticated/menu.spec.ts` | `chromium-authenticated` | 4 | Logout, reset state, sidebar navigation |
| | | | | **45 cases → 147 runs** | |

> Rows 3–6 (34 tests) additionally run under the `firefox`, `webkit` and `Mobile Chrome` projects — `45 + (34 × 3) = 147` runs per bare `npm test`.

### Test Entry Styles

Two deliberate styles for reaching the page under test — decided **per test**, never globally:

| Style | How | When to use |
|---|---|---|
| **A — Journey** | Ride in from the previous page (`inventoryPage.addToCart → openCart → …`) | The *path itself* is part of the claim (cart, checkout happy path) |
| **B — Direct** | `await checkoutPage.goto()` | Testing the *form in isolation* — validation tests skip the cart journey |

---

## Test Cases

### 1. Setup — `auth/auth.setup.ts` (1)

| # | Test | Assertion |
|---|---|---|
| 1 | `authenticate` | Login as `standard_user` → URL matches `/inventory/` → persist `storageState` |

### 2. Login — `login.spec.ts` (10) · *unauthenticated*

| # | Test | Type | Assertion |
|---|---|---|---|
| 1 | Verify Successful Login | Happy path | URL → `/inventory.html` |
| 2 | Verify Unsuccessful Login | Negative | Error: *Username and password do not match any user in this service* |
| 3 | Verify Empty Username | Validation | Error: *Epic sadface: Username is required* |
| 4 | Verify Empty Password | Validation | Error: *Epic sadface: Password is required* |
| 5 | Verify Locked Out User Login | Negative | Error: *Epic sadface: Sorry, this user has been locked out.* |
| 6 | Verify Problem User Login | Persona | URL → `/inventory.html` |
| 7 | Verify Performance Glitch Login | Persona | URL → `/inventory.html` |
| 8 | Verify Error User Login | Persona | URL → `/inventory.html` |
| 9 | Verify Visual User Login | Persona | URL → `/inventory.html` |
| 10 | Unauthenticated direct access to `/inventory.html` redirects to login page | Security/route guard | URL → `/` + app's own access-denied message |

### 3. Inventory — `inventory.spec.ts` (15) · *authenticated*

| # | Test | Category | Assertion |
|---|---|---|---|
| 1 | Verify authenticated user can access Inventory page | Access | `expectLoaded()` (URL + container + list + 6 items) |
| 2 | Verify all inventory items are displayed | Data integrity | Exactly 6 items · every image loaded (`complete && naturalWidth > 0`) · exact A→Z name list · exact price list |
| 3 | Verify Add to Cart Function | Cart | Button flips Add → Remove |
| 4 | Verify Remove Functionality | Cart | Button flips Remove → Add |
| 5 | Verify cart badge count | Cart | Badge = `1` |
| 6 | Cart badge shows correct count when adding multiple items | Cart | Badge 1 → 2 → 3 after each add |
| 7 | Cart badge disappears when all items are removed | Cart | Badge hidden after removing all 3 |
| 8 | Verify sorting by name A to Z | Sorting | Full pinned name order matches |
| 9 | Verify sorting by price low to high | Sorting | Full pinned price order matches |
| 10 | Verify sorting by name Z to A | Sorting | ≥ 2 items · visible names equal their own descending sort (derived transform) |
| 11 | Verify sorting by price high to low | Sorting | ≥ 2 items · every price finite · visible prices equal their own descending sort |
| 12 | Details page shows correct name and price | Details | Details name/price equal list values after navigation |
| 13 | Details page shows correct description | Details | Description text matches data |
| 14 | Add to Cart from details page syncs the cart badge | Details + cart | Button flips + badge = 1 |
| 15 | Back to products returns to inventory | Journey | Back → badge 1 → cart contains item → Continue Shopping → badge still 1 |

### 4. Cart — `cart.spec.ts` (5) · *authenticated*

| # | Test | Assertion |
|---|---|---|
| 1 | Verify product displayed in cart page | Item name **and** price match data |
| 2 | Verify Remove Functionality | Item removed → cart count 0 |
| 3 | Verify continue shop button navigates user to inventory page | URL → `/inventory.html` |
| 4 | Verify user can check out item | URL → `/checkout-step-one.html` |
| 5 | Verify checkout attempt with no items in cart | Empty cart still reaches `/checkout-step-one.html` |

### 5. Checkout — `checkout.spec.ts` (10) · *authenticated*

| # | Test | Type | Assertion |
|---|---|---|---|
| 1 | Verify clicking continue with empty fields display error message | Validation | Error: *First Name is required* |
| 2 | Validate Empty First Name | Validation | Error: *First Name is required* (2 of 3 fields filled) |
| 3 | Validate Empty Last Name | Validation | Error: *Last Name is required* |
| 4 | Verify checkout step one with valid inputs | Happy path | Journey → valid details → URL → `/checkout-step-two.html` |
| 5 | Verify checkout step two with valid inputs | Happy path | Overview shows item → Finish → `/checkout-complete.html` + *Thank you for your order!* |
| 6 | Verify cancel button working | Cancel | Step-one Cancel → `/cart.html` + item still in cart |
| 7 | Verify overview cancel button returns to inventory with cart intact | Cancel | Step-two Cancel → `/inventory.html` + badge = 1 |
| 8 | Verify confirmation page returns to inventory with empty cart | Journey | Finish → Back Home → `/inventory.html` + **no** badge |
| 9 | Verify item total equals the sum of item prices | Calculation | 2-item cart: Σ item prices = displayed item total (integer cents) |
| 10 | Verify Tax and grand total calculated correctly | Calculation | tax = 8% of subtotal (rate asserted) · subtotal + tax = total |

### 6. Menu / Session — `menu.spec.ts` (4) · *authenticated*

| # | Test | Assertion |
|---|---|---|
| 1 | Logout from burger menu returns to login page | Sidebar opens → Logout → URL back to login |
| 2 | Reset option clears cart badge and restores button states | **Both** claims: badge gone **and** button back to "Add to Cart" |
| 3 | All Items option navigates back to inventory | From details → All Items → `expectLoaded()` |
| 4 | Verify About page will navigate user to saucelabs | Select About → URL = `https://saucelabs.com/` |

---

## Test Data

All expected values are centralized in `data/` — specs and POMs contain **no raw expected strings**.

### `data/loginData.ts` — `LoginData`

| Key | Username | Password | Expected |
|---|---|---|---|
| `validUser` | `standard_user` | `secret_sauce` | URL `/inventory.html` |
| `invalidUser` | `invalid_user` | `secret_sauce` | *Username and password do not match any user in this service* |
| `emptyUser` | *(empty)* | `secret_sauce` | *Epic sadface: Username is required* |
| `emptyPassword` | `standard_user` | *(empty)* | *Epic sadface: Password is required* |
| `lockedOutUser` | `locked_out_user` | `secret_sauce` | *Epic sadface: Sorry, this user has been locked out.* |
| `problemUser` | `problem_user` | `secret_sauce` | URL `/inventory.html` |
| `performanceGlitchUser` | `performance_glitch_user` | `secret_sauce` | URL `/inventory.html` |
| `errorUser` | `error_user` | `secret_sauce` | URL `/inventory.html` |
| `visualUser` | `visual_user` | `secret_sauce` | URL `/inventory.html` |
| `unauthenticatedAccess` | — | — | *Epic sadface: You can only access '/inventory.html' when you are logged in.* |

### `data/inventoryData.ts` — `InventoryData`

| Key | Value |
|---|---|
| `expectedURL` | `/inventory.html` |
| `expectedItemCount` | `6` |
| `expectedCartBadgeCount` | `1` |
| `expectedDetailsURL` | `/inventory-item.html` |
| `sortOptions.nameAToZ` / `priceLowToHigh` | `az` / `lohi` |
| `expectedNamesAToZ` | Sauce Labs Backpack · Bike Light · Bolt T-Shirt · Fleece Jacket · Onesie · Test.allTheThings() T-Shirt (Red) |
| `expectedPricesLowToHigh` | `$7.99 · $9.99 · $15.99 · $15.99 · $29.99 · $49.99` |
| `expectedPricesItemsSortedNamesAToZ` | `$29.99 · $9.99 · $15.99 · $49.99 · $7.99 · $15.99` (prices pinned in name order) |
| `featuredProduct` | Sauce Labs Backpack · `$29.99` · *carry.allTheThings()…* |
| `featuredProduct2` | Sauce Labs Bike Light · `$9.99` |
| `featuredProduct3` | Sauce Labs Fleece Jacket · `$49.99` |
| `AboutPage.url` | `https://saucelabs.com/` |

### `data/checkoutData.ts` — `CheckoutData`

| Key | Value |
|---|---|
| `summary.taxRate` | `0.08` (8%) |
| `validData` | Sofie · Villalobos · `4026` → *Thank you for your order!* |
| `emptyFirstName` | `''` · Villalobos · `4026` → *Error: First Name is required* |
| `emptyLastName` | Sofie · `''` · `4026` → *Error: Last Name is required* |
| `emptyField` | → *Error: First Name is required* |

> **Data provenance rule:** expected values are read from the **live site** (DevTools / served JS bundle), never from memory. Pinned values are re-verified when the site changes — the catalog already moved once (Backpack `$49.99` → `$29.99`).

---

## Configuration

### `playwright.config.ts` (key settings)

| Setting | Value | Notes |
|---|---|---|
| `testDir` | `'.'` | Projects narrow it via `testMatch` |
| `baseURL` | `https://www.saucedemo.com` | All `goto()` calls are relative |
| `testIdAttribute` | `data-test` | `getByTestId()` maps to `data-test` |
| `fullyParallel` | `true` | Tests within a file run in parallel too — up to `workers` at a time |
| `workers` | `4` | 4 tests in flight at once (kept at 4 deliberately; verified green) |
| `retries` | `2` on CI, `0` locally | |
| `forbidOnly` | `true` on CI | Prevents leaked `test.only` |
| `trace` | `retain-on-failure` | Every failed test keeps a trace — not just retries, which would keep **none** locally at `retries: 0` |
| `reporter` | `[['html'], ['list']]` | HTML in `playwright-report/` **and** live console output |

### `tsconfig.json`

- `strict: true` — no implicit `any`, strict null checks
- `noEmit: true` — type-checking only
- `target: ES2022`, `module/moduleResolution: node16`
- Includes all `**/*.ts`; excludes `node_modules`, `test-results`, `playwright-report`

---

## Running Tests

### npm scripts

| Command | What it does |
|---|---|
| `npm test` | Run the **full** suite (setup → unauthenticated → authenticated; 45 cases → 147 runs across 6 projects) |
| `npm run typecheck` | TypeScript strict check (`tsc --noEmit`) — run before committing |
| `npm run test:ui` | Interactive Playwright UI mode (watch, pick, debug) |
| `npm run test:headed` | Run with a visible browser window |
| `npm run report` | Open the latest HTML report in a browser |

### Useful CLI invocations

```bash
# Single suite
npx playwright test tests/authenticated/checkout.spec.ts

# One test by name
npx playwright test -g "Verify Tax and grand total"

# Flake check — repeat a test 5 times
npx playwright test -g "Back to products" --repeat-each=5

# One browser project only (cross-browser check)
npx playwright test --project=webkit

# Stress run for the ms-scale menu race (WebKit's click offset sits closest to the 500 ms window)
npx playwright test --project=webkit --workers=1 --repeat-each=20

# Debug a failure with UI mode
npx playwright test --ui

# List tests without running them ⚠️ (see report note below)
npx playwright test --list
```

### Report gotchas (learned the hard way)

- ⚠️ **Every** `playwright test` run rewrites `playwright-report/index.html` — including `--list`, which records the whole suite as *skipped* (`expected=0`, ~100 ms = nothing ran). A tell-tale sign: `total = suite size, skipped = all`.
- ⚠️ `npm test -- --reporter=list` on the CLI **replaces** the config's HTML reporter, so no report file is written.
- ✅ For a fresh report: run a **bare `npm test`**, then `npm run report`.

---

## Reporting

- **HTML report** → `playwright-report/index.html` (open via `npm run report`), plus live console output from the `list` reporter
- **Traces** → captured `retain-on-failure`; inspect with `npx playwright show-trace test-results/<test>/trace.zip`
- **Artifacts on failure** → `test-results/`
- **Last verified run** (bare `npm test`, Sun Nov 8 2026, 11:12 PM): **147 passed** · 0 flaky · 0 retries · `npm run typecheck` clean — with `fullyParallel: true` and `workers: 4`

---

## Coding Standards & Conventions

### In specs

- **One test = one user story**, structured Arrange → Act → Assert.
- **The title is the contract** — every noun in a test name must have a matching assertion ("returns to inventory with empty cart" ⇒ assert URL *and* badge).
- **No raw selectors, URLs, or expected values** in specs — they belong to POMs or data files.
- **A test with no assertion cannot fail meaningfully** — a click proves nothing.
- **Guards must be falsifiable** — `expectItemCount(2)` before math; `>= 2` (not `> 0`) before an ordering claim; `.not.toHaveCount(0)` before looping a collection.
- **Perform the action, then assert** — never assert a state you never caused.

### In page objects

- Locators declared `readonly`, resolved in the constructor.
- Prefer `getByTestId` (`data-test`), then role/placeholder; **CSS class only as a scope** when no unique testid exists (`.inventory_details_desc_container`, `.bm-menu-wrap`).
- `data-test` attributes are **camelCase** (`firstName`); `id`s are hyphenated (`first-name`) — read `data-test` from DevTools, never `id`.
- `expectLoaded()` is a **door bouncer** — called at test start so failures land at line 1 with *page not ready*, not line 20 with a confusing mid-test error.
- POMs never import other POMs.
- **No `console.log`** — definition of done for cleanup is `grep console.log` returning nothing outside `node_modules`.

### In data files

- Typed exported consts (`LoginData`, `InventoryData`, `CheckoutData`).
- Expected strings copied exactly from the live app (watch for double spaces!).
- Pinned lists are acceptable for *catalog content*; derived transforms (Z→A etc.) compute the expectation from visible values instead — avoid a second pinned list that can rot.

### Money

- Always **integer cents**: `Math.round(Number(text.replace('$','').trim()) * 100)` — makes exact `toBe` safe (`4999 + 999 = 5998`, never `5998.000000000001`).

---

## Design Principles

Condensed from the framework's build journal ([`PROGRESS.md`](PROGRESS.md)):

1. **Three-layer rule** — spec (what) / POM (how) / data (expected). One home per fact.
2. **Site is the source of truth** — testids and expected strings come from DevTools or the served bundle, never memory.
3. **The title is the contract** — assertions must cover every claim in the test name.
4. **Falsifiability** — every guard must be capable of failing for the right reason.
5. **Read → compute → assert** — `expect()` is a sink; to keep a page value you must `innerText()`/`allTextContents()`/`textContent()` it into a `const` first.
6. **POMs are rooms, helpers are routes** — routes live where they're used; extract to `helpers/` only when a second spec needs them (YAGNI).
7. **A POM-only fix should need zero spec edits** — if a spec must change, the fix went in the wrong layer.
8. **A milestone nobody re-runs is a rumour** — record numbers from a bare `npm test` run, not from counting `test(` occurrences.
9. **Behavior-preserving ≠ pointless** — scoping a locator that "works today" deletes a whole failure class (strict-mode ambiguity).
10. **Green tests that prove nothing are worse than no test** — assertion-less tests are parked as visible `/*WIP*/`, not shipped.
11. **A snapshot is a claim about *this instant*** — `allTextContents()` / `textContent()` / `count()` / `isVisible()` read whatever exists right now; `toHaveCount()` / `toBeVisible()` ask for what *should* be true. Anything the app renders asynchronously gets the second kind (Nov 6 — the cause of both checkout flakes).

---

## Known Limitations

- **Cross-browser, but not exhaustive** — the 34 authenticated tests run on Chromium, Firefox, WebKit and Mobile Chrome (147 runs); login stays Chromium-only by design (session behaviour isn't browser-specific), and Mobile Safari / Pixel 5 on iOS are still commented out.
- **Live-site dependency** — tests hit `saucedemo.com`; duration and stability depend on the public host (observed swings: 38 s → 9.8 min for the identical suite). A run on Nov 8 failed on `Test timeout of 30000ms exceeded` with zero assertion mismatches and passed unchanged on re-run — a network blip, not a code defect. Locally `retries: 0`, so there is no second chance; re-run before debugging.
- **Pinned data can rot** — catalog prices/URLs must be re-verified when the site changes.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Phantom IDE errors everywhere | Missing/loose `tsconfig` | Ensure strict `tsconfig.json` present; run `npm run typecheck` |
| `ERR_UNKNOWN_FILE_EXTENSION` on `npm test` | TypeScript 7.x on Node 20 | Pin `typescript@5` (already in `package.json`) |
| `ts(7006)` implicit `any` on a helper | Untyped fixture params | Annotate each parameter with its POM class |
| Test fails "element not visible" at step 2 | Construct-only fixture (`cartPage`/`checkoutPage`/`menuPage`) didn't navigate | Call `goto()` (Style B) or arrive through the journey (Style A) |
| `resolved to N elements` strict-mode error | Locator matches shared testids across components | Scope under a unique container (CSS class if no unique testid) |
| Assertion fails with a wrong-looking expected string | Value typed from memory (e.g. double space) | Copy the exact string from DevTools / live bundle |
| `expect(prices.length).toBe(n)` receives `0` | Non-waiting snapshot read (`allTextContents()` doesn't auto-wait) | Wait for visibility first, or use the auto-waiting `expectItemCount(n)` (see [Design Principles #11](#design-principles)) |
| Menu test fails `Received: hidden` on `.bm-menu-wrap` right after clicking **Open Menu** | `react-burger-menu` re-applies `[hidden]` ~500 ms after mount (app defect) | 600 ms guard in `MenuPage.openSidebarMenu()` — see [Bug 1](#bugs-encounteredfound) |
| Report shows all tests *skipped*, ~100 ms | `--list` (or any run) overwrote the report | Run a bare `npm test` |
| `npm test -- --reporter=…` writes no report | CLI reporter replaces config reporter | Use bare `npm test` for the HTML report |
| Edit mysteriously reverted | Stale editor buffer saved over a changed file | `Ctrl+Shift+P` → **Revert File** before editing files changed by tooling |
| Flaky "resolved to 7 elements" on details page | List/details/cart share `inventory-item-*` testids | Scoped locators under `.inventory_details_desc_container` in the POM |

---

## Bugs Encountered/Found

Defects found in the **application under test** ([SauceDemo](https://www.saucedemo.com)) while building and running this suite. Framework- and test-side problems live in [Troubleshooting](#troubleshooting) instead.

| # | Bug | Component | Severity | Suite status |
|---|---|---|---|---|
| 1 | Sidebar menu can fail to open if clicked within 500 ms of page load | `react-burger-menu` | High — dead menu, fails silently | **Guarded** in `MenuPage.openSidebarMenu()`; won't fix upstream (demo site, out of scope) |
| 2 | **Reset App State** doesn't flip *Remove* → *Add to cart* until you navigate away | Cart state sync | Medium — stale UI only; state *is* reset | **Guarded** — `test.fail()` in `menu.spec.ts` keeps the suite green and goes red when the app is fixed |

---

### Bug 1 — Sidebar menu doesn't open when clicked within 500 ms of page load

**Browsers:** reproduced on **Firefox 151** (captured in a Playwright trace) and reported consistently on **WebKit**; Chromium passed in observed runs but is timing-dependent.

**Symptom:** clicking *Open Menu* does nothing. The sidebar never appears and `expect('.bm-menu-wrap').toBeVisible()` times out after 5 s with `Received: hidden` — even though the click itself succeeded.

**Repro**

1. Log in and open a product details page (`/inventory-item.html?id=4`).
2. Click the burger button (top-left) roughly 500 ms after the page mounts — i.e. after only a couple of quick assertions.
3. The menu never opens. Navigating away and back clears it.

**Actual DOM after the click** — React believes the menu is open, the HTML says otherwise:

```html
<div class="bm-menu-wrap"
     style="position: fixed; …; width: 300px; height: 100%; transition: 0.5s;"
     aria-hidden="false"     <!-- state = OPEN -->
     hidden="true">          <!-- …but display: none -->
```

**Root cause — two sources of truth in `react-burger-menu`**

Open/closed state is tracked in two independent places:

1. React state → renders `aria-hidden` plus the `transform` / `width` styles
2. An imperative `document.querySelector('.bm-menu-wrap')` call that adds/removes the `hidden` attribute

The imperative call is driven by a **500 ms timer armed on mount**, and the *open* path never cancels it — the `clearTimeout` only runs later, inside the effect that fires **after** the async state flip:

```js
// armed on mount — fires 500ms later and re-hides the wrapper
b.current = setTimeout(() => { b.current = null; !isOpen && setWrapperHidden(); }, 500);

// what a burger click runs:
function open() {
  removeHidden();                                 // clears [hidden]
  setTimeout(() => setIsOpen(prev => !prev));     // flips state on the NEXT tick
  // clearTimeout() only runs in the [v] effect → after that tick
}
```

If the click lands in the few milliseconds between `removeHidden()` and the post-flip effect, the stale timer fires and re-applies `hidden="true"` at the exact moment the menu opens.

**Why it looked Safari-only.** The window is only a few milliseconds wide, but inside one environment both navigation→mount latency and Playwright's click latency are near-constant — so the click lands at almost the same offset every run. WebKit sat at ≈480 ms (inside the window → fails every time); Chromium sat at ≈350/550 ms (outside → passes). The very first full-suite run passed purely on timing luck, which is what made it look random.

**Suite workaround** — `pages/MenuPage.ts` → `openSidebarMenu()` waits **600 ms** before clicking. This is deterministic rather than a blind sleep: the burger button cannot exist before the menu has mounted, so `click_time > mount + 600 ms` is guaranteed, which is always past the 500 ms window.

**Suggested upstream fix:** cancel the pending timer at the start of the open path (call the `clearTimeout` helper *before* removing the attribute), and replace the global `document.querySelector('.bm-menu-wrap')` with a ref so two `Menu` instances can't mutate each other's node.

---

### Bug 2 — "Reset App State" doesn't restore the *Add to cart* button in place

**Severity:** Medium — stale UI only. The underlying cart state **is** reset correctly.

**Symptom:** with an item in the cart, open the sidebar → **Reset App State**. The cart badge disappears immediately, but the product button still reads **Remove**. It only flips back to **Add to cart** after navigating to another page (or reloading) and returning.

**Repro**

1. Log in, click **Add to cart** on any product → button reads *Remove*, badge shows `1`.
2. Open the burger menu → **Reset App State**.
3. Badge clears ✅ — button still reads *Remove* ❌.
4. Open any product's details page and go back → the button now reads *Add to cart*.

**Root cause — only the cart badge subscribes to cart changes**

The cart store exposes a small listener registry and notifies it on every mutation:

```js
static resetCart() {
  window.localStorage.removeItem('cart-contents');
  Cart.LISTENERS.forEach(listener => listener.forceUpdate());   // notifies known listeners only
}
static registerCartListener(listener) { Cart.LISTENERS.push(listener); }
```

The **cart badge** registers — so it re-renders and clears immediately ✅:

```js
const [contents, setContents] = useState(Cart.getCartContents());
useEffect(() => {
  Cart.registerCartListener({ forceUpdate: () => setContents(Cart.getCartContents()) });
}, []);
```

The **inventory item card does not**. It caches the flag in local state, read once at mount:

```js
const [inCart, setInCart] = useState(Cart.isItemInCart(id));   // read ONCE
const addToCart      = id => { Cart.addItem(id);    setInCart(true)  };
const removeFromCart = id => { Cart.removeItem(id); setInCart(false) };
// label = inCart ? 'Remove' : 'Add to cart'
```

`resetCart()` clears `localStorage` and notifies the listeners it knows about — the item card isn't one of them, so its `inCart` stays `true` and the label stays *Remove*. **Navigation "fixes" it only because remounting re-runs `useState(Cart.isItemInCart(id))` against the now-empty `localStorage`.** The product **details** page uses the identical pattern and has the identical defect (a bundle-wide search shows `registerCartListener` is called in exactly one place: the badge).

**Suite status (guarded since Nov 8):** `tests/authenticated/menu.spec.ts` → *"Reset option clears cart badge and restores button states"* now asserts in the right order:

```ts
await inventoryPage.expectNoCartBadge();   // badge DOES clear — passes normally
test.fail();                               // from here: a known product defect
await inventoryPage.assertAddToCartButtonIsVisible(InventoryData.featuredProduct.name);
```

The details-page round-trip that used to mask the defect (a remount silently fixing the label before the assertion) was deleted. The suite stays **green** today — the test is reported as an *expected* failure, one artifact per authenticated project — and it goes **red automatically** the day SauceDemo fixes the card, at which point `test.fail()` should be removed.

**Suggested fix:** either register a cart listener in the item-card and details components, or derive `inCart` from `Cart.getCartContents()` on every render instead of caching it in `useState`.

---

## Documentation

| Document | Purpose |
|---|---|
| [`PROGRESS.md`](PROGRESS.md) | Day-by-day journal: what was built, what was learned, which blockers arose and **why** each fix won |
| [`README.md`](README.md) | This document — architecture, test inventory, conventions, and the [bugs found in the app under test](#bugs-encounteredfound) |

---

## License

ISC
