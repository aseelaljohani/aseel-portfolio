// main.js
// - Loads each section's HTML from /sections/*.html into the layout
// - Renders projects from the PROJECTS data source
// - Handles navigation behavior, smooth scrolling, and UX enhancements

document.addEventListener("DOMContentLoaded", () => {
  const sectionNodes = document.querySelectorAll("[data-section-src]");
  const navLinks = document.querySelectorAll(".site-nav a[href^='#']");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const header = document.querySelector(".site-header");

  // Set current year in footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  // Load HTML partials for each section from /sections
  sectionNodes.forEach((section) => {
    const src = section.getAttribute("data-section-src");
    if (!src) return;

    fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load section: ${src}`);
        }
        return response.text();
      })
      .then((html) => {
        section.innerHTML = `<div class="container section-inner">${html}</div>`;

        // After projects section is injected, render project cards
        if (section.id === "projects") {
          renderProjects();
        }

        // Setup scroll spy after sections are loaded
        requestAnimationFrame(() => setupScrollSpy());
      })
      .catch((error) => {
        section.innerHTML =
          '<div class="container section-inner"><p class="muted">Unable to load this section at the moment.</p></div>';
        console.error(error);
      });
  });

  // Render projects from window.PROJECTS onto the page
  function renderProjects() {
    const container = document.getElementById("projects-list");
    if (!container || !Array.isArray(window.PROJECTS)) return;

    container.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "projects-grid";

    window.PROJECTS.forEach((project, index) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.style.animationDelay = `${index * 0.08}s`;

      const inner = document.createElement("div");
      inner.className = "project-card-inner";

      // Button is rendered even if demo file is not present yet.
      // Click behavior is handled in setupProjectDemoButtons to avoid 404 pages.
      const demoButtonHtml = project.demoUrl
        ? `<button type="button" class="btn btn-outline project-demo-btn" data-demo-url="${project.demoUrl}">Watch demo</button>`
        : "";

      inner.innerHTML = `
        <div class="project-type">${project.type || ""}</div>
        <h3 class="project-name">${project.name}</h3>
        <p class="project-desc">${project.description || ""}</p>
        <div class="project-tags">
          ${(project.technologies || [])
            .map((tech) => `<span class="project-tag">${String(tech)}</span>`)
            .join("")}
        </div>
        <div class="project-media-placeholder">
          <span class="project-media-label">Screenshot / Demo</span>
          <span class="project-media-note">Add project image or video in <strong>assets/images</strong> or <strong>assets/videos</strong>.</span>
          ${demoButtonHtml}
        </div>
      `;

      card.appendChild(inner);
      grid.appendChild(card);
    });

    container.appendChild(grid);

    // Attach behavior for demo buttons
    setupProjectDemoButtons();
  }

  // Attach click handlers for project demo buttons.
  // If the file does not exist yet, we show a friendly message instead of a 404 page.
  function setupProjectDemoButtons() {
    const buttons = document.querySelectorAll(".project-demo-btn");

    buttons.forEach((btn) => {
      const url = btn.getAttribute("data-demo-url");
      if (!url) return;

      btn.addEventListener("click", () => {
  window.open(url, "_blank", "noopener,noreferrer");
});

    });
  }

  // Mobile navigation toggle
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
    });
  }

  // Smooth scrolling and close mobile menu on link click
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href")?.substring(1);
      if (!targetId) return;

      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      event.preventDefault();

      const headerOffset = 80;
      const rect = targetSection.getBoundingClientRect();
      const offsetTop = rect.top + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });

      navLinks.forEach((item) => item.classList.remove("is-active"));
      link.classList.add("is-active");

      if (nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navToggle?.classList.remove("is-open");
      }
    });
  });

  // Scroll spy: update active nav link based on scroll position
  let scrollSpyInitialized = false;
  function setupScrollSpy() {
    if (scrollSpyInitialized) return;
    scrollSpyInitialized = true;

    const sectionIds = ["about", "projects", "skills", "experience", "education", "training", "contact"];

    function updateActiveLink() {
      const scrollY = window.scrollY;
      const headerHeight = header?.offsetHeight || 80;

      let current = "about";
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - headerHeight;
          if (scrollY >= top) current = id;
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute("href")?.substring(1);
        link.classList.toggle("is-active", href === current);
      });
    }

    window.addEventListener("scroll", () => {
      updateActiveLink();
      if (header) {
        header.classList.toggle("scrolled", window.scrollY > 20);
      }
    }, { passive: true });

    updateActiveLink();
  }
});
