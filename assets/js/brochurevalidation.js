(() => {
  if (window.__fernBrochureFormInitialized) return;

  window.__fernBrochureFormInitialized = true;

  /* =========================================
     1. CONFIGURATION
  ========================================= */

  // Change only this URL when connecting your backend.

  const API_URL = "https://your-url-here.com/api/submit";

  const BROCHURE_PDF_URL = "assets/pdf/fern-brochure.pdf";

  const BROCHURE_FILE_NAME = "Fern-Brochure.pdf";

  /* =========================================
     2. REGEX & VALIDATION STATE
  ========================================= */

  const nameRegex = /^[A-Za-z.\s]+$/;

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  let nameInvalidAttempt = false;

  /* =========================================
     3. INPUTS
  ========================================= */

  const nameInput = document.getElementById("brochureNameInput");
  const emailInput = document.getElementById("brochureEmailInput");
  const phoneInput = document.getElementById("brochurePhoneInput");

  const mainForm = document.getElementById("brochureForm");

  if (!mainForm || !nameInput || !emailInput || !phoneInput) {
    console.error("Brochure form elements are missing.");
    return;
  }

  /* =========================================
     4. ERROR HANDLING
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
    ["brochureNameError", "brochureEmailError", "brochurePhoneError"].forEach(
      hideError,
    );
  }

  /* =========================================
     5. PHONE INITIALIZATION
  ========================================= */

  if (typeof window.intlTelInput !== "function") {
    console.error("intl-tel-input library is not loaded.");
    return;
  }

  const countryCodeInitialise = window.intlTelInput(phoneInput, {
    initialCountry: "in",
    separateDialCode: true,
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  /* =========================================
     6. NAME VALIDATION
  ========================================= */

  function validateName(showRequiredError = true) {
    const fullname = nameInput.value.trim();

    if (nameInvalidAttempt) {
      showError(
        "brochureNameError",
        "Numbers and special characters are not allowed in the name.",
      );

      return false;
    }

    if (!fullname) {
      if (showRequiredError) {
        showError("brochureNameError", "Name is required.");
      } else {
        hideError("brochureNameError");
      }

      return false;
    }

    if (!nameRegex.test(fullname)) {
      showError(
        "brochureNameError",
        "Only letters, spaces and periods are allowed.",
      );

      return false;
    }

    hideError("brochureNameError");
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
        "brochureNameError",
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

      showError("brochureNameError", "Numbers are not allowed in the name.");
    } else if (/[^A-Za-z.\s]/.test(originalValue)) {
      nameInvalidAttempt = true;

      showError(
        "brochureNameError",
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
        hideError("brochureNameError");
      }
    }
  });

  nameInput.addEventListener("blur", () => {
    validateName(true);
  });

  /* =========================================
     7. EMAIL VALIDATION
  ========================================= */

  function validateEmail(showRequiredError = true) {
    const email = emailInput.value.trim();

    if (!email) {
      if (showRequiredError) {
        showError("brochureEmailError", "Email address is required.");
      } else {
        hideError("brochureEmailError");
      }

      return false;
    }

    if (!emailRegex.test(email)) {
      showError("brochureEmailError", "Please enter a valid email address.");

      return false;
    }

    hideError("brochureEmailError");
    return true;
  }

  emailInput.addEventListener("input", () => {
    if (emailInput.value.trim()) {
      validateEmail(false);
    } else {
      hideError("brochureEmailError");
    }
  });

  emailInput.addEventListener("blur", () => {
    validateEmail(true);
  });

  /* =========================================
     8. PHONE VALIDATION
  ========================================= */

  function updatePhoneMaxLength() {
    const country = countryCodeInitialise.getSelectedCountryData();

    if (country.iso2 === "in") {
      phoneInput.maxLength = 10;
    } else {
      phoneInput.removeAttribute("maxlength");
    }
  }

  function validatePhone(showRequiredError = true) {
    const country = countryCodeInitialise.getSelectedCountryData();
    const phone = phoneInput.value.trim();

    if (!phone) {
      if (showRequiredError) {
        showError("brochurePhoneError", "Phone number is required.");
      } else {
        hideError("brochurePhoneError");
      }

      return false;
    }

    if (country.iso2 === "in") {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        showError(
          "brochurePhoneError",
          "Enter a valid 10-digit number starting with 6, 7, 8 or 9.",
        );

        return false;
      }
    } else if (!countryCodeInitialise.isValidNumber()) {
      showError("brochurePhoneError", "Please enter a valid phone number.");

      return false;
    }

    hideError("brochurePhoneError");
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

    const country = countryCodeInitialise.getSelectedCountryData();

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

      showError("brochurePhoneError", "Number must start with 6, 7, 8 or 9.");
    }
  });

  phoneInput.addEventListener("input", () => {
    const country = countryCodeInitialise.getSelectedCountryData();

    let value = phoneInput.value.replace(/\D/g, "");

    if (country.iso2 === "in") {
      value = value.slice(0, 10);

      if (value.length > 0 && !/^[6-9]/.test(value)) {
        phoneInput.value = "";

        showError("brochurePhoneError", "Number must start with 6, 7, 8 or 9.");

        return;
      }
    }

    phoneInput.value = value;

    if (value) {
      validatePhone(false);
    } else {
      hideError("brochurePhoneError");
    }
  });

  phoneInput.addEventListener("blur", () => {
    validatePhone(true);
  });

  /* =========================================
     9. PDF DOWNLOAD
  ========================================= */

  function downloadBrochure() {
    const downloadLink = document.createElement("a");

    downloadLink.href = BROCHURE_PDF_URL;
    downloadLink.download = BROCHURE_FILE_NAME;

    document.body.appendChild(downloadLink);

    downloadLink.click();

    downloadLink.remove();
  }

  /* =========================================
     10. FORM SUBMISSION
  ========================================= */

  mainForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAllErrors();

    let hasError = false;

    const fullname = nameInput.value.trim();
    const email = emailInput.value.trim();

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

    // STOP IF ANY VALIDATION FAILS.

    if (hasError) return;

    /* =========================================
       11. FORM DATA
    ========================================= */

    const data = {
      fullname,
      email,
      phone: countryCodeInitialise.getNumber(),
    };

    console.log("Brochure Form Data:", data);

    /* =========================================
       12. SUBMIT UI
    ========================================= */

    const submitBtn = document.getElementById("brochureSubmitBtn");
    const btnText = document.getElementById("btnText");
    const loader = document.getElementById("loader");
    const formMessage = document.getElementById("brochureFormMessage");

    if (formMessage) {
      formMessage.textContent = "";
      formMessage.classList.remove("text-success", "text-danger");
    }

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Submitting...";
    if (loader) loader.classList.remove("hidden");

    try {
      /* =========================================
         13. POST API REQUEST
      ========================================= */

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(data),
      });

      const responseText = await response.text();

      let result = null;

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = responseText;
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof result === "object" && result?.message
            ? result.message
            : "Form submission failed. Please try again.";

        throw new Error(errorMessage);
      }

      if (
        typeof result === "object" &&
        result?.status &&
        result.status !== "success"
      ) {
        throw new Error(result.message || "Form submission failed.");
      }

      /* =========================================
         14. SUCCESS
      ========================================= */

      if (formMessage) {
        formMessage.textContent =
          "Form submitted successfully! Your brochure is downloading.";

        formMessage.classList.add("text-success");
      } else {
        alert("Form submitted successfully!");
      }

      // Download only after successful API response.

      downloadBrochure();

      // Reset form.

      mainForm.reset();

      countryCodeInitialise.setCountry("in");

      updatePhoneMaxLength();

      // Reset validation state.

      nameInvalidAttempt = false;

      // Clear validation errors.

      clearAllErrors();
    } catch (error) {
      console.error("Brochure form submission error:", error);

      if (formMessage) {
        formMessage.textContent =
          error.message || "Submission failed. Please try again.";

        formMessage.classList.add("text-danger");
      } else {
        alert(error.message || "Submission failed. Please try again.");
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = "Submit Enquiry";
      if (loader) loader.classList.add("hidden");
    }
  });
})();
