export const languages = [
    {
        name: "Python",
        icon: "python",
        avail: 1,
        monacoLang: "python" // Monaco language ID
    },
    {
        name: "C++",
        icon: "cpp",
        avail: 0,
        monacoLang: "cpp" // Monaco language ID
    },
    {
        name: "Java",
        icon: "java",
        avail: 0,
        monacoLang: "java" // Monaco language ID
    },
    {
        name: "C",
        icon: "c",
        avail: 0,
        monacoLang: "c" // Monaco language ID
    },
    {
        name: "Go",
        icon: "go",
        avail: 0,
        monacoLang: "go" // Monaco language ID
    },
    {
        name: "JavaScript",
        icon: "js",
        avail: 0,
        monacoLang: "javascript" // Monaco language ID
    },
];

export function getInitials(name: string): string {
  if (!name) return '';

  return name
    .trim()
    .split(/\s+/) // split by whitespace
    .map(word => word[0].toUpperCase())
    .join('');
}
