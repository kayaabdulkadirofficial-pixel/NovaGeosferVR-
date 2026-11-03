const grid = document.getElementById("grid");
const search = document.getElementById("search");
const dialog = document.getElementById("detail");
const chips = document.querySelectorAll(".chip");

let filter = "all";

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
        ${item.image ? `<img class="card-img" src="${item.image}" alt="${item.title}" loading="lazy" />` : ""}
        <div class="card-body">
          <p class="tag">${item.tag} &middot; ${item.city}</p>
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
  document.getElementById("d-tag").textContent = `${item.tag} \u00b7 ${item.city}`;
  document.getElementById("d-title").textContent = item.title;
  document.getElementById("d-meta").textContent = item.duration;
  document.getElementById("d-body").textContent = item.body;
  document.getElementById("d-tip").textContent = `\u0130pucu: ${item.tip}`;
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
