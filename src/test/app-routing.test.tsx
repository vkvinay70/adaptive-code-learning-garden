import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { CURRICULUM_LESSONS, CURATED_QUIZ_BANK, getLessonsByLevel } from "@/lib/curriculum";
import { analyze } from "@/lib/tutor";

describe("App routing & NaomiLearn curriculum", () => {
  const routesToVerify = [
    "/",
    "/dashboard",
    "/learn",
    "/practice",
    "/quizzes",
    "/tutor",
    "/progress",
    "/settings",
    "/login",
    "/signup",
    "/reset-password",
  ];

  it("matches every core NaomiLearn route instead of falling back to not found", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    for (const path of routesToVerify) {
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    }
  });

  it("provides 24 structured Python modules across Beginner, Intermediate, and Advanced levels", () => {
    expect(CURRICULUM_LESSONS).toHaveLength(24);
    expect(getLessonsByLevel("Beginner")).toHaveLength(8);
    expect(getLessonsByLevel("Intermediate")).toHaveLength(8);
    expect(getLessonsByLevel("Advanced")).toHaveLength(8);

    for (const lesson of CURRICULUM_LESSONS) {
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
      expect(lesson.exampleCode.length).toBeGreaterThan(10);
      expect(lesson.starterCode.length).toBeGreaterThan(5);
      expect(lesson.hints.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("provides curated quizzes across all three difficulty levels", () => {
    expect(CURATED_QUIZ_BANK.length).toBeGreaterThanOrEqual(24);
    expect(CURATED_QUIZ_BANK.filter((q) => q.level === "Beginner").length).toBeGreaterThanOrEqual(
      8,
    );
    expect(
      CURATED_QUIZ_BANK.filter((q) => q.level === "Intermediate").length,
    ).toBeGreaterThanOrEqual(8);
    expect(CURATED_QUIZ_BANK.filter((q) => q.level === "Advanced").length).toBeGreaterThanOrEqual(
      8,
    );
  });

  it("computes accuracy, strong/weak modules, and recommended next topic accurately", () => {
    const result = analyze({
      "Variables & Data Types": { attempted: 5, correct: 5 },
      Loops: { attempted: 4, correct: 1 },
    });

    expect(result.attempted).toBe(9);
    expect(result.correct).toBe(6);
    expect(result.accuracy).toBe(67);
    expect(result.strong).toContain("Variables & Data Types");
    expect(result.weak).toContain("Loops");
    expect(result.recommended).toBe("Loops");
  });
});
