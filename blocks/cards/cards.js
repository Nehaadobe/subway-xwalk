import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null
 */
function getYouTubeVideoId(url) {
  if (!url) return null;

  // Match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/v\/([^&?/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Create and show video modal with YouTube embed
 * @param {string} videoId - YouTube video ID
 */
function openVideoModal(videoId) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'video-modal-overlay';
  modal.innerHTML = `
    <div class="video-modal">
      <button class="video-modal-close" aria-label="Close video">×</button>
      <div class="video-modal-content">
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Close modal on click outside or close button
  const closeModal = () => {
    modal.remove();
    document.body.style.overflow = '';
  };

  modal.querySelector('.video-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

export default function decorate(block) {
  const isVideoVariant = block.classList.contains('video');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);

  // Handle video variant - add click handlers for YouTube modals
  if (isVideoVariant) {
    ul.querySelectorAll('li').forEach((card) => {
      const link = card.querySelector('a[href*="youtube.com"], a[href*="youtu.be"]');
      if (link) {
        const videoId = getYouTubeVideoId(link.href);
        if (videoId) {
          // Make the entire card clickable for video
          const imageWrapper = card.querySelector('.cards-card-image');
          if (imageWrapper) {
            imageWrapper.style.cursor = 'pointer';
            imageWrapper.addEventListener('click', (e) => {
              e.preventDefault();
              openVideoModal(videoId);
            });
          }

          // Also make the link open the modal instead of navigating
          link.addEventListener('click', (e) => {
            e.preventDefault();
            openVideoModal(videoId);
          });
        }
      }
    });
  }
}
