import stringSimilarity from 'string-similarity';
import {Filter} from 'bad-words';

interface ValidationResult {
  valid: boolean;
  message: string;
}

const reservedUsernames = [
  'admin', 'root', 'support', 'system', 'null', 'undefined', 'user', 'test'
];

const profanityFilter = new Filter();

export const validateUserInputs = (name: string, username: string): ValidationResult => {
  // 1. Username pattern: No consecutive _ or ., no starting/ending with them
  const usernameRegex = /^(?!.*[_.]{2})[a-zA-Z0-9](?:[a-zA-Z0-9._]{1,18}[a-zA-Z0-9])?$/;

  // 2. Full name pattern: Only letters and spaces, min 3 characters
  const nameRegex = /^[a-zA-Z\s]{3,}$/;

  // 3. Email-like username
  const emailLike = /\S+@\S+\.\S+/;

  // 4. Phone number-like username
  const phoneLike = /^[0-9]{10,15}$/;

  // 5. URL-like username
  const urlLike = /(https?:\/\/|www\.)[^\s]+/i;

  // 6. Repetitive characters (aaaaa, 11111)
  const repetitivePattern = /^(\w)\1+$/;

  // 7. Reserved usernames check
  if (reservedUsernames.includes(username.toLowerCase())) {
    return { valid: false, message: 'This username is reserved. Please choose another one.' };
  }

  // 8. Profanity check
  if (profanityFilter.isProfane(username)) {
    return { valid: false, message: 'This username contains inappropriate words.' };
  }

  // 9. Regex check for username
  if (!usernameRegex.test(username)) {
    return { valid: false, message: 'Username must be 3-20 characters, cannot start or end with a dot or underscore, and cannot have consecutive dots or underscores.' };
  }

  // 10. Regex check for full name
  if (!nameRegex.test(name)) {
    return { valid: false, message: 'Full name must be at least 3 characters and contain only letters and spaces.' };
  }

  // 11. Check for email format
  if (emailLike.test(username)) {
    return { valid: false, message: 'Username cannot be an email address.' };
  }

  // 12. Check for phone number format
  if (phoneLike.test(username)) {
    return { valid: false, message: 'Username cannot be a phone number.' };
  }

  // 13. Check for URL format
  if (urlLike.test(username)) {
    return { valid: false, message: 'Username cannot contain a URL.' };
  }

  // 14. Check for repetitive characters
  if (repetitivePattern.test(username)) {
    return { valid: false, message: 'Username cannot be a single character repeated.' };
  }

  // 15. (Optional) Similarity check to reserved usernames
  const matches = stringSimilarity.findBestMatch(username.toLowerCase(), reservedUsernames);
  if (matches.bestMatch.rating > 0.8) {
    return { valid: false, message: 'Username is too similar to a reserved name.' };
  }

  return { valid: true, message: '' };
};
