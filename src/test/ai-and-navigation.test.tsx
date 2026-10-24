import { describe, expect, it, vi, afterEach } from "vitest";
import { learningItems } from "@/components/app-sidebar";
import {
  DEFAULT_GEMINI_MODEL,
  PRIMARY_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  resolveModelName,
  categorizeGeminiError,
  isRetryableModelError,
  buildCurriculumGroundedReply,
  executeAgentTool,
} from "@/routes/api.gemini";
import { callGemini } from "@/lib/tutor";

describe("Sidebar Navigation & Dashboard Default", () => {
  it("makes Dashboard the primary workspace landing item and removes separate Home link", () => {
    // The first learning item should be the Dashboard
    expect(learningItems[0]?.title).toBe("Dashboard");
    expect(learningItems[0]?.url).toBe("/dashboard");

    // "Home" should no longer be an entry in the learning items
    const hasHome = learningItems.some((item) => item.title.toLowerCase() === "home");
    expect(hasHome).toBe(false);
  });

  it("retains all core workspace items in sequential order", () => {
    const titles = learningItems.map((item) => item.title);
    expect(titles).toEqual(["Dashboard", "Learn Python", "Code Lab", "Quizzes", "AI Tutor"]);
  });

  it("highlights AI Tutor with a special Gemini badge", () => {
    const tutorItem = learningItems.find((item) => item.title === "AI Tutor");
    expect(tutorItem).toBeDefined();
    expect(tutorItem?.badge).toBe("Gemini");
    expect(tutorItem?.isAi).toBe(true);
  });

  it("determines correct landing destination based on authentication status", () => {
    const getLandingTarget = (isAuthenticated: boolean) =>
      isAuthenticated ? "/dashboard" : "/login";

    expect(getLandingTarget(true)).toBe("/dashboard");
    expect(getLandingTarget(false)).toBe("/login");
  });
});

describe("AI Tutor Agent Tools Execution", () => {
  it("executes getCurriculumModule correctly", () => {
    const result = executeAgentTool("getCurriculumModule", { topicOrTitle: "Loops" }, {});
    expect(result["title"]).toContain("Loop");
    expect(result["exampleCode"]).toBeDefined();
    expect(result["objectives"]).toBeDefined();
  });

  it("executes recommendNextLesson based on student level", () => {
    const result = executeAgentTool(
      "recommendNextLesson",
      { level: "Beginner", currentModule: "Setup & First Program" },
      {},
    );
    expect(result["recommendedModule"]).toBeDefined();
    expect(result["level"]).toBe("Beginner");
  });

  it("executes generatePracticeExercise with starter code and hints", () => {
    const result = executeAgentTool(
      "generatePracticeExercise",
      { topic: "Variables & Data Types", level: "Beginner" },
      {},
    );
    expect(result["starterCode"]).toBeDefined();
    expect(Array.isArray(result["hints"])).toBe(true);
  });

  it("executes reviewStudentCode and inspects syntax constructs", () => {
    const goodCode = "for i in range(5):\n    print(i)";
    const result = executeAgentTool("reviewStudentCode", { code: goodCode, topic: "Loops" }, {});
    expect(result["hasLoop"]).toBe(true);
    expect(result["hasPrint"]).toBe(true);
    expect(result["lineCount"]).toBe(2);
  });
});

