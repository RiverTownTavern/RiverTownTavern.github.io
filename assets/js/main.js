/* =========================================================
   RIVER TOWN TAVERN — SITE SETTINGS
   ✏️  Update these with the owner. Everything on the site
   (hours, weekly lineup, "Tonight" banner, events) reads
   from here, so you only change things in one place.
   ========================================================= */
const RTT = {
  phone: "843-488-2517",
  address: "1221 16th Ave, Conway, SC",
  facebook: "",   // e.g. "https://facebook.com/rivertowntavern"
  email: "",      // e.g. "rivertowntavern@gmail.com" (used by contact form)

  // 24h times, e.g. ["12:00","24:00"]. Leave "" to show "Call for hours".
  hours: {
    Monday: "", Tuesday: "", Wednesday: "", Thursday: "",
    Friday: "", Saturday: "", Sunday: ""
  },

  // Weekly lineup. Each day can have any number of items.
  weekly: {
    Tuesday:   [{ title: "Salmon & Broccoli Special", detail: "Every Tuesday", price: "$14.99", icon: "🐟" }],
    Wednesday: [{ title: "Open Mic Night", detail: "7 – 10 PM · Bring your guitar", price: "", icon: "🎤" }],
    Friday:    [{ title: "Karaoke", detail: "Starts at 9 PM", price: "", icon: "🎶", neon: true }]
  },

  // Recurring deal shown in the "Best Deal in Conway" section
  steakNight: { price: "$19.99", note: "Check this week's lineup for the night" },

  // Upcoming events (auto-hide after the end time passes)
  events: [
    {
      title: "Christmas Party",
      sub: "Dirty Santa Gift Exchange",
      start: "2026-12-12T15:00:00",
      end:   "2026-12-12T19:00:00",
      blurb: "Bring a $25 gift to receive a $25 gift. Food is included, and this one's for members only.",
      img: "assets/img/christmas-party.jpg"
    }
  ]
};

/* ---------- helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const today = DAYS[new Date().getDay()];
const fmt = t => { let [h, m] = t.split(":").map(Number); if (h === 24) h = 0; const ap = h >= 12 ? "PM" : "AM"; const hh = h % 12 || 12; return m ? `${hh}:${String(m).padStart(2,"0")} ${ap}` : `${hh} ${ap}`; };
const tel = p => p.replace(/\D/g, "");

/* ---------- nav ---------- */
const burger = $(".burger"), links = $(".links");
burger && burger.addEventListener("click", () => {
  links.classList.toggle("open"); burger.classList.toggle("x");
  burger.setAttribute("aria-expanded", links.classList.contains("open"));
});

/* ---------- reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .1 });
$$(".rv").forEach(el => io.observe(el));

/* ---------- shared fields ---------- */
$$("[data-year]").forEach(e => e.textContent = new Date().getFullYear());
$$("[data-phone]").forEach(e => e.innerHTML = `<a href="tel:${tel(RTT.phone)}">${RTT.phone}</a>`);
$$("[data-fb]").forEach(e => { if (RTT.facebook) e.innerHTML = `<a href="${RTT.facebook}" target="_blank" rel="noopener">Facebook</a>`; else e.closest("li, .row")?.remove(); });

/* ---------- hours ---------- */
$$("[data-hours]").forEach(t => {
  t.innerHTML = WEEK.map(d => {
    const v = RTT.hours[d];
    const txt = Array.isArray(v) ? `${fmt(v[0])} – ${fmt(v[1])}` : (v || "Call for hours");
    return `<tr class="${d === today ? "today" : ""}"><td>${d}</td><td>${txt}</td></tr>`;
  }).join("");
});
const openState = () => {
  const v = RTT.hours[today]; if (!Array.isArray(v)) return null;
  const n = new Date(), mins = n.getHours() * 60 + n.getMinutes();
  const [o, c] = v.map(t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; });
  return { open: c > o ? mins >= o && mins < c : mins >= o || mins < c, v };
};
$$("[data-open]").forEach(e => {
  const s = openState();
  e.innerHTML = !s ? `<i></i> Open daily · call ahead`
    : s.open ? `<i></i> Open now · until ${fmt(s.v[1])}`
    : `<i style="background:#e06f6f;animation:none"></i> Closed now · opens ${fmt(s.v[0])}`;
});

/* ---------- "Tonight at the Tavern" ---------- */
const tn = $("[data-tonight]");
if (tn) {
  const items = RTT.weekly[today] || [];
  const ev = RTT.events.find(e => new Date(e.start).toDateString() === new Date().toDateString());
  let title, body;
  if (ev) { title = ev.title; body = ev.sub + " · " + new Date(ev.start).toLocaleTimeString([], { hour: "numeric" }); }
  else if (items.length) { title = items.map(i => i.title).join(" + "); body = items.map(i => [i.detail, i.price].filter(Boolean).join(" · ")).join(" | "); }
  else { title = "Cold drinks & good company"; body = "No special on the board tonight. Pull up a stool anyway."; }
  $(".day b", tn).textContent = today.slice(0, 3);
  $("h3", tn).textContent = title;
  $("p", tn).textContent = body;
}

