// Smooth scrolling for navigation links
const header = document.querySelector("header");
let ignoreAutoHide = false;
const headerHeight = header ? header.offsetHeight : 0;
let activeLinkLocked = false;
let lockedActiveHref = "#home";

const navLinks = document.querySelectorAll(".home-bar a");

const normalizeHref = (href) => {
  if (!href) return "";
  if (href.startsWith("index.html#")) return href.slice(10);
  if (href.startsWith("./index.html#")) return href.slice(12);
  if (href.startsWith("#")) return href;
  return href;
};

const setActiveLinkByHref = (href) => {
  const normalizedHref = normalizeHref(href);

  navLinks.forEach((link) => {
    const linkHref = normalizeHref(link.getAttribute("href"));
    const isActive = linkHref === normalizedHref;
    link.classList.toggle("active", isActive);

    if (link.classList.contains("dropdown-toggle")) {
      const dropdown = link.closest(".dropdown");
      const submenuLinks = dropdown?.querySelectorAll(".dropdown-menu a") || [];
      const submenuActive = Array.from(submenuLinks).some(
        (submenuLink) =>
          normalizeHref(submenuLink.getAttribute("href")) === normalizedHref,
      );
      link.classList.toggle("active", isActive || submenuActive);
    }
  });
};

const showAllSections = () => {
  document.querySelectorAll("section[id]").forEach((section) => {
    section.classList.remove("section-hidden");
  });
};

const showOnlySection = (hash) => {
  const target = document.querySelector(hash);
  if (!target) return;
  document.querySelectorAll("section[id]").forEach((section) => {
    section.classList.toggle("section-hidden", section !== target);
  });
};

const setActiveHomeOnly = () => {
  navLinks.forEach((link) => {
    const linkHref = normalizeHref(link.getAttribute("href"));
    link.classList.toggle("active", linkHref === "#home");
  });
};

const isIndexPage = () => {
  const currentPath = window.location.pathname.split("/").pop();
  return currentPath === "" || currentPath === "index.html";
};

const scrollToHashTarget = (hash, behavior = "auto") => {
  if (!hash) return;
  const target = document.querySelector(hash);
  if (!target) return;
  const scrollTarget =
    target.querySelector(".about-panel, .career-panel, .section-panel") ||
    target;
  const targetTop =
    scrollTarget.getBoundingClientRect().top + window.pageYOffset;
  const offset = headerHeight + 10;
  window.scrollTo({
    top: Math.max(targetTop - offset, 0),
    behavior,
  });
};

const navigateToSection = (href) => {
  const target = document.querySelector(href);
  if (!target) return;

  if (href === "#home") {
    activeLinkLocked = false;
    lockedActiveHref = "#home";
    showAllSections();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    return;
  }

  activeLinkLocked = true;
  lockedActiveHref = href;
  showOnlySection(href);

  requestAnimationFrame(() => {
    scrollToHashTarget(href, "smooth");
  });
};

navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    if (link.classList.contains("dropdown-toggle")) {
      e.preventDefault();
      return;
    }

    if (href && href.startsWith("#") && href !== "#") {
      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();
        ignoreAutoHide = true;
        header.classList.remove("hidden");
        navigateToSection(href);
        history.replaceState(null, "", href);
        setActiveLinkByHref(href);
        setTimeout(() => {
          ignoreAutoHide = false;
        }, 700);
      }
    } else {
      if (href === "#") {
        e.preventDefault();
      }
      setActiveLinkByHref(href);
    }
  });
});

const activateCurrentNavLink = () => {
  const currentPath = window.location.pathname.split("/").pop();
  const currentHash = window.location.hash || "#home";
  let activeHref = currentHash;

  if (currentPath && currentPath !== "index.html") {
    activeHref = currentPath;
  }

  // If we are on index page and no hash is set, treat it as home.
  if (isIndexPage() && !window.location.hash) {
    activeHref = "#home";
  }

  setActiveLinkByHref(activeHref);
};

window.addEventListener("load", () => {
  activateCurrentNavLink();
  if (window.location.hash) {
    if (window.location.hash === "#home") {
      showAllSections();
      scrollToHashTarget(window.location.hash);
    } else {
      activeLinkLocked = true;
      lockedActiveHref = window.location.hash;
      showOnlySection(window.location.hash);
      scrollToHashTarget(window.location.hash);
    }
  }
});
window.addEventListener("popstate", () => {
  activateCurrentNavLink();
  if (window.location.hash && window.location.hash !== "#home") {
    showOnlySection(window.location.hash);
  } else {
    showAllSections();
  }
});

