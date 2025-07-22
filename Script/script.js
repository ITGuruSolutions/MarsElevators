// Vertical slider logic
const slides = Array.from(document.querySelectorAll('.slide'));
const dotsContainer = document.getElementById('dots');
let current = 0;

function updateSlides(newIndex) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active', 'above', 'below');
    if (i === newIndex) slide.classList.add('active');
    else if (i < newIndex) slide.classList.add('above');
    else slide.classList.add('below');
  });
  Array.from(dotsContainer.children).forEach((dot, i) => {
    dot.classList.toggle('active', i === newIndex);
    if (i === newIndex) {
      dot.setAttribute('aria-current', 'true');
    } else {
      dot.removeAttribute('aria-current');
    }
  });
  current = newIndex;
}

// Dots
// Clear any existing dots (in case of hot reload)
dotsContainer.innerHTML = '';
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('tabindex', '0');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  if (i === 0) dot.setAttribute('aria-current', 'true');
  dot.onclick = () => updateSlides(i);
  dot.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      updateSlides(i);
    }
  };
  dotsContainer.appendChild(dot);
});

// Scroll/Swipe
let lastScroll = 0;
window.addEventListener('wheel', (e) => {
  if (Date.now() - lastScroll < 800) return;
  if (e.deltaY > 0 && current < slides.length - 1) updateSlides(current + 1);
  else if (e.deltaY < 0 && current > 0) updateSlides(current - 1);
  lastScroll = Date.now();
});

// Touch swipe
let startY = null;
window.addEventListener('touchstart', (e) => (startY = e.touches[0].clientY));
window.addEventListener('touchend', (e) => {
  if (startY === null) return;
  let endY = e.changedTouches[0].clientY;
  if (endY - startY > 50 && current > 0) updateSlides(current - 1);
  else if (startY - endY > 50 && current < slides.length - 1) updateSlides(current + 1);
  startY = null;
});

// Keyboard
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' && current < slides.length - 1) updateSlides(current + 1);
  if (e.key === 'ArrowUp' && current > 0) updateSlides(current - 1);
});

// Slide-out menu logic
const openMenu = document.getElementById('openMenu');
const closeMenu = document.getElementById('closeMenu');
const menu = document.getElementById('elevatorMenu');
const backdrop = document.getElementById('menuBackdrop');

openMenu.onclick = () => {
  menu.classList.add('open');
  backdrop.classList.add('show');
};

// Ensure both backdrop and close button close the menu
const closeMenuHandler = () => {
  menu.classList.remove('open');
  backdrop.classList.remove('show');
};
backdrop.onclick = closeMenuHandler;
if (closeMenu) closeMenu.onclick = closeMenuHandler;

// Add click handlers for side menu buttons to close menu
const menuButtons = document.querySelectorAll('.elevator-menu-btn');
menuButtons.forEach((btn) => {
  btn.onclick = () => {
    menu.classList.remove('open');
    backdrop.classList.remove('show');
    // TODO: Add navigation logic here if needed
  };
});

// Navbar hide/show on scroll (enhanced)
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.elevator-navbar');
let navbarVisible = true;

function showNavbar() {
  if (!navbarVisible) {
    navbar.classList.remove('hide');
    navbar.classList.add('show');
    navbarVisible = true;
  }
}
function hideNavbar() {
  if (navbarVisible) {
    navbar.classList.add('hide');
    navbar.classList.remove('show');
    navbarVisible = false;
  }
}

window.addEventListener('scroll', function () {
  const currentScrollY = window.scrollY;
  // Always show at the very top (hero section)
  if (currentScrollY < 80) {
    showNavbar();
  } else if (currentScrollY > lastScrollY + 5) {
    // Scrolling down
    hideNavbar();
  } else if (currentScrollY < lastScrollY - 5) {
    // Scrolling up
    showNavbar();
  }
  lastScrollY = currentScrollY;
});

// Frame motion: animate elements on scroll into view
const motionElements = document.querySelectorAll('.motion-frame, .motion-fade, .motion-zoom');
const observer = new window.IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.getAttribute('data-motion-delay');
      if (delay) {
        entry.target.style.transitionDelay = delay;
      }
      entry.target.classList.add('motion-in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
motionElements.forEach((el) => observer.observe(el));

// On page load, animate elements already in viewport with delay
window.addEventListener('DOMContentLoaded', () => {
  motionElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      const delay = el.getAttribute('data-motion-delay') || '0.3s';
      setTimeout(() => {
        el.classList.add('motion-in-view');
      }, parseFloat(delay) * 1000);
    }
  });
});

