// Deal Scout — routing, search and filters. The list lives at #/, one deal at
// #/deal/<id>. Filters also read from the page URL (?q=&category=&store=
// &minoff=&sort=) so a view of the finder can be linked to directly, and the
// toolbar writes them back as the shopper types. No network is used: the
// deals are in deals.js and every filter runs on them in the browser.
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals, CHECKED_AT } from "./deals.js";
import { listPage, dealPage, missingPage, rows } from "./views.js";

const app = document.getElementById("app");

const VERDICT_RANK = { "new-low": 0, strong: 1, routine: 2 };
const discountOf = (d) => 1 - d.price / d.was;

function counts() {
  const categories = {};
  const stores = {};
  let newLows = 0;
  let strong = 0;
  let routine = 0;
  for (const d of deals) {
    categories[d.category] = (categories[d.category] ?? 0) + 1;
    stores[d.store] = (stores[d.store] ?? 0) + 1;
    if (d.verdict === "new-low") newLows += 1;
    else if (d.verdict === "strong") strong += 1;
    else routine += 1;
  }
  return {
    total: deals.length,
    categories,
    stores,
    storesCount: Object.keys(stores).length,
    newLows,
    strong,
    routine,
    checkedAt: CHECKED_AT,
  };
}

function readState() {
  const params = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#\/\?/, ""));
  const get = (key, fallback) => params.get(key) ?? hash.get(key) ?? fallback;
  return {
    q: get("q", ""),
    category: get("category", "All categories"),
    store: get("store", "All stores"),
    minoff: Number(get("minoff", "0")) || 0,
    sort: get("sort", "discount"),
  };
}

function applyFilters(state) {
  const q = state.q.trim().toLowerCase();
  let shown = deals.filter((d) => {
    if (q !== "" && `${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q) === false) return false;
    if (state.category !== "All categories" && d.category !== state.category) return false;
    if (state.store !== "All stores" && d.store !== state.store) return false;
    if (discountOf(d) * 100 < state.minoff) return false;
    return true;
  });
  if (state.sort === "verdict") {
    shown = [...shown].sort(
      (a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || discountOf(b) - discountOf(a),
    );
  } else if (state.sort === "price-low") {
    shown = [...shown].sort((a, b) => a.price - b.price);
  } else if (state.sort === "price-high") {
    shown = [...shown].sort((a, b) => b.price - a.price);
  } else {
    shown = [...shown].sort((a, b) => discountOf(b) - discountOf(a));
  }
  return shown;
}

function renderList(state) {
  const shown = applyFilters(state);
  const c = counts();
  app.innerHTML = listPage(shown, state, c);
  document.title = "Deal Scout — Black Friday 2026";
  const search = document.getElementById("search");
  const category = document.getElementById("category");
  const store = document.getElementById("store");
  const minoff = document.getElementById("minoff");
  const sort = document.getElementById("sort");
  const list = document.getElementById("deals");
  const count = document.getElementById("result-count");
  const refresh = () => {
    const next = {
      q: search.value,
      category: category.value,
      store: store.value,
      minoff: Number(minoff.value) || 0,
      sort: sort.value,
    };
    const filtered = applyFilters(next);
    list.innerHTML = rows(filtered);
    count.textContent = `${filtered.length} of ${c.total} deals`;
    const params = new URLSearchParams();
    if (next.q !== "") params.set("q", next.q);
    if (next.category !== "All categories") params.set("category", next.category);
    if (next.store !== "All stores") params.set("store", next.store);
    if (next.minoff !== 0) params.set("minoff", String(next.minoff));
    if (next.sort !== "discount") params.set("sort", next.sort);
    const query = params.toString();
    history.replaceState(null, "", query === "" ? "#/" : `#/?${query}`);
  };
  for (const el of [search, category, store, minoff, sort]) {
    el.addEventListener("input", refresh);
    el.addEventListener("change", refresh);
  }
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    if (found) {
      const same = deals.filter(
        (d) => d.id !== found.id && d.title === found.title,
      );
      document.title = `${found.title} | Deal Scout`;
      app.innerHTML = dealPage(found, same);
    } else {
      document.title = "Not found | Deal Scout";
      app.innerHTML = missingPage();
    }
  } else {
    renderList(readState());
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
