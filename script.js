/* =====================================================================
   script.js

   The page (index.html) has EMPTY containers. This file:
     1. holds all your content as plain data,
     2. turns that data into HTML and puts it in those containers,
     3. reacts to clicks and typing (search, filters, pins, theme).

   To add a project later you only touch SECTION 1. Nothing else changes.
   ===================================================================== */

/* ---------------------------------------------------------------------
   SECTION 1: YOUR CONTENT
   An array [ ... ] is a list. Each { ... } is an object: a bundle of
   "name: value" pairs. Replace all of this example content with your own.
   --------------------------------------------------------------------- */

const EMAIL = "";

const projects = [
  {
    id: "dns-stack", // short unique name, no spaces
    title: "Pi-hole + Unbound DNS stack",
    tag: "homelab",
    date: "2026-09-14", // year-month-day, so sorting works
    summary:
      "A recursive, ad-blocking DNS stack with observability and safe fallbacks.",
    tech: ["Docker", "Linux", "DNS"],
    pinned: true, // starts pinned to the top
    cover: "DNS / 10.0.0.1", // text on the little display
    url: "https://github.com/", // optional: leave this line out if there is no link
  },
];

const skills = ["Linux", "Docker", "Networking", "C#", "Python"];

// status must be exactly one of: "completed", "in progress", "attended"
// (the CSS has a colour for each of those three)
const achievements = [
  {
    year: "2026",
    title: "BSc Computer Science, year 1",
    issuer: "Ulster University, Belfast",
    status: "in progress",
  },
];

/* ---------------------------------------------------------------------
   SECTION 2: FIND THE ELEMENTS WE NEED
   document.querySelector("#something") means: "find the element on the
   page whose id is 'something'". We store each in a const to use later.
   --------------------------------------------------------------------- */

const grid = document.querySelector("#project-grid");
const filtersBox = document.querySelector("#filters");
const searchInput = document.querySelector("#search");
const countLabel = document.querySelector("#project-count");
const emptyState = document.querySelector("#empty-state");
const skillList = document.querySelector("#skill-list");
const achievementList = document.querySelector("#achievement-list");
const themeButton = document.querySelector("#theme-toggle");
const copyButton = document.querySelector("#copy-email");
const clock = document.querySelector("#uk-clock");
const yearLabel = document.querySelector("#year");

/* ---------------------------------------------------------------------
   SECTION 3: STATE
   "State" is just the things that can change while the page is open.
   `let` (not const) means we are allowed to change the value later.
   --------------------------------------------------------------------- */

let searchText = ""; // what the visitor has typed in the search box
let activeTag = "all"; // which filter button is selected

/* ---------------------------------------------------------------------
   SECTION 4: PINS (remembered between visits)
   localStorage is a tiny notepad the browser keeps for your site.
   try/catch means: "if this fails (private mode, for example), carry on".
   --------------------------------------------------------------------- */

const PIN_KEY = "portfolio-pins";

function loadPins() {
  try {
    const saved = JSON.parse(localStorage.getItem(PIN_KEY));
    if (Array.isArray(saved)) {
      // For every project, pinned is true only if its id is in the saved list
      projects.forEach(function (p) {
        p.pinned = saved.includes(p.id);
      });
    }
  } catch (error) {
    // nothing saved yet, or storage blocked: keep the defaults from Section 1
  }
}

function savePins() {
  try {
    const pinnedIds = projects.filter((p) => p.pinned).map((p) => p.id);
    localStorage.setItem(PIN_KEY, JSON.stringify(pinnedIds));
  } catch (error) {
    // ignore
  }
}

/* ---------------------------------------------------------------------
   SECTION 5: BUILDING THE PROJECT CARDS
   A "template literal" is text inside backticks `like this`. Anything in
   ${ ... } is swapped for a real value. That is how one data object
   becomes one chunk of HTML.
   --------------------------------------------------------------------- */

function cardHTML(p) {
  // Optional field: only build the link if the project actually has a url.
  // Without this check the page would print the word "undefined".
  const link = p.url
    ? `<a class="read-link" href="${p.url}" target="_blank" rel="noreferrer">cat README.md</a>`
    : "";

  // .map() turns each tech name into an <li>, .join("") glues them together
  const chips = p.tech.map((t) => `<li>${t}</li>`).join("");

  // Eight little "network ports" for decoration
  const ports = "<i></i>".repeat(8);

  return `
    <article class="unit ${p.pinned ? "is-pinned" : ""}" data-tag="${p.tag}">
      <div class="unit-head">
        <span class="led"></span>
        <span class="tape">${p.tag}</span>
        <span class="serial">${p.date}</span>
        <button class="pin" type="button" data-id="${p.id}" aria-pressed="${p.pinned}">
          ${p.pinned ? "pinned" : "pin"}
        </button>
      </div>
      <div class="unit-display"><span>${p.cover}</span></div>
      <div class="ports" aria-hidden="true">${ports}</div>
      <div class="unit-body">
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
        <ul class="chips">${chips}</ul>
        ${link}
      </div>
    </article>`;
}

