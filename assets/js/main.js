/* Veyon Labs — site behaviour
   Theme toggle · mobile nav · sticky header · scroll reveal · contact form */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- theme */
  // The initial theme is applied by an inline script in <head> (see any page)
  // so there is no flash of the wrong palette. This only wires the toggle.
  var root = document.documentElement;

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("veyon-theme", theme);
    } catch (e) {
      /* private mode — theme just won't persist */
    }
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    });
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  });

  // Follow the OS only while the visitor has not chosen for themselves.
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      var stored = null;
      try {
        stored = localStorage.getItem("veyon-theme");
      } catch (err) {}
      if (!stored) root.setAttribute("data-theme", e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ----------------------------------------------------------- mobile nav */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navLinks = document.getElementById("nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* -------------------------------------------------------- sticky header */
  var header = document.querySelector(".site-header");
  if (header) {
    var syncHeader = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  /* --------------------------------------------------------- scroll reveal */
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length) {
    if (!("IntersectionObserver" in window)) {
      revealables.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry, i) {
            if (!entry.isIntersecting) return;
            // Stagger siblings that scroll into view together.
            entry.target.style.transitionDelay = Math.min(i * 70, 280) + "ms";
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealables.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* ------------------------------------------------------------ nav state */
  // Mark the current page in the nav without hand-editing aria-current per file.
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav__links a[href]").forEach(function (a) {
    var target = a.getAttribute("href").split("/").pop().toLowerCase();
    var section = a.dataset.section;
    if (target === here || (section && here.indexOf(section) === 0)) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* --------------------------------------------------------- contact form */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector(".form__status");
    var submit = form.querySelector("[type=submit]");
    var endpoint = form.getAttribute("action") || "";
    var configured = endpoint && endpoint.indexOf("YOUR_FORM_ID") === -1;

    var say = function (state, message) {
      if (!status) return;
      status.hidden = false;
      status.dataset.state = state;
      status.textContent = message;
    };

    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) return; // let the browser show its messages

      e.preventDefault();
      var data = new FormData(form);

      // Honeypot: real people leave this hidden field empty.
      if (data.get("company_website")) {
        say("success", "Thanks — we'll be in touch shortly.");
        form.reset();
        return;
      }

      if (!configured) {
        // No endpoint wired up yet: hand the message off to the mail client
        // so nothing is silently lost. See README for the 2-minute setup.
        var lines = [
          "Name: " + (data.get("name") || ""),
          "Email: " + (data.get("email") || ""),
          "Company: " + (data.get("company") || "—"),
          "Budget: " + (data.get("budget") || "—"),
          "Services: " + (data.getAll("services").join(", ") || "—"),
          "",
          data.get("message") || ""
        ].join("\n");
        window.location.href =
          "mailto:hello@veyonlabs.com?subject=" +
          encodeURIComponent("New project enquiry — " + (data.get("name") || "website")) +
          "&body=" +
          encodeURIComponent(lines);
        say(
          "success",
          "Opening your email app with the details filled in. Prefer a form that sends directly? See README.md."
        );
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.dataset.label = submit.textContent;
        submit.textContent = "Sending…";
      }
      say("pending", "Sending your message…");

      fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed with " + res.status);
          form.reset();
          say("success", "Thanks — your message is in. We reply to every enquiry within one business day.");
        })
        .catch(function () {
          say(
            "error",
            "Something went wrong sending that. Email us directly at hello@veyonlabs.com and we'll pick it up."
          );
        })
        .finally(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = submit.dataset.label || "Send enquiry";
          }
        });
    });
  }

  /* ------------------------------------------------------------- footer yr */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
