// Deal Scout — HTML for the list and the deal pages. Every value is escaped
// before it goes into the page, and every price on a card is computed from
// the deal's own price and was, so the discount shown always matches.

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) =>
  `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const checkedDay = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";

const VERDICT_LABEL = {
  "new-low": "NEW LOW",
  strong: "STRONG PRICE",
  routine: "ROUTINE SALE",
};

export function verdictBadge(d) {
  return `<span class="verdict ${d.verdict}">${VERDICT_LABEL[d.verdict]}</span>`;
}

export function card(d) {
  return `<li class="card">
  <a class="card-link" href="#/deal/${encodeURIComponent(d.id)}">
    <span class="card-top">
      <span class="card-title">${escape(d.title)}</span>
      ${verdictBadge(d)}
    </span>
    <span class="card-store">${escape(d.store)} &middot; ${escape(d.category)}</span>
    <span class="card-prices">
      <span class="price">${usd(d.price)}</span>
      <s class="was">${usd(d.was)}</s>
      <span class="off">${percentOff(d)}% off</span>
    </span>
    <span class="card-save">You save ${usd(saved(d))}</span>
    <span class="card-checked">Checked ${checkedDay(d.checked)}</span>
  </a>
  <a class="card-shop" href="${escape(d.url)}" rel="noopener" target="_blank">View at ${escape(d.store)} &rarr;</a>
</li>`;
}

export function rows(deals) {
  if (deals.length === 0) {
    return '<li class="empty">No deal matches. Try another search or filter.</li>';
  }
  return deals.map(card).join("");
}

export function listPage(deals, state, counts) {
  const cats = Object.keys(counts.categories).sort();
  const stores = Object.keys(counts.stores).sort();
  const catOptions = ["All categories", ...cats]
    .map(
      (c) =>
        `<option value="${escape(c)}"${state.category === c ? " selected" : ""}>${escape(c)} (${c === "All categories" ? counts.total : counts.categories[c]})</option>`,
    )
    .join("");
  const storeOptions = ["All stores", ...stores]
    .map(
      (s) =>
        `<option value="${escape(s)}"${state.store === s ? " selected" : ""}>${escape(s)} (${s === "All stores" ? counts.total : counts.stores[s]})</option>`,
    )
    .join("");
  return `<section class="hero">
  <h1>Black Friday Deal Scout</h1>
  <p class="tagline">Real deals, checked today &mdash; every price read at the store or in a deals source that names it, with an honest call on whether it is really a deal.</p>
  <p class="stats"><strong>${counts.total} deals</strong> &middot; ${counts.storesCount} stores &middot; <strong>${counts.newLows} new lows</strong> &middot; ${counts.strong} strong prices &middot; ${counts.routine} routine sales &middot; checked ${checkedDay(counts.checkedAt)}</p>
</section>
<section class="toolbar" aria-label="Search and filter">
  <label class="search-label">Search <input id="search" type="search" placeholder="Try &ldquo;headphones&rdquo; or &ldquo;TV&rdquo;" value="${escape(state.q)}"></label>
  <label>Category <select id="category">${catOptions}</select></label>
  <label>Store <select id="store">${storeOptions}</select></label>
  <label>Discount <select id="minoff">
    <option value="0"${state.minoff === 0 ? " selected" : ""}>Any discount</option>
    <option value="25"${state.minoff === 25 ? " selected" : ""}>25% off or more</option>
    <option value="40"${state.minoff === 40 ? " selected" : ""}>40% off or more</option>
    <option value="50"${state.minoff === 50 ? " selected" : ""}>50% off or more</option>
  </select></label>
  <label>Sort <select id="sort">
    <option value="discount"${state.sort === "discount" ? " selected" : ""}>Biggest discount first</option>
    <option value="verdict"${state.sort === "verdict" ? " selected" : ""}>Best verdict first</option>
    <option value="price-low"${state.sort === "price-low" ? " selected" : ""}>Lowest price first</option>
    <option value="price-high"${state.sort === "price-high" ? " selected" : ""}>Highest price first</option>
  </select></label>
</section>
<p class="result-count" id="result-count">${deals.length} of ${counts.total} deals</p>
<ul class="deals" id="deals">${rows(deals)}</ul>`;
}

export function dealPage(d, sameProduct) {
  const others =
    sameProduct.length > 0
      ? `<section class="compare">
  <h2>Same product at another store</h2>
  <ul>${sameProduct
    .map(
      (o) =>
        `<li><a href="#/deal/${encodeURIComponent(o.id)}">${escape(o.store)}: ${usd(o.price)} (was ${usd(o.was)}, ${percentOff(o)}% off)</a></li>`,
    )
    .join("")}</ul>
  <p>Compare before you buy: the cheapest checked price for this product is <strong>${usd(Math.min(d.price, ...sameProduct.map((o) => o.price)))}</strong>.</p>
</section>`
      : "";
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="deal">
  <h1>${escape(d.title)}</h1>
  <p class="deal-store">${escape(d.store)} &middot; ${escape(d.category)} ${verdictBadge(d)}</p>
  <p class="deal-prices"><span class="price big">${usd(d.price)}</span> <s class="was big">${usd(d.was)}</s> <span class="off big">${percentOff(d)}% off</span></p>
  <p class="deal-save">You save ${usd(saved(d))} off the usual price.</p>
  <h2>Is it really a deal?</h2>
  <p class="deal-why">${escape(d.why)}</p>
  <dl class="deal-facts">
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Sale price</dt><dd>${usd(d.price)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)}</dd>
    <dt>Discount</dt><dd>${percentOff(d)}% off (save ${usd(saved(d))})</dd>
    <dt>Price checked</dt><dd>${checkedDay(d.checked)}</dd>
    <dt>Read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p><a class="shop-button" href="${escape(d.url)}" rel="noopener" target="_blank">Buy it at ${escape(d.store)} &rarr;</a></p>
  ${others}
</article>`;
}

export function missingPage() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
