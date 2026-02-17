/* ============================================================
   NYRunway.com — Interactive JavaScript Engine
   Scroll animations, counters, carousels, timelines,
   navigation, language switching, FAQ accordions, and more
   ============================================================ */

(function () {
  'use strict';

  // --- Page Loader ---
  const loader = document.querySelector('.page-loader');
  if (loader) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('loaded');
        setTimeout(function () { loader.remove(); }, 600);
      }, 400);
    });
  }

  // --- Wait for DOM ---
  document.addEventListener('DOMContentLoaded', function () {

    // === Navigation ===
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__mobile-menu');
    const mobileLinks = document.querySelectorAll('.nav__mobile-link');

    // Scroll behavior for nav
    if (nav) {
      let lastScroll = 0;
      window.addEventListener('scroll', function () {
        var scrollY = window.scrollY || window.pageYOffset;
        if (scrollY > 80) {
          nav.classList.add('nav--scrolled');
        } else {
          nav.classList.remove('nav--scrolled');
        }
        lastScroll = scrollY;
      }, { passive: true });
    }

    // Hamburger toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
      });

      mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }

    // Language dropdown
    var langSwitch = document.querySelector('.nav__lang-switch');
    var langDropdown = document.querySelector('.nav__lang-dropdown');
    if (langSwitch && langDropdown) {
      langSwitch.addEventListener('click', function (e) {
        e.stopPropagation();
        langDropdown.classList.toggle('active');
      });
      document.addEventListener('click', function () {
        langDropdown.classList.remove('active');
      });
    }

    // === Scroll Animations (Intersection Observer) ===
    var animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
      var animObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      animatedElements.forEach(function (el) {
        animObserver.observe(el);
      });
    }

    // === Counter Animation ===
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length > 0 && 'IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    }

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var duration = 2000;
      var startTime = null;

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function updateCount(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var easedProgress = easeOutCubic(progress);
        var current = Math.floor(easedProgress * target);
        el.textContent = prefix + current.toLocaleString() + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = prefix + target.toLocaleString() + suffix;
        }
      }

      requestAnimationFrame(updateCount);
    }

    // === Bar Chart Animation ===
    var chartBars = document.querySelectorAll('.chart-bar[data-height]');
    if (chartBars.length > 0 && 'IntersectionObserver' in window) {
      var barObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var bars = entry.target.querySelectorAll('.chart-bar[data-height]');
            bars.forEach(function (bar, i) {
              setTimeout(function () {
                bar.style.height = bar.getAttribute('data-height');
              }, i * 80);
            });
            barObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      // Observe the parent containers
      var chartContainers = document.querySelectorAll('.chart-bars');
      chartContainers.forEach(function (container) {
        barObserver.observe(container);
      });
    }

    // === Draggable Timeline ===
    var timelineWrappers = document.querySelectorAll('.timeline__track-wrapper');
    timelineWrappers.forEach(function (wrapper) {
      var isDown = false;
      var startX, scrollLeft;

      wrapper.addEventListener('mousedown', function (e) {
        isDown = true;
        wrapper.classList.add('grabbing');
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
      });

      wrapper.addEventListener('mouseleave', function () {
        isDown = false;
        wrapper.classList.remove('grabbing');
      });

      wrapper.addEventListener('mouseup', function () {
        isDown = false;
        wrapper.classList.remove('grabbing');
      });

      wrapper.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        e.preventDefault();
        var x = e.pageX - wrapper.offsetLeft;
        var walk = (x - startX) * 2;
        wrapper.scrollLeft = scrollLeft - walk;
      });
    });

    // Timeline nav buttons
    var timelineNavBtns = document.querySelectorAll('.timeline__nav-btn');
    timelineNavBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-dir');
        var wrapper = btn.closest('.timeline').querySelector('.timeline__track-wrapper');
        if (wrapper) {
          var scrollAmount = dir === 'left' ? -350 : 350;
          wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      });
    });

    // === FAQ Accordion ===
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      var question = item.querySelector('.faq-item__question');
      if (question) {
        question.addEventListener('click', function () {
          var isActive = item.classList.contains('active');
          // Close all others
          faqItems.forEach(function (other) {
            other.classList.remove('active');
          });
          // Toggle current
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });

    // === Tabs ===
    var tabsSections = document.querySelectorAll('.tabs');
    tabsSections.forEach(function (tabSection) {
      var btns = tabSection.querySelectorAll('.tabs__btn');
      var panels = tabSection.querySelectorAll('.tabs__panel');

      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-tab');

          btns.forEach(function (b) { b.classList.remove('active'); });
          panels.forEach(function (p) { p.classList.remove('active'); });

          btn.classList.add('active');
          var targetPanel = tabSection.querySelector('[data-panel="' + target + '"]');
          if (targetPanel) targetPanel.classList.add('active');
        });
      });
    });

    // === Filter Pills ===
    var filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var group = pill.closest('.filter-pills');
        if (group) {
          group.querySelectorAll('.filter-pill').forEach(function (p) {
            p.classList.remove('active');
          });
        }
        pill.classList.add('active');

        // Filter grid items
        var filterValue = pill.getAttribute('data-filter');
        var targetGrid = pill.getAttribute('data-target');
        if (targetGrid) {
          var grid = document.querySelector(targetGrid);
          if (grid) {
            var items = grid.children;
            for (var i = 0; i < items.length; i++) {
              var item = items[i];
              if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = '';
              } else {
                item.style.display = 'none';
              }
            }
          }
        }
      });
    });

    // === Smooth Scroll for anchor links ===
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var navHeight = nav ? nav.offsetHeight : 0;
          var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      });
    });

    // === Parallax effect on hero background ===
    var heroImg = document.querySelector('.hero__bg-image');
    if (heroImg) {
      window.addEventListener('scroll', function () {
        var scrollY = window.scrollY || window.pageYOffset;
        if (scrollY < window.innerHeight) {
          heroImg.style.transform = 'translateY(' + (scrollY * 0.3) + 'px) scale(1.1)';
        }
      }, { passive: true });
    }

    // === Carousel auto-scroll for street runway ===
    var carousels = document.querySelectorAll('.street-runway__carousel');
    carousels.forEach(function (carousel) {
      var scrollInterval;
      var scrollSpeed = 1;
      var isPaused = false;

      function autoScroll() {
        if (!isPaused) {
          carousel.scrollLeft += scrollSpeed;
          if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth) {
            carousel.scrollLeft = 0;
          }
        }
      }

      scrollInterval = setInterval(autoScroll, 30);

      carousel.addEventListener('mouseenter', function () { isPaused = true; });
      carousel.addEventListener('mouseleave', function () { isPaused = false; });
      carousel.addEventListener('touchstart', function () { isPaused = true; }, { passive: true });
      carousel.addEventListener('touchend', function () {
        setTimeout(function () { isPaused = false; }, 3000);
      });
    });

    // === Ticker duplication for infinite scroll ===
    var tickers = document.querySelectorAll('.ticker__track');
    tickers.forEach(function (track) {
      var clone = track.innerHTML;
      track.innerHTML = clone + clone;
    });

    // === Search functionality ===
    var searchInputs = document.querySelectorAll('.search-bar__input');
    searchInputs.forEach(function (input) {
      var form = input.closest('form');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var query = input.value.trim();
          if (query) {
            // Simulated search - in production, this would hit an API
            alert('Searching the archive for: "' + query + '"');
          }
        });
      }
    });

    // === Newsletter form ===
    var ctaForms = document.querySelectorAll('.cta-banner__form');
    ctaForms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('.cta-banner__input');
        if (input && input.value.trim()) {
          var btn = form.querySelector('.btn');
          if (btn) {
            var originalText = btn.textContent;
            btn.textContent = btn.getAttribute('data-success') || 'Subscribed!';
            btn.style.background = '#2d5a3d';
            input.value = '';
            setTimeout(function () {
              btn.textContent = originalText;
              btn.style.background = '';
            }, 3000);
          }
        }
      });
    });

    // === Image lazy loading fallback ===
    if (!('loading' in HTMLImageElement.prototype)) {
      var lazyImages = document.querySelectorAll('img[loading="lazy"]');
      if ('IntersectionObserver' in window) {
        var imgObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              img.src = img.dataset.src || img.src;
              imgObserver.unobserve(img);
            }
          });
        });
        lazyImages.forEach(function (img) { imgObserver.observe(img); });
      }
    }

    // === Active nav link highlighting ===
    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(function (link) {
      if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
        link.classList.add('nav__link--active');
      }
    });

    // === Keyboard navigation for accessibility ===
    document.addEventListener('keydown', function (e) {
      // Escape to close mobile menu
      if (e.key === 'Escape') {
        if (hamburger && mobileMenu && mobileMenu.classList.contains('active')) {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.body.style.overflow = '';
        }
        if (langDropdown && langDropdown.classList.contains('active')) {
          langDropdown.classList.remove('active');
        }
      }
    });

    // === Back to top (on scroll) ===
    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 600) {
          backToTop.style.opacity = '1';
          backToTop.style.pointerEvents = 'auto';
        } else {
          backToTop.style.opacity = '0';
          backToTop.style.pointerEvents = 'none';
        }
      }, { passive: true });

      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // === Archive portal card hover animations (stagger) ===
    var portalCards = document.querySelectorAll('.archive-portal__card');
    if (portalCards.length > 0 && 'IntersectionObserver' in window) {
      var cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var cards = entry.target.querySelectorAll('.archive-portal__card');
            cards.forEach(function (card, i) {
              card.style.opacity = '0';
              card.style.transform = 'translateY(20px)';
              setTimeout(function () {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, i * 100);
            });
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      var portalGrid = document.querySelector('.archive-portal__grid');
      if (portalGrid) cardObserver.observe(portalGrid);
    }

    // === Dynamic copyright year ===
    var yearEl = document.querySelector('.footer-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

  }); // end DOMContentLoaded
})();
