export const languages = [
    {
        name: "Python",
        icon: "python",
        avail: 1,
        monacoLang: "python",
        pistonLang: "python",
        version: "3.10.0"
    },
    {
        name: "C++",
        icon: "cpp",
        avail: 1,
        monacoLang: "cpp",
        pistonLang: "cpp",
        version: "10.2.0"
    },
    {
        name: "Java",
        icon: "java",
        avail: 1,
        monacoLang: "java",
        pistonLang: "java",
        version: "15.0.2"
    },
    {
        name: "C",
        icon: "c",
        avail: 1,
        monacoLang: "c",
        pistonLang: "c",
        version: "10.2.0"
    },
    {
        name: "Go",
        icon: "go",
        avail: 0,
        monacoLang: "go",
        pistonLang: "go",
        version: "1.16.2"
    },
    {
        name: "JavaScript",
        icon: "js",
        avail: 1,
        monacoLang: "javascript",
        pistonLang: "javascript",
        version: "18.15.0"
    }
];


export function getInitials(name: string): string {
  if (!name) return '';

  return name
    .trim()
    .split(/\s+/) // split by whitespace
    .map(word => word[0].toUpperCase())
    .join('');
}
