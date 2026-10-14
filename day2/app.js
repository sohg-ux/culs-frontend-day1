const placeGrid = document.querySelector("#place-grid");
const statusMessage = document.querySelector("#places-status");
const filterButtons = document.querySelectorAll("[data-filter]");

let places = [];

function createPlaceCard(place, index) {
  const article = document.createElement("article");
  article.className = "place-card";

  const number = document.createElement("span");
  number.className = "place-number";
  number.setAttribute("aria-hidden", "true");
  number.textContent = String(index + 1).padStart(2, "0");

  const content = document.createElement("div");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const meta = document.createElement("div");
  const category = document.createElement("span");
  const duration = document.createElement("span");

  title.textContent = place.name;
  description.textContent = place.description;
  meta.className = "place-meta";
  category.textContent = place.categoryLabel;
  duration.textContent = place.duration;
  meta.append(category, duration);
  content.append(title, description, meta);
  article.append(number, content);

  return article;
}

function renderPlaces(filter = "all") {
  const visiblePlaces = filter === "all"
    ? places
    : places.filter((place) => place.category === filter);

  placeGrid.replaceChildren(
    ...visiblePlaces.map((place, index) => createPlaceCard(place, index))
  );

  statusMessage.textContent = `${visiblePlaces.length} ${visiblePlaces.length === 1 ? "place" : "places"} shown.`;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    renderPlaces(button.dataset.filter);
  });
});

async function loadPlaces() {
  try {
    const response = await fetch("data/places.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    places = await response.json();
    renderPlaces();
  } catch (error) {
    statusMessage.textContent = "The places could not be loaded. Please run the project through a local web server.";
    console.error("Unable to load place data:", error);
  }
}

loadPlaces();
