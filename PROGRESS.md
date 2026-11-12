# Progress Log — playwright-ts

Day-by-day record: what I built, what I learned, what blocked me, and how I decided on the fix.
Chronological — earliest at top, newest at bottom. Append each session at the end.

**Entry format per day:**
- **Accomplished** — framework progress / activities completed
- **Learned** — concepts clicked that day
- **Blockers & decisions** — the issue → how it was resolved → *why that approach won*

---

## Before Oct 25, 2026 — Foundations
*(reconstructed from TODO.md — fill in exact dates when you remember them)*

**Accomplished**
- Set up Playwright + TypeScript project: strict `tsconfig.json`, npm scripts `test` / `typecheck`
- Login suite (`tests/unauthenticated/login.spec.ts`) with `LoginPage` POM + `data/loginData.ts`
- Inventory refactor: built `pages/InventoryPage.ts`, moved all expected values into `data/inventoryData.ts`, kept the spec thin (no raw selectors/URLs/values in specs)
- Created `fixtures/page.fixture.ts` with `test.extend()` — `loginPage`/`inventoryPage` auto-navigate, `cartPage`/`checkoutPage` construct-only
- Product details suite (4 tests) + cart suite rescued (5 tests, journey pattern `addToCart → openCart → cartPage assertions`)
- Checkout locators started (`firstName`/`lastName`/`postalCode`)
- Milestone: **27/27 tests passing, 0 failures**

**Learned**
- Page-object pattern: the spec declares *what* happens; the POM holds *how* (locators, actions, `expectX()` assertions)
- `test.extend()` = dependency injection: Playwright builds the object once per test and hands it to whoever destructures it
- All test facts (counts, URLs, sort codes, answer keys) belong in a data file
- `data-test` attributes are camelCase (`firstName`), `id`s are hyphenated (`first-name`) — read `data-test` in DevTools, never `id`

