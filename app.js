const elements = {
  list: document.querySelector("#herb-list"),
  emptyList: document.querySelector("#empty-list"),
  detail: document.querySelector("#herb-detail"),
  status: document.querySelector("#app-status"),
  connection: document.querySelector("#connection-status"),
  search: document.querySelector("#herb-search"),
  favouritesOnly: document.querySelector("#favourites-only")
}

const state = {
  herbs: [],
  currentSlug: null,
  query: "",
  favouritesOnly: false,
  favourites: readFavourites(),
  requestId: 0
}

function createElement(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function readFavourites() {
  try {
    const saved = JSON.parse(localStorage.getItem("little-herb-garden-favourites") || "[]")
    return new Set(Array.isArray(saved) ? saved : [])
  } catch {
    return new Set()
  }
}

function saveFavourites() {
  try {
    localStorage.setItem("little-herb-garden-favourites", JSON.stringify([...state.favourites]))
  } catch {
    showStatus("Favourite changed for this visit, but the browser could not save it.", "warning")
  }
}

function showStatus(message, type = "info") {
  elements.status.textContent = message
  elements.status.dataset.type = type
}

function updateConnectionStatus() {
  const online = navigator.onLine
  elements.connection.textContent = online ? "Server connection available" : "You appear to be offline"
  elements.connection.classList.toggle("is-offline", !online)
}

function getSlugFromHash() {
  return decodeURIComponent(location.hash.slice(1)).trim().toLowerCase()
}

function filteredHerbs() {
  const query = state.query.trim().toLowerCase()
  return state.herbs.filter((herb) => {
    const matchesSearch = !query || herb.name.toLowerCase().includes(query) || herb.latin.toLowerCase().includes(query)
    const matchesFavourite = !state.favouritesOnly || state.favourites.has(herb.slug)
    return matchesSearch && matchesFavourite
  })
}

function renderHerbMenu() {
  const herbs = filteredHerbs()
  const items = herbs.map((herb) => {
    const item = createElement("li")
    const link = createElement("a")
    const name = createElement("span", "herb-link-name", herb.name)
    const latin = createElement("span", "herb-link-latin", herb.latin)
    const favourite = createElement("span", "herb-link-favourite", state.favourites.has(herb.slug) ? "★" : "")
    favourite.setAttribute("aria-hidden", "true")
    link.href = `#${herb.slug}`
    link.append(name, latin, favourite)
    if (herb.slug === state.currentSlug) link.setAttribute("aria-current", "page")
    item.append(link)
    return item
  })
  elements.list.replaceChildren(...items)
  elements.emptyList.hidden = herbs.length > 0
}

function validateHerb(herb) {
  const fields = ["slug", "name", "latin", "summary", "use", "life", "sun", "water", "harvest", "difficulty", "colour"]
  return fields.every((field) => typeof herb[field] === "string" && herb[field].trim())
}

function createFact(term, description) {
  const wrapper = createElement("div", "fact")
  wrapper.append(createElement("dt", "fact-label", term), createElement("dd", "fact-value", description))
  return wrapper
}

function findNeighbour(direction) {
  const index = state.herbs.findIndex((herb) => herb.slug === state.currentSlug)
  const nextIndex = (index + direction + state.herbs.length) % state.herbs.length
  return state.herbs[nextIndex]
}

function renderHerb(herb) {
  const headingGroup = createElement("div", "detail-heading")
  const nameGroup = createElement("div")
  const name = createElement("h3", "herb-name", herb.name)
  const latin = createElement("p", "herb-latin", herb.latin)
  const favouriteButton = createElement("button", "favourite-button")
  const isFavourite = state.favourites.has(herb.slug)
  favouriteButton.type = "button"
  favouriteButton.setAttribute("aria-pressed", String(isFavourite))
  favouriteButton.textContent = isFavourite ? "★ Saved favourite" : "☆ Save favourite"
  favouriteButton.addEventListener("click", toggleCurrentFavourite)
  nameGroup.append(name, latin)
  headingGroup.append(nameGroup, favouriteButton)

  const summary = createElement("p", "herb-summary", herb.summary)
  const facts = createElement("dl", "facts")
  facts.append(
    createFact("Kitchen use", herb.use),
    createFact("Life cycle", herb.life),
    createFact("Sun", herb.sun),
    createFact("Water", herb.water),
    createFact("Harvest", herb.harvest),
    createFact("Difficulty", herb.difficulty)
  )

  const previous = findNeighbour(-1)
  const next = findNeighbour(1)
  const navigation = createElement("nav", "detail-navigation")
  navigation.setAttribute("aria-label", "Previous and next herb")
  const previousLink = createElement("a", "previous-herb", `← ${previous.name}`)
  const nextLink = createElement("a", "next-herb", `${next.name} →`)
  previousLink.href = `#${previous.slug}`
  nextLink.href = `#${next.slug}`
  navigation.append(previousLink, nextLink)

  elements.detail.replaceChildren(headingGroup, summary, facts, navigation)
  elements.detail.style.setProperty("--herb-colour", herb.colour)
  elements.detail.setAttribute("aria-busy", "false")
  document.title = `${herb.name} | The Little Herb Garden`
}

function renderError(title, message, linkText = "Open basil", linkHash = "#basil") {
  const panel = createElement("div", "error-panel")
  const link = createElement("a", "primary-link", linkText)
  link.href = linkHash
  panel.append(createElement("h3", "", title), createElement("p", "", message), link)
  elements.detail.replaceChildren(panel)
  elements.detail.setAttribute("aria-busy", "false")
}

function toggleCurrentFavourite() {
  if (!state.currentSlug) return
  if (state.favourites.has(state.currentSlug)) state.favourites.delete(state.currentSlug)
  else state.favourites.add(state.currentSlug)
  saveFavourites()
  renderHerbMenu()
  loadHerb(state.currentSlug)
}

async function loadHerb(slug) {
  if (location.protocol === "file:") {
    showStatus("A web server is required.", "error")
    renderError("No web server detected", "This application fetches JSON data. Run ‘npx serve’ in the project folder and open the HTTP address it prints.")
    return
  }

  const listedHerb = state.herbs.find((herb) => herb.slug === slug)
  if (!listedHerb) {
    state.currentSlug = null
    renderHerbMenu()
    showStatus(`Unknown herb: ${slug || "empty address"}.`, "error")
    renderError("That herb is not in this garden", "Check the address or choose one of the eight herbs from the list.")
    return
  }

  const requestId = ++state.requestId
  state.currentSlug = slug
  renderHerbMenu()
  elements.detail.setAttribute("aria-busy", "true")
  elements.detail.replaceChildren(createElement("p", "loading-card", `Loading ${listedHerb.name}…`))
  showStatus(`Requesting data/${slug}.json from the server…`)

  try {
    const response = await fetch(`data/${encodeURIComponent(slug)}.json`, { cache: "no-store" })
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
    const herb = await response.json()
    if (!validateHerb(herb) || herb.slug !== slug) throw new Error("The JSON file has an invalid format")
    if (requestId !== state.requestId) return
    renderHerb(herb)
    showStatus(`${herb.name} loaded from data/${slug}.json.`, "success")
  } catch (error) {
    if (requestId !== state.requestId) return
    showStatus(`Could not load data/${slug}.json.`, "error")
    renderError(`${listedHerb.name} could not be loaded`, `The file may be missing or the server may be unavailable. Technical detail: ${error.message}`, "Try basil instead")
  }
}

function loadFromHash() {
  const slug = getSlugFromHash() || state.herbs[0]?.slug
  if (!getSlugFromHash() && slug) history.replaceState(null, "", `#${slug}`)
  if (slug) loadHerb(slug)
}

async function initialise() {
  updateConnectionStatus()
  if (location.protocol === "file:") {
    await loadHerb("")
    return
  }
  try {
    const response = await fetch("data/herbs.json", { cache: "no-store" })
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
    const herbs = await response.json()
    if (!Array.isArray(herbs) || !herbs.length) throw new Error("The herb index is empty or invalid")
    state.herbs = herbs
    renderHerbMenu()
    loadFromHash()
  } catch (error) {
    showStatus("The herb index could not be loaded.", "error")
    renderError("The garden is unavailable", `The server did not provide data/herbs.json. Technical detail: ${error.message}`)
  }
}

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value
  renderHerbMenu()
})

elements.favouritesOnly.addEventListener("change", (event) => {
  state.favouritesOnly = event.target.checked
  renderHerbMenu()
})

window.addEventListener("hashchange", loadFromHash)
window.addEventListener("online", updateConnectionStatus)
window.addEventListener("offline", updateConnectionStatus)

document.addEventListener("keydown", (event) => {
  const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  if (event.key === "/" && !isTyping) {
    event.preventDefault()
    elements.search.focus()
  }
  if (event.key === "Escape" && document.activeElement === elements.search) {
    elements.search.value = ""
    state.query = ""
    renderHerbMenu()
    elements.search.blur()
  }
})

initialise()