// --- Search Overlay Logic ---
const searchBtns = document.querySelectorAll('.elevator-nav-search');
let searchOverlay = document.getElementById('searchOverlay');
if (!searchOverlay) {
  searchOverlay = document.createElement('div');
  searchOverlay.id = 'searchOverlay';
  searchOverlay.style.position = 'fixed';
  searchOverlay.style.top = 0;
  searchOverlay.style.left = 0;
  searchOverlay.style.width = '100vw';
  searchOverlay.style.height = '100vh';
  searchOverlay.style.background = 'rgba(0,0,0,0.6)';
  searchOverlay.style.display = 'flex';
  searchOverlay.style.alignItems = 'center';
  searchOverlay.style.justifyContent = 'center';
  searchOverlay.style.zIndex = 2000;
  searchOverlay.style.visibility = 'hidden';
  searchOverlay.innerHTML = `<div id="searchBox" style="background:#fff;padding:2rem 2.5rem;border-radius:2rem;box-shadow:0 4px 32px rgba(0,0,0,0.18);display:flex;flex-direction:column;align-items:center;min-width:300px;max-width:90vw;"><input id="searchInput" type="text" placeholder="Type to search..." style="font-size:1.3rem;padding:0.7em 1em;border-radius:1em;border:1px solid #ccc;width:100%;outline:none;" autofocus><button id="closeSearch" style="margin-top:1.5em;background:var(--color-main,#B76E79);color:#fff;border:none;padding:0.5em 1.5em;border-radius:1em;font-size:1rem;cursor:pointer;">Close</button></div>`;
  document.body.appendChild(searchOverlay);
}
function openSearch() {
  searchOverlay.style.visibility = 'visible';
  setTimeout(() => {
    const input = document.getElementById('searchInput');
    if (input) input.focus();
  }, 50);
}
function closeSearch() {
  searchOverlay.style.visibility = 'hidden';
}
searchBtns.forEach(btn => btn.onclick = openSearch);
document.getElementById('closeSearch').onclick = closeSearch;
searchOverlay.onclick = function(e) {
  if (e.target === searchOverlay) closeSearch();
};
document.addEventListener('keydown', function(e) {
  if (searchOverlay.style.visibility === 'visible' && e.key === 'Escape') closeSearch();
});

// About page slider functionality
const aboutSlider = document.getElementById('aboutSlider');
if (aboutSlider) {
  const aboutSlides = Array.from(aboutSlider.querySelectorAll('.slide'));
  const aboutDotsContainer = document.getElementById('aboutDots');
  let aboutCurrent = 0;

  function updateAboutSlides(newIndex) {
    aboutSlides.forEach((slide, i) => {
      slide.classList.remove('active', 'above', 'below');
      if (i === newIndex) slide.classList.add('active');
      else if (i < newIndex) slide.classList.add('above');
      else slide.classList.add('below');
    });
    
    if (aboutDotsContainer) {
      Array.from(aboutDotsContainer.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === newIndex);
        if (i === newIndex) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }
    aboutCurrent = newIndex;
  }

  // Create dots for about slider
  if (aboutDotsContainer) {
    aboutDotsContainer.innerHTML = '';
    aboutSlides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.setAttribute('aria-current', 'true');
      dot.onclick = () => updateAboutSlides(i);
      dot.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          updateAboutSlides(i);
        }
      };
      aboutDotsContainer.appendChild(dot);
    });
  }

  // Auto-advance about slider
  let aboutAutoAdvance = setInterval(() => {
    if (aboutCurrent < aboutSlides.length - 1) {
      updateAboutSlides(aboutCurrent + 1);
    } else {
      updateAboutSlides(0);
    }
  }, 5000); // Change slide every 5 seconds

  // Pause auto-advance on hover
  aboutSlider.addEventListener('mouseenter', () => {
    clearInterval(aboutAutoAdvance);
  });

  aboutSlider.addEventListener('mouseleave', () => {
    aboutAutoAdvance = setInterval(() => {
      if (aboutCurrent < aboutSlides.length - 1) {
        updateAboutSlides(aboutCurrent + 1);
      } else {
        updateAboutSlides(0);
      }
    }, 5000);
  });
}

