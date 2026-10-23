// עמוד הבחירה: כרטיס לכל דמות, ותיבת אישור אחת שבלעדיה אי אפשר להתחיל.

import { applyTheme, bidiYears, loadCharacters, readSettings, saveSettings, withParams, type PublicCharacter } from "./characters.ts";
import { Avatar } from "./avatar.ts";

applyTheme();

const list = document.getElementById("characters")!;
const consent = document.getElementById("consent") as HTMLInputElement;

function card(c: PublicCharacter): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "char-card card";
  li.style.setProperty("--accent", c.accentColor);
  const avatar = new Avatar(c);
  const era = document.createElement("p");
  era.className = "era";
  era.textContent = c.eraHe ?? "";
  const h2 = document.createElement("h2");
  h2.textContent = c.nameHe;
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.append(...bidiYears(c.years));
  const tag = document.createElement("p");
  tag.className = "tagline";
  tag.textContent = c.taglineHe;
  const go = document.createElement("a");
  go.className = "btn primary";
  go.textContent = "דבר איתי";
  go.href = withParams("talk.html", { c: c.id });
  go.setAttribute("aria-label", `דבר עם ${c.nameHe}`);
  go.addEventListener("click", (e) => {
    if (!consent.checked) {
      e.preventDefault();
      consent.focus();
      consent.closest(".consent")?.classList.add("shake");
      setTimeout(() => consent.closest(".consent")?.classList.remove("shake"), 500);
      return;
    }
    saveSettings({ lastCharacter: c.id });
  });
  li.append(avatar.el, ...(c.eraHe ? [era] : []), h2, meta, tag, go);
  return li;
}

function syncConsent() {
  saveSettings({ consent: consent.checked });
  list.classList.toggle("locked", !consent.checked);
}

consent.checked = readSettings().consent === true;
consent.addEventListener("change", syncConsent);
syncConsent();

// הדמויות מגיעות בסדר כרונולוגי (sortYear), והתקופה מסומנת על כל כרטיס.
loadCharacters()
  .then((chars) => list.append(...chars.map(card)))
  .catch(() => {
    list.textContent = "לא הצלחנו לטעון את רשימת הדמויות. רענן את הדף.";
  });
