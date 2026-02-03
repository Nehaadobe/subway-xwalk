export default function decorate(block) {
  const isTimeline = block.classList.contains('timeline');

  // Get all rows as slides
  const rows = [...block.children];

  // Create carousel structure
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  // Process each row into a slide
  rows.forEach((row, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.dataset.index = index;

    const cols = [...row.children];

    // First column: image
    if (cols[0]) {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'carousel-slide-image';
      imageContainer.innerHTML = cols[0].innerHTML;
      slide.appendChild(imageContainer);
    }

    // Second column: content
    if (cols[1]) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'carousel-slide-content';
      contentContainer.innerHTML = cols[1].innerHTML;
      slide.appendChild(contentContainer);
    }

    track.appendChild(slide);
    row.remove();
  });

  wrapper.appendChild(track);

  // Create navigation
  const nav = document.createElement('div');
  nav.className = 'carousel-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-btn carousel-prev';
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
  prevBtn.setAttribute('aria-label', 'Previous');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-btn carousel-next';
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
  nextBtn.setAttribute('aria-label', 'Next');

  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);

  // Create timeline dots for timeline variant
  if (isTimeline) {
    const slides = track.querySelectorAll('.carousel-slide');
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-timeline';

    const dotsTrack = document.createElement('div');
    dotsTrack.className = 'carousel-timeline-track';

    slides.forEach((slide, index) => {
      const content = slide.querySelector('.carousel-slide-content');
      const strong = content?.querySelector('strong');
      let year = '';

      if (strong) {
        const text = strong.textContent;
        const match = text.match(/^(\d{4})/);
        if (match) {
          year = match[1];
        }
      }

      const dot = document.createElement('button');
      dot.className = 'carousel-timeline-dot';
      dot.dataset.index = index;
      if (index === 0) dot.classList.add('active');

      const yearLabel = document.createElement('span');
      yearLabel.className = 'carousel-timeline-year';
      yearLabel.textContent = year;

      dot.appendChild(yearLabel);
      dotsTrack.appendChild(dot);
    });

    dotsContainer.appendChild(dotsTrack);
    wrapper.insertBefore(dotsContainer, track);

    // Dot click handler
    dotsTrack.addEventListener('click', (e) => {
      const dot = e.target.closest('.carousel-timeline-dot');
      if (dot) {
        const index = parseInt(dot.dataset.index, 10);
        goToSlide(index);
      }
    });
  }

  block.textContent = '';
  block.appendChild(wrapper);
  block.appendChild(nav);

  // Carousel state
  let currentIndex = 0;
  const slides = track.querySelectorAll('.carousel-slide');
  const totalSlides = slides.length;

  function updateCarousel() {
    // Update track position
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalSlides - 1;

    // Update active slide
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentIndex);
    });

    // Update timeline dots
    if (isTimeline) {
      const dots = block.querySelectorAll('.carousel-timeline-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      // Scroll dots into view
      const activeDot = dots[currentIndex];
      if (activeDot) {
        activeDot.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }

  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    updateCarousel();
  }

  // Event listeners
  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
    if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }
  }, { passive: true });

  // Initialize
  updateCarousel();
}
