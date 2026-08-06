let people = [];
let history = [];
let supabaseClient = null;

function isConfigured() {
  return (
    typeof SUPABASE_URL === "string" &&
    typeof SUPABASE_ANON_KEY === "string" &&
    !SUPABASE_URL.includes("YOUR-PROJECT") &&
    !SUPABASE_ANON_KEY.includes("YOUR-ANON-PUBLIC-KEY")
  );
}

function showSetupBanner() {
  document.getElementById("setup-banner").hidden = false;
}

function rowToPerson(r) {
  return { id: r.id, name: r.name, courseId: r.course_id };
}

function rowToHistoryEntry(r) {
  return {
    id: r.id,
    personId: r.person_id,
    courseId: r.course_id,
    theme: r.theme,
    date: r.date,
    done: r.done,
  };
}

async function fetchPeople() {
  const { data, error } = await supabaseClient.from("people").select("*").order("id");
  if (error) {
    console.error(error);
    return [];
  }
  if (!data || data.length === 0) {
    const seed = DEFAULT_PEOPLE.map((p) => ({
      id: p.id,
      name: p.name,
      course_id: p.courseId,
    }));
    await supabaseClient.from("people").upsert(seed);
    return DEFAULT_PEOPLE.map((p) => ({ ...p }));
  }
  return data.map(rowToPerson);
}

async function fetchHistory() {
  const { data, error } = await supabaseClient
    .from("history")
    .select("*")
    .order("date", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data.map(rowToHistoryEntry);
}

async function refreshAll() {
  [people, history] = await Promise.all([fetchPeople(), fetchHistory()]);
  render();
}

function getLastDrawFor(personId) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].personId === personId) return history[i];
  }
  return null;
}

async function drawThemeFor(personId) {
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

  const { error } = await supabaseClient.from("history").insert({
    person_id: personId,
    course_id: person.courseId,
    theme,
    done: false,
  });

  if (error) {
    console.error(error);
    alert("Não foi possível salvar o sorteio. Verifique sua conexão/configuração do Supabase.");
    return;
  }

  if (cycleRestarted) {
    window.setTimeout(() => {
      alert(
        `Todos os temas de ${course.name} já foram sorteados! O ciclo reiniciou e os temas podem se repetir a partir de agora.`
      );
    }, 50);
  }

  await refreshAll();
}

async function toggleDone(historyId) {
  const entry = history.find((h) => h.id === historyId);
  if (!entry) return;
  const { error } = await supabaseClient
    .from("history")
    .update({ done: !entry.done })
    .eq("id", historyId);
  if (error) {
    console.error(error);
    return;
  }
  await refreshAll();
}

async function clearHistoryForCourse(courseId) {
  const course = COURSES[courseId];
  const ok = confirm(
    `Tem certeza que deseja apagar todo o histórico de ${course.name}? Isso não pode ser desfeito.`
  );
  if (!ok) return;
  const { error } = await supabaseClient.from("history").delete().eq("course_id", courseId);
  if (error) {
    console.error(error);
    return;
  }
  await refreshAll();
}

async function updatePersonName(personId, newName) {
  const trimmed = newName.trim();
  if (!trimmed) return;
  const { error } = await supabaseClient
    .from("people")
    .update({ name: trimmed })
    .eq("id", personId);
  if (error) {
    console.error(error);
    return;
  }
  await refreshAll();
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

async function init() {
  if (!isConfigured()) {
    showSetupBanner();
    return;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  await refreshAll();

  supabaseClient
    .channel("sorteando-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "history" }, refreshAll)
    .on("postgres_changes", { event: "*", schema: "public", table: "people" }, refreshAll)
    .subscribe();
}

init();