// Pinned projects first, then newest first
function sortProjects(list) {
  return [...list].sort(function (a, b) {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return b.date.localeCompare(a.date); // "2026-09" sorts after "2026-08"
  });
}

function renderProjects() {
  const needle = searchText.toLowerCase();

  // Keep only projects that match the selected tag AND the search text
  const visible = projects.filter(function (p) {
    const matchesTag = activeTag === "all" || p.tag === activeTag;
    const haystack =
      `${p.title} ${p.tag} ${p.summary} ${p.tech.join(" ")}`.toLowerCase();
    return matchesTag && haystack.includes(needle);
  });

  grid.innerHTML = sortProjects(visible).map(cardHTML).join("");
  countLabel.textContent = `${visible.length}/${projects.length} repos`;
  emptyState.hidden = visible.length > 0; // show the message only when nothing matched
}

/* ---------------------------------------------------------------------
   SECTION 6: FILTER BUTTONS
   Built from the tags in your data, so a new tag = a new button for free.
   --------------------------------------------------------------------- */

function renderFilters() {
  // A Set removes duplicates: ["devops","devops"] becomes just "devops"
  const tags = ["all", ...new Set(projects.map((p) => p.tag))];

  filtersBox.innerHTML = tags
    .map(function (tag) {
      const cls = tag === activeTag ? "active" : "";
      return `<button type="button" class="${cls}" data-tag="${tag}">${tag}</button>`;
    })
    .join("");
}

/* ---------------------------------------------------------------------
   SECTION 7: SKILLS AND ACHIEVEMENTS
   --------------------------------------------------------------------- */

function renderSkills() {
  // "ii" is how Debian's package list marks something as installed
  skillList.innerHTML = skills.map((s) => `<li><b>ii</b> ${s}</li>`).join("");
}

function renderAchievements() {
  achievementList.innerHTML = achievements
    .map(function (a) {
      const statusClass = a.status.replace(" ", "-"); // "in progress" -> "in-progress"
      return `
      <div class="log-row">
        <span class="log-year">${a.year}</span>
        <div>
          <h3>${a.title}</h3>
          <p>${a.issuer}</p>
        </div>
        <span class="status ${statusClass}"><i></i>${a.status}</span>
      </div>`;
    })
    .join("");
}

/* ---------------------------------------------------------------------
   SECTION 8: EVENTS (reacting to the visitor)
   addEventListener("click", function) = "when this is clicked, run this".
   --------------------------------------------------------------------- */

// Typing in the search box
searchInput.addEventListener("input", function () {
  searchText = searchInput.value;
  renderProjects();
});

// Clicking a filter button.
// We listen on the whole row (not each button) because the buttons are
// rebuilt every time. This trick is called "event delegation".
filtersBox.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return; // the click was not on a button
  activeTag = button.dataset.tag; // reads data-tag="..." from the HTML
  renderFilters();
  renderProjects();
});

// Clicking a pin button (same delegation trick, on the grid)
grid.addEventListener("click", function (event) {
  const button = event.target.closest(".pin");
  if (!button) return;
  const project = projects.find((p) => p.id === button.dataset.id);
  project.pinned = !project.pinned; // ! flips true to false and back
  savePins();
  renderProjects();
});

// Press "/" anywhere to jump to the search box
document.addEventListener("keydown", function (event) {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault(); // stop the "/" from being typed
    searchInput.focus();
  }
});

/* ---------------------------------------------------------------------
   SECTION 9: THEME TOGGLE
   We put data-theme="dark" or "light" on the <html> tag. The CSS has a
   different set of colours for each. That is all the toggle has to do.
   --------------------------------------------------------------------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = `theme: ${theme}`;
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch (error) {
    // ignore
  }
}

themeButton.addEventListener("click", function () {
  const current = document.documentElement.dataset.theme;
  applyTheme(current === "dark" ? "light" : "dark");
});

let savedTheme = "dark"; // dark by default
try {
  savedTheme = localStorage.getItem("portfolio-theme") || "dark";
} catch (error) {
  // ignore
}
applyTheme(savedTheme);

/* ---------------------------------------------------------------------
   SECTION 10: SMALL EXTRAS
   --------------------------------------------------------------------- */

// Copy email. If the browser refuses (it needs https or localhost),
// we just show the address instead so nobody is stuck.
copyButton.addEventListener("click", async function () {
  try {
    await navigator.clipboard.writeText(EMAIL);
    copyButton.textContent = "copied";
  } catch (error) {
    copyButton.textContent = EMAIL;
  }
  setTimeout(function () {
    copyButton.textContent = "copy email";
  }, 1800);
});

// Live UK time (Europe/London handles GMT/BST switching for us)
function updateClock() {
  clock.textContent = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
updateClock();
setInterval(updateClock, 30000); // refresh every 30 seconds

yearLabel.textContent = new Date().getFullYear();

/* ---------------------------------------------------------------------
   SECTION 11: START EVERYTHING
   Functions only run when called. These calls draw the page the first time.
   --------------------------------------------------------------------- */

loadPins();
renderFilters();
renderProjects();
renderSkills();
renderAchievements();
