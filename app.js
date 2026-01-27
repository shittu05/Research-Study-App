// app.js
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || null;
  initProgressPersistence(page);

  initHeaderNavigation();

  switch (page) {
    case "signup":
      initSignupPage();
      break;
    case "preDirections":
      // (Nothing special required here yet)
      break;
    case "video":
      initVideoPage();
      break;
    case "survey":
      initSurveyPage();
      break;
    case "hub":
      initHubPage();
      break;
  }
});

/* ---------- Progress persistence & resume banner ---------- */
function initHeaderNavigation() {
  const header = document.querySelector(".app-header");
  if (!header) return;

  header.style.cursor = "pointer";
  header.setAttribute("title", "Back to learning materials");

  header.addEventListener("click", (e) => {
    // don't override click
    const tag = e.target.tagName.toLowerCase();
    if (tag === "a" || tag === "button") return;

    window.location.href = "learning-hub.html";
  });
}



const PAGE_URLS = {
  signup: "index.html",
  preDirections: "pre-directions.html",
  video: "video.html",
  survey: "survey.html",
  hub: "learning-hub.html",
};

function initProgressPersistence(currentPage) {
  const lastPage = localStorage.getItem("researchAppLastPage");

  if (lastPage && currentPage && lastPage !== currentPage) {
    showResumeBanner(lastPage);
  }

  if (currentPage) {
    localStorage.setItem("researchAppLastPage", currentPage);
  }
}

function showResumeBanner(lastPageKey) {
  const existing = document.querySelector(".resume-banner");
  if (existing) return;

  const labelMap = {
    signup: "Sign Up",
    preDirections: "Pre-Directions",
    video: "Video Explanation",
    survey: "Short Survey",
    hub: "Learning Hub",
  };

  const div = document.createElement("div");
  div.className = "resume-banner";
  div.innerHTML = `
    <span>Resume where you left off? Last page: <strong>${labelMap[lastPageKey] || "Unknown"}</strong></span>
    <button class="btn btn-sm btn-light me-1" type="button" id="resumeBtn">Resume</button>
    <button class="btn btn-sm btn-outline-light" type="button" id="dismissResumeBtn">Dismiss</button>
  `;

  document.body.appendChild(div);

  document.getElementById("resumeBtn").addEventListener("click", () => {
    const url = PAGE_URLS[lastPageKey];
    if (url) {
      window.location.href = url;
    }
  });

  document.getElementById("dismissResumeBtn").addEventListener("click", () => {
    div.remove();
  });
}

/* ---------- Page 1: Sign Up ---------- */

function initSignupPage() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const strengthBar = document.getElementById("passwordStrengthBar");
  const strengthLabel = document.getElementById("passwordStrengthLabel");
  const submitBtn = document.getElementById("signupSubmit");
  const feedback = document.getElementById("signupFeedback");

  // Toggle password visibility
  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePasswordBtn.setAttribute("aria-pressed", String(isPassword));
    togglePasswordBtn.innerHTML = isPassword
      ? '<i class="bi bi-eye-slash"></i>'
      : '<i class="bi bi-eye"></i>';
  });

  // Validation helpers
  const showError = (input, message) => {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    const feedbackEl = input.nextElementSibling;
    if (feedbackEl && feedbackEl.classList.contains("invalid-feedback")) {
      feedbackEl.textContent = message;
    }
  };

  const showSuccess = (input) => {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  };

  const validateName = () => {
    const value = nameInput.value.trim();
    if (!value) {
      showError(nameInput, "Please enter your name.");
      return false;
    }
    if (value.length < 2) {
      showError(nameInput, "Name should be at least 2 characters.");
      return false;
    }
    showSuccess(nameInput);
    return true;
  };

  const validateEmail = () => {
    const value = emailInput.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      showError(emailInput, "Please enter your email.");
      return false;
    }
    if (!re.test(value)) {
      showError(emailInput, "Please enter a valid email address.");
      return false;
    }
    showSuccess(emailInput);
    return true;
  };

  const getPasswordStrength = (value) => {
    let score = 0;
    if (value.length >= 4) score++;
    if (value.length >= 6) score++;
    if (/\d/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (score <= 1) return { level: "Weak", percent: 25, color: "bg-danger" };
    if (score <= 3) return { level: "Medium", percent: 60, color: "bg-warning" };
    return { level: "Strong", percent: 100, color: "bg-success" };
  };

  const validatePassword = () => {
    const value = passwordInput.value;
    if (!value) {
      showError(passwordInput, "Please enter a password.");
      updatePasswordStrength("");
      return false;
    }
    if (value.length < 4) {
      showError(passwordInput, "Password should be at least 4 characters.");
      updatePasswordStrength(value);
      return false;
    }
    showSuccess(passwordInput);
    updatePasswordStrength(value);
    return true;
  };

  const updatePasswordStrength = (value) => {
    const strength = getPasswordStrength(value);
    strengthBar.style.width = strength.percent + "%";
    strengthBar.className = "password-strength-bar " + strength.color;
    strengthLabel.textContent = value ? strength.level : "Enter a password";
  };

  // Real-time password strength
  passwordInput.addEventListener("input", (e) => {
    updatePasswordStrength(e.target.value);
  });

  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    feedback.textContent = "";
    feedback.classList.add("d-none");

    const validName = validateName();
    const validEmail = validateEmail();
    const validPassword = validatePassword();

    if (!validName || !validEmail || !validPassword) {
      feedback.textContent = "Please correct the highlighted fields.";
      feedback.classList.remove("d-none");
      feedback.classList.remove("alert-success");
      feedback.classList.add("alert-danger");
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Creating account...';

    // Simulate async signup
    setTimeout(() => {
      localStorage.setItem("researchAppUserName", nameInput.value.trim());
      localStorage.setItem("researchAppUserEmail", emailInput.value.trim());
      feedback.textContent = "Sign up successful! Redirecting...";
      feedback.classList.remove("d-none");
      feedback.classList.remove("alert-danger");
      feedback.classList.add("alert-success");

      setTimeout(() => {
        window.location.href = "pre-directions.html";
      }, 800);
    }, 1000);
  });
}

