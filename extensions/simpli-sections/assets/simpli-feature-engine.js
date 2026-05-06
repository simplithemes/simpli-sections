document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".simpli-feature").forEach((el) => {
    const type = el.dataset.type;
    const heading = el.dataset.heading;
    const content = el.dataset.content;
    const bg = el.dataset.bg;
    const text = el.dataset.text;

    el.style.background = bg;
    el.style.color = text;

    if (type === "announcement_bar") {
      el.innerHTML = `
        <div class="sf-announcement">
          ${heading}
        </div>
      `;
    }

    if (type === "trust_badges") {
      const items = content.split("|");
      el.innerHTML = `
        <div class="sf-trust">
          ${items.map(item => `<span>${item}</span>`).join("")}
        </div>
      `;
    }

    if (type === "faq_accordion") {
      const items = content.split("|");
      el.innerHTML = `
        <div class="sf-faq">
          ${items.map(item => `
            <div class="sf-faq-item">
              <strong>${item}</strong>
            </div>
          `).join("")}
        </div>
      `;
    }
  });
});