/* =========================================
   1. SHARED POPUP HELPERS
========================================= */

function updateBodyScroll() {
  const brochurePopup = document.getElementById("brochurePopup");
  const enquiryPopup = document.getElementById("enquiryPopup");

  const brochureOpen =
    brochurePopup && !brochurePopup.classList.contains("hidden");

  const enquiryOpen =
    enquiryPopup && !enquiryPopup.classList.contains("hidden");

  document.body.classList.toggle(
    "overflow-hidden",
    Boolean(brochureOpen || enquiryOpen),
  );
}

/* =========================================
   2. AOS INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 100,
      delay: 0,
      mirror: false,
      anchorPlacement: "top-bottom",
    });
  }
});

window.addEventListener("load", () => {
  if (typeof AOS !== "undefined") {
    AOS.refresh();
  }
});

/* =========================================
   3. BROCHURE POPUP
========================================= */

(() => {
  const popup = document.getElementById("brochurePopup");
  const modal = document.getElementById("brochureModal");
  const backdrop = document.getElementById("brochureBackdrop");
  const closeBtn = document.getElementById("closeBrochurePopup");

  if (!popup || !modal || !backdrop) return;

  let isOpen = false;
  let closeTimer;

  function openBrochurePopup() {
    if (isOpen) return;

    clearTimeout(closeTimer);

    isOpen = true;

    popup.classList.remove("hidden");
    popup.classList.add("flex");
    popup.setAttribute("aria-hidden", "false");

    updateBodyScroll();

    // Initial animation state
    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");

    modal.classList.remove("opacity-100", "translate-y-0");
    modal.classList.add("opacity-0", "-translate-y-8");

    // Start animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void modal.offsetHeight;

        backdrop.classList.remove("opacity-0");
        backdrop.classList.add("opacity-100");

        modal.classList.remove("opacity-0", "-translate-y-8");
        modal.classList.add("opacity-100", "translate-y-0");
      });
    });
  }

  function closeBrochurePopupHandler() {
    if (!isOpen) return;

    isOpen = false;

    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");

    modal.classList.remove("opacity-100", "translate-y-0");
    modal.classList.add("opacity-0", "-translate-y-8");

    popup.setAttribute("aria-hidden", "true");

    closeTimer = setTimeout(() => {
      if (!isOpen) {
        popup.classList.add("hidden");
        popup.classList.remove("flex");
      }

      updateBodyScroll();
    }, 500);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeBrochurePopupHandler);
  }

  backdrop.addEventListener("click", closeBrochurePopupHandler);

  document.querySelectorAll(".download-brochure").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openBrochurePopup();
    });
  });

  window.openFernBrochurePopup = openBrochurePopup;
  window.closeFernBrochurePopup = closeBrochurePopupHandler;

  window.closeFernBrochurePopupIfOpen = () => {
    if (isOpen) closeBrochurePopupHandler();
  };
})();

/* =========================================
   4. ENQUIRY POPUP AUTO OPEN
========================================= */

function scheduleEnquiryPopup() {
  setTimeout(() => {
    const enquiryPopup = document.getElementById("enquiryPopup");

    if (!enquiryPopup) {
      console.error("Enquiry popup element is missing.");
      return;
    }

    if (typeof window.openFernEnquiryPopup !== "function") {
      console.error(
        "Enquiry popup script is not loaded. Check your script order.",
      );
      return;
    }

    window.openFernEnquiryPopup();
  }, 3000);
}

if (document.readyState === "complete") {
  scheduleEnquiryPopup();
} else {
  window.addEventListener("load", scheduleEnquiryPopup, {
    once: true,
  });
}

/* =========================================
   5. ESCAPE KEY
========================================= */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (typeof window.closeFernEnquiryPopup === "function") {
    window.closeFernEnquiryPopup();
  }

  if (typeof window.closeFernBrochurePopupIfOpen === "function") {
    window.closeFernBrochurePopupIfOpen();
  }
});

/* =========================================
   6. CONNECTIVITY ACCORDION
========================================= */

const connectivityItems = document.querySelectorAll(".connectivity-item");

connectivityItems.forEach((item) => {
  const trigger = item.querySelector(".connectivity-trigger");
  const panel = item.querySelector(".connectivity-panel");

  if (!trigger || !panel) return;

  const icon = trigger.querySelector("i");

  trigger.addEventListener("click", () => {
    const isOpen = item.dataset.open === "true";

    // Close all accordion items
    connectivityItems.forEach((otherItem) => {
      otherItem.dataset.open = "false";

      const otherTrigger = otherItem.querySelector(".connectivity-trigger");

      const otherPanel = otherItem.querySelector(".connectivity-panel");

      if (!otherTrigger || !otherPanel) return;

      const otherIcon = otherTrigger.querySelector("i");

      otherTrigger.setAttribute("aria-expanded", "false");

      otherPanel.classList.remove("grid-rows-[1fr]");
      otherPanel.classList.add("grid-rows-[0fr]");

      if (otherIcon) {
        otherIcon.classList.remove("fa-minus");
        otherIcon.classList.add("fa-plus");
      }
    });

    // Open selected item
    if (!isOpen) {
      item.dataset.open = "true";

      trigger.setAttribute("aria-expanded", "true");

      panel.classList.remove("grid-rows-[0fr]");
      panel.classList.add("grid-rows-[1fr]");

      if (icon) {
        icon.classList.remove("fa-plus");
        icon.classList.add("fa-minus");
      }
    }
  });
});
