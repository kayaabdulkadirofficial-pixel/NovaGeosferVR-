const grid = document.getElementById("grid");
const search = document.getElementById("search");
const dialog = document.getElementById("detail");
const chips = document.querySelectorAll(".chip");

let filter = "all";
const categoryIcons = { doga: "🌿", sehir: "🏙️", kultur: "🏛️", su: "🌊", spor: "🚴", aile: "👨‍👩‍👧" };

function mapsSearchUrl(item) {
  const query = encodeURIComponent(`${item.title}, ${item.city}, Türkiye`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function matches(item, q) {
  const hay = `${item.title} ${item.city} ${item.tag} ${item.body}`.toLowerCase();
  const okFilter = filter === "all" || item.category === filter;
  return okFilter && hay.includes(q);
}

function render() {
  const q = (search.value || "").trim().toLowerCase();
  const items = window.ACTIVITIES.filter((item) => matches(item, q));
  grid.innerHTML = items
    .map(
      (item) => `
      <button class="card" data-id="${item.id}">
        ${item.image ? `<img class="card-img" src="${item.image}" alt="${item.imageAlt || item.title}" loading="lazy" />` : ""}
        <div class="card-body">
          <p class="tag"><span class="activity-icon" aria-hidden="true">${item.icon || categoryIcons[item.category] || "✦"}</span> ${item.tag} &middot; ${item.city}</p>
          <h3>${item.title}</h3>
          <p class="card-duration">${item.duration}</p>
        </div>
      </button>`
    )
    .join("");

  if (!items.length) {
    grid.innerHTML = "<p>Bu süzgeçte rota yok. Aramayı veya kategoriyi değiştir.</p>";
  }
}

function openDetail(id) {
  const item = window.ACTIVITIES.find((a) => a.id === id);
  if (!item) return;
  document.getElementById("d-tag").textContent = `${item.icon || categoryIcons[item.category] || "✦"} ${item.tag} \u00b7 ${item.city}`;
  document.getElementById("d-title").textContent = item.title;
  document.getElementById("d-meta").textContent = item.duration;
  document.getElementById("d-body").textContent = item.body;
  document.getElementById("d-tip").textContent = `\u0130pucu: ${item.tip}`;
  document.getElementById("d-map-link").href = mapsSearchUrl(item);
  dialog.showModal();
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    filter = chip.dataset.filter;
    render();
  });
});

search.addEventListener("input", render);

grid.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (card) openDetail(card.dataset.id);
});

dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

document.querySelector(".close").addEventListener("click", () => dialog.close());

render();


// Lightweight photo tour preview: motion over still images, ready for later 360° scenes.
const tourScene = document.getElementById("tour-scene");
if (tourScene) {
  const tourSlides = window.ACTIVITIES.filter((item) => item.image);
  const tourImage = document.getElementById("tour-image");
  const tourStops = document.getElementById("tour-stops");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let tourIndex = 0;
  let tourTimer = null;
  let tourPlaying = !reducedMotion;

  function showTourSlide(index) {
    if (!tourSlides.length) return;
    tourIndex = (index + tourSlides.length) % tourSlides.length;
    const item = tourSlides[tourIndex];
    tourScene.classList.remove("is-moving");
    tourImage.src = item.image;
    tourImage.alt = item.imageAlt || `${item.city} destinasyon görünümü`;
    document.getElementById("tour-location").textContent = `${item.city} · ${item.tag}`;
    document.getElementById("tour-title").textContent = item.title;
    document.getElementById("tour-description").textContent = item.body;
    document.getElementById("tour-duration").textContent = `◷ ${item.duration}`;
    document.getElementById("tour-category").textContent = `${item.icon || categoryIcons[item.category] || "✦"} ${item.tag}`;
    document.getElementById("tour-tip").textContent = `Gezi notu: ${item.tip}`;
    document.getElementById("tour-map-link").href = mapsSearchUrl(item);
    document.getElementById("tour-counter").textContent = `${tourIndex + 1} / ${tourSlides.length}`;
    tourStops.querySelectorAll("button").forEach((button, i) => {
      const active = i === tourIndex;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "true" : "false");
    });
    requestAnimationFrame(() => tourScene.classList.add("is-moving"));
  }

  function setTourPlaying(playing) {
    tourPlaying = playing;
    const button = document.getElementById("tour-toggle");
    button.textContent = playing ? "⏸ Duraklat" : "▶ Oynat";
    button.setAttribute("aria-pressed", String(playing));
    if (tourTimer) window.clearInterval(tourTimer);
    tourTimer = playing ? window.setInterval(() => showTourSlide(tourIndex + 1), 8000) : null;
  }

  tourStops.innerHTML = tourSlides.map((item, i) => `<button type="button" class="tour-stop" data-index="${i}" aria-label="${item.city}: ${item.title}" aria-current="false"><img src="${item.image}" alt="" loading="lazy"><span>${item.city}<small>${item.tag} · ${item.duration}</small></span></button>`).join("");
  tourStops.addEventListener("click", (event) => {
    const stop = event.target.closest("button[data-index]");
    if (stop) { showTourSlide(Number(stop.dataset.index)); setTourPlaying(false); }
  });
  document.getElementById("tour-prev").addEventListener("click", () => showTourSlide(tourIndex - 1));
  document.getElementById("tour-next").addEventListener("click", () => showTourSlide(tourIndex + 1));
  document.getElementById("tour-toggle").addEventListener("click", () => setTourPlaying(!tourPlaying));
  showTourSlide(0);
  setTourPlaying(tourPlaying);
}
