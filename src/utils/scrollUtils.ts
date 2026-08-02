/**
 * Smoothly scrolls to a specific element or position on the page
 * 
 * @param elementId - The ID of the element to scroll to, or null to scroll to a specific position
 * @param yOffset - Additional Y offset in pixels (default: -20) - use negative value to scroll above the element
 * @param position - Y position to scroll to if elementId is null
 */
export const scrollTo = (
  elementId: string | null = null, 
  yOffset: number = -20, 
  position: number | null = null
): void => {
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  } else if (position !== null) {
    window.scrollTo({ top: position, behavior: 'smooth' });
  }
};

/**
 * Scrolls to the top of the page smoothly
 */
export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Scrolls to a specific section by id with animation
 * Useful for navigation menus and "scroll to" buttons
 */
export const scrollToSection = (sectionId: string): void => {
  scrollTo(sectionId);
}; 