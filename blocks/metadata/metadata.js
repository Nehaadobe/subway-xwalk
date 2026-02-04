// Metadata block - processes metadata but doesn't render anything visible
export default function decorate(block) {
  // Hide the block - metadata is processed by the system
  block.style.display = 'none';
}
