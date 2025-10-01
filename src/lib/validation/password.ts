export const passwordSchema = [
  { label: "password-requirements.characters", test: (pw: string): boolean => pw.length >= 8 },
  { label: "password-requirements.letter", test: (pw: string): boolean => /[A-Za-z]/u.test(pw) },
  { label: "password-requirements.digit", test: (pw: string): boolean => /\d/u.test(pw) },
  {
    label: "password-requirements.special",
    test: (pw: string): boolean => /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/u.test(pw),
  },
] as const;