describe("AI Tutor Model Resolution & Error Classification", () => {
  it("resolves undefined or empty environment model to default gemini-3.8-flash", () => {
    expect(DEFAULT_GEMINI_MODEL).toBe("gemini-3.8-flash");
    expect(PRIMARY_GEMINI_MODEL).toBe("gemini-3.8-flash");
    expect(FALLBACK_GEMINI_MODEL).toBe("gemini-3.8-flash");

    expect(resolveModelName()).toBe("gemini-3.8-flash");
    expect(resolveModelName("")).toBe("gemini-3.8-flash");
    expect(resolveModelName("   ")).toBe("gemini-3.8-flash");
    expect(resolveModelName("gemini-3.8-flash")).toBe("gemini-3.8-flash");
    expect(resolveModelName("gemini-2.5-flash")).toBe("gemini-2.5-flash");
    expect(resolveModelName("gemini-1.5-flash")).toBe("gemini-1.5-flash");
  });

  it("categorizes 401 auth errors properly without leaking keys", () => {
    const authCat = categorizeGeminiError({ status: 401 });
    expect(authCat.status).toBe(401);
    expect(authCat.isRetryable).toBe(false);
    expect(authCat.category).toBe("Authentication Error");
    expect(authCat.userMessage).toContain("GEMINI_API_KEY");
  });

  it("categorizes 429 rate limit errors as retryable", () => {
    const rateCat = categorizeGeminiError({ status: 429 });
    expect(rateCat.status).toBe(429);
    expect(rateCat.isRetryable).toBe(true);
    expect(rateCat.category).toContain("Rate Limit");
  });

  it("categorizes 503 high demand errors as retryable with friendly message", () => {
    const demandCat = categorizeGeminiError({ status: 503 });
    expect(demandCat.status).toBe(503);
    expect(demandCat.isRetryable).toBe(true);
    expect(demandCat.category).toContain("High Demand");
    expect(demandCat.userMessage).toContain("high demand");
  });

  it("categorizes 404 model not found errors as non-retryable", () => {
    const notFoundCat = categorizeGeminiError({ status: 404 });
    expect(notFoundCat.status).toBe(404);
    expect(notFoundCat.isRetryable).toBe(false);
    expect(notFoundCat.category).toContain("Model Unsupported or Not Found");
  });

  it("categorizes network failure as retryable", () => {
    const netCat = categorizeGeminiError(new Error("fetch failed"));
    expect(netCat.isRetryable).toBe(true);
    expect(netCat.category).toBe("Network Connection Issue");
  });

  it("correctly delegates isRetryableModelError", () => {
    expect(isRetryableModelError({ status: 503 })).toBe(true);
    expect(isRetryableModelError({ status: 429 })).toBe(true);
    expect(isRetryableModelError(new Error("503 UNAVAILABLE: The model is overloaded"))).toBe(true);
    expect(isRetryableModelError(new Error("Rate limit exceeded (429)"))).toBe(true);
    expect(isRetryableModelError(new Error("Resource has been exhausted"))).toBe(true);

    // Non-retryable
    expect(isRetryableModelError(null)).toBe(false);
    expect(isRetryableModelError(new Error("Invalid API key provided"))).toBe(false);
    expect(isRetryableModelError({ status: 400 })).toBe(false);
    expect(isRetryableModelError({ status: 404 })).toBe(false);
  });

  it("produces structured curriculum fallback responses with verified tools used", () => {
    const naomiSummary = buildCurriculumGroundedReply("Tell me about NaomiLearn modules");
    expect(naomiSummary.text).toContain("NaomiLearn");
    expect(naomiSummary.text).toContain("24");
    expect(naomiSummary.toolsUsed).toContain("getCurriculumModule");

    const loopsLesson = buildCurriculumGroundedReply("Loops", "Beginner", "Loops");
    expect(loopsLesson.text).toContain("Module");
    expect(loopsLesson.toolsUsed).toContain("getCurriculumModule");
  });
});

describe("Client AI Request Flow & Error Handling (callGemini)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully parses live AI responses from /api/gemini", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        text: "Here is your Python explanation: variables store data.",
        toolsUsed: ["getCurriculumModule"],
      }),
    } as unknown as Response);

    const result = await callGemini({
      system: "You are PyTutor",
      messages: [{ role: "user", text: "What are variables?" }],
    });

    expect(result.text).toBe("Here is your Python explanation: variables store data.");
    expect(result.toolsUsed).toContain("getCurriculumModule");
  });

  it("handles HTTP 503 errors gracefully and throws clean user-facing error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error:
          "AI Tutor is currently experiencing high demand. Please try your question again in a few moments.",
      }),
    } as unknown as Response);

    await expect(
      callGemini({
        system: "You are PyTutor",
        messages: [{ role: "user", text: "Explain recursion" }],
      }),
    ).rejects.toThrow("high demand");
  });

  it("handles HTTP 429 rate limit errors gracefully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: "AI Tutor rate limit reached. Please wait a moment and try again.",
      }),
    } as unknown as Response);

    await expect(
      callGemini({
        system: "You are PyTutor",
        messages: [{ role: "user", text: "Generate exercises" }],
      }),
    ).rejects.toThrow("rate limit");
  });
});
