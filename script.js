/* ==========================================================================
   Tompadel — shared behaviour
   nav · reveal · faq accordion · contact form · gallery lightbox
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- navbar */
  const nav = document.querySelector("[data-nav]");
  if (nav) {
    const toggle = nav.querySelector(".nav__toggle");
    const links = nav.querySelector(".nav__links");

    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    links?.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );

    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------------------------------------------------------- scroll reveal */
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length) {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ------------------------------------------------------------------ faq */
  document.querySelectorAll("[data-faq] .faq__item").forEach((item) => {
    const btn = item.querySelector(".faq__q");
    btn?.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      // close siblings for a clean single-open accordion
      item.parentElement.querySelectorAll(".faq__item.is-open").forEach((s) => {
        if (s !== item) { s.classList.remove("is-open"); s.querySelector(".faq__q")?.setAttribute("aria-expanded", "false"); }
      });
      item.classList.toggle("is-open", !open);
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  /* --------------------------------------------------------- contact form */
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const status = form.querySelector(".form-status");

    const setInvalid = (field, on) => field.classList.toggle("invalid", on);

    const validate = () => {
      let ok = true;
      form.querySelectorAll("[data-field]").forEach((field) => {
        const input = field.querySelector("input, textarea");
        const val = input.value.trim();
        let bad = !val;
        if (!bad && input.type === "tel") bad = !/^[0-9()+\-\s]{7,}$/.test(val);
        setInvalid(field, bad);
        if (bad) ok = false;
      });
      return ok;
    };

    form.querySelectorAll("[data-field] input, [data-field] textarea").forEach((input) => {
      input.addEventListener("blur", () => {
        const field = input.closest("[data-field]");
        const val = input.value.trim();
        let bad = !val;
        if (!bad && input.type === "tel") bad = !/^[0-9()+\-\s]{7,}$/.test(val);
        setInvalid(field, bad);
      });
      input.addEventListener("input", () => {
        if (input.value.trim()) setInvalid(input.closest("[data-field]"), false);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (status) { status.textContent = ""; status.classList.remove("ok"); }
      if (!validate()) {
        if (status) status.textContent = "אנא מלאו את כל השדות המסומנים.";
        form.querySelector(".invalid input, .invalid textarea")?.focus();
        return;
      }

      // TODO: חברו כאן שירות שליחה (למשל Formspree / EmailJS / endpoint משלכם)
      // fetch("https://your-endpoint", { method: "POST", body: new FormData(form) })
      if (status) { status.textContent = "תודה! פנייתכם נשלחה, נחזור אליכם בהקדם. 🎾"; status.classList.add("ok"); }
      form.reset();
    });
  }

  /* ------------------------------------------------------------- lightbox */
  const gallery = document.querySelector("[data-gallery]");
  const lb = document.querySelector("[data-lightbox]");
  if (gallery && lb) {
    const lbImg = lb.querySelector(".lb__img");
    const items = Array.from(gallery.querySelectorAll(".gallery__item img"));
    let idx = 0;

    const show = (i) => {
      idx = (i + items.length) % items.length;
      const src = items[idx].getAttribute("src");
      lbImg.setAttribute("src", src);
      lbImg.setAttribute("alt", items[idx].getAttribute("alt") || "");
    };
    const open = (i) => { show(i); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; lb.querySelector(".lb__close")?.focus(); };
    const close = () => { lb.classList.remove("is-open"); document.body.style.overflow = ""; };

    items.forEach((img, i) => {
      const cell = img.closest(".gallery__item");
      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", "0");
      cell.addEventListener("click", () => open(i));
      cell.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
    });

    lb.querySelector(".lb__close")?.addEventListener("click", close);
    lb.querySelector(".lb__next")?.addEventListener("click", () => show(idx + 1));
    lb.querySelector(".lb__prev")?.addEventListener("click", () => show(idx - 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx + 1);   // RTL: left = next
      if (e.key === "ArrowRight") show(idx - 1);
    });
  }

  /* ---------------------------------------------- current year in footer */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