// Services page slider functionality
const servicesSlider = document.getElementById('servicesSlider');
if (servicesSlider) {
  const servicesSlides = Array.from(servicesSlider.querySelectorAll('.slide'));
  const servicesDotsContainer = document.getElementById('servicesDots');
  let servicesCurrent = 0;

  function updateServicesSlides(newIndex) {
    servicesSlides.forEach((slide, i) => {
      slide.classList.remove('active', 'above', 'below');
      if (i === newIndex) slide.classList.add('active');
      else if (i < newIndex) slide.classList.add('above');
      else slide.classList.add('below');
    });
    
    if (servicesDotsContainer) {
      Array.from(servicesDotsContainer.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === newIndex);
        if (i === newIndex) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }
    servicesCurrent = newIndex;
  }

  // Create dots for services slider
  if (servicesDotsContainer) {
    servicesDotsContainer.innerHTML = '';
    servicesSlides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.setAttribute('aria-current', 'true');
      dot.onclick = () => updateServicesSlides(i);
      dot.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          updateServicesSlides(i);
        }
      };
      servicesDotsContainer.appendChild(dot);
    });
  }

  // Auto-advance services slider
  let servicesAutoAdvance = setInterval(() => {
    if (servicesCurrent < servicesSlides.length - 1) {
      updateServicesSlides(servicesCurrent + 1);
    } else {
      updateServicesSlides(0);
    }
  }, 5000); // Change slide every 5 seconds

  // Pause auto-advance on hover
  servicesSlider.addEventListener('mouseenter', () => {
    clearInterval(servicesAutoAdvance);
  });

  servicesSlider.addEventListener('mouseleave', () => {
    servicesAutoAdvance = setInterval(() => {
      if (servicesCurrent < servicesSlides.length - 1) {
        updateServicesSlides(servicesCurrent + 1);
      } else {
        updateServicesSlides(0);
      }
    }, 5000);
  });
}

// FAQ page slider functionality
const faqSlider = document.getElementById('faqSlider');
if (faqSlider) {
  const faqSlides = Array.from(faqSlider.querySelectorAll('.slide'));
  const faqDotsContainer = document.getElementById('faqDots');
  let faqCurrent = 0;

  function updateFaqSlides(newIndex) {
    faqSlides.forEach((slide, i) => {
      slide.classList.remove('active', 'above', 'below');
      if (i === newIndex) slide.classList.add('active');
      else if (i < newIndex) slide.classList.add('above');
      else slide.classList.add('below');
    });
    
    if (faqDotsContainer) {
      Array.from(faqDotsContainer.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === newIndex);
        if (i === newIndex) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }
    faqCurrent = newIndex;
  }

  // Create dots for FAQ slider
  if (faqDotsContainer) {
    faqDotsContainer.innerHTML = '';
    faqSlides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.setAttribute('aria-current', 'true');
      dot.onclick = () => updateFaqSlides(i);
      dot.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          updateFaqSlides(i);
        }
      };
      faqDotsContainer.appendChild(dot);
    });
  }

  // Auto-advance FAQ slider
  let faqAutoAdvance = setInterval(() => {
    if (faqCurrent < faqSlides.length - 1) {
      updateFaqSlides(faqCurrent + 1);
    } else {
      updateFaqSlides(0);
    }
  }, 5000); // Change slide every 5 seconds

  // Pause auto-advance on hover
  faqSlider.addEventListener('mouseenter', () => {
    clearInterval(faqAutoAdvance);
  });

  faqSlider.addEventListener('mouseleave', () => {
    faqAutoAdvance = setInterval(() => {
      if (faqCurrent < faqSlides.length - 1) {
        updateFaqSlides(faqCurrent + 1);
      } else {
        updateFaqSlides(0);
      }
    }, 5000);
  });
}

// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('FAQ Accordion script loaded');
  console.log('Current page URL:', window.location.pathname);
  console.log('FAQ page detected:', window.location.pathname.includes('faq'));
  
  // Function to initialize FAQ functionality
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    console.log('Found FAQ items:', faqItems.length);
    
    // Debug: Log all elements with class 'faq-item'
    document.querySelectorAll('*').forEach(el => {
      if (el.classList.contains('faq-item')) {
        console.log('FAQ item found:', el);
      }
    });
    
    faqItems.forEach((item, index) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const chevron = item.querySelector('.faq-question i');
      
      console.log(`FAQ item ${index + 1}:`, question ? 'Question found' : 'Question not found', chevron ? 'Chevron found' : 'Chevron not found');
      
      if (question) {
        // Remove any existing event listeners
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);
        
        // Add click event listener to the question
        newQuestion.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const isActive = item.classList.contains('active');
          console.log('FAQ question clicked, current state:', isActive ? 'active' : 'inactive');
          
          // Close all other FAQ items
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          
          // Toggle current item
          if (!isActive) {
            item.classList.add('active');
            console.log('FAQ item activated');
          } else {
            item.classList.remove('active');
            console.log('FAQ item deactivated');
          }
        });
        
        // Add click event listener to the chevron icon specifically
        const newChevron = newQuestion.querySelector('i');
        if (newChevron) {
          newChevron.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = item.classList.contains('active');
            console.log('FAQ chevron clicked, current state:', isActive ? 'active' : 'inactive');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
              if (otherItem !== item) {
                otherItem.classList.remove('active');
              }
            });
            
            // Toggle current item
            if (!isActive) {
              item.classList.add('active');
              console.log('FAQ item activated via chevron');
            } else {
              item.classList.remove('active');
              console.log('FAQ item deactivated via chevron');
            }
          });
        }
      }
    });
  }
  
  // Initialize FAQ functionality
  initFAQ();
  
  // Re-initialize if content is dynamically loaded
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        const faqGrid = document.querySelector('.faq-grid');
        if (faqGrid && mutation.target.contains(faqGrid)) {
          console.log('FAQ content updated, re-initializing...');
          setTimeout(initFAQ, 100);
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// --- Navbar Search Input Logic ---
const navbarSearchBtn = document.querySelector('.elevator-navbar-right .elevator-nav-search');
const navbarSearchInput = document.getElementById('navbarSearchInput');
if (navbarSearchBtn && navbarSearchInput) {
  navbarSearchBtn.onclick = function(e) {
    e.preventDefault();
    navbarSearchInput.style.display = 'inline-block';
    navbarSearchInput.focus();
  };
  navbarSearchInput.onblur = function() {
    setTimeout(() => { navbarSearchInput.style.display = 'none'; }, 150);
  };
  navbarSearchInput.onkeydown = function(e) {
    if (e.key === 'Escape') {
      navbarSearchInput.style.display = 'none';
      navbarSearchInput.blur();
    }
  };
} 

// Lamborghini-style Models Slider Logic
(function() {
  const sliderSection = document.querySelector('.models-slider-section');
  if (!sliderSection) return;
  const images = Array.from(sliderSection.querySelectorAll('.models-slider-image img'));
  const leftBtn = sliderSection.querySelector('.models-slider-arrow.left');
  const rightBtn = sliderSection.querySelector('.models-slider-arrow.right');
  const leftSide = sliderSection.querySelector('.models-slider-side-image.left');
  const rightSide = sliderSection.querySelector('.models-slider-side-image.right');
  const nameEl = document.getElementById('modelsSliderName');
  const taglineEl = document.getElementById('modelsSliderTagline');
  const exploreBtn = document.getElementById('exploreModelBtn');
  const brochureBtn = document.getElementById('downloadBrochureBtn');
  // Model details for each slide (edit as needed)
  const modelDetails = [
    {
      name: 'Mars Cover',
      tagline: "The Future of Elevation",
      explore: '#',
      brochure: '#'
    },
    {
      name: '22 Years of Excellence',
      tagline: "Celebrating Innovation & Trust",
      explore: '#',
      brochure: '#'
    },
    {
      name: 'About Us',
      tagline: "Our Story, Your Journey",
      explore: '#',
      brochure: '#'
    },
    {
      name: 'Prototype',
      tagline: "Engineering Tomorrow",
      explore: '#',
      brochure: '#'
    }
  ];
  let current = 0;

  function showSlide(idx) {
    images.forEach((img, i) => {
      img.classList.toggle('active', i === idx);
    });
    current = idx;
    // Update side images
    if (leftSide) {
      const prevIdx = (current - 1 + images.length) % images.length;
      leftSide.innerHTML = '';
      const prevImg = images[prevIdx].cloneNode();
      prevImg.classList.remove('active');
      leftSide.appendChild(prevImg);
    }
    if (rightSide) {
      const nextIdx = (current + 1) % images.length;
      rightSide.innerHTML = '';
      const nextImg = images[nextIdx].cloneNode();
      nextImg.classList.remove('active');
      rightSide.appendChild(nextImg);
    }
    // Update model details
    if (modelDetails[idx]) {
      if (nameEl) nameEl.textContent = modelDetails[idx].name;
      if (taglineEl) taglineEl.textContent = modelDetails[idx].tagline;
      if (exploreBtn) exploreBtn.href = modelDetails[idx].explore;
      if (brochureBtn) brochureBtn.href = modelDetails[idx].brochure;
    }
  }

  leftBtn.addEventListener('click', () => {
    let idx = (current - 1 + images.length) % images.length;
    showSlide(idx);
  });
  rightBtn.addEventListener('click', () => {
    let idx = (current + 1) % images.length;
    showSlide(idx);
  });

  // Optional: swipe support for mobile
  let startX = null;
  sliderSection.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  sliderSection.addEventListener('touchend', (e) => {
    if (startX === null) return;
    let endX = e.changedTouches[0].clientX;
    if (endX - startX > 50) leftBtn.click();
    else if (startX - endX > 50) rightBtn.click();
    startX = null;
  });

  // Keyboard navigation
  sliderSection.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftBtn.click();
    if (e.key === 'ArrowRight') rightBtn.click();
  });
  // Make section focusable for keyboard
  sliderSection.tabIndex = 0;

  // Show first slide on load
  showSlide(0);
})(); 