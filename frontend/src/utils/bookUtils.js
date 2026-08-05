/**
 * Formats/cleans ISBN by removing hyphens, spaces, and punctuation
 * e.g., "978-0-13-235088-4" -> "9780132350884"
 */
export const cleanIsbn = (isbn) => {
  if (!isbn) return null;
  const cleaned = String(isbn).replace(/[^0-9X]/gi, "");
  return cleaned.length >= 9 ? cleaned : null;
};

/**
 * Returns OpenLibrary cover image URL for given ISBN and size ('S', 'M', 'L')
 */
export const getOpenLibraryCoverUrl = (isbn, size = "M") => {
  const cleaned = cleanIsbn(isbn);
  if (!cleaned) return null;
  return `https://covers.openlibrary.org/b/isbn/${cleaned}-${size}.jpg?default=false`;
};


