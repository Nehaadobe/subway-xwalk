/**
 * Hero Block
 * Restructures DOM to combine image, title, and optional description
 * into a proper hero layout with white card overlay
 */
export default function decorate(block) {
  // Get all rows (each row is a div with div children)
  const rows = [...block.children];

  if (rows.length === 0) return;

  // Find the image row (contains picture element)
  let imageRow = null;
  const textRows = [];

  rows.forEach((row) => {
    const hasPicture = row.querySelector('picture');
    if (hasPicture && !imageRow) {
      imageRow = row;
    } else {
      textRows.push(row);
    }
  });

  // Clear the block
  block.innerHTML = '';

  // Create image container
  if (imageRow) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'hero-image';
    imageContainer.append(...imageRow.children);
    block.append(imageContainer);
  }

  // Create text card container (combines title + description)
  if (textRows.length > 0) {
    const textCard = document.createElement('div');
    textCard.className = 'hero-text';

    textRows.forEach((row, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = index === 0 ? 'hero-title' : 'hero-description';
      wrapper.append(...row.children);
      textCard.append(wrapper);
    });

    block.append(textCard);
  }
}
