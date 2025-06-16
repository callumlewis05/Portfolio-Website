// Section 3 - Features

// Animate appearance of all elements in the features section
document.addEventListener("DOMContentLoaded", () => {
  // Get all the elements in the text column
  const elements = document.querySelectorAll("#text-column *");

  // Create an observer to check when each element appears 35% into the screen
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Make the element fade in and rise up
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  // Apply the observer to all the elements in the text column
  elements.forEach((el) => observer.observe(el));
});

// Handle scroll event for sticky positioning
document.addEventListener("scroll", () => {
  // Load all relevant elements
  const image_column = document.getElementById("image-column");
  const icon_container = document.getElementById("icon-container");
  const columnRect = image_column.getBoundingClientRect();
  const container_rect = icon_container.getBoundingClientRect();
  const container_height = container_rect.height;
  const viewportMiddle = window.innerHeight / 2;

  // Check if the viewport is viewing the features section
  if (
    viewportMiddle > columnRect.top + container_height / 2 &&
    viewportMiddle < columnRect.bottom - container_height / 2
  ) {
    // Makes the icons stick in the middle
    icon_container.classList.add("sticky");
    image_column.style.alignItems = "";
  } 
  // Check if the viewport is below the features section
  else if (viewportMiddle >= columnRect.bottom - container_height / 2) {
    // Makes the icons stick at the end
    icon_container.classList.remove("sticky");
    image_column.style.alignItems = "end";
  } 
  // Check if the viewport is above the features section
  else {
    // Makes the icons stick at the start
    icon_container.classList.remove("sticky");
    image_column.style.alignItems = "start";
  }
});

// Update the width of the icon container
document.addEventListener("DOMContentLoaded", () => {
  const updateStickyWidth = () => {
    const stickyElement = document.querySelector("#icon-container");
    const parentElement = stickyElement.parentElement;
    stickyElement.style.width = `${parentElement.offsetWidth}px`;
  }

  window.addEventListener("resize", updateStickyWidth);
  window.addEventListener("scroll", updateStickyWidth);
  updateStickyWidth();
});

// Insert the SVG's and then animate then
document.addEventListener("DOMContentLoaded", () => {
  // Function to load an SVG file and append it to a container
  const loadSVG = async (url, containerId) => {
    try {
      const response = await fetch(url);
      const svgText = await response.text();
      const container = document.getElementById(containerId);
      const div = document.createElement("div");
      div.innerHTML = svgText;
      const svgElement = div.firstChild;
      svgElement.classList.add("icon");
      svgElement.classList.add("appear");
      container.appendChild(svgElement);
    } catch (error) {
      console.error("Error loading SVG:", error);
    }
  };

  // Function to load multiple SVGs in order
  const loadSVGsInOrder = async () => {
    for (let i = 0; i < 6; i++) {
      await loadSVG(`img/icon${i + 1}-highlight.svg`, "icon-container");
    }
  };

  loadSVGsInOrder().then(() => {
    const container = document.getElementById("icon-container");
    const icons = Array.from(container.getElementsByClassName("icon"));
    const totalIcons = icons.length;
    const radius = 100;
    let angleOffset = Math.PI / 2;
    const fixedAngleStep = (2 * Math.PI) / totalIcons;

    // Function to position icons in a circular layout
    const positionIcons = () => {
      icons.forEach((icon, index) => {
        const windowWidth = window.innerWidth;
        const windowPercentSize = windowWidth / 1440;
        const angle = index * fixedAngleStep + angleOffset;
        const x = radius * Math.cos(angle) * 1.3 * windowPercentSize;
        const y = radius * Math.sin(angle) * 0.8 * windowPercentSize;
        const scale = 0.5 + 0.8 * (1 + Math.sin(angle));

        // Example: toggle highlight classes if needed
        const highlightElement = icon.querySelector(".highlight");
        if (highlightElement) {
          if (scale > 2) {
            highlightElement.classList.add("highlight-gradient");
            highlightElement.classList.remove("highlight-black");
          } else {
            highlightElement.classList.add("highlight-black");
            highlightElement.classList.remove("highlight-gradient");
          }
        }

        icon.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      });
    };

    // Position icons initially
    positionIcons();

    // Animate the angle offset transition
    const animateAngleOffset = (start, end, duration) => {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutQuad(progress);
        angleOffset = start + (end - start) * easedProgress;
        positionIcons();
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // Easing function for smooth transitions
    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    // Get iframes
    const iframes = Array.from(document.querySelectorAll("iframe"));

    // Prevent duplicate triggers when scrolling quickly
    let currentActiveSection = -1;

    // Set up IntersectionObservers for each section
    const sections = document.querySelectorAll(".scroll-text-section");
    const observerOptions = {
      root: null,
      threshold: 0,
      rootMargin: "-40% 0px -40% 0px",
    };

    // Store the current timeout ID
    let activeTimeout;

    // Setup animation for each section
    sections.forEach((section, index) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && currentActiveSection !== index) {
            currentActiveSection = index;
            // Remove "appear" from all iframes and add to all icons
            iframes.forEach((iframe) => iframe.classList.remove("appear"));
            icons.forEach((icon) => icon.classList.add("appear"));

            // Animate rotation to a new angle offset
            const newAngleOffset = (index + 3) * fixedAngleStep - Math.PI / 2;
            animateAngleOffset(angleOffset, newAngleOffset, 400);

            // Clear any existing timer so only the latest is active
            if (activeTimeout) clearTimeout(activeTimeout);

            // After 1.5 seconds, toggle the "appear" classes
            activeTimeout = setTimeout(() => {
              icons.forEach((icon) => icon.classList.remove("appear"));
              if (iframes[index]) {
                iframes[index].classList.add("appear");
              }
            }, 1500);
          }
        });
      }, observerOptions);
      observer.observe(section);
    });
  });
});