/* ---------- Page 3: Video Explanation ---------- */

function initVideoPage() {
  const video = document.getElementById("explanationVideo");
  const continueBtn = document.getElementById("videoContinueBtn");
  const progressLabel = document.getElementById("videoProgressLabel");
  const transcriptToggle = document.getElementById("transcriptToggle");
  const transcriptBox = document.getElementById("transcriptBox");

  if (!video || !continueBtn) return;

  const MIN_WATCH_SECONDS = 15;
  let requirementMet = false;

  const setContinueEnabled = (enabled) => {
    continueBtn.disabled = !enabled;
    if (enabled) {
      continueBtn.classList.remove("btn-secondary");
      continueBtn.classList.add("btn-primary");
      continueBtn.setAttribute("aria-disabled", "false");
    } else {
      continueBtn.classList.add("btn-secondary");
      continueBtn.classList.remove("btn-primary");
      continueBtn.setAttribute("aria-disabled", "true");
    }
  };

  setContinueEnabled(false);

  video.addEventListener("timeupdate", () => {
    if (video.duration) {
      const percent = (video.currentTime / video.duration) * 100;
      if (progressLabel) {
        progressLabel.textContent = `Watched: ${Math.round(percent)}%`;
      }
      if (!requirementMet && (video.currentTime >= MIN_WATCH_SECONDS || percent >= 50)) {
        requirementMet = true;
        setContinueEnabled(true);
      }
    } else {
      if (video.currentTime >= MIN_WATCH_SECONDS && !requirementMet) {
        requirementMet = true;
        setContinueEnabled(true);
      }
    }
  });

  video.addEventListener("ended", () => {
    requirementMet = true;
    setContinueEnabled(true);
    if (progressLabel) {
      progressLabel.textContent = "Watched: 100%";
    }
  });

  continueBtn.addEventListener("click", () => {
    if (!requirementMet) return;
    window.location.href = "survey.html";
  });

  if (transcriptToggle && transcriptBox) {
    transcriptToggle.addEventListener("click", () => {
      const isHidden = transcriptBox.classList.contains("d-none");
      transcriptBox.classList.toggle("d-none", !isHidden);
      transcriptToggle.setAttribute("aria-expanded", String(isHidden));
    });
  }
}

/* ---------- Page 4: Survey ---------- */

function initSurveyPage() {
  const textarea = document.getElementById("surveyText");
  const charCounter = document.getElementById("charCount");
  const submitBtn = document.getElementById("surveySubmit");
  const feedback = document.getElementById("surveyFeedback");
  const autoSaveToast = document.getElementById("autosaveToast");

  if (!textarea || !submitBtn) return;

  const MIN_CHARS = 2;
  let submitted = false;

  // Load draft
  const draft = localStorage.getItem("surveyDraft");
  if (draft) {
    textarea.value = draft;
  }

  const updateCounter = () => {
    const len = textarea.value.trim().length;
    if (!charCounter) return;
    charCounter.textContent = `${len} characters`;
    charCounter.classList.remove("too-short", "ok");
    if (len < MIN_CHARS) {
      charCounter.classList.add("too-short");
    } else {
      charCounter.classList.add("ok");
    }
  };

  updateCounter();

  textarea.addEventListener("input", updateCounter);

  const containsProfanity = (text) => {
    const blacklist = ["badword1", "badword2"]; // placeholder list
    const lower = text.toLowerCase();
    return blacklist.some((word) => lower.includes(word));
  };

  const showToast = () => {
    if (!autoSaveToast) return;
    autoSaveToast.classList.add("visible");
    setTimeout(() => {
      autoSaveToast.classList.remove("visible");
    }, 1500);
  };

  // Auto-save every 15 seconds
  setInterval(() => {
    localStorage.setItem("surveyDraft", textarea.value);
    showToast();
  }, 15000);

  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    feedback.classList.add("d-none");
    const answer = textarea.value.trim();
    const len = answer.length;

    if (len < MIN_CHARS) {
      feedback.textContent = `Please write at least ${MIN_CHARS} characters.`;
      feedback.classList.remove("d-none");
      feedback.classList.remove("alert-success");
      feedback.classList.add("alert-danger");
      return;
    }

    if (containsProfanity(answer)) {
      feedback.textContent =
        "Your response appears to contain inappropriate language. Please revise it.";
      feedback.classList.remove("d-none");
      feedback.classList.remove("alert-success");
      feedback.classList.add("alert-danger");
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Submitting...';

    setTimeout(() => {
      submitted = true;
      localStorage.setItem("surveyResponse", answer);
      localStorage.removeItem("surveyDraft");
      feedback.textContent = "Response saved! Moving to learning materials...";
      feedback.classList.remove("d-none");
      feedback.classList.remove("alert-danger");
      feedback.classList.add("alert-success");

      setTimeout(() => {
        window.location.href = "learning-hub.html";
      }, 900);
    }, 900);
  });

  // Warn before leaving if not submitted and text present
  window.addEventListener("beforeunload", (e) => {
    if (!submitted && textarea.value.trim().length > 0) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}

/* ---------- Page 5: Learning Hub ---------- */

function initHubPage() {
  const conceptNodes = document.querySelectorAll(".concept-node");
  const explanationBox = document.getElementById("conceptExplanation");
  const zoomRange = document.getElementById("zoomRange");
  const conceptInner = document.querySelector(".concept-map-inner");
  const hintBtn = document.getElementById("hintBtn");
  const hintBox = document.getElementById("hintBox");
  const checkAnswerBtn = document.getElementById("checkAnswerBtn");
  const answerFeedback = document.getElementById("answerFeedback");
  const solutionBtn = document.getElementById("solutionBtn");
  const solutionBox = document.getElementById("solutionBox");
  const continueBtn = document.getElementById("completionBtn");
  const downloadDataBtn = document.getElementById("downloadDataBtn");

  // Concept node click explanations
  conceptNodes.forEach((node) => {
    node.addEventListener("click", () => {
      const text = node.getAttribute("data-explanation") || "No details.";
      if (explanationBox) {
        explanationBox.textContent = text;
      }
    });
  });

  // Zoom range
  if (zoomRange && conceptInner) {
    zoomRange.addEventListener("input", (e) => {
      const value = e.target.value;
      const scale = value / 100;
      conceptInner.style.transform = `scale(${scale})`;
    });
  }

  // Hint
  if (hintBtn && hintBox) {
    hintBtn.addEventListener("click", () => {
      const isHidden = hintBox.classList.contains("d-none");
      hintBox.classList.toggle("d-none", !isHidden);
    });
  }

  // Check answer
  if (checkAnswerBtn && answerFeedback) {
    checkAnswerBtn.addEventListener("click", () => {
      const selected = document.querySelector('input[name="practiceQuestion"]:checked');
      if (!selected) {
        answerFeedback.textContent = "Please select an option.";
        answerFeedback.classList.remove("text-success");
        answerFeedback.classList.add("text-danger");
        return;
      }

      const isCorrect = selected.dataset.correct === "true";
      if (isCorrect) {
        answerFeedback.textContent = "Correct! Well done.";
        answerFeedback.classList.remove("text-danger");
        answerFeedback.classList.add("text-success");
      } else {
        answerFeedback.textContent = "Not quite. Try again or reveal the solution.";
        answerFeedback.classList.remove("text-success");
        answerFeedback.classList.add("text-danger");
      }
    });
  }

  // Show solution
  if (solutionBtn && solutionBox) {
    solutionBtn.addEventListener("click", () => {
      solutionBox.classList.toggle("d-none");
    });
  }

  // Completion
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      alert("You have completed the study flow. Thank you for your participation!");
    });
  }

  // Data export
  if (downloadDataBtn) {
    downloadDataBtn.addEventListener("click", () => {
      const data = {
        name: localStorage.getItem("researchAppUserName") || null,
        email: localStorage.getItem("researchAppUserEmail") || null,
        surveyResponse: localStorage.getItem("surveyResponse") || null,
        lastPage: localStorage.getItem("researchAppLastPage") || null,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "research-data.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }
}