// Add active link highlighting on scroll
let lastScrollY = window.pageYOffset;
let userHasScrolled = false;

window.addEventListener("wheel", () => {
  userHasScrolled = true;
});
window.addEventListener("touchmove", () => {
  userHasScrolled = true;
});

window.addEventListener("scroll", () => {
  if (!isIndexPage()) return;

  if (activeLinkLocked) {
    setActiveLinkByHref(lockedActiveHref);
  } else if (window.location.hash && window.location.hash !== "#home") {
    setActiveLinkByHref(window.location.hash);
  } else {
    setActiveHomeOnly();
  }

  if (!ignoreAutoHide) {
    const currentScrollY = window.pageYOffset;
    if (
      userHasScrolled &&
      currentScrollY > lastScrollY &&
      currentScrollY > 120
    ) {
      header.classList.add("hidden");
    } else {
      header.classList.remove("hidden");
    }
    lastScrollY = currentScrollY;
  }
});

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

document
  .querySelectorAll(".project-item, .experience-item, .skill")
  .forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(item);
  });

const portfolioTabs = document.querySelectorAll(".projects-tabs .tab");
const projectItems = Array.from(
  document.querySelectorAll(".projects-grid .project-item"),
);

function updatePortfolioFilter(filter) {
  projectItems.forEach((item, index) => {
    if (filter === "latest" && index >= 4) {
      item.style.display = "none";
    } else {
      item.style.display = "flex";
    }
  });
}

portfolioTabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    const filter = tab.dataset.filter;
    portfolioTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    updatePortfolioFilter(filter);
  });
});

// initialize default filter state
updatePortfolioFilter("all");

const portfolioModal = document.getElementById("portfolioModal");
const portfolioModalBackdrop = document.getElementById(
  "portfolioModalBackdrop",
);
const portfolioModalClose = document.getElementById("portfolioModalClose");
const portfolioModalPrev = document.getElementById("portfolioModalPrev");
const portfolioModalNext = document.getElementById("portfolioModalNext");
const portfolioModalImage = document.getElementById("portfolioModalImage");
const portfolioModalCaption = document.getElementById("portfolioModalCaption");

let currentPortfolioIndex = 0;

function showPortfolioModal(index) {
  const item = projectItems[index];
  const image = item.querySelector(".project-image img");
  const title = item.querySelector(".project-title").textContent;
  const description = item.querySelector(".project-info p").textContent;

  currentPortfolioIndex = index;
  portfolioModalImage.src = image.src;
  portfolioModalImage.alt = image.alt;
  portfolioModalCaption.textContent = `${title} — ${description}`;
  portfolioModal.classList.add("open");
  document.body.classList.add("modal-open");
}

projectItems.forEach((item, index) => {
  const openModal = () => {
    showPortfolioModal(index);
  };

  item.addEventListener("click", openModal);
  const imageWrapper = item.querySelector(".project-image");
  if (imageWrapper) {
    imageWrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal();
    });
  }
});

function closePortfolioModal() {
  portfolioModal.classList.remove("open");
  document.body.classList.remove("modal-open");
}

function showPortfolioNext() {
  currentPortfolioIndex = (currentPortfolioIndex + 1) % projectItems.length;
  showPortfolioModal(currentPortfolioIndex);
}

function showPortfolioPrev() {
  currentPortfolioIndex =
    (currentPortfolioIndex - 1 + projectItems.length) % projectItems.length;
  showPortfolioModal(currentPortfolioIndex);
}

portfolioModalClose.addEventListener("click", closePortfolioModal);
portfolioModalBackdrop.addEventListener("click", closePortfolioModal);
portfolioModalPrev.addEventListener("click", (e) => {
  e.stopPropagation();
  showPortfolioPrev();
});
portfolioModalNext.addEventListener("click", (e) => {
  e.stopPropagation();
  showPortfolioNext();
});

document.addEventListener("keydown", (e) => {
  if (!portfolioModal.classList.contains("open")) return;
  if (e.key === "Escape") {
    closePortfolioModal();
  }
  if (e.key === "ArrowRight") {
    showPortfolioNext();
  }
  if (e.key === "ArrowLeft") {
    showPortfolioPrev();
  }
});

portfolioModal.addEventListener("transitionend", () => {
  if (!portfolioModal.classList.contains("open")) {
    portfolioModalImage.src = "";
    portfolioModalImage.alt = "";
    portfolioModalCaption.textContent = "";
  }
});