**Blockers & decisions**
- **Phantom IDE errors everywhere** → project had no `tsconfig.json`. *Fix:* added strict-mode config. *Why:* without it TS defaults loose, so real files "errored" randomly and hid genuine bugs.
- **`npm test` crashed: `ERR_UNKNOWN_FILE_EXTENSION`** → TypeScript v7.0.2 incompatible with Node 20.9. *Fix:* pinned `typescript@5`. *Why:* downgrade beats upgrading Node mid-project — tests were already green on v5 semantics.
- **Broken `getRandomIndex()`** (missing `return`, asserted a function call, referenced a non-existent `.itemName`). *Fix:* replaced wholesale with `getRandomProduct()` + `getProductByName()`. *Why:* one honest getter beats two half-broken ones; callers got simpler too.
- **Cart checkout button never found** → testid had drifted (`continue-checkout` → `checkout`). *Fix:* read the live `data-test` in DevTools, updated POM. *Why:* the site is the source of truth, not memory.
- **My own old buffer overwrote `InventoryPage.ts`** → stale editor buffer saved after the agent edited. *Fix:* habit — `Ctrl+Shift+P` → **Revert File** before touching a file the agent changed (kept in TODO.md's editor note). *Why:* editor caches file state; saving stale content silently rolls back real work.

---

## Sun Oct 25, 2026 — Review session Round 1 (checkout intro)

**Accomplished**
- Wrote first checkout test: empty-field validation entered via the real cart journey
- Created `data/checkoutData.ts`; error text moved out of the spec
- Grew `CheckoutPage`: `clickContinueBtn()`, `expectError(message)`
- Fixes: removed dead `emptyField` field values, URL assertion switched to `checkoutPage.page`, orphan "First Name Field Check" parked as WIP (spec + POM both marked)

**Learned**
- Anatomy of a spec file: fixture imports → `test.describe` → one test = one user story = Arrange → Act → Assert
- The three-layer rule: **spec** (orchestrates the story) / **POM** (locators + actions + `expectX`) / **data** (expected values). Rule of thumb: if a testid string appears in a spec, it's in the wrong file
- Fixtures don't all navigate: `inventoryPage` goes to the app, `cartPage`/`checkoutPage` don't — every test must reach the page itself
  - **Style A:** ride in from a previous page (journey)
  - **Style B:** `await checkoutPage.goto()` (direct)
- Assertions live in two places: actions may self-guard small state flips (button changed to "Remove"); the spec asserts the business outcome
- A test with no assertion can't fail meaningfully — a click proves almost nothing

**Blockers & decisions**
- **First checkout test failed: element not visible** → the original test had a `// ← add this line` note on `await checkoutPage.goto()`. *Root cause:* the `checkoutPage` fixture constructs but does **not** navigate (unlike `inventoryPage`). *Fix:* call `goto()` or arrive through the cart. *Why two styles exist:* journey tests should travel the real path (Style A), form tests should go straight to the form (Style B) — decided per test, not globally.
- **Dead data in `emptyField`** (`firstName:''` etc. never read) → offered "delete" vs "use explicitly with fill()". *Resolution:* deleted later that day. *Why:* unused data implies a test does something it doesn't — misleading readers is worse than short files.
- **"First Name Field Check" clicks with zero assertions** → couldn't say what it proves, so it wasn't a test yet. *Fix:* parked as visible `/*WIP*/` in spec + POM (project isn't under git, so commenting preserves it better than deleting). *Why not delete:* planned upgrade (assert field focus) would have lost the scaffold; *why not keep as-is:* a green test that proves nothing is worse than no test — false confidence.
- **I wrongly called two validation tests "redundant"** → user pushed back: one fills *nothing*, the other fills 2 of 3 fields. *Resolution:* conceded — different user stories, both stay. *Why:* shared error text ≠ same test; the assertion must match what the *arrangement* claims. App limitation noted: saucedemo only shows the first error it finds, so both report "First Name is required" — that's the app, not the test.

---

## Mon Oct 26, 2026 — Round 2: happy path + review fixes

**Accomplished**
- Suite grew to 7 tests: 3 field validations, step-one happy path, step two → finish → confirmation URL, cancel → cart with item intact
- Added `expectLoaded()` to `CheckoutPage` and used it at the start of every test
- Added `validData` (realistic customer) + `fillFirstName/fillLastName/fillPostalCode`
- Added `clickCancelBtn()`, `clickFinishBtn()`, `getCheckOutItemByName()` / `expectItemInCheckOut()` — the cart pattern reused for checkout
- Review fixes: double space bug in `'Error: Last Name is required'`, dead `checkoutData` aliases removed, unused `CheckoutData` import removed from POM, leftover WIP/TODO comments cleared

**Learned**
- Why `expectLoaded()` exists: a "door bouncer" — fails at line 1 with *page not ready* instead of failing at line 20 with a confusing mid-test error
- One test = one `page` — destructured fixtures are just different name-tags on the same browser tab
- Copy-pasted journey blocks inside a spec are a DRY violation → extract a helper
- Validation tests don't need the cart: test the *form* → go straight to it (`goto()`); test the *journey* → take the real path
- Made a conscious design choice and stopped drifting: keep 3 fill methods (selective filling matters more than one-line happy paths)

**Blockers & decisions**
- **No internet connection — tests couldn't run** → wrote inline code comments asking to verify (`// check when available if this is good`, `// kindly check the url if correct`). *Resolution:* reviewed against known saucedemo behavior — `finish` lives on step two, `/checkout-complete.html/` is correct; flagged the real bug on sight instead. *Why approach:* can't execute, so shift verification to static review — and mark uncertainty in the code rather than silently hoping.
- **Error string would fail: `'Error: Last  Name is required'`** (double space) → *Fix:* single space from the real app string. *Why it slipped in:* typed from memory, not copied from the site. *Lesson:* expected values come from DevTools/source, and only a real run proves an assertion — never trust a test you haven't run.
- **Dead `checkoutData` alias** (`const x = ...` declared, code used `CheckoutData.y` directly) → two styles mixed inside one test. *Fix:* use the alias everywhere. *Why:* aliases exist so a test reads once and refers to one thing; mixed styles make readers check both paths.
- **Journey copy-pasted 3× (7 identical lines)** → first instinct was "it's only 3 tests". *Resolution:* extract a helper — but placement argument postponed to next day. *Why helper:* DRY applies to specs; duplication means a selector change needs 3 edits and any missed edit lies about coverage.
- **3 fill methods vs 1 `fillCustomerDetails()`** → initially recommended compressing; user's validation tests fill selective combinations. *Resolution:* keep the 3 methods. *Why:* the compressed version forces "fill all three" on tests that need partial fills — flexibility beat brevity *for this suite*. Lesson: defaults are per-project, not universal.
- **Validation tests walked 4 lines through the cart** (`goto cart → checkout btn → URL → expectLoaded`) to reach a form reachable in 1 line → *Fix:* switched to `checkoutPage.goto()` (Style B), dropped `cartPage` from those tests. *Why:* the cart journey proves itself in journey tests; validation is about the form — testing the form, skip the journey.

---

## Tue Oct 27, 2026 — Helpers day

**Accomplished**
- Extracted two helpers at the top of `checkout.spec.ts`:
  - `startCheckoutAtStepOne(inventoryPage, cartPage, checkoutPage)` — the 7-line journey, now called once per journey test
  - `checkoutFillDetails(checkoutPage)` — fill valid details → continue → assert step two
- Converted all 3 validation tests to Style B (`checkoutPage.goto()`), dropped unused `cartPage` destructure
- Thank-you message assertion: `data-test="complete-header"` + `expectCheckoutCompleteMessage()` + data value `'Thank you for your order!'`
- Back-home test rebuilt on the full journey (add → cart → checkout → finish), now proving both claims of its name:
  - URL → `/inventory.html/` after Back Home
  - `inventoryPage.expectNoCartBadge()` (new method in InventoryPage — badge hidden after a completed order)

**Learned**
- A helper is just a normal `async` function above `test.describe` — no Playwright magic
- Helper rules: annotate parameter types (POM classes) or TS7006 fires; name it as a destination/step (`startCheckoutAtStepOne`, not `doStuff`); the helper gets you to the starting line, the *test* still makes the claims
- Helper lifecycle: local function in the spec → graduate to `helpers/x.ts` only when a **second** spec needs it
- Fixtures vs helpers: a fixture = a helper with setup baked in that Playwright hands to any test that destructures it; fixtures for per-test objects, plain helpers for steps inside a test
- Every test must end with proof of its own title (caught the assertion-less Back Home click)

**Blockers & decisions**
- **TS error `ts(7006): Parameter 'inventoryPage' implicitly has an 'any' type`** on the new helper → *Fix:* annotate each parameter with its POM class + ensure the classes are imported. *Why this fix:* the fixture hands over a live *instance*; the function signature must declare what it *expects* — matching the two is what lets TS catch typos like `openCarts()` at edit time instead of runtime.
- **"Can't I just put the helper in the POM file? …obviously CheckoutPage"** → user's instinct, common in the wild. *Resolution:* rejected for this codebase with three reasons: (1) the helper is 90% inventory/cart actions — misleading inside a checkout class; (2) `CheckoutPage.ts` would import both other POMs, so renaming `CartPage.openCart()` breaks checkout code; (3) knowledge flows backwards — the destination shouldn't give directions to the front door. *Chosen approach:* helper lives at the top of the spec; graduate to a `flows/` class only if ceremony-free options die. *Rule:* **POMs are rooms, helpers are routes — routes live where they're used.** Two consumers, then extract (YAGNI).
- **Helper placement follow-up: shared `helpers/` file now?** → user uses it in one spec only. *Decision:* keep it local. *Why:* a second file is machinery nobody needs yet; the migration path (move function, add exports, import elsewhere) is trivial when the day comes.
- **Back-home test ended with no assertion** — clicked Back Home and stopped; would pass even if the button did nothing. *Root cause:* the test's title promised "returns to inventory with empty cart" but neither claim was checked. *Fix:* URL `/inventory.html/` + `inventoryPage.expectNoCartBadge()` (new POM method doing `toBeHidden()` — passes whether the badge is hidden or absent). *Why assert both:* the title *is* the contract; every noun in a test name needs a matching assertion.
- **`checkoutFillDetails` name understates its job** (it fills *and* submits *and* asserts navigation) → *Fix proposed:* rename `submitValidDetails`. *Status:* open, keeping it consciously for now. *Why flagged:* honest names are load-bearing — a reader must predict behavior from the name alone.

**Open / next**
- Round 3: empty postal-code validation, price assertion on overview (`featuredProduct.price`), total = subtotal + tax
- Cleanup: unused `cartPage` in the 3 validation tests, decide `checkoutFillDetails` rename, one style for reading `checkoutmessage`
- From TODO: Z→A / price high→low sorting, multi-item cart tests, menu/session tests, CI workflow

---

## Fri Oct 30, 2026 — Checkout totals: reading page values

**Accomplished**
- Two calculation tests in `checkout.spec.ts`: item total = sum of item prices, and tax = 8% of subtotal + subtotal = total. Both on a fixed 2-item cart (Backpack + Bike Light)
- New `CheckoutPage` readers: `getItemPrices()` (returns cents array), `getItemTotal()`, `getTax()`, `getTotal()` — POM reads and returns values, the spec does the math and the asserting
- `CheckoutData.summary.taxRate = 0.08`; guard `expect(prices.length).toBe(2)` before any summing
- `inventoryData.ts`: `featuredProduct2` / `featuredProduct3`; corrected `featuredProduct.price` to the live $29.99
- Side work: multi-item badge tests + continue-shopping test in `inventory.spec.ts`, price-in-cart check in `cart.spec.ts` (`expectItemPriceInCart`)
- Review fixes applied: wrong variable in a debug log, dead page-wide `detailsPrice` assert removed from `CartPage`, shadowed `prices` param renamed to `text`
- Milestone: **38/38 passing** (9 login + 13 inventory + 5 cart + 9 checkout)

**Learned**
- `expect()` is a **sink** — it consumes a value and returns nothing. To keep a page value you must *read* it: `innerText()` (one), `allTextContents()` (a list, one call), `textContent()` (may be null). Read → store in a `const` → compute → assert
- A value lives in one of 4 places: test-local `const` (default) / data file (facts that never change) / POM reader (read needed by 2+ tests) / `helpers/` (2+ specs). Never a module-level `let` — parallel workers
- Money in **integer cents**: `49.99 + 9.99 = 59.980000000000001` (float), but `4999 + 999 = 5998`. Converting with `Math.round(Number(text.replace('$','').trim()) * 100)` makes exact `toBe` safe — no `toBeCloseTo` needed
- A test title is the contract. "Tax calculated correctly" needs the **rate** asserted — subtotal + tax = total only proves internal consistency, and a 100%-tax app would pass it
- Design rule applied: expected value *passed in* → the POM may assert it (`expectSortedPrices`); expected value *derived from other page values* → the POM only reads, the spec computes
- The site's catalog moved (Backpack $49.99 → $29.99) — verified by grepping saucedemo's JS bundle. Hardcoded "expected" values rot; they're only trustworthy if re-checked against the live site

**Blockers & decisions**
- **Test IDs I predicted from memory looked wrong** (`summary_subtotal_label` vs the user's `subtotal-label`) → downloaded saucedemo's JS bundle and read the real `data-test` values. *User was right*, my memory was of the old site. *Rule reaffirmed:* the site is the source of truth — for the assistant too
- **The locator "improvement" broke both new tests** — scoping was written as `this.itemPrices.getByTestId('inventory-item-price')` = price *inside* a price → `[]` → both failed with `expect(0).toBe(2)`. *Fix:* `this.checkoutItems.getByTestId(...)`. *Why it mattered:* the `length` guard converted a misleading "3998 vs 0" deep in the math into an instant, readable "cart wasn't 2 items". Guard before you compute
- **Suggested a single `getAmount()` for all 3 readers → user declined, and the run proved them right** — 38/38 green with the three separate methods; the only benefit was a nicer error message if a label ever changes. *Rule:* optional hardening is not a defect — don't churn working code for hypothetical failures
- **Two journey helpers (1-item vs 2-item)** → dedup offered, user kept both: the second exists specifically to add different products. Not merged. The parameterized-helper version stays on the table if a third variant appears
- **TODO/PROGRESS were 3 days behind the code** — 6 written tests unticked, no entry for the session. Bookkeeping now happens at the end of the session, not "later"

**Open / next**
- TODO 53 half-done: cart asserts price but never the item's *name* text against data
- Z→A / price high→low sorting; menu/session tests (logout, reset app state); `test:ui` / `test:headed` / `report` npm scripts

---

## Fri Oct 30, 2026 — Session 2: details locator scoping + verification run

**Accomplished**
- Fixed the known details/list testid clash: new field `readonly detailsContainer = page.locator('.inventory_details_desc_container')` in `InventoryPage`; `detailsName`, `detailsPrice`, `detailsDesc`, `detailsAddToCart` and the `remove` flip-check in `addToCartFromDetails()` all resolve inside it — **0 spec edits**
- Scope decided from the live bundle (`/assets/index-*.js`), not memory: details markup is `div.inventory_details_desc_container` containing name + desc + price + the add-to-cart button
- Cleaning pass finished: removed the 5th `console.log` (POM `getProductName`) together with the dead `await this.getProductName(product)` in `addToCart()` that existed only to feed it; removed the checkout item-total log; both sorting guards `toBeGreaterThan(0)` → `toBeGreaterThanOrEqual(2)`
- Verification: `typecheck` clean · details tests `--repeat-each=5` → 16 passed · "Back to products" `--repeat-each=5` → 6 passed · full suite → **40/40** (1 setup + 9 login + 15 inventory + 5 cart + 10 checkout)
- npm scripts added: `test:ui` (`--ui`), `test:headed` (`--headed`), `report` (`show-report`) — all three flags verified accepted (`--help`, `--list --headed`); closes the last easy tooling item
- Suite re-run after the flag check: **40/40 passed (37.7s)** with the config's default HTML reporter → `npm run report` now opens a real, current report (`total=40 expected=40 skipped=0 ok=true`)
- `TODO.md` re-synced: Z→A / price high→low ticked, flake item ticked with how it was verified, stale "multi-item still open" note cleared, milestone corrected 38 → 40

**Learned**
- **A testid rule has an exception for scopes.** "Use `data-test`, not CSS" applies to the element under test; when the *container* has no unique testid, a CSS class is the only honest scope. `getByTestId('inventory-item')` is shared by **three** components (list item, cart item, details root) and `inventory-container` by both list and details pages — a testid scope there is a coin flip
- Cart items reuse `inventory-item-name/-price/-desc` too — the same defect class lives on the cart page, which is why `CartPage` scoping was never optional
- **Behavior-preserving ≠ pointless.** The fix changes nothing while only one view is mounted; its value is deleting a failure class (strict mode "resolved to 7 elements") instead of waiting to be bitten by it
- A POM-only fix should need zero spec edits. If a spec has to change, the fix went in the wrong layer
- A guard must make the claim *falsifiable*: `length > 0` cannot fail an ordering assertion, because 1 element is sorted every way. `>= 2` can
- Deleting a debug log exposes the calls that existed only to print — `getProductName()`'s return value was unused in `addToCart()`, so log and dead call go together
- Deferred judgement on the flake: it didn't reproduce before the fix (details looks like its own route in the new Vite SPA), but "couldn't reproduce" isn't "can't happen" when the DOM evidence says three components share the testids
- **`playwright test --list` is not read-only.** Verifying the new flags with `--list --headed` ran the reporters too and overwrote `playwright-report/index.html` with "40 tests, all skipped, 107 ms" — I destroyed the good report *by inspecting*. Tell-tale: total = suite size, `expected=0`, `skipped=40`, duration ≈ 0. Fix: `npm test`. *Why both gotchas bite:* the CLI `--reporter` flag **replaces** the config's `reporter`, so `npm test -- --reporter=list` writes *no* HTML report — and `--list`, which sounds inert, still invokes the reporter chain. Only a bare `npm test` leaves a fresh report behind

**Blockers & decisions**
- **"Just change `detailsDesc`?" → all three, plus the button.** The container holds name, desc, price *and* add-to-cart as direct children — scoping one and leaving two page-wide would have kept the defect and implied the other two were fine. *Why all four:* partial fixes read as "the rest is safe", which is exactly the wrong message
- **Rejected `getByTestId('inventory-item')` / `('inventory-container')` as the scope** → verified in the bundle that both are shared across pages/components. *Chosen:* `.inventory_details_desc_container`, the one selector unique to the details view. *Why:* a scope that's shared by the thing you're excluding isn't a scope
- **User pushed back on the new sorting tests** (self-derived expectation instead of a pinned list) and was right: they assert the order *the user sees*, and A→Z already pins content. A second pinned list is a second thing to rot — the Backpack price already proved that. *Conceded, and only the `>= 2` guard + logs changed*
- **Fix the flake anyway, though it won't reproduce?** → yes. 3 lines, deterministic, zero behavior change today. *Why:* optional hardening that removes a whole failure class is different from churning working code for a hypothetical — this one has DOM evidence behind it
- **Docs said 38/38 while the code held 39 + setup** → ran the full suite instead of trusting the number: **40/40**. *Why:* a milestone nobody re-runs is a rumour

**Open / next**
- Menu/session tests: logout, "Reset App State", "All Items", unauthenticated direct access — the last real coverage gap (planned next session)
- Data integrity: 6 product prices, image loading
- Tooling: GitHub Actions CI workflow; (optional) Firefox/WebKit projects in `playwright.config.ts`
- POM debug logs in `CartPage` (6) and `CheckoutPage` (5) still print every run — decide keep or drop

---

## Sat Oct 31, 2026 — Menu suite: session coverage closed

**Accomplished**
- New `pages/MenuPage.ts`: burger button by role (`Open Menu`), sidebar scoped to `.bm-menu-wrap`, the 4 sidebar links by testid, `openSidebarMenu()` (click **+** `expectSidebarMenu()` guard), `selectAllItems/selectAbout/selectLogout/selectResetAppState`, and `expectSidebarMenu()` / `expectAboutPageLoaded()` / `expectLogout()`
- `menuPage` added to `fixtures/page.fixture.ts` as a **construct-only** fixture — it does not navigate, exactly like `cartPage`/`checkoutPage`, so each test proves `inventoryPage.expectLoaded()` before opening the menu
- New `tests/authenticated/menu.spec.ts` (4 tests): logout → login page · "Reset App State" clears the badge and restores button states · "All Items" returns to inventory · About link
- The reset test checks **both** claims of its title: `expectNoCartBadge()` *and* the button back to "Add to Cart" (new `InventoryPage.assertAddToCartButtonIsVisible(name)`); it dives into product details and back first so the list is re-rendered after the reset
- 10th login test: unauthenticated direct access to `/inventory.html` redirects to login with the app's own message — `LoginData.unauthenticatedAccess.expectedError`; `InventoryData.AboutPage` added for the About URL
- `cart.spec.ts`: "Verify checkout attempt with no items in cart"
- Bookkeeping done **after** the run: `TODO.md` re-synced (logout/reset items, 4 Menu/session boxes, empty-cart checkout line) and this entry written
- Milestone: **45/45 tests passing (9.8m)** — 1 setup + 10 login + 15 inventory + 5 cart + 10 checkout + 4 menu; `npm run typecheck` clean

**Learned**
- A "reset" test needs two independent proofs: badge gone *and* button restored. Either alone could pass while the other fails — the title promises both, so both are asserted
- Fixture discipline paid off immediately: `menuPage` constructs without navigating, so the menu tests reuse the existing `inventoryPage` auto-navigation instead of re-implementing a `goto`
- The menu's 4 links are all testids, but the sidebar *container* (`.bm-menu-wrap`) is a CSS class — same scoping lesson as `.inventory_details_desc_container`: assert visibility on the wrapper, interact through testids
- Suite duration moved from ~38s to **9.8m**, with `inventory.spec.ts` flagged slow (5.7m) — more tests on the live site, not more parallelism (4 workers)

**Blockers & decisions**
- **Docs were 5 tests behind the code** → ran the suite first and wrote **45/45** from the run output instead of counting `test(` occurrences. *Why:* a milestone nobody re-runs is a rumour — same rule as Oct 30, applied before writing this time
- **Where the About assertion's expected URL lives** → `InventoryData.AboutPage.url` in the data file, not a string in `MenuPage.expectAboutPageLoaded()`. *Why:* three-layer rule — the POM names the intent, the data file holds the value
- **Filtered run vs full run**: tonight's earlier run covered only the logout test, so `playwright-report/index.html` held 2 results while the code held 45. A bare `npm test` at the end of the session is what produced the record above (per the report note in TODO.md)

**Open / next**
- Data integrity: test that all 6 product prices match the hardcoded values, and that all product images load
- Tooling: GitHub Actions CI workflow; (optional) Firefox/WebKit projects
- POM debug logs in `CartPage` (6) and `CheckoutPage` (5) — keep or drop
- `checkoutFillDetails` rename decision from Oct 27 still parked

---

## Mon Nov 2, 2026 — Data integrity: real image/price checks + log cleanup

**Accomplished**
- "Verify all inventory items are displayed" grew from a count into a real inventory check: exactly 6 items, **every image actually loaded**, exact name list, exact price list in the default (A→Z) order
- New POM pieces: `productImages` = `.inventory_item_img img` and `verifyAllProductImagesLoaded()` — a per-image `expect.poll(...).toBeTruthy()` on `img.complete && img.naturalWidth > 0`
- Spec-side guard `expect(productImages).not.toHaveCount(0)` placed **before** the loop
- New data key `InventoryData.expectedPricesItemsSortedNamesAToZ` (6 prices pinned in name order)
- Logs cleared project-wide: `CartPage` (6) and `CheckoutPage` (5) removed; the temporary `Product Images Loaded: 6/6` log and the unused `getProductImagesCount()` were added while writing the image check and deleted the same session — `grep console.log` now matches only `node_modules`
- About test corrected: it now calls `menuPage.selectAbout()` **before** `expectAboutPageLoaded()`, and `InventoryData.AboutPage.url` fixed `…/inventory.html` → `https://saucelabs.com/`; stale commented `npm run test:ui …` line and the title's trailing space cleaned out of `menu.spec.ts`
- Bookkeeping after the run: `TODO.md` re-synced (both **Data integrity** boxes, the **POM debug logs** item, new dated block) and this entry written
- Milestone: **45/45 passed (46.6s)** from a bare `npm test`, report `total=45 expected=45 unexpected=0 flaky=0 ok=true`; `npm run typecheck` clean

**Learned**
- `expect.poll` because images settle *after* the DOM: `complete && naturalWidth > 0` only turns true once the bytes arrive — a one-shot `toBeVisible()` would prove an `<img>` tag exists, not that it fetched
- A loop over a possibly-empty collection is only as honest as its guard: with 0 images the body never runs and everything "passes". `.not.toHaveCount(0)` is what makes the claim falsifiable
- A state assertion without the action that should cause it can't fail for the right reason — the About test asserted a URL it never navigated to. Perform the action, then assert; the title is the contract
- Expected values come from what the link *actually does*, not what its label says — hence `https://saucelabs.com/` read from the real destination
- "Definition of done" for a cleanup: a grep that returns nothing outside `node_modules`, not a file-by-file eyeball

**Blockers & decisions**
- **Pinned price list vs derived expectation** — kept pinned on purpose: unlike the Z→A / high→low transform tests, this claims *catalog content* in the page's default order, the same category as `expectedNamesAToZ`. Rot risk accepted (the Backpack price already moved once); a derived check would be circular here
- **Two `-g` filtered runs vs one record** — tonight's filtered runs proved the images test and the About test individually, but the report can only show 2 entries per run. A bare `npm test` first, docs second — the Oct 30 rule, applied in that order again
- **Duration swung 9.8m → 46.6s** for the identical 45 tests / 4 workers — logged as an observation, nothing changed in the suite to explain it, so no action taken
- **Debug log added then removed within one session** — it earned its place while the image check was being written and none after; the Oct 30 cleanup rule now applies forward, not just retroactively

**Open / next**
- Tooling: GitHub Actions CI workflow; (optional) Firefox/WebKit projects in `playwright.config.ts`
- `checkoutFillDetails` → `submitValidDetails` rename parked since Oct 27
- Cosmetic: the `expect.poll` block inside `verifyAllProductImagesLoaded()` still carries over-indented lines from the session it was written

---

## Mon Nov 2, 2026 — Session 2: closing the parked items

**Accomplished**
- **`checkoutFillDetails` → `submitValidDetails`** — the Oct 27 rename finally applied: definition, comment and all 7 call sites in `checkout.spec.ts`
- `verifyAllProductImagesLoaded()` indentation normalized in `InventoryPage.ts`
- Verification: `npm run typecheck` clean · bare `npm test` → **45/45 passed (54.9s)**; report confirmed `total=45 expected=45 unexpected=0 flaky=0 ok=true`
- `TODO.md` re-synced: a dated "Session 2" block records both closures; CI and browser boxes left open on purpose

**Learned**
- A rename is finished when the name predicts the behavior: the helper fills the form, clicks Continue, **and** asserts `/checkout-step-two.html/` — `submitValidDetails` covers all three, `checkoutFillDetails` only described the first
- Definition of done for a rename is a grep: `checkoutFillDetails` now returns nothing outside `node_modules`, same bar as the log cleanup earlier today

**Blockers & decisions**
- **GitHub Actions workflow now?** → skipped by choice this session. It stays open rather than half-landed: a workflow file proves nothing until a push runs it, so writing it while deferring verification would put an untested claim in TODO
- **Firefox/WebKit enabled?** → no. 45 tests × 3 browsers = 135 plus two downloads; still marked optional in `playwright.config.ts`, unchanged

**Open / next**
- GitHub Actions CI workflow (the only real tooling item left)
- Firefox/WebKit projects — optional, by design
- Everything else from the Oct 31 / Nov 2 open lists is closed

---

## Fri Nov 6, 2026 — Flakes root-caused, cross-browser on, two real product bugs filed

**Accomplished**
- **Flake 1 diagnosed and fixed.** `expect(prices.length).toBe(2)` was receiving `0`: `allTextContents()` does not auto-wait, so the spec read the DOM between the URL change and React's render. Fix in `pages/CheckoutPage.ts`: `getItemPrices()` now waits for the prices to be visible before reading, a new auto-waiting `expectItemCount(n)` (backed by `toHaveCount`) became the guard, and `getItemTotal()` / `getTax()` / `getTotal()` each gained a visibility wait and dropped their `!` non-null assertions so they can no longer produce `NaN`. Both call sites in `tests/authenticated/checkout.spec.ts` (the item-total and tax/total tests) now call `expectItemCount(2)` *before* reading prices.
- **Flake 2 diagnosed and fixed — it was an app bug, not a Safari bug.** Unpacked a Playwright trace and rebuilt the DOM timeline: after a successful click the wrapper had `aria-hidden="false"` and the open transform but `hidden="true"` (`display:none`). The served bundle confirmed the cause: `react-burger-menu` arms a **500 ms timer on mount** that re-applies `[hidden]`, and the open path never cancels it — the `clearTimeout` only runs in the effect that fires *after* the async state flip. A click landing in that window leaves the menu dead.
- Suite workaround: `pages/MenuPage.ts` → `openSidebarMenu()` waits **600 ms** before clicking, with the invariant in the comment (the burger button cannot exist before the menu mounts, so `click_time > mount + 600 ms` by construction). `closeSidebarMenu()` now asserts `toBeVisible()` instead of branching on a non-waiting `isVisible()` snapshot.
- **Diagnostics config**: `trace` `on-first-retry` → `retain-on-failure`, `reporter` → `[['html'], ['list']]`. With `retries: 0` locally the old setting could never produce a trace — this bug survived partly because a chance trace was the only evidence ever captured.
- **Flake 3 / Bug 2 diagnosed.** "Reset App State" clears the badge but leaves the product button on *Remove*: only the cart badge calls `registerCartListener`, while the inventory item card caches `useState(Cart.isItemInCart(id))` read **once at mount**. `resetCart()` empties `localStorage` and notifies the listeners it knows about — the card isn't one — so the label only corrects itself on remount (i.e. after navigation). The details page has the identical defect.
- **New `README.md` section `Bugs Encountered/Found`** (TOC §18, after Troubleshooting) files both bugs with symptom / repro / actual DOM / root cause / suggested fix, and flags that `menu.spec.ts`'s reset test currently *masks* bug 2 by navigating away before asserting.
- README bookkeeping synced to reality: suite status, Features (cross-browser bullet), Getting Started install command and expected results, Prerequisites, the Playwright Projects table (all 6 projects), Test Suites totals, Running Tests commands, Configuration (`trace`/`reporter`), Reporting, a new Design Principle #11, Known Limitations, Roadmap, two new Troubleshooting rows, and the Documentation table.
- Verification: `npm run typecheck` clean · bare `npm test` → **147 passed (4.3m)**, 0 flaky, **0 retries** across 6 projects (setup 1 · chromium-unauthenticated 10 · chromium-authenticated 34 · firefox 34 · webkit 34 · Mobile Chrome 34).

**Learned**
- "A different test fails every run" is one symptom, not several bugs — both checkout flakes were races between a test action and an internal async boundary (React's commit, a 500 ms timer). Categorize the failures before fixing them.
- **A snapshot is a claim about *this instant*; a web-first assertion is a claim about *whenever it becomes true*.** `allTextContents()` / `textContent()` / `count()` / `isVisible()` read whatever exists right now; `toHaveCount()` / `toBeVisible()` retry until it should. Anything the app renders asynchronously gets the second kind — that is now README Design Principle #11.
- `trace: 'on-first-retry'` + `retries: 0` means **no trace, ever** locally. A failure with no trace is a story, not evidence; `retain-on-failure` costs disk and buys the answer.
- A millisecond-wide race can masquerade as an engine difference: within one environment the click offset from mount is near-constant, so WebKit landed at ≈480 ms (inside the window) every run while Chromium landed outside it. "Safari always fails" was really "WebKit's timing is deterministic" — the chance trace that caught it was **Firefox**, not Safari.
- Reading the served bundle beats guessing: a single search for `registerCartListener` across ~550 KB of minified JS returned **one** hit (the cart badge), which settled bug 2 outright.
- A test can pass while hiding the very bug in its title — the reset test navigates to details and back before asserting the button, so it never observes the stale label. Test names are claims; check what the *order* of steps actually proves.

**Blockers & decisions**
- **`expect(prices.length).toBe(2)` fails although the same test passed before** → not a selector bug: `allTextContents()` doesn't wait. *Fix:* visibility wait inside the reader + `expectItemCount()` using `toHaveCount`. *Why this approach won:* the guard was already doing its job (turning "NaN math" into "0 ≠ 2") — the read itself had to become self-synchronizing, so the spec stays declarative.
- **Was the menu failure Safari-only?** → the trace on disk was **Firefox 151**. *Decision:* stopped attributing it to the engine and reconstructed the DOM timeline instead. *Why:* an engine is a symptom — the same code path failed in two engines, so the cause had to be in the shared code.
- **`waitForTimeout(600)` is discouraged by Playwright — use it anyway?** → considered `networkidle`, `document.fonts.ready` and a fixed shorter delay; none can *guarantee* "500 ms since menu mount", and a probabilistic guard merely relocates the race. *Chosen:* 600 ms with the invariant written into the comment. *Why this wins:* a sleep that encodes a known SUT timer is a fact; a sleep picked by feel is a coin flip.
- **Report the menu bug upstream or just patch the suite?** → both. The guard makes the suite deterministic; the README section records the defect for the app team. Patching alone would have hidden a real user-facing bug.
- **Paper over bug 2 with a test tweak?** → no. `menu.spec.ts` already navigates before asserting, which is *why* it passes; recorded the exact assertion move that would make it fail and left the test as-is rather than silently changing what it claims.
- **Write docs first or re-run first?** → re-ran first. The docs previously said `45/45` and "Chromium only"; every number in this entry comes from the bare `npm test` above (Oct 30 rule, applied before writing).

**Open / next**
- Promote bug 2 into a failing test: move `assertAddToCartButtonIsVisible()` to immediately after `selectResetAppState()` — needs a decision on whether a red test documenting an app bug is wanted
- Stress-verify the 600 ms guard: `npx playwright test --project=webkit --workers=1 --repeat-each=20` and `npx playwright test --repeat-each=3` — one green run does not close a ms-scale race
- GitHub Actions CI workflow (still the only real tooling item left)
- `Math.random()` in `getRandomProduct()` (`inventory.spec.ts`) — the last non-deterministic selector in the suite

---

## Sun Nov 8, 2026 — Bug 2 guarded with `test.fail()`, parallel workers on, README de-planned

**Accomplished**
- **Bug 2 is now guarded** (`tests/authenticated/menu.spec.ts:15-26`): the test asserts `expectNoCartBadge()` *first* (passes — the badge really does clear), then calls `test.fail()`, then `assertAddToCartButtonIsVisible()`. The details-page round-trip that used to mask the defect was deleted — a remount was silently repairing the label before the assertion ran. The suite stays green (the test reports as an *expected* failure, one artifact per authenticated project) and goes **red automatically** the day SauceDemo fixes the card, at which point `test.fail()` comes out.
- **Config: `fullyParallel: true`** (was `false`) with **`workers: 4` kept deliberately** — tests inside a file now run in parallel too, not just across files.
- **Verified:** bare `npm test` → **147 passed, 0 failed, 0 flaky, 0 retries** at Sun Nov 8 11:12 PM, with `fullyParallel: true` + `workers: 4`. `npm run typecheck` clean.
- **README re-synced** after those changes: config table `fullyParallel` row (`false` → `true`, `workers` note), Overview suite status, Getting Started expected duration, Reporting "last verified run", the Bugs summary table (Bug 1 → guarded + won't fix; Bug 2 → guarded via `test.fail()`), and the Bug 2 "Suite status" paragraph rewritten to show the actual code order instead of the deleted workaround.
- **README de-planned:** the Roadmap section is gone — this is a repo visitors read, not my personal backlog. The heading became `## Known Limitations` (the TOC already pointed at `#known-limitations`, so the old `& Roadmap` suffix was a broken anchor). A new Known Limitations bullet records the Nov 8 timeout episode so the next reader doesn't misdiagnose it.

**Learned**
- **Timeout failures vs assertion failures are different animals.** The Nov 8 ~9 PM run failed with `Test timeout of 30000ms exceeded` and `element(s) not found` — never reaching a single assertion — while the identical suite passed unchanged three hours later. A bug fails on *what the page said*; a network blip fails on *how long it took*. That one distinction answers "do I debug or re-run?" without opening a trace.
- **`test.fail()` leaves visible debris that isn't a failure.** Four `test-results/` folders (one per authenticated project) each holding an `error-context.md` are the *expected* failures of the reset test — `failedTests: []` is the number that matters, not the folder count.
- **Caveat on attributing the blip:** `playwright.config.ts` was edited at 10:25 PM, *between* the failing run (9:09 PM) and the passing one (11:12 PM) — so the two runs are not provably identical config. The timeout signature plus a clean re-run still points at the network, but the evidence is "consistent with", not "proven".
- **`retries: 0` locally turns a hiccup into a red.** CI would have retried twice automatically (config already keys off `process.env.CI`). Locally the rule is: re-run once before believing a timeout.

**Blockers & decisions**
- **Bug 1 (menu race) — do nothing.** *Why:* it's a demo site; the suite is already deterministic thanks to the 600 ms guard, and the defect is fully documented in the README. Chasing an upstream fix on a practice app buys nothing.
- **Stress runs (`--repeat-each=20` / `=3`) — declined.** *Why:* time is better spent elsewhere; the guard is deterministic by construction (the button cannot exist before the menu mounts), and CI will repeat the suite on every push anyway.
- **`Math.random()` in `getRandomProduct()` — keep.** *Why:* all 6 products are structurally identical, the suites that mattered (details, cart) already use a fixed product, and it isn't a source of flakiness — it never caused a failure.
- **Keep `workers: 4` instead of dropping to 1 after the timeouts.** *Why:* the failures were load-shaped, not contention-shaped, and the same 4-worker config passed on re-run — throttling would have been treating a symptom we couldn't even prove was parallelism.
- **Roadmap removed from the README.** *Why:* the README is read by people landing on the repo; a list of my future intentions is noise to them and lives in `TODO.md` instead. Documentation serves the reader, not the author.

**Open / next**
- GitHub Actions CI workflow — being handled separately, out of scope for this session
- `TODO.md` still carries three stale boxes (Bug 2 promoted → done; stress runs → declined; `Math.random` → kept) — not touched here, pending a pass of its own

---

## Mon Nov 9, 2026 — Postal-code test, CI closed, 46/151 verified under a degraded host

**Accomplished**
- **46th test:** `Validate Empty Postal Code` (`tests/authenticated/checkout.spec.ts`) + `CheckoutData.emptyPostalCode` (`Error: Postal Code is required`) — closes the last coverage gap: all three validation tests had previously *filled* the postal code, so the empty-postal branch was never exercised. Built to the exact pattern of its two siblings (Style B `goto()` → `expectLoaded()` → fill 2 of 3 → continue → `expectError`).
- **Git divergence reconciled** — `main` was ahead 3 / behind 3 with byte-identical trees (rewritten SHAs, likely commits made outside the local clone). Resolved; `main` back in sync with `origin/main`.
- **CI milestone closed.** The Nov 8 session deferred CI as "handled separately"; verified for the record: `.github/workflows/ci.yml` pushed and **GitHub Actions run #1 completed successfully** (2m 26s, Nov 8) — typecheck gate, 147 tests, failure artifacts on red.
- **Bookkeeping pass** (the item PROGRESS Nov 8 left "pending a pass of its own"): `TODO.md`'s false `Math.random` tick corrected — the decision was **keep**, not "remove"; stress-run and Bug-2 boxes reworded to record their decisions; CI box annotated with run #1's result.
- **README synced 45/147 → 46/151** everywhere (suite status, Features, Getting Started, Projects table, Test Suites totals, checkout table + row 11, Running Tests, Reporting, Known Limitations). Also caught stale data while in there: the CheckoutData table still said *Sofie · Villalobos* — the live file holds *Valid · User*; fixed and the new `emptyPostalCode` row added.
- **Verification:** `npm run typecheck` clean · **5 bare `npm test` runs → 150, 148, 143, 149, 147 / 151**, plus 3 targeted re-runs (all green).

**Learned**
- **Load-shaped failures cluster and masquerade as regressions.** Every one of the 18 failure instances was the same signature class — `element(s) not found` at `expectLoaded()` or `Test timeout of 30000ms exceeded`, *before any assertion ran*. Zero assertion mismatches. The tell was in the passing tests: firefox taking 20–36s against its usual 5–10s. A test that fails on *what the page said* is a bug; a test that fails on *how long it took* is the network — the Nov 8 rule, but this time observed as a **trend across 5 runs** rather than a single blip (1 → 3 → 8 → 2 → 4 failures).
- **"Re-run once" scales to "re-run the failures, then believe the aggregate."** Targeted re-run batches were the real evidence: 1 + 3 + 8 failures re-run green in three batches. Across 755 test executions (5 × 151), every one of the 151 tests passed in at least one run and every failure passed again on re-run — that aggregate, not any single run's number, is what proves the suite. (Checked and corrected mid-write: "no test failed twice in a row" was *false* — `Validate Empty Last Name` failed on firefox in runs 2 **and** 3. A true-sounding tally must be counted, not remembered.)
- **A degraded host changes the *shape* of a suite's runtime, not just a few tests.** When every browser slows down together, fixed timeouts (`expect` 5s, test 30s) become the failure site — the assertions never get a chance to be wrong.
- **Bookkeeping triage:** a ticked box is a claim. `Remove Math.random()` was ticked while the decision was *keep* — same defect class as "docs said 38 while code held 40": the box recorded an intent, not an outcome. Ticks now carry the decision (`kept by decision Nov 8`).

**Blockers & decisions**
- **5 bare runs without a clean 151/151 — record the composite or keep running?** → *Record the composite.* Each run is 5–7 minutes against a host that was getting slower, not faster (143 was the worst); another run rolls the dice, not the evidence. README Reporting now says exactly what happened instead of claiming a clean number that never occurred. *Why:* a milestone nobody can reproduce is a rumour — and so is one that's quietly rounded up.
- **Bump `workers` down or the expect timeout up to force a green run?** → *No config change.* The same config ran 147/147 clean on Nov 8; the variable today was the host. Changing config to mask a network day would be treating the symptom — the Nov 8 "load-shaped, not contention-shaped" reasoning still holds.
- **Targeted re-run overwrote the HTML report** (documented `--list`/filtered-run gotcha) — the final bare run restored it; sequence "filtered run → bare run" is now a hard habit.
- **CheckoutData table said Sofie · Villalobos while the file said Valid · User** — the README data table rotted when `checkoutData.ts` was updated (commit `ad6e8e4`). Fixed on sight: data tables in docs are pinned values too, subject to the same provenance rule.

**Open / next**
- Phase 1 polish complete: coverage gap closed, git clean, docs synced, CI verified. **Framework #2 is next** — target chosen by skill gap (API testing / complex UI), not by URL.
- Optional, not taken up: ESLint (typecheck remains the only static gate); a clean 151/151 single-run record on a good network day.

---

## Tue Nov 10 – Thu Nov 12, 2026 — URL centralization (`data/routes.ts`), `toHaveURL` deep dive, storage-state TTL audit

**Accomplished**
- **Storage-state review (Nov 10):** audited the login-once setup end to end — `setup` project → `storageState` JSON → `dependencies: ['setup']` + `use.storageState` on the 4 authenticated projects. Confirmed it does exactly what it claims: authenticated specs contain zero login steps, unauthenticated project carries no state, state file gitignored, logout in one test can't poison another (fresh context per test from the same file). Side finding: the saved `session-username` cookie expires **~10 minutes** after login (see *Learned*).
- **Commit `33db937` (Nov 10):** first refactor pass — hardcoded URLs and regexes moved out of POMs and specs into `expectedURL` groups in the three data files (9 files), reviewed and whitespace-cleaned before commit.
- **Second pass — `data/routes.ts` (this change):** the review flagged that pass 1 had put the *same* paths in up to 3 files (`/cart.html`, `/checkout-step-one.html` in both inventory and checkout data; `/inventory.html` ×6 in login data). Collapsed everything into a single `Routes` source of truth: 9 routes incl. `base`, plus `login`/`about`. Deleted `expectedURL` from all three data files, `AboutPage.url`, `expectedDetailsURL`, `unauthenticatedAccess.loginURL/inventoryURL` and the 5× per-user `expectedURL`; switched every consumer — 4 POMs, 3 specs, `auth.setup.ts` — to `Routes.*`, and pointed `playwright.config.ts` at `baseURL: Routes.base`. 12 files modified + 1 added.
- **Logout assertion upgraded:** `toHaveURL('')` → `toHaveURL(Routes.base)`.
- **Pre-commit cleanup found and fixed:** 5 trailing-whitespace lines (one on an untouched `forbidOnly` line — accidental diff noise) and 3 now-unused data imports left behind in `CartPage`/`CheckoutPage`/`MenuPage` after their last references migrated.
- **README re-synced:** new `Routes` table in Test Data (with the why-regex note), project tree, Features/Overview bullets, `baseURL` config row, "URLs belong to `Routes`" convention, 2 new Troubleshooting rows for the two real failures below, storage-state TTL in Known Limitations + Auth Flow, stale `expectedURL`/`AboutPage` rows deleted from the data tables.
- **Verification:** `npm run typecheck` clean · `git diff --check` clean · bare `npm test` → **150/151**, then bare re-run → **151/151 passed (3.5m)** — the clean single-run record previously listed as "optional, not taken up".

**Learned**
- **`toHaveURL(string)` is exact equality, not a glob.** The string is resolved against `baseURL` (`new URL(...).toString()`) and handed to the injected `ExpectedTextMatcher`, whose string branch is literally `text === this._string`. Globs *do* exist in Playwright — but in the `waitForURL`/`goto` engine (`urlMatches`), a **sibling utility with the same-looking job**. I "verified" the glob fix by testing that engine in isolation; it passed there and failed in the matcher that actually runs. *Rule:* prove a fix against the exact code path that executes, not a similarly-named neighbour.
- **The evidence was in the repo all along:** README Bug 1's repro has said `/inventory-item.html?id=4` since Nov 6 — the details route carries a query param, so an exact string can never match it. `Routes.inventoryItem` is a `RegExp` deliberately; the other 8 routes are exact strings because none carry query params (all passed on all 6 projects).
- **`'/inventory-item\.html/'` is not a regex.** Quoted, so `\.` collapses to `.` and the closing `/` becomes a literal path segment — which is why the failure's `Expected: …inventory-item.html/` showed a trailing slash that no code wrote. The mismatch shape identified the mistake: regex literals are unquoted.
- **A whitespace grep can be silently blind.** `[ \t]+$` never matches CRLF files — `\r` sits between the space and `$` — so "no trailing whitespace found" was reported while `git diff --check` was failing on 5 lines. *`git diff --check` is the tool; a homegrown regex must know the line endings.*
- **SauceDemo sessions live ~10 minutes** (storage-state audit): the saved cookie's `expires` = login + 600 s — file written 12:19:36 UTC, cookie dead 12:29:35 UTC. Safe within a run because `setup` re-logins on every `npm test`; a run whose authenticated phase outlasts the TTL, or `--no-deps` against an old file, silently redirects to login. Documented as a Known Limitation.
- **`toHaveURL('')` was never a no-op.** An interim claim (empty string short-circuits to "always pass") came from the same wrong engine: that rule lives in `urlMatches`; in the real matcher `''` resolves to base + `/` and compares exactly — it was a genuine assertion all along. The swap to `Routes.base` (made under the wrong justification) is equivalent and clearer; kept.

**Blockers & decisions**
- **`?id=4` broke the migrated details assertion — three wrong fixes before the right one.** (1) exact string → fails on the query; (2) glob `'/inventory-item.html*'` → right idea, wrong matcher engine, failed in the real run despite passing in isolation; (3) quoted regex → still a string, produced the `…html/` trailing-slash tell. *Fix:* unquoted `/inventory-item\.html/` in `Routes`. *Why it won:* the same regex passed at that exact line pre-refactor, and the matcher's regex branch is already used by `auth.setup.ts`.
- **Regex vs predicate vs exact-with-`?id=4` in `Routes`** → regex wins. One consumer (an assertion, never `goto`), so the mixed `string | RegExp` type costs nothing — and TS would reject a future `page.goto(Routes.inventoryItem)` misuse. A predicate works but leaks matching logic into the POM; pinning `?id=4` would tie a route constant to one product's id.
- **Single `Routes` file vs per-domain URL groups** → single file. The whole point of pass 2 was one edit point per path; per-domain groups reproduced pass 1's duplication (`cartURL` ×2 etc.) with cleaner naming.
- **First bare run scored 150/151 — record the composite or re-run?** → re-run (Nov 9 protocol). The failure was the load-shaped signature — `element(s) not found` at `expectLoaded()` *before any assertion ran*, on the same test that had passed minutes earlier — and **zero** URL assertion mismatches occurred anywhere, so the migration itself was already proven. Re-run: **151/151**, report fresh.
- **Docs before or after the run?** → after, again. Both README "last verified" paragraphs now cite numbers from tonight's runs, and the two failure-shape Troubleshooting rows cite failures that actually happened.

**Open / next**
- Storage-state freshness guard — fail fast with a clear message when the stored cookie has expired (design ready: read `expires` from the JSON in an auto fixture for projects using `STORAGE_STATE`; guard 1 = sanity check at save time in `auth.setup.ts`). Not implemented yet.
- Commit this change: 12 modified files + `data/routes.ts`, message `refactor: centralize route paths in data/routes.ts`.
- Optional, not taken up: ESLint (typecheck remains the only static gate).