// Load the SVGs on mobile
document.addEventListener("DOMContentLoaded", () => {
  // Track if SVGs are already loaded
  let svgLoaded = false;

  const loadMobileSVGs = async () => {
    if (svgLoaded) return; // Prevent duplicate SVG insertions
    svgLoaded = true;

    const container = document.getElementById("text-column");
    const headings = container.querySelectorAll("h2");
    const paragraphs = container.querySelectorAll("p");

    if (headings.length !== 6 || paragraphs.length !== 6) {
      console.error(
        "Expected 6 <h2> and 6 <p> elements, but found different counts."
      );
      return;
    }

    // Remove any existing SVGs (just in case)
    container.querySelectorAll("svg").forEach((svg) => svg.remove());

    const mobileSVGOrder = [1, 6, 5, 4, 3, 2];

    // Load mobile SVGs sequentially in order
    for (let i = 0; i < 6; i++) {
      try {
        const response = await fetch(
          `img/icon${mobileSVGOrder[i]}-highlight.svg`
        );
        const svgText = await response.text();

        // Insert SVG after the corresponding paragraph
        const svgWrapper = document.createElement("div");
        svgWrapper.innerHTML = svgText;
        const svgElement = svgWrapper.firstChild;
        paragraphs[i].after(svgElement);

        // Setup Intersection Observer for this specific SVG
        setupObserverForElement(svgElement);
      } catch (error) {
        console.error(`Error loading mobile SVG ${mobileSVGOrder[i]}:`, error);
      }
    }
  };

  const handleMobileIcons = () => {
    const container = document.getElementById("text-column");

    if (window.innerWidth < 640) {
      loadMobileSVGs();
    } else {
      // Remove SVGs only if they exist
      if (svgLoaded) {
        container.querySelectorAll("svg").forEach((svg) => svg.remove());
        svgLoaded = false; // Reset flag when removing SVGs
      }
    }
  };

  // Function to set up Intersection Observer for a single element
  const setupObserverForElement = (element) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            observer.unobserve(entry.target); // Stop observing once animated
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
  };

  // Run on page load
  handleMobileIcons();

  // Listen for window resize to dynamically add/remove icons
  window.addEventListener("resize", handleMobileIcons);
});





// Section 5 - Testimonials

// Testimonials animation
document.addEventListener("DOMContentLoaded", () => {
  // Get elements for the testimonial animation
  const headings = document.getElementsByClassName("testimonials-client");
  const paragraphs = document.getElementsByClassName(
    "testimonials-client-information"
  );
  const progressBars = document.querySelectorAll(".progress-bar");
  const container = document.querySelector("#testimonials-container");

  // Set the current index to slide 3
  let currentIndex = 2;
  const slideDuration = 5000;
  let testimonialInterval = null;

  const updateSlide = () => {
    // Remove active classes from current slide
    headings[currentIndex].classList.remove("active");
    progressBars[currentIndex].classList.remove("active");

    // Update index (0-2)
    currentIndex = (currentIndex + 1) % 3;

    // Add active classes to the new current slide
    headings[currentIndex].classList.add("active");
    progressBars[currentIndex].classList.add("active");

    // Cycle the paragraphs (this code moves the last paragraph to the top)
    container.insertBefore(
      paragraphs[paragraphs.length - 1],
      container.firstChild
    );
  };

  // Configure options for the Intersection Observer
  const observerOptions = {
    root: null,
    threshold: 0.5,
  };

  // Function to handle Intersection Observer events
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Check if the testimonials section is in view and auto-rotation is not started
        if (!testimonialInterval) {
          updateSlide();
          testimonialInterval = setInterval(updateSlide, slideDuration);
        }
      }
    });
  }, observerOptions);

  // Start observing the testimonials container
  if (container) {
    observer.observe(container);
  }
});