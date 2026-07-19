// ── ACTIVE NAV ──
(function () {
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".sidebar-nav a");

  function updateActive() {
    var scrollY = window.scrollY + window.innerHeight * 0.3;
    var current = null;
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        current = section.getAttribute("id");
      }
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10) {
      current = sections[sections.length - 1].getAttribute("id");
    }
    if (!current) return;
    navLinks.forEach(function (link) {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
    if (window.innerWidth <= 900) {
      var activeLink = document.querySelector(".sidebar-nav a.active");
      if (activeLink) {
        activeLink.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
})();

// ── SMOOTH SCROLL ──
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      if (this.classList.contains("exp-see-more")) {
        var expWin = document.querySelector("#experience .terminal-window");
        if (expWin && expWin.classList.contains("maximized")) {
          expWin.classList.remove("maximized");
          document.getElementById("experience").classList.remove("maximized-section");
          document.body.classList.remove("maximized-active");
        }
      }

      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        if (target.style.display === "none") {
          target.style.display = "";
          var win = target.querySelector(".terminal-window");
          if (win) {
            win.classList.remove("minimized");
            win.classList.remove("maximized");
          }
          target.classList.remove("maximized-section");
          document.body.classList.remove("maximized-active");
          var navLink = document.querySelector('.sidebar-nav a[href="#' + target.id + '"]');
          if (navLink) {
            navLink.classList.remove("hidden-section");
            navLink.closest("li").classList.remove("section-hidden");
          }
          var hidden = JSON.parse(localStorage.getItem("hiddenSections") || "[]");
          hidden = hidden.filter(function (h) { return h !== target.id; });
          localStorage.setItem("hiddenSections", JSON.stringify(hidden));
          var minimized = JSON.parse(localStorage.getItem("minimizedSections") || "[]");
          minimized = minimized.filter(function (m) { return m !== target.id; });
          localStorage.setItem("minimizedSections", JSON.stringify(minimized));
        }
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
})();

// ── REVEAL ON SCROLL ──
(function () {
  var reveals = document.querySelectorAll(".reveal");
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );
  reveals.forEach(function (el) {
    observer.observe(el);
  });
})();

