export type EnumChoice = { name: string; value: string };

export const TYPE_CHOICES: readonly EnumChoice[] = [
  { name: "Feature", value: "feat" },
  { name: "Fix", value: "fix" },
  { name: "Documentation", value: "docs" },
  { name: "Chore", value: "chore" },
  { name: "Refactor", value: "refactor" },
  { name: "Test", value: "test" },
  { name: "Performance", value: "perf" },
  { name: "Build", value: "build" },
  { name: "CI", value: "ci" },
];
