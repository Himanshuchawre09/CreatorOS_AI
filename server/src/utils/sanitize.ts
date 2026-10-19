/**
 * Sanitize and escape special regular expression characters from user input
 * to prevent ReDoS and regex operator injection in Mongo queries.
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