// ── TERMINAL TYPING ANIMATION ──
(function () {
  var body = document.querySelector(".home-terminal .terminal-body");
  if (!body) return;

  var data = [
    { cmd: "$ whoami", out: "> gabriel_ben — senior mobile engineer / React native" },
    { cmd: "$ status", out: "> senior mobile developer @ Timon" },
    { cmd: "$ uptime", out: "> shipping since 2020" },
  ];

  var delay = 500;

  data.forEach(function (item) {
    setTimeout(function () {
      var line = document.createElement("div");
      line.className = "term-line";
      body.appendChild(line);
      typeText(line, item.cmd, function () {
        var output = document.createElement("div");
        output.className = "term-output";
        output.textContent = item.out;
        body.appendChild(output);
      });
    }, delay);
    delay += item.cmd.length * 50 + 400;
  });

  function typeText(el, text, callback) {
    var i = 0;
    var interval = setInterval(function () {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 50);
  }
})();

// ── TERMINAL CLOSE ──
(function () {
  var overlay = document.getElementById("closeOverlay");
  if (!overlay) return;

  localStorage.removeItem("hiddenSections");
  localStorage.removeItem("minimizedSections");

  var pendingSection = null;

  function hideSection(section) {
    var id = section.id;
    section.classList.add("hiding");
    setTimeout(function () {
      section.style.display = "none";
      section.classList.remove("hiding");
    }, 400);
    var navLink = document.querySelector('.sidebar-nav a[href="#' + id + '"]');
    if (navLink) {
      navLink.classList.add("hidden-section");
      navLink.closest("li").classList.add("section-hidden");
    }
    var hidden = JSON.parse(localStorage.getItem("hiddenSections") || "[]");
    if (hidden.indexOf(id) === -1) hidden.push(id);
    localStorage.setItem("hiddenSections", JSON.stringify(hidden));
  }

  function showSection(id) {
    var section = document.getElementById(id);
    if (section) {
      section.style.display = "";
      var win = section.querySelector(".terminal-window");
      if (win) {
        if (win.classList.contains("minimized")) {
          win.classList.remove("minimized");
          var minimized = JSON.parse(localStorage.getItem("minimizedSections") || "[]");
          minimized = minimized.filter(function (m) { return m !== id; });
          localStorage.setItem("minimizedSections", JSON.stringify(minimized));
        }
        if (win.classList.contains("maximized")) {
          win.classList.remove("maximized");
          section.classList.remove("maximized-section");
          document.body.classList.remove("maximized-active");
        }
      }
      section.classList.add("hiding");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          section.classList.remove("hiding");
          section.scrollIntoView({ behavior: "smooth" });
        });
      });
    }
    var navLink = document.querySelector('.sidebar-nav a[href="#' + id + '"]');
    if (navLink) {
      navLink.classList.remove("hidden-section");
      navLink.closest("li").classList.remove("section-hidden");
    }
    var hidden = JSON.parse(localStorage.getItem("hiddenSections") || "[]");
    hidden = hidden.filter(function (h) {
      return h !== id;
    });
    localStorage.setItem("hiddenSections", JSON.stringify(hidden));
  }

  document.querySelectorAll(".terminal-bar .dots .close").forEach(function (dot) {
    dot.addEventListener("click", function () {
      var section = this.closest("section[id]");
      if (section) {
        pendingSection = section;
        overlay.classList.add("active");
      }
    });
  });

  overlay.querySelector(".close-yes").addEventListener("click", function () {
    if (pendingSection) {
      hideSection(pendingSection);
    }
    overlay.classList.remove("active");
    pendingSection = null;
  });

  overlay.querySelector(".close-no").addEventListener("click", function () {
    overlay.classList.remove("active");
    pendingSection = null;
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      pendingSection = null;
    }
  });

  document.querySelectorAll(".show-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showSection(this.dataset.target);
    });
  });

  // ── TERMINAL MINIMIZE ──
  document.querySelectorAll(".terminal-bar .dots .minimize").forEach(function (dot) {
    dot.addEventListener("click", function () {
      var section = this.closest("section[id]");
      if (!section) return;
      var win = section.querySelector(".terminal-window");
      if (!win) return;
      if (win.classList.contains("maximized")) {
        win.classList.remove("maximized");
        section.classList.remove("maximized-section");
        document.body.classList.remove("maximized-active");
      }
      win.classList.toggle("minimized");
      var id = section.id;
      var minimized = JSON.parse(localStorage.getItem("minimizedSections") || "[]");
      if (win.classList.contains("minimized")) {
        if (minimized.indexOf(id) === -1) minimized.push(id);
      } else {
        minimized = minimized.filter(function (m) {
          return m !== id;
        });
      }
      localStorage.setItem("minimizedSections", JSON.stringify(minimized));
    });
  });

  // ── TERMINAL MAXIMIZE ──
  document.querySelectorAll(".terminal-bar .dots .maximize").forEach(function (dot) {
    dot.addEventListener("click", function () {
      var section = this.closest("section[id]");
      if (!section) return;
      var win = section.querySelector(".terminal-window");
      if (!win) return;
      if (win.classList.contains("minimized")) {
        win.classList.remove("minimized");
        var id = section.id;
        var minimized = JSON.parse(localStorage.getItem("minimizedSections") || "[]");
        minimized = minimized.filter(function (m) { return m !== id; });
        localStorage.setItem("minimizedSections", JSON.stringify(minimized));
      }
      win.classList.toggle("maximized");
      section.classList.toggle("maximized-section");
      document.body.classList.toggle("maximized-active");
    });
  });

})();

// ── STATS COUNTER ──
(function () {
  var grid = document.querySelector(".stats-grid");
  if (!grid) return;
  var nums = grid.querySelectorAll(".stat-number");
  var animated = false;

  function animateNum(el, target, duration) {
    var start = 0;
    var startTime = null;
    var suffix = el.textContent.replace(/[0-9]/g, "");

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !animated) {
        animated = true;
        nums.forEach(function (el) {
          var val = parseInt(el.textContent, 10);
          if (!isNaN(val)) animateNum(el, val, 1500);
        });
      }
    });
  }, { threshold: 0.3 });
  observer.observe(grid);
})();

