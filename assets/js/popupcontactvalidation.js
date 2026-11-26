(() => {
  if (window.__fernEnquiryPopupInitialized) return;

  window.__fernEnquiryPopupInitialized = true;

  /* =========================================
     1. CONFIGURATION
  ========================================= */

  // Change only this URL when connecting your backend.

  const API_URL = "https://your-url-here.com/api/enquiries";

  /* =========================================
     2. ELEMENTS
  ========================================= */

  const popup = document.getElementById("enquiryPopup");
  const backdrop = document.getElementById("enquiryBackdrop");
  const modal = document.getElementById("enquiryModal");
  const closeBtn = document.getElementById("closeEnquiryPopup");
  const form = document.getElementById("enquiryForm");

  const nameInput = document.getElementById("enquiryNameInput");
  const emailInput = document.getElementById("enquiryEmailInput");
  const phoneInput = document.getElementById("enquiryPhoneInput");

  const budgetInput = document.getElementById("enquiryBudgetInput");
  const timelineInput = document.getElementById("enquiryTimelineInput");
  const siteVisitInput = document.getElementById("enquirySiteVisitInput");

  const submitBtn = document.getElementById("enquirySubmitBtn");
  const btnText = document.getElementById("enquiryBtnText");
  const loader = document.getElementById("enquiryLoader");

  if (
    !popup ||
    !backdrop ||
    !modal ||
    !closeBtn ||
    !form ||
    !nameInput ||
    !emailInput ||
    !phoneInput ||
    !budgetInput ||
    !timelineInput ||
    !siteVisitInput ||
    !submitBtn
  ) {
    console.error("Enquiry popup elements are missing.");
    return;
  }

  /* =========================================
     3. REGEX & VALIDATION STATE
  ========================================= */

  const nameRegex = /^[A-Za-z.\s]+$/;

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  let nameInvalidAttempt = false;

  // Dropdown errors appear only after the first submit attempt.

  let formSubmitted = false;

  /* =========================================
     4. POPUP CONTROLS
  ========================================= */

  let isOpen = false;
  let closeTimer;

  function updateBodyScroll() {
    const brochurePopup = document.getElementById("brochurePopup");

    const brochureOpen =
      brochurePopup && !brochurePopup.classList.contains("hidden");

    const enquiryOpen = !popup.classList.contains("hidden");

    document.body.classList.toggle(
      "overflow-hidden",
      Boolean(brochureOpen || enquiryOpen),
    );
  }

  function openEnquiryPopup() {
    if (isOpen) return;

    clearTimeout(closeTimer);

    isOpen = true;

    popup.classList.remove("hidden");
    popup.classList.add("flex");

    popup.setAttribute("aria-hidden", "false");

    updateBodyScroll();

    // Initial animation state.

    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");

    modal.classList.remove("opacity-100", "translate-y-0");
    modal.classList.add("opacity-0", "-translate-y-8");

    // Animate after the browser applies the initial state.

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

  function closeEnquiryPopup() {
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

  closeBtn.addEventListener("click", closeEnquiryPopup);

  backdrop.addEventListener("click", closeEnquiryPopup);

  document.querySelectorAll(".open-enquiry-popup").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openEnquiryPopup();
    });
  });

  window.openFernEnquiryPopup = openEnquiryPopup;
  window.closeFernEnquiryPopup = closeEnquiryPopup;

  /* =========================================
     5. ERROR HANDLING
  ========================================= */

  function showError(elementId, message) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;
    element.classList.add("error-visible");
  }

  function hideError(elementId) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = "";
    element.classList.remove("error-visible");
  }

  function clearAllErrors() {
    [
      "enquiryNameError",
      "enquiryEmailError",
      "enquiryPhoneError",
      "enquiryBudgetError",
      "enquiryTimelineError",
      "enquirySiteVisitError",
      "enquiryDropdownError",
    ].forEach(hideError);
  }

  /* =========================================
     6. PHONE INITIALIZATION
  ========================================= */

  if (typeof window.intlTelInput !== "function") {
    console.error("intl-tel-input library is not loaded.");
    return;
  }

  const phoneInstance = window.intlTelInput(phoneInput, {
    initialCountry: "in",
    separateDialCode: true,
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  /* =========================================
     7. NAME VALIDATION
  ========================================= */

  function validateName(showRequiredError = true) {
    const value = nameInput.value.trim();

    if (nameInvalidAttempt) {
      showError(
        "enquiryNameError",
        "Numbers and special characters are not allowed in the name.",
      );

      return false;
    }

    if (!value) {
      if (showRequiredError) {
        showError("enquiryNameError", "Name is required.");
      } else {
        hideError("enquiryNameError");
      }

      return false;
    }

    if (!nameRegex.test(value)) {
      showError(
        "enquiryNameError",
        "Only letters, spaces and periods are allowed.",
      );

      return false;
    }

    hideError("enquiryNameError");
    return true;
  }

  // Prevent invalid characters while typing.

  nameInput.addEventListener("keydown", (event) => {
    const key = event.key;

    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Tab",
        "Home",
        "End",
        "Enter",
      ].includes(key)
    ) {
      return;
    }

    if (key.length === 1 && !/^[A-Za-z.\s]$/.test(key)) {
      event.preventDefault();

      nameInvalidAttempt = true;

      showError(
        "enquiryNameError",
        /\d/.test(key)
          ? "Numbers are not allowed in the name."
          : "Only letters, spaces and periods are allowed.",
      );
    }
  });

  // Handle pasted text and other input methods.

  nameInput.addEventListener("input", () => {
    const originalValue = nameInput.value;

    if (/\d/.test(originalValue)) {
      nameInvalidAttempt = true;

      showError("enquiryNameError", "Numbers are not allowed in the name.");
    } else if (/[^A-Za-z.\s]/.test(originalValue)) {
      nameInvalidAttempt = true;

      showError(
        "enquiryNameError",
        "Only letters, spaces and periods are allowed.",
      );
    } else {
      nameInvalidAttempt = false;
    }

    nameInput.value = originalValue.replace(/[^A-Za-z.\s]/g, "");

    if (!nameInvalidAttempt) {
      if (nameInput.value.trim()) {
        validateName(false);
      } else {
        hideError("enquiryNameError");
      }
    }
  });

  nameInput.addEventListener("blur", () => {
    validateName(true);
  });

  /* =========================================
     8. EMAIL VALIDATION
  ========================================= */

  function validateEmail(showRequiredError = true) {
    const email = emailInput.value.trim();

    if (!email) {
      if (showRequiredError) {
        showError("enquiryEmailError", "Email address is required.");
      } else {
        hideError("enquiryEmailError");
      }

      return false;
    }

    if (!emailRegex.test(email)) {
      showError("enquiryEmailError", "Please enter a valid email address.");

      return false;
    }

    hideError("enquiryEmailError");
    return true;
  }

  emailInput.addEventListener("input", () => {
    if (emailInput.value.trim()) {
      validateEmail(false);
    } else {
      hideError("enquiryEmailError");
    }
  });

  emailInput.addEventListener("blur", () => {
    validateEmail(true);
  });

  /* =========================================
     9. PHONE VALIDATION
  ========================================= */

  function updatePhoneMaxLength() {
    const country = phoneInstance.getSelectedCountryData();

    if (country.iso2 === "in") {
      phoneInput.maxLength = 10;
    } else {
      phoneInput.removeAttribute("maxlength");
    }
  }

  function validatePhone(showRequiredError = true) {
    const country = phoneInstance.getSelectedCountryData();
    const phone = phoneInput.value.trim();

    if (!phone) {
      if (showRequiredError) {
        showError("enquiryPhoneError", "Phone number is required.");
      } else {
        hideError("enquiryPhoneError");
      }

      return false;
    }

    if (country.iso2 === "in") {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        showError(
          "enquiryPhoneError",
          "Enter a valid 10-digit number starting with 6, 7, 8 or 9.",
        );

        return false;
      }
    } else if (!phoneInstance.isValidNumber()) {
      showError("enquiryPhoneError", "Please enter a valid phone number.");

      return false;
    }

    hideError("enquiryPhoneError");
    return true;
  }

  updatePhoneMaxLength();

  phoneInput.addEventListener("countrychange", () => {
    updatePhoneMaxLength();

    if (phoneInput.value.trim()) {
      validatePhone(false);
    }
  });

  // Allow only digits.

  phoneInput.addEventListener("keydown", (event) => {
    const key = event.key;

    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Tab",
        "Home",
        "End",
        "Enter",
      ].includes(key)
    ) {
      return;
    }

    if (!/^\d$/.test(key)) {
      event.preventDefault();
      return;
    }

    const country = phoneInstance.getSelectedCountryData();

    if (country.iso2 !== "in") return;

    const current = phoneInput.value;

    const start = phoneInput.selectionStart ?? current.length;
    const end = phoneInput.selectionEnd ?? current.length;

    const nextValue = current.slice(0, start) + key + current.slice(end);

    if (nextValue.length > 10) {
      event.preventDefault();
      return;
    }

    if (nextValue.length > 0 && !/^[6-9]/.test(nextValue)) {
      event.preventDefault();

      showError("enquiryPhoneError", "Number must start with 6, 7, 8 or 9.");
    }
  });

  phoneInput.addEventListener("input", () => {
    const country = phoneInstance.getSelectedCountryData();

    let value = phoneInput.value.replace(/\D/g, "");

    if (country.iso2 === "in") {
      value = value.slice(0, 10);

      if (value.length > 0 && !/^[6-9]/.test(value)) {
        phoneInput.value = "";

        showError("enquiryPhoneError", "Number must start with 6, 7, 8 or 9.");

        return;
      }
    }

    phoneInput.value = value;

    if (value) {
      validatePhone(false);
    } else {
      hideError("enquiryPhoneError");
    }
  });

  phoneInput.addEventListener("blur", () => {
    validatePhone(true);
  });

  /* =========================================
     10. INDIVIDUAL DROPDOWN VALIDATION
  ========================================= */

  function validateBudget() {
    if (!budgetInput.value) {
      showError("enquiryBudgetError", "Please select your budget.");

      return false;
    }

    hideError("enquiryBudgetError");
    return true;
  }

  function validateTimeline() {
    if (!timelineInput.value) {
      showError(
        "enquiryTimelineError",
        "Please select your purchase timeline.",
      );

      return false;
    }

    hideError("enquiryTimelineError");
    return true;
  }

  function validateSiteVisit() {
    if (!siteVisitInput.value) {
      showError(
        "enquirySiteVisitError",
        "Please select your site visit preference.",
      );

      return false;
    }

    hideError("enquirySiteVisitError");
    return true;
  }

  function validateDropdowns() {
    const isBudgetValid = validateBudget();
    const isTimelineValid = validateTimeline();
    const isSiteVisitValid = validateSiteVisit();

    return isBudgetValid && isTimelineValid && isSiteVisitValid;
  }

  /* =========================================
     11. DROPDOWN CHANGE EVENTS
  ========================================= */

  budgetInput.addEventListener("change", () => {
    if (formSubmitted) {
      validateBudget();
    }
  });

  timelineInput.addEventListener("change", () => {
    if (formSubmitted) {
      validateTimeline();
    }
  });

  siteVisitInput.addEventListener("change", () => {
    if (formSubmitted) {
      validateSiteVisit();
    }
  });

  /* =========================================
     12. POST API REQUEST
  ========================================= */

  async function submitEnquiry(data) {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify(data),
    });

    const responseText = await response.text();

    let responseData = null;

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
    }

    if (!response.ok) {
      const errorMessage =
        typeof responseData === "object" && responseData?.message
          ? responseData.message
          : `Request failed with status ${response.status}`;

      throw new Error(errorMessage);
    }

    if (
      typeof responseData === "object" &&
      responseData?.status &&
      responseData.status !== "success"
    ) {
      throw new Error(responseData.message || "Enquiry submission failed.");
    }

    return responseData;
  }

  /* =========================================
     13. FORM SUBMISSION
  ========================================= */

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Show dropdown errors only after the first submit attempt.

    formSubmitted = true;

    clearAllErrors();

    let hasError = false;

    // NAME

    if (!validateName(true)) {
      hasError = true;
    }

    // EMAIL

    if (!validateEmail(true)) {
      hasError = true;
    }

    // PHONE

    if (!validatePhone(true)) {
      hasError = true;
    }

    // ALL THREE DROPDOWNS ARE REQUIRED.

    if (!validateDropdowns()) {
      hasError = true;
    }

    // Stop if any validation fails.

    if (hasError) return;

    /* =========================================
       14. FORM DATA
    ========================================= */

    const data = {
      fullname: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInstance.getNumber(),
      budget: budgetInput.value,
      purchaseTimeline: timelineInput.value,
      siteVisit: siteVisitInput.value,
    };

    console.log("Enquiry Form Data:", data);

    /* =========================================
       15. SUBMIT UI
    ========================================= */

    submitBtn.disabled = true;

    if (btnText) {
      btnText.textContent = "Submitting...";
    }

    if (loader) {
      loader.classList.remove("hidden");
    }

    try {
      /* POST API REQUEST */

      const apiResponse = await submitEnquiry(data);

      console.log("Enquiry submitted successfully:", apiResponse);

      // Success event for localhost toast/message system.

      form.dispatchEvent(
        new CustomEvent("fern:enquiry-success", {
          bubbles: true,
          detail: {
            data,
            response: apiResponse,
          },
        }),
      );
    } catch (error) {
      console.error("Enquiry submission error:", error);

      // Error event for localhost toast/message system.

      form.dispatchEvent(
        new CustomEvent("fern:enquiry-error", {
          bubbles: true,
          detail: {
            message: error.message,
          },
        }),
      );
    } finally {
      submitBtn.disabled = false;

      if (btnText) {
        btnText.textContent = "Submit Enquiry";
      }

      if (loader) {
        loader.classList.add("hidden");
      }
    }
  });
})();
