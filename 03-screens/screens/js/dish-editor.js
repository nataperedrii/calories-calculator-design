// Dish detail: view and edit the dish name, ingredients and method (steps), with live recalculation.
// Data (foods per 100 g from USDA, ingredients, steps, budgets) comes from the JSON block #dish-data that
// 03-screens/tools/build_screens.py writes, so the numbers match every other screen.
// <body data-state="…"> picks a starting state for the PNG exports:
//   view · edit · edited · deleted · name-error · saving · discard · method · steps-edit · step-error · step-deleted · no-steps · servings
(() => {
  const data = JSON.parse(document.getElementById("dish-data").textContent);
  const $ = (id) => document.getElementById(id);
  const ARC = 351.86; // length of the ring's half circle (radius 112)
  const NAME_MAX = data.nameMax;
  const UNITS = ["g", "ml", "portion"];

  let uid = 0;
  const withIds = (list) => list.map((i) => ({ ...i, id: ++uid }));
  const clone = (list) => list.map((i) => ({ ...i }));
  let saved = { ingredients: withIds(data.ingredients), steps: withIds(data.steps.map((text) => ({ text }))) };
  let work = { ingredients: clone(saved.ingredients), steps: clone(saved.steps) };
  let mode = "view";
  let lastDeleted = null; // { kind: "ingredients" | "steps", item, index }
  let dishName = data.name;
  let servings = 1; // the Servings stepper scales the ingredient list in view mode; the summary stays per portion

  const r0 = (x) => Math.round(x); // half up for the positive values used here
  const r1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
  const fmt = (x) => x.toLocaleString("en-US");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const qtyOf = (ing) => Number(String(ing.qty).replace(",", "."));
  const icon = (n) => `<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  // ---------- maths ----------
  function grams(ing) {
    const food = data.foods[ing.name];
    const q = qtyOf(ing);
    if (!food || !(q > 0) || q > 5000) return null;
    if (ing.unit === "ml") return q * food.density;
    if (ing.unit === "portion") return q * food.portion;
    return q;
  }
  function nutrition(ing) {
    const g = grams(ing);
    if (g === null) return null;
    const f = data.foods[ing.name];
    return { g, kcal: r0((f.kcal * g) / 100), p: (f.p * g) / 100, f: (f.f * g) / 100, c: (f.c * g) / 100 };
  }
  function totals(list) {
    const t = { kcal: 0, p: 0, f: 0, c: 0, g: 0, allergens: new Set() };
    for (const ing of list) {
      const n = nutrition(ing);
      if (!n) continue;
      for (const k of ["kcal", "p", "f", "c", "g"]) t[k] += n[k];
      data.foods[ing.name].allergens.forEach((a) => t.allergens.add(a));
    }
    return t;
  }
  const sig = (w) => JSON.stringify([w.ingredients.map(({ name, qty, unit }) => [name, String(qty), unit]), w.steps.map((s) => s.text.trim())]);
  const dirty = () => sig(work) !== sig(saved);

  // ---------- rendering: ingredients ----------
  // Two lines per ingredient: name | amount, then the P / F / C chips (the same macro-chip component as the rest
  // of the app) | kcal. Amount and kcal end on one right edge.
  const macroRow = (n) =>
    `<div class="macro-tiles macro-tiles--inline">` +
    [["p", "P", "Protein", n.p], ["f", "F", "Fat", n.f], ["c", "C", "Carbs", n.c]]
      .map(([k, L, W, v]) => `<span class="macro-tile macro-tile--${k} macro-tile--chip"><span class="macro-tile__label" aria-hidden="true">${L}</span><span class="visually-hidden">${W}</span><span class="macro-tile__value">${r0(v)}<small> g</small></span></span>`)
      .join("") + `</div><span class="ingredient__kcal">${n.kcal} kcal</span>`;
  const portions = (n) => `${fmt(n)} portion${n === 1 ? "" : "s"}`;
  const amountText = (ing, k = 1) => (ing.unit === "portion" ? portions(qtyOf(ing) * k) : `${fmt(Math.round(qtyOf(ing) * k * 10) / 10)} ${ing.unit}`);
  // one ingredient for k servings: amount, kcal and P / F / C all scale
  function scaled(ing, k) {
    const n = nutrition(ing);
    if (!n || k === 1) return n;
    const f = data.foods[ing.name];
    return { g: n.g * k, kcal: r0((f.kcal * n.g * k) / 100), p: n.p * k, f: n.f * k, c: n.c * k };
  }

  function ingView(ing) {
    const n = scaled(ing, servings);
    return `<li class="ingredient" data-id="${ing.id}"><span class="ingredient__name">${esc(ing.name)}</span><span class="ingredient__amount">${amountText(ing, servings)}</span>${n ? macroRow(n) : ""}</li>`;
  }
  function ingEdit(ing) {
    const id = `ing-${ing.id}`;
    const n = nutrition(ing);
    const known = Boolean(data.foods[ing.name]);
    const q = qtyOf(ing);
    const nameErr = ing.touched && !known;
    const qtyErr = ing.touched && !(q > 0 && q <= 5000);
    const help = nameErr ? "Pick a food from the list, for example “Broccoli, boiled”."
      : qtyErr ? "Enter an amount between 1 and 5,000."
      : n ? `${n.kcal} kcal · ${r1(n.g)} g` : "Choose a food and an amount.";
    const units = UNITS.map((u) => `<option value="${u}"${ing.unit === u ? " selected" : ""}>${u}</option>`).join("");
    return `<li class="ingredient ingredient--edit${nameErr || qtyErr ? " is-error" : ""}" data-id="${ing.id}">
      <div class="field ingredient__wide${nameErr ? " is-error" : ""}"><label class="field__label" for="${id}-name">Ingredient</label>
        <div class="field__control"><input id="${id}-name" type="text" data-field="name" list="foods" value="${esc(ing.name)}" autocomplete="off" aria-describedby="${id}-help"${nameErr ? ' aria-invalid="true"' : ""}></div></div>
      <div class="ingredient__fields">
        <div class="field${qtyErr ? " is-error" : ""}"><label class="field__label" for="${id}-qty">Amount</label>
          <div class="field__control"><input id="${id}-qty" data-field="qty" type="text" inputmode="decimal" value="${esc(ing.qty)}" aria-describedby="${id}-help"${qtyErr ? ' aria-invalid="true"' : ""}></div></div>
        <div class="field"><label class="field__label" for="${id}-unit">Unit</label>
          <div class="field__control"><select id="${id}-unit" data-field="unit">${units}</select></div></div>
      </div>
      <button type="button" class="icon-btn" data-delete aria-label="Delete ${esc(ing.name || "this ingredient")}">${icon("trash")}</button>
      <p class="field__help ingredient__wide" id="${id}-help">${help}</p></li>`;
  }

  // ---------- rendering: steps ----------
  function stepView(st, i) {
    return `<li class="recipe-step" data-id="${st.id}"><span class="recipe-step__num" aria-hidden="true">${i + 1}</span><p class="recipe-step__text"><span class="visually-hidden">Step ${i + 1}: </span>${esc(st.text)}</p></li>`;
  }
  function stepEdit(st, i, all) {
    const id = `step-${st.id}`;
    const err = st.touched && !st.text.trim();
    const n = i + 1;
    return `<li class="recipe-step recipe-step--edit${err ? " is-error" : ""}" data-id="${st.id}"><span class="recipe-step__num" aria-hidden="true">${n}</span>
      <div class="field${err ? " is-error" : ""}"><label class="field__label" for="${id}">Step ${n}</label>
        <div class="field__control"><textarea id="${id}" data-step-text rows="3" aria-describedby="${id}-help"${err ? ' aria-invalid="true"' : ""}>${esc(st.text)}</textarea></div>
        <p class="field__help" id="${id}-help">${err ? "Write what to do in this step, or delete it." : "One action per step. Include times and temperatures."}</p></div>
      <div class="recipe-step__actions">
        <button type="button" class="icon-btn" data-move="-1" aria-label="Move step ${n} up"${i === 0 ? " disabled" : ""}>${icon("arrow-up")}</button>
        <button type="button" class="icon-btn" data-move="1" aria-label="Move step ${n} down"${i === all.length - 1 ? " disabled" : ""}>${icon("arrow-down")}</button>
        <button type="button" class="icon-btn" data-delete-step aria-label="Delete step ${n}">${icon("trash")}</button>
      </div></li>`;
  }

  function render(focus) {
    const edit = mode === "edit";
    $("ingredients").innerHTML = (edit ? work.ingredients.map(ingEdit) : work.ingredients.map(ingView)).join("") ||
      `<li class="ingredient"><span class="ingredient__name">No ingredients yet</span></li>`;
    const noSteps = !work.steps.length;
    $("steps").innerHTML = work.steps.map((s, i, a) => (edit ? stepEdit(s, i, a) : stepView(s, i))).join("");
    $("steps").hidden = noSteps;
    $("steps-empty").hidden = !noSteps || edit;
    updateSummary();
    document.body.dataset.mode = mode;
    for (const id of ["edit-toggle", "edit-steps", "foot-view"]) $(id).hidden = edit;
    for (const id of ["add-ingredient", "add-step", "edit-note", "foot-edit"]) $(id).hidden = !edit;
    // editing is per portion: the Servings row hides, and the list shows 1 portion again
    $("servings-row").hidden = edit;
    $("servings-text").textContent = portions(edit ? 1 : servings);
    syncServings();
    if (focus) document.querySelector(focus)?.focus();
  }

  function updateSummary() {
    const t = totals(work.ingredients);
    $("sum-kcal").textContent = fmt(t.kcal);
    $("ring-value").setAttribute("stroke-dasharray", `${Math.round(Math.min(t.kcal / data.budget, 1) * ARC)} 400`);
    $("ring").setAttribute("aria-label", `${fmt(t.kcal)} of ${fmt(data.budget)} kcal left for dinner`);
    $("sum-100").textContent = t.g ? fmt(r0((t.kcal * 100) / t.g)) : "–";
    for (const k of ["p", "f", "c"]) {
      const v = r0(t[k]);
      const goal = data.goal[k];
      const m = document.querySelector(`[data-macro="${k}"]`);
      m.querySelector(".macro__value").firstChild.textContent = v;
      const bar = m.querySelector(".macro__bar");
      bar.setAttribute("aria-valuenow", Math.min(v, goal));
      bar.setAttribute("aria-valuetext", `${v} of ${goal} grams a day`);
      bar.querySelector("i").style.setProperty("--w", `${Math.min(100, Math.round((v / goal) * 100))}%`);
    }
    $("log-btn-kcal").textContent = fmt(t.kcal);
    const list = [...t.allergens];
    $("allergens-text").innerHTML = list.length
      ? `<b>Contains: ${list.join(", ")}.</b> ${data.freeFrom}`
      : `<b>No major allergens</b> in these ingredients. Always check product labels.`;
    return t;
  }

  function syncServings() {
    $("servings-input").value = servings;
    $("servings-unit").textContent = servings === 1 ? "portion" : "portions";
    $("servings-row").querySelector('[data-servings="-1"]').disabled = servings <= 1;
    $("servings-row").querySelector('[data-servings="1"]').disabled = servings >= data.servingsMax;
  }
  function setServings(n, focusBtn) {
    const v = Math.min(data.servingsMax, Math.max(1, Math.round(n) || 1));
    servings = v;
    render();
    // at a limit the pressed button is disabled: keep focus on the stepper (the other button)
    if (focusBtn) {
      const b = $("servings-row").querySelector(`[data-servings="${focusBtn}"]`);
      (b.disabled ? $("servings-row").querySelector(`[data-servings="${-focusBtn}"]`) : b).focus();
    }
    announce(`Ingredients for ${portions(v)}. Nutrition stays per portion: ${fmt(totals(work.ingredients).kcal)} kcal.`);
  }

  function announce(text) {
    const s = $("dish-status");
    s.textContent = "";
    requestAnimationFrame(() => { s.textContent = text; });
  }
  function showToast(msg, undo) {
    const row = $("toast-row");
    row.hidden = false;
    row.innerHTML = `<div class="toast toast--success" role="status">${icon("high")}<span class="toast__msg">${esc(msg)}</span>${undo ? '<button type="button" class="toast__action" data-undo>Undo</button>' : ""}<button type="button" class="toast__close" aria-label="Dismiss" data-dismiss>${icon("close")}</button></div>`;
  }
  function hideToast() { $("toast-row").hidden = true; $("toast-row").innerHTML = ""; }

  // ---------- actions ----------
  function enterEdit(focus) {
    mode = "edit";
    work = { ingredients: clone(saved.ingredients), steps: clone(saved.steps) };
    render(focus);
    announce("Editing the dish. Totals update as you type.");
  }
  function leaveEdit() {
    mode = "view";
    work = { ingredients: clone(saved.ingredients), steps: clone(saved.steps) };
    hideToast();
    render("#edit-toggle");
  }
  function changeCount() {
    let c = 0;
    for (const kind of ["ingredients", "steps"]) {
      const ids = new Set([...saved[kind], ...work[kind]].map((i) => i.id));
      for (const id of ids) {
        const a = saved[kind].find((i) => i.id === id);
        const b = work[kind].find((i) => i.id === id);
        if (!a || !b || JSON.stringify([a.name, String(a.qty), a.unit, a.text]) !== JSON.stringify([b.name, String(b.qty), b.unit, b.text])) c++;
      }
    }
    const order = (w) => w.steps.map((s) => s.id).join();
    if (!c && order(work) !== order(saved)) c = 1;
    return c;
  }
  function requestLeave(after) {
    if (mode === "edit" && dirty()) {
      const c = changeCount();
      $("discard-desc").textContent = `You changed ${c} item${c === 1 ? "" : "s"}. If you leave now, these changes are lost.`;
      $("discard").dataset.after = after;
      $("discard").showModal();
    } else if (after === "back") location.href = data.back;
    else leaveEdit();
  }
  function deleteIngredient(id) {
    const index = work.ingredients.findIndex((i) => i.id === id);
    lastDeleted = { kind: "ingredients", item: work.ingredients[index], index };
    work.ingredients.splice(index, 1);
    const next = work.ingredients[index] ?? work.ingredients[index - 1];
    render(next ? `[data-id="${next.id}"] [data-field="name"]` : "#add-ingredient");
    const name = lastDeleted.item.name || "Ingredient";
    showToast(`${name} deleted`, true);
    announce(`${name} deleted. Now ${totals(work.ingredients).kcal} kcal per portion.`);
  }
  function deleteStep(id) {
    const index = work.steps.findIndex((s) => s.id === id);
    lastDeleted = { kind: "steps", item: work.steps[index], index };
    work.steps.splice(index, 1);
    const next = work.steps[index] ?? work.steps[index - 1];
    render(next ? `[data-id="${next.id}"] [data-step-text]` : "#add-step");
    showToast(`Step ${index + 1} deleted`, true);
    announce(`Step ${index + 1} deleted. ${work.steps.length} steps left.`);
  }
  function undoDelete() {
    if (!lastDeleted) return;
    const { kind, item, index } = lastDeleted;
    work[kind].splice(index, 0, item);
    lastDeleted = null;
    hideToast();
    render(kind === "ingredients" ? `[data-id="${item.id}"] [data-field="name"]` : `[data-id="${item.id}"] [data-step-text]`);
    announce(kind === "ingredients" ? `${item.name} restored. Now ${totals(work.ingredients).kcal} kcal per portion.` : `Step ${index + 1} restored.`);
  }
  function moveStep(id, dir) {
    const i = work.steps.findIndex((s) => s.id === id);
    const j = i + dir;
    if (j < 0 || j >= work.steps.length) return;
    [work.steps[i], work.steps[j]] = [work.steps[j], work.steps[i]];
    // keep focus on the same control; if it is now disabled (top / bottom), use the other move button
    const atEdge = j === 0 || j === work.steps.length - 1;
    render(atEdge ? `[data-id="${id}"] [data-move="${-dir}"]` : `[data-id="${id}"] [data-move="${dir}"]`);
    announce(`Step moved ${dir < 0 ? "up" : "down"}. It is now step ${j + 1} of ${work.steps.length}.`);
  }
  function addIngredient() {
    const ing = { id: ++uid, name: "", qty: "100", unit: "g" };
    work.ingredients.push(ing);
    render(`[data-id="${ing.id}"] [data-field="name"]`);
    announce("New ingredient added. Choose a food and an amount.");
  }
  function addStep() {
    if (mode !== "edit") enterEdit();
    const st = { id: ++uid, text: "" };
    work.steps.push(st);
    render(`[data-id="${st.id}"] [data-step-text]`);
    announce(`Step ${work.steps.length} added.`);
  }
  function validateAll() {
    work.ingredients.forEach((i) => { i.touched = true; });
    work.steps.forEach((s) => { s.touched = true; });
    const badIng = work.ingredients.find((i) => !data.foods[i.name] || !(qtyOf(i) > 0 && qtyOf(i) <= 5000));
    const badStep = work.steps.find((s) => !s.text.trim());
    render(badIng ? `[data-id="${badIng.id}"] [data-field="${data.foods[badIng.name] ? "qty" : "name"}"]` : badStep ? `[data-id="${badStep.id}"] [data-step-text]` : undefined);
    return !badIng && !badStep;
  }
  function save(simulateOnly) {
    if (!validateAll()) { announce("Some fields need a fix before saving."); return; }
    const btn = $("save-edit");
    btn.disabled = true;
    btn.textContent = "Saving…";
    $("foot-edit").setAttribute("aria-busy", "true");
    announce("Saving your changes…");
    if (simulateOnly) return;
    setTimeout(() => {
      const strip = (l) => l.map(({ touched, _t, ...rest }) => rest);
      saved = { ingredients: strip(work.ingredients), steps: strip(work.steps) };
      btn.disabled = false;
      btn.textContent = "Save changes";
      $("foot-edit").removeAttribute("aria-busy");
      mode = "view";
      render("#edit-toggle");
      showToast("Saved as your version of this recipe", false);
      announce(`Saved. ${totals(saved.ingredients).kcal} kcal per portion, ${saved.steps.length} steps.`);
    }, 900);
  }

  // ---------- name editing ----------
  function openName() {
    $("title-view").classList.add("visually-hidden"); // the h1 stays for screen readers
    $("edit-name").hidden = true;
    $("name-form").hidden = false;
    $("name-input").value = dishName;
    nameCheck(false);
    $("name-input").focus();
  }
  function closeName() {
    $("name-form").hidden = true;
    $("title-view").classList.remove("visually-hidden");
    $("edit-name").hidden = false;
    $("edit-name").focus();
  }
  function nameCheck(show) {
    const v = $("name-input").value;
    $("name-count").textContent = `${v.length} / ${NAME_MAX}`;
    let err = "";
    if (!v.trim()) err = "Enter a name, for example “Baked cod with broccoli”.";
    else if (v.length > NAME_MAX) err = `Use ${NAME_MAX} characters or fewer. It's ${v.length} now.`;
    const showErr = Boolean(show && err);
    $("name-field").classList.toggle("is-error", showErr);
    if (showErr) $("name-input").setAttribute("aria-invalid", "true"); else $("name-input").removeAttribute("aria-invalid");
    $("name-help").textContent = showErr ? err : `Up to ${NAME_MAX} characters. Shown in Recipes and your diary.`;
    return !err;
  }

  // ---------- events ----------
  document.addEventListener("click", (e) => {
    const t = e.target;
    const row = t.closest("[data-id]");
    if (t.closest("[data-servings]")) setServings(servings + Number(t.closest("[data-servings]").dataset.servings), Number(t.closest("[data-servings]").dataset.servings));
    else if (t.closest("#edit-toggle")) enterEdit(`[data-field="name"]`);
    else if (t.closest("#edit-steps")) enterEdit("[data-step-text]");
    else if (t.closest("#add-ingredient")) addIngredient();
    else if (t.closest("#add-step, #add-steps-empty")) addStep();
    else if (t.closest("[data-delete]")) deleteIngredient(Number(row.dataset.id));
    else if (t.closest("[data-delete-step]")) deleteStep(Number(row.dataset.id));
    else if (t.closest("[data-move]")) moveStep(Number(row.dataset.id), Number(t.closest("[data-move]").dataset.move));
    else if (t.closest("[data-undo]")) undoDelete();
    else if (t.closest("[data-dismiss]")) hideToast();
    else if (t.closest("#cancel-edit")) requestLeave("view");
    else if (t.closest("#save-edit")) save(false);
    else if (t.closest("#edit-name")) openName();
    else if (t.closest("#name-cancel")) closeName();
    else if (t.closest("#keep-editing")) $("discard").close();
    else if (t.closest("#discard-confirm")) {
      const after = $("discard").dataset.after;
      $("discard").close();
      if (after === "back") location.href = data.back; else leaveEdit();
    }
  });
  // Back: protect unsaved changes. Runs before the generic data-href navigation.
  document.querySelector("[data-dish-back]").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    requestLeave("back");
  }, true);

  $("ingredients").addEventListener("input", (e) => {
    const el = e.target.closest("[data-field]");
    if (!el) return;
    const item = work.ingredients.find((i) => i.id === Number(el.closest("[data-id]").dataset.id));
    item[el.dataset.field] = el.value;
    const t = updateSummary();
    const n = nutrition(item);
    if (n && !item.touched) el.closest(".ingredient").querySelector(".field__help").textContent = `${n.kcal} kcal · ${r1(n.g)} g`;
    clearTimeout(item._t);
    item._t = setTimeout(() => announce(`Now ${t.kcal} kcal per portion.`), 600);
  });
  $("ingredients").addEventListener("change", (e) => {
    const el = e.target.closest("[data-field]");
    if (!el) return;
    const item = work.ingredients.find((i) => i.id === Number(el.closest("[data-id]").dataset.id));
    item.touched = true;
    render(`[data-id="${item.id}"] [data-field="${el.dataset.field}"]`);
  });
  $("steps").addEventListener("input", (e) => {
    const el = e.target.closest("[data-step-text]");
    if (!el) return;
    work.steps.find((s) => s.id === Number(el.closest("[data-id]").dataset.id)).text = el.value;
  });
  $("steps").addEventListener("change", (e) => {
    const el = e.target.closest("[data-step-text]");
    if (!el) return;
    const st = work.steps.find((s) => s.id === Number(el.closest("[data-id]").dataset.id));
    const wasError = st.touched && !st.text.trim();
    st.touched = true;
    if (wasError !== !st.text.trim()) render(`[data-id="${st.id}"] [data-step-text]`);
  });
  // typed servings: whole numbers from 1 to servingsMax; anything else snaps to the nearest valid value
  $("servings-input").addEventListener("change", (e) => setServings(Number(String(e.target.value).replace(",", "."))));
  $("servings-input").addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); setServings(servings + (e.key === "ArrowUp" ? 1 : -1)); $("servings-input").focus(); }
  });
  $("name-input").addEventListener("input", () => nameCheck($("name-field").classList.contains("is-error")));
  $("name-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!nameCheck(true)) { $("name-input").focus(); announce($("name-help").textContent); return; }
    const btn = $("name-save");
    btn.disabled = true;
    btn.textContent = "Saving…";
    setTimeout(() => {
      dishName = $("name-input").value.trim();
      $("dish-title").textContent = dishName;
      btn.disabled = false;
      btn.textContent = "Save name";
      closeName();
      showToast("Name saved", false);
      announce(`Name saved: ${dishName}`);
    }, 600);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("name-form").hidden) closeName();
  });

  // ---------- starting state (for the exports) ----------
  const state = document.body.dataset.state || "view";
  if (state === "no-steps") { saved.steps = []; work.steps = []; }
  render();
  const find = (kind, pred) => work[kind].find(pred);
  const show = (sel, block = "start") => document.querySelector(sel)?.scrollIntoView({ block });
  if (["edit", "edited", "deleted", "saving", "discard", "steps-edit", "step-error", "step-deleted"].includes(state)) enterEdit();
  if (["edited", "saving", "discard"].includes(state)) { find("ingredients", (i) => i.name.startsWith("Potatoes")).qty = "150"; render(); }
  if (state === "deleted") { deleteIngredient(find("ingredients", (i) => i.name === "Garlic").id); document.activeElement.closest(".ingredient")?.scrollIntoView({ block: "center" }); }
  if (state === "step-error") { work.steps[2].text = ""; work.steps[2].touched = true; render(`[data-id="${work.steps[2].id}"] [data-step-text]`); show(`[data-id="${work.steps[2].id}"]`, "center"); }
  if (state === "step-deleted") { deleteStep(work.steps[2].id); show(`[data-id="${work.steps[2].id}"]`, "center"); }
  if (state === "saving") save(true);
  if (state === "discard") requestLeave("back");
  if (state === "name-error") { openName(); $("name-input").value = ""; nameCheck(true); }
  if (["edit", "discard"].includes(state)) show("#ing-head");
  if (["edited", "saving"].includes(state)) show(".nutri");
  if (["method", "no-steps", "steps-edit"].includes(state)) show("#method-head");
  if (state === "servings") { setServings(2); show("#ing-head"); }
})();