/* ---------- weekly lineup cards (home) ---------- */
const lu = $("[data-lineup]");
if (lu) {
  const cards = [];
  WEEK.forEach(d => (RTT.weekly[d] || []).forEach(i => cards.push({ d, ...i })));
  cards.push({ d: "Weekly", title: "Steak Night", detail: RTT.steakNight.note, price: RTT.steakNight.price, icon: "🥩" });
  lu.innerHTML = cards.map(c => `
    <article class="plank wood rv in ${c.d === today ? "today" : ""}">
      ${c.d === today ? '<span class="badge">Tonight</span>' : ""}
      <div class="d">${c.d === "Weekly" ? "Weekly" : c.d.slice(0, c.d === "Thursday" ? 5 : 3) + "."}</div>
      <h3 class="${c.neon ? "neon-pink" : ""}">${c.title}</h3>
      <p>${c.detail || ""}</p>
      ${c.price ? `<span class="price">${c.price}</span>` : ""}
      <span class="ic" aria-hidden="true">${c.icon || "★"}</span>
    </article>`).join("");
}

/* ---------- full week calendar (events page) ---------- */
const wk = $("[data-week]");
if (wk) {
  wk.innerHTML = WEEK.map(d => {
    const it = RTT.weekly[d] || [];
    return `<div class="dcol ${d === today ? "today" : ""}"><h4>${d}${d === today ? " · Today" : ""}</h4>${
      it.length ? it.map(i => `<div class="ev"><b>${i.title}</b>${[i.detail, i.price].filter(Boolean).join(" · ")}</div>`).join("")
                : `<div class="quiet">Cold beer, good times</div>`}</div>`;
  }).join("");
}

/* ---------- upcoming event + countdown ---------- */
const upcoming = RTT.events.filter(e => new Date(e.end) > new Date()).sort((a, b) => new Date(a.start) - new Date(b.start));
$$("[data-event]").forEach(sec => { if (!upcoming.length) sec.remove(); });
const cd = $("[data-countdown]");
if (cd && upcoming.length) {
  const target = new Date(upcoming[0].start);
  const tick = () => {
    let s = Math.max(0, (target - new Date()) / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); const sec = Math.floor(s - m * 60);
    cd.innerHTML = [[d, "Days"], [h, "Hrs"], [m, "Min"], [sec, "Sec"]].map(([v, l]) => `<div><b>${String(v).padStart(2, "0")}</b><small>${l}</small></div>`).join("");
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- add to calendar (.ics) ---------- */
$$("[data-ics]").forEach(btn => btn.addEventListener("click", e => {
  e.preventDefault();
  const ev = upcoming[+btn.dataset.ics || 0]; if (!ev) return;
  const f = d => d.replace(/[-:]/g, "").slice(0, 15);
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//River Town Tavern//EN","BEGIN:VEVENT",
    `UID:${Date.now()}@rivertowntavern`, `DTSTAMP:${f(new Date().toISOString())}Z`,
    `DTSTART:${f(ev.start)}`, `DTEND:${f(ev.end)}`,
    `SUMMARY:River Town Tavern · ${ev.title}`, `DESCRIPTION:${ev.sub}. ${ev.blurb}`,
    `LOCATION:${RTT.address}`, "END:VEVENT","END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "river-town-tavern-" + ev.title.toLowerCase().replace(/\W+/g, "-") + ".ics";
  a.click();
}));

/* ---------- lightbox ---------- */
const lb = $(".lightbox");
if (lb) {
  $$("[data-zoom]").forEach(img => img.addEventListener("click", () => { $("img", lb).src = img.dataset.zoom || img.src; $("img", lb).alt = img.alt; lb.classList.add("show"); }));
  lb.addEventListener("click", () => lb.classList.remove("show"));
  addEventListener("keydown", e => e.key === "Escape" && lb.classList.remove("show"));
}

/* ---------- menu: scroll-spy + search ---------- */
const mnav = $(".menu-nav");
if (mnav) {
  const navLinks = $$(".cats a", mnav);
  const blocks = $$(".mblock");
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      const on = navLinks.find(a => a.classList.contains("on")); on && on.scrollIntoView({ block: "nearest", inline: "center" });
    }
  }), { rootMargin: "-45% 0px -50% 0px" });
  blocks.forEach(b => spy.observe(b));

  const q = $(".menu-search input"), none = $(".no-results");
  $$(".mi").forEach(mi => { mi.dataset.h3 = $("h3", mi).innerHTML; const p = $("p", mi); if (p) mi.dataset.p = p.innerHTML; });
  q.addEventListener("input", () => {
    const v = q.value.trim().toLowerCase(); let hits = 0;
    $$(".mi").forEach(mi => {
      const h = $("h3", mi), p = $("p", mi);
      h.innerHTML = mi.dataset.h3; if (p) p.innerHTML = mi.dataset.p;
      const match = !v || mi.textContent.toLowerCase().includes(v);
      mi.classList.toggle("hide", !match);
      if (match && v) {
        hits++;
        const re = new RegExp("(" + v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
        h.innerHTML = h.textContent.replace(re, "<mark>$1</mark>");
        if (p) p.innerHTML = p.textContent.replace(re, "<mark>$1</mark>");
      }
    });
    blocks.forEach(b => b.style.display = !v || $$(".mi:not(.hide)", b).length ? "" : "none");
    none.style.display = v && !hits ? "block" : "none";
  });
}

/* ---------- contact form (opens email app) ---------- */
const form = $("form.contact");
form && form.addEventListener("submit", e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const body = `Name: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nTopic: ${d.topic}\n\n${d.msg}`;
  location.href = `mailto:${RTT.email}?subject=${encodeURIComponent("River Town Tavern · " + d.topic)}&body=${encodeURIComponent(body)}`;
  $(".form-ok").hidden = false;
});
