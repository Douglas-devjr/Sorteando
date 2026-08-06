const STORAGE_KEYS = {
  people: "sorteando_people",
  history: "sorteando_history",
};

let people = loadPeople();
let history = loadHistory();

function loadPeople() {
  const raw = localStorage.getItem(STORAGE_KEYS.people);
  if (!raw) return structuredClone(DEFAULT_PEOPLE);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (e) {}
  return structuredClone(DEFAULT_PEOPLE);
}

function loadHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.history);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  return [];
}

function savePeople() {
  localStorage.setItem(STORAGE_KEYS.people, JSON.stringify(people));
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

function getLastDrawFor(personId) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].personId === personId) return history[i];
  }
  return null;
}

function drawThemeFor(personId) {
  const person = people.find((p) => p.id === personId);
  if (!person) return;

  const course = COURSES[person.courseId];
  const usedThemes = new Set(
    history.filter((h) => h.courseId === person.courseId).map((h) => h.theme)
  );

  let available = course.themes.filter((t) => !usedThemes.has(t));
  let cycleRestarted = false;
  if (available.length === 0) {
    available = course.themes.slice();
    cycleRestarted = true;
  }

  const theme = available[Math.floor(Math.random() * available.length)];

  history.push({
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    personId,
    courseId: person.courseId,
    theme,
    date: new Date().toISOString(),
    done: false,
  });
  saveHistory();

  if (cycleRestarted) {
    window.setTimeout(() => {
      alert(
        `Todos os temas de ${course.name} já foram sorteados! O ciclo reiniciou e os temas podem se repetir a partir de agora.`
      );
    }, 50);
  }

  render();
}

function toggleDone(historyId) {
  const entry = history.find((h) => h.id === historyId);
  if (!entry) return;
  entry.done = !entry.done;
  saveHistory();
  render();
}

function clearHistoryForCourse(courseId) {
  const course = COURSES[courseId];
  const ok = confirm(
    `Tem certeza que deseja apagar todo o histórico de ${course.name}? Isso não pode ser desfeito.`
  );
  if (!ok) return;
  history = history.filter((h) => h.courseId !== courseId);
  saveHistory();
  render();
}

function updatePersonName(personId, newName) {
  const person = people.find((p) => p.id === personId);
  if (!person) return;
  person.name = newName.trim() || person.name;
  savePeople();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function renderPeopleGrid() {
  const grid = document.getElementById("people-grid");
  grid.innerHTML = "";

  people.forEach((person) => {
    const course = COURSES[person.courseId];
    const lastDraw = getLastDrawFor(person.id);

    const card = document.createElement("div");
    card.className = "person-card";
    card.style.setProperty("--course-color", course.color);

    const nameRow = document.createElement("div");
    nameRow.className = "name-row";
    const nameInput = document.createElement("input");
    nameInput.className = "name-input";
    nameInput.type = "text";
    nameInput.value = person.name;
    nameInput.setAttribute("aria-label", "Nome");
    nameInput.addEventListener("change", (e) =>
      updatePersonName(person.id, e.target.value)
    );
    nameRow.appendChild(nameInput);

    const badge = document.createElement("span");
    badge.className = "course-badge";
    badge.textContent = `${course.emoji} ${course.name}`;

    const themeDisplay = document.createElement("div");
    if (lastDraw) {
      themeDisplay.className = "theme-display";
      themeDisplay.innerHTML = `${lastDraw.theme}<span class="theme-date">Sorteado em ${formatDate(
        lastDraw.date
      )}</span>`;
    } else {
      themeDisplay.className = "theme-display placeholder";
      themeDisplay.textContent = "Nenhum tema sorteado ainda";
    }

    const drawBtn = document.createElement("button");
    drawBtn.className = "btn btn-draw";
    drawBtn.textContent = "🎲 Sortear tema";
    drawBtn.addEventListener("click", () => drawThemeFor(person.id));

    card.appendChild(nameRow);
    card.appendChild(badge);
    card.appendChild(themeDisplay);
    card.appendChild(drawBtn);
    grid.appendChild(card);
  });
}

function renderHistoryGrid() {
  const grid = document.getElementById("history-grid");
  grid.innerHTML = "";

  Object.keys(COURSES).forEach((courseId) => {
    const course = COURSES[courseId];
    const entries = history
      .filter((h) => h.courseId === courseId)
      .slice()
      .reverse();

    const col = document.createElement("div");
    col.className = "history-col";
    col.style.setProperty("--course-color", course.color);

    const header = document.createElement("div");
    header.className = "history-col-header";
    const h3 = document.createElement("h3");
    h3.textContent = `${course.emoji} ${course.name}`;
    header.appendChild(h3);

    if (entries.length) {
      const clearBtn = document.createElement("button");
      clearBtn.className = "link-btn";
      clearBtn.textContent = "Limpar histórico";
      clearBtn.addEventListener("click", () => clearHistoryForCourse(courseId));
      header.appendChild(clearBtn);
    }

    col.appendChild(header);

    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "history-empty";
      empty.textContent = "Nenhum tema sorteado ainda.";
      col.appendChild(empty);
    } else {
      const list = document.createElement("ul");
      list.className = "history-list";
      entries.forEach((entry) => {
        const person = people.find((p) => p.id === entry.personId);
        const li = document.createElement("li");
        li.className = "history-item" + (entry.done ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = entry.done;
        checkbox.setAttribute(
          "aria-label",
          entry.done ? "Marcar como não ensinado" : "Marcar como ensinado"
        );
        checkbox.addEventListener("change", () => toggleDone(entry.id));

        const textWrap = document.createElement("div");
        textWrap.className = "item-text";
        const themeSpan = document.createElement("span");
        themeSpan.textContent = entry.theme;
        const metaSpan = document.createElement("span");
        metaSpan.className = "item-meta";
        metaSpan.textContent = `${person ? person.name : "?"} · ${formatDate(
          entry.date
        )}`;
        textWrap.appendChild(themeSpan);
        textWrap.appendChild(metaSpan);

        li.appendChild(checkbox);
        li.appendChild(textWrap);
        list.appendChild(li);
      });
      col.appendChild(list);
    }

    grid.appendChild(col);
  });
}

function render() {
  renderPeopleGrid();
  renderHistoryGrid();
}

document.getElementById("draw-both-btn").addEventListener("click", () => {
  people.forEach((p) => drawThemeFor(p.id));
});

render();
