(() => {
  if (window.__contactEnquiryFormInitialized) return;

  window.__contactEnquiryFormInitialized = true;

  /* =========================================
     1. API CONFIGURATION
  ========================================= */

  // Change only this URL when connecting your backend.

  const CONTACT_API_URL = "YOUR_API_ENDPOINT_HERE";

  /* =========================================
     2. ELEMENTS
  ========================================= */

  const contactForm = document.getElementById("contactEnquiryForm");

  const contactNameInput = document.getElementById("contactNameInput");
  const contactEmailInput = document.getElementById("contactEmailInput");
  const contactPhoneInput = document.getElementById("contactPhoneInput");

  const contactBudgetInput = document.getElementById("contactBudgetInput");
  const contactTimelineInput = document.getElementById("contactTimelineInput");
  const contactSiteVisitInput = document.getElementById(
    "contactSiteVisitInput",
  );

  const contactSubmitBtn = document.getElementById("contactSubmitBtn");
  const contactBtnText = document.getElementById("contactBtnText");
  const contactLoader = document.getElementById("contactLoader");

  if (
    !contactForm ||
    !contactNameInput ||
    !contactEmailInput ||
    !contactPhoneInput ||
    !contactBudgetInput ||
    !contactTimelineInput ||
    !contactSiteVisitInput ||
    !contactSubmitBtn
  ) {
    console.error("Contact form elements are missing.");
    return;
  }

  /* =========================================
     3. REGEX & VALIDATION STATE
  ========================================= */

  const contactNameRegex = /^[A-Za-z.\s]+$/;

  const contactEmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  let contactNameInvalidAttempt = false;
  let contactFormSubmitted = false;

  /* =========================================
     4. ERROR HANDLING
  ========================================= */

  function showContactError(elementId, message) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;
    element.classList.add("error-visible");
  }

  function hideContactError(elementId) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = "";
    element.classList.remove("error-visible");
  }

  function clearContactFormErrors() {
    [
      "contactNameError",
      "contactEmailError",
      "contactPhoneError",
      "contactBudgetError",
      "contactTimelineError",
      "contactSiteVisitError",
    ].forEach(hideContactError);
  }

  /* =========================================
     5. PHONE INITIALIZATION
  ========================================= */

  if (typeof window.intlTelInput !== "function") {
    console.error("intl-tel-input library is not loaded.");
    return;
  }

  const contactPhoneInstance = window.intlTelInput(contactPhoneInput, {
    initialCountry: "in",
    separateDialCode: true,
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  /* =========================================
     6. NAME VALIDATION
  ========================================= */

  function validateContactName(showRequiredError = true) {
    const value = contactNameInput.value.trim();

    if (contactNameInvalidAttempt) {
      showContactError(
        "contactNameError",
        "Numbers and special characters are not allowed in the name.",
      );

      return false;
    }

    if (!value) {
      if (showRequiredError) {
        showContactError("contactNameError", "Name is required.");
      } else {
        hideContactError("contactNameError");
      }

      return false;
    }

    if (!contactNameRegex.test(value)) {
      showContactError(
        "contactNameError",
        "Only letters, spaces and periods are allowed.",
      );

      return false;
    }

    hideContactError("contactNameError");
    return true;
  }

  contactNameInput.addEventListener("keydown", (event) => {
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

      contactNameInvalidAttempt = true;

      showContactError(
        "contactNameError",
        /\d/.test(key)
          ? "Numbers are not allowed in the name."
          : "Only letters, spaces and periods are allowed.",
      );
    }
  });

  contactNameInput.addEventListener("input", () => {
    const originalValue = contactNameInput.value;

    if (/\d/.test(originalValue)) {
      contactNameInvalidAttempt = true;

      showContactError(
        "contactNameError",
        "Numbers are not allowed in the name.",
      );
    } else if (/[^A-Za-z.\s]/.test(originalValue)) {
      contactNameInvalidAttempt = true;

      showContactError(
        "contactNameError",
        "Only letters, spaces and periods are allowed.",
      );
    } else {
      contactNameInvalidAttempt = false;
    }

    contactNameInput.value = originalValue.replace(/[^A-Za-z.\s]/g, "");

    if (!contactNameInvalidAttempt) {
      if (contactNameInput.value.trim()) {
        validateContactName(false);
      } else {
        hideContactError("contactNameError");
      }
    }
  });

  contactNameInput.addEventListener("blur", () => {
    validateContactName(true);
  });

  /* =========================================
     7. EMAIL VALIDATION
  ========================================= */

  function validateContactEmail(showRequiredError = true) {
    const email = contactEmailInput.value.trim();

    if (!email) {
      if (showRequiredError) {
        showContactError("contactEmailError", "Email address is required.");
      } else {
        hideContactError("contactEmailError");
      }

      return false;
    }

    if (!contactEmailRegex.test(email)) {
      showContactError(
        "contactEmailError",
        "Please enter a valid email address.",
      );

      return false;
    }

    hideContactError("contactEmailError");
    return true;
  }

  contactEmailInput.addEventListener("input", () => {
    if (contactEmailInput.value.trim()) {
      validateContactEmail(false);
    } else {
      hideContactError("contactEmailError");
    }
  });

  contactEmailInput.addEventListener("blur", () => {
    validateContactEmail(true);
  });

  /* =========================================
     8. PHONE VALIDATION
  ========================================= */

  function updateContactPhoneMaxLength() {
    const country = contactPhoneInstance.getSelectedCountryData();

    if (country.iso2 === "in") {
      contactPhoneInput.maxLength = 10;
    } else {
      contactPhoneInput.removeAttribute("maxlength");
    }
  }

  function validateContactPhone(showRequiredError = true) {
    const country = contactPhoneInstance.getSelectedCountryData();
    const phone = contactPhoneInput.value.trim();

    if (!phone) {
      if (showRequiredError) {
        showContactError("contactPhoneError", "Phone number is required.");
      } else {
        hideContactError("contactPhoneError");
      }

      return false;
    }

    if (country.iso2 === "in") {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        showContactError(
          "contactPhoneError",
          "Enter a valid 10-digit number starting with 6, 7, 8 or 9.",
        );

        return false;
      }
    } else if (!contactPhoneInstance.isValidNumber()) {
      showContactError(
        "contactPhoneError",
        "Please enter a valid phone number.",
      );

      return false;
    }

    hideContactError("contactPhoneError");
    return true;
  }

  updateContactPhoneMaxLength();

  contactPhoneInput.addEventListener("countrychange", () => {
    updateContactPhoneMaxLength();

    if (contactPhoneInput.value.trim()) {
      validateContactPhone(false);
    }
  });

  contactPhoneInput.addEventListener("keydown", (event) => {
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

    const country = contactPhoneInstance.getSelectedCountryData();

    if (country.iso2 !== "in") return;

    const current = contactPhoneInput.value;
    const start = contactPhoneInput.selectionStart ?? current.length;
    const end = contactPhoneInput.selectionEnd ?? current.length;

    const nextValue = current.slice(0, start) + key + current.slice(end);

    if (nextValue.length > 10) {
      event.preventDefault();
      return;
    }

    if (nextValue.length > 0 && !/^[6-9]/.test(nextValue)) {
      event.preventDefault();

      showContactError(
        "contactPhoneError",
        "Number must start with 6, 7, 8 or 9.",
      );
    }
  });

  contactPhoneInput.addEventListener("input", () => {
    const country = contactPhoneInstance.getSelectedCountryData();

    let value = contactPhoneInput.value.replace(/\D/g, "");

    if (country.iso2 === "in") {
      value = value.slice(0, 10);

      if (value.length > 0 && !/^[6-9]/.test(value)) {
        contactPhoneInput.value = "";

        showContactError(
          "contactPhoneError",
          "Number must start with 6, 7, 8 or 9.",
        );

        return;
      }
    }

    contactPhoneInput.value = value;

    if (value) {
      validateContactPhone(false);
    } else {
      hideContactError("contactPhoneError");
    }
  });

  contactPhoneInput.addEventListener("blur", () => {
    validateContactPhone(true);
  });

  /* =========================================
     9. INDIVIDUAL DROPDOWN VALIDATION
  ========================================= */

  function validateContactBudget() {
    if (!contactBudgetInput.value) {
      showContactError("contactBudgetError", "Please select your budget.");

      return false;
    }

    hideContactError("contactBudgetError");
    return true;
  }

  function validateContactTimeline() {
    if (!contactTimelineInput.value) {
      showContactError(
        "contactTimelineError",
        "Please select your purchase timeline.",
      );

      return false;
    }

    hideContactError("contactTimelineError");
    return true;
  }

  function validateContactSiteVisit() {
    if (!contactSiteVisitInput.value) {
      showContactError(
        "contactSiteVisitError",
        "Please select your site visit preference.",
      );

      return false;
    }

    hideContactError("contactSiteVisitError");
    return true;
  }

  function validateContactDropdowns() {
    const isBudgetValid = validateContactBudget();
    const isTimelineValid = validateContactTimeline();
    const isSiteVisitValid = validateContactSiteVisit();

    return isBudgetValid && isTimelineValid && isSiteVisitValid;
  }

  /* =========================================
     10. DROPDOWN CHANGE EVENTS
  ========================================= */

  contactBudgetInput.addEventListener("change", () => {
    if (contactFormSubmitted) {
      validateContactBudget();
    }
  });

  contactTimelineInput.addEventListener("change", () => {
    if (contactFormSubmitted) {
      validateContactTimeline();
    }
  });

  contactSiteVisitInput.addEventListener("change", () => {
    if (contactFormSubmitted) {
      validateContactSiteVisit();
    }
  });

  /* =========================================
     11. POST API REQUEST
  ========================================= */

  async function submitContactEnquiry(contactFormData) {
    const response = await fetch(CONTACT_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify(contactFormData),
    });

    // Read the response safely, including empty responses.

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

    return responseData;
  }

  /* =========================================
     12. FORM SUBMISSION
  ========================================= */

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Show dropdown errors only after the first submission attempt.

    contactFormSubmitted = true;

    clearContactFormErrors();

    let hasError = false;

    // NAME

    if (!validateContactName(true)) {
      hasError = true;
    }

    // EMAIL

    if (!validateContactEmail(true)) {
      hasError = true;
    }

    // PHONE

    if (!validateContactPhone(true)) {
      hasError = true;
    }

    // ALL THREE DROPDOWNS ARE REQUIRED.

    if (!validateContactDropdowns()) {
      hasError = true;
    }

    // Stop if any validation fails.

    if (hasError) {
      return;
    }

    /* =========================================
       13. FORM DATA
    ========================================= */

    const contactFormData = {
      fullname: contactNameInput.value.trim(),
      email: contactEmailInput.value.trim(),
      phone: contactPhoneInstance.getNumber(),
      budget: contactBudgetInput.value,
      purchaseTimeline: contactTimelineInput.value,
      siteVisit: contactSiteVisitInput.value,
    };

    console.log("Contact Form Data:", contactFormData);

    /* =========================================
       14. SUBMIT UI
    ========================================= */

    contactSubmitBtn.disabled = true;

    if (contactBtnText) {
      contactBtnText.textContent = "Submitting...";
    }

    if (contactLoader) {
      contactLoader.classList.remove("hidden");
    }

    try {
      /* SEND POST REQUEST */

      const apiResponse = await submitContactEnquiry(contactFormData);

      console.log("Contact enquiry submitted successfully:", apiResponse);

      // Success event for your localhost toast/message system.

      contactForm.dispatchEvent(
        new CustomEvent("contact:enquiry-success", {
          bubbles: true,
          detail: {
            data: contactFormData,
            response: apiResponse,
          },
        }),
      );
    } catch (error) {
      console.error("Contact form submission error:", error);

      // Error event for your localhost toast/message system.

      contactForm.dispatchEvent(
        new CustomEvent("contact:enquiry-error", {
          bubbles: true,
          detail: {
            message: error.message,
          },
        }),
      );
    } finally {
      contactSubmitBtn.disabled = false;

      if (contactBtnText) {
        contactBtnText.textContent = "Submit Enquiry";
      }

      if (contactLoader) {
        contactLoader.classList.add("hidden");
      }
    }
  });
})();