// ── STACK ITEMS STAGGER ──
(function () {
  var grid = document.querySelector(".stack-grid");
  if (!grid) return;
  var items = grid.querySelectorAll(".stack-item");

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        items.forEach(function (item, i) {
          setTimeout(function () {
            item.classList.add("visible");
          }, i * 50);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(grid);
})();

// ── EXPERIENCE CARDS STAGGER ──
(function () {
  var container = document.querySelector(".exp-cards");
  if (!container) return;
  var cards = container.querySelectorAll(".exp-card");

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        cards.forEach(function (card, i) {
          setTimeout(function () {
            card.classList.add("visible");
          }, i * 150);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(container);
})();

// ── CONTACT ITEMS FADE ──
(function () {
  var grid = document.querySelector(".contact-grid");
  if (!grid) return;
  var items = grid.querySelectorAll(".contact-item");

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        items.forEach(function (item, i) {
          setTimeout(function () {
            item.classList.add("visible");
          }, i * 150);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(grid);
})();

// ── CURSOR SPOTLIGHT ──
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var el = document.querySelector(".bg-spotlight");
  if (!el) return;
  var rafQueued = false;
  var mx = 0;
  var my = 0;

  function flush() {
    rafQueued = false;
    el.style.setProperty("--mx", mx + "px");
    el.style.setProperty("--my", my + "px");
  }

  window.addEventListener("mousemove", function (e) {
    mx = e.clientX;
    my = e.clientY;
    if (!rafQueued) {
      rafQueued = true;
      requestAnimationFrame(flush);
    }
  }, { passive: true });
})();

// ── RAIN DROPS ──
(function () {
  var canvas = document.getElementById("rainCanvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var drops = [];

  var config = {
    speed: 1.0,
    density: 50,
    opacity: 0.7,
    trailLength: 10,
    paused: false
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function createDrop() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1
    };
  }

  function initDrops() {
    drops = [];
    for (var i = 0; i < config.density; i++) {
      drops.push(createDrop());
    }
  }
  initDrops();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!config.paused) {
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent").trim();
      canvas.style.opacity = config.opacity;
      drops.forEach(function (d) {
        ctx.globalAlpha = d.opacity;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + config.trailLength);
        ctx.stroke();
        d.y += d.speed * config.speed;
        if (d.y > canvas.height) {
          d.y = -config.trailLength;
          d.x = Math.random() * canvas.width;
        }
      });
    }
    requestAnimationFrame(draw);
  }
  draw();

  function updateGradient(input) {
    var min = parseFloat(input.min);
    var max = parseFloat(input.max);
    var val = parseFloat(input.value);
    var pct = ((val - min) / (max - min)) * 100;
    input.style.background =
      "linear-gradient(to right, var(--accent) 0%, var(--accent) " +
      pct + "%, var(--border) " + pct + "%, var(--border) 100%)";
  }

  var toggle = document.querySelector(".rain-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var checked = this.getAttribute("aria-checked") === "true";
      this.setAttribute("aria-checked", String(!checked));
      config.paused = !checked;
      saveConfig();
    });
  }

  var speedInput = document.getElementById("rainSpeed");
  var speedVal = document.getElementById("rainSpeedVal");
  if (speedInput) {
    updateGradient(speedInput);
    speedInput.addEventListener("input", function () {
      config.speed = parseFloat(this.value);
      speedVal.textContent = config.speed.toFixed(1) + "x";
      updateGradient(this);
    });
    speedInput.addEventListener("change", saveConfig);
  }

  var opacityInput = document.getElementById("rainOpacity");
  var opacityVal = document.getElementById("rainOpacityVal");
  if (opacityInput) {
    updateGradient(opacityInput);
    opacityInput.addEventListener("input", function () {
      config.opacity = parseFloat(this.value);
      opacityVal.textContent = Math.round(config.opacity * 100) + "%";
      updateGradient(this);
    });
    opacityInput.addEventListener("change", saveConfig);
  }

  var trailInput = document.getElementById("rainTrail");
  var trailVal = document.getElementById("rainTrailVal");
  if (trailInput) {
    updateGradient(trailInput);
    trailInput.addEventListener("input", function () {
      config.trailLength = parseInt(this.value, 10);
      trailVal.textContent = config.trailLength + "px";
      updateGradient(this);
    });
    trailInput.addEventListener("change", saveConfig);
  }

  function saveConfig() {
    localStorage.setItem("rainConfig", JSON.stringify(config));
  }

  function loadConfig() {
    try {
      var saved = JSON.parse(localStorage.getItem("rainConfig"));
      if (saved) {
        config.speed = saved.speed || 1.0;
        config.density = 50;
        config.opacity = saved.opacity || 0.7;
        config.trailLength = saved.trailLength || 10;
        config.paused = saved.paused || false;
        if (speedInput) { speedInput.value = config.speed; speedVal.textContent = config.speed.toFixed(1) + "x"; updateGradient(speedInput); }
        if (opacityInput) { opacityInput.value = config.opacity; opacityVal.textContent = Math.round(config.opacity * 100) + "%"; updateGradient(opacityInput); }
        if (trailInput) { trailInput.value = config.trailLength; trailVal.textContent = config.trailLength + "px"; updateGradient(trailInput); }
        if (toggle) { toggle.setAttribute("aria-checked", String(config.paused)); }
        initDrops();
      }
    } catch (e) {}
  }
  loadConfig();
})();
