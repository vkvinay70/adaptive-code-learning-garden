import { createFileRoute } from "@tanstack/react-router";
import { FunctionDeclaration, GoogleGenAI, Type, type Content } from "@google/genai";
import {
  CURRICULUM_LESSONS,
  CURATED_QUIZ_BANK,
  getLessonByIdOrTitle,
  getLessonsByLevel,
  type LearningLevel,
} from "@/lib/curriculum";

const agentToolDeclarations: FunctionDeclaration[] = [
  {
    name: "getCurriculumModule",
    description:
      "Retrieve structured lesson objectives, explanation, runnable example code, and checkpoint exercise for a specific NaomiLearn Python module or topic.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        topicOrTitle: {
          type: Type.STRING,
          description:
            "Module title or topic keyword, e.g. 'Loops', 'Decorators & Generators', 'Variables & Data Types', or 'Async'.",
        },
      },
      required: ["topicOrTitle"],
    },
  },
  {
    name: "recommendNextLesson",
    description:
      "Recommend the next structured Python module for the student based on their current difficulty level and progress.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.STRING,
          description: "Student level: Beginner, Intermediate, or Advanced.",
        },
        currentModule: {
          type: Type.STRING,
          description: "The module the student is currently studying.",
        },
      },
      required: ["level"],
    },
  },
  {
    name: "generatePracticeExercise",
    description:
      "Retrieve a guided Python coding exercise with starter code, expected output, and progressive hints for a module and difficulty level.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          description: "The Python topic or module name.",
        },
        level: {
          type: Type.STRING,
          description: "Difficulty level: Beginner, Intermediate, or Advanced.",
        },
      },
      required: ["topic", "level"],
    },
  },
  {
    name: "explainQuizAnswer",
    description:
      "Look up reference quiz questions, correct answers, and explanations for a given Python topic.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          description: "The Python module or concept being quizzed.",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "summarizeStudentProgress",
    description:
      "Summarize the student's recorded learning progress, accuracy, completed lessons, and recommended next topic.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        includeRecommendations: {
          type: Type.BOOLEAN,
          description: "Whether to include next-step study recommendations.",
        },
      },
    },
  },
  {
    name: "reviewStudentCode",
    description:
      "Analyze a student's Python code snippet against a target topic or exercise to check structure, constructs used, and potential issues.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        code: {
          type: Type.STRING,
          description: "The Python code submitted by the student.",
        },
        topic: {
          type: Type.STRING,
          description: "The module or exercise topic.",
        },
      },
      required: ["code"],
    },
  },
];

function executeAgentTool(
  name: string,
  args: Record<string, unknown>,
  context: {
    level?: string;
    module?: string;
    progressSummary?: {
      attempted: number;
      accuracy: number;
      completedCount: number;
      recommended: string;
    };
  },
): Record<string, unknown> {
  switch (name) {
    case "getCurriculumModule": {
      const query = String(args["topicOrTitle"] ?? context.module ?? "Variables");
      const found =
        getLessonByIdOrTitle(query) ??
        CURRICULUM_LESSONS.find((l) => l.level === (context.level as LearningLevel)) ??
        CURRICULUM_LESSONS[0]!;
      return {
        id: found.id,
        number: found.number,
        level: found.level,
        title: found.title,
        summary: found.summary,
        objectives: found.objectives,
        exampleCode: found.exampleCode,
        exampleOutput: found.exampleOutput,
        exerciseTitle: found.exerciseTitle,
        exercisePrompt: found.exercisePrompt,
        nextStepHint: found.nextStepHint,
      };
    }

    case "recommendNextLesson": {
      const lvl = (
        ["Beginner", "Intermediate", "Advanced"].includes(String(args["level"]))
          ? String(args["level"])
          : context.level || "Beginner"
      ) as LearningLevel;
      const curTitle = String(args["currentModule"] ?? context.module ?? "");
      const levelLessons = getLessonsByLevel(lvl);
      const currentIdx = levelLessons.findIndex(
        (l) =>
          l.shortTitle.toLowerCase() === curTitle.toLowerCase() ||
          l.title.toLowerCase() === curTitle.toLowerCase(),
      );
      const nextLesson =
        currentIdx >= 0 && currentIdx + 1 < levelLessons.length
          ? levelLessons[currentIdx + 1]!
          : levelLessons[0]!;
      return {
        recommendedModule: nextLesson.title,
        shortTitle: nextLesson.shortTitle,
        level: nextLesson.level,
        duration: nextLesson.duration,
        objectives: nextLesson.objectives,
        reason: context.progressSummary?.recommended
          ? `Recommended based on your activity (${context.progressSummary.recommended}) and ${lvl} learning path.`
          : `Next sequential milestone in the ${lvl} Python track.`,
      };
    }

    case "generatePracticeExercise": {
      const topic = String(args["topic"] ?? context.module ?? "Loops");
      const lesson = getLessonByIdOrTitle(topic) ?? CURRICULUM_LESSONS[0]!;
      return {
        module: lesson.title,
        level: lesson.level,
        exerciseTitle: lesson.exerciseTitle,
        prompt: lesson.exercisePrompt,
        starterCode: lesson.starterCode,
        hints: lesson.hints,
        expectedOutputContains: lesson.expectedOutputContains,
      };
    }

    case "explainQuizAnswer": {
      const topic = String(args["topic"] ?? context.module ?? "").toLowerCase();
      const matches = CURATED_QUIZ_BANK.filter(
        (q) => q.module.toLowerCase().includes(topic) || q.question.toLowerCase().includes(topic),
      ).slice(0, 2);
      return {
        topic,
        referenceQuestions: matches.map((q) => ({
          question: q.question,
          correctOption: q.options[q.answerIndex],
          explanation: q.explanation,
        })),
      };
    }

    case "summarizeStudentProgress": {
      const p = context.progressSummary ?? {
        attempted: 0,
        accuracy: 0,
        completedCount: 0,
        recommended: context.module || "Setup & First Program",
      };
      return {
        questionsAttempted: p.attempted,
        quizAccuracyPercent: p.accuracy,
        completedLessonsCount: p.completedCount,
        totalCurriculumLessons: CURRICULUM_LESSONS.length,
        recommendedNextTopic: p.recommended,
        currentLevel: context.level || "Beginner",
      };
    }

    case "reviewStudentCode": {
      const code = String(args["code"] ?? "");
      const topic = String(args["topic"] ?? context.module ?? "");
      const lesson = getLessonByIdOrTitle(topic);
      const lineCount = code.split("\n").length;
      const hasPrint = /\bprint\s*\(/.test(code);
      const hasDef = /\bdef\s+\w+/.test(code);
      const hasLoop = /\b(for|while)\b/.test(code);
      const missingConstructs = (lesson?.requiredConstructs ?? []).filter((c) => !code.includes(c));
      return {
        lineCount,
        hasPrint,
        hasFunctionDefinition: hasDef,
        hasLoop,
        missingRequiredConstructs: missingConstructs,
        targetExercisePrompt: lesson?.exercisePrompt ?? null,
        hintsAvailable: lesson?.hints ?? [],
      };
    }

    default:
      return { info: "Tool executed." };
  }
}

export const Route = createFileRoute("/api/gemini")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.GEMINI_API_KEY?.trim();

          if (!apiKey) {
            return Response.json(
              {
                error:
                  "AI Tutor service is not configured yet (missing GEMINI_API_KEY on server). You can still explore all 24 lessons, run Python code in the Code Lab, and take curated topic quizzes!",
              },
              { status: 503 },
            );
          }

          const body = await request.json().catch(() => null);
          if (!body || typeof body !== "object") {
            return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
          }

          const { system, messages, json, level, module, progressSummary } = body as {
            system?: unknown;
            messages?: unknown;
            json?: unknown;
            level?: string;
            module?: string;
            progressSummary?: {
              attempted: number;
              accuracy: number;
              completedCount: number;
              recommended: string;
            };
          };

          if (
            typeof system !== "string" ||
            !Array.isArray(messages) ||
            messages.length === 0 ||
            messages.length > 40 ||
            messages.some(
              (m: { role?: unknown; text?: unknown }) =>
                !["user", "model"].includes(String(m?.role)) ||
                typeof m?.text !== "string" ||
                m.text.length > 16000,
            )
          ) {
            return Response.json(
              {
                error:
                  "Invalid request parameters. Please check your message length and try again.",
              },
              { status: 400 },
            );
          }

          const configuredModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";

          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const contents: Content[] = messages.map(
            (m: { role: "user" | "model"; text: string }) => ({
              role: m.role,
              parts: [{ text: m.text }],
            }),
          );

          // Structured JSON generation path (e.g. for AI Quiz generation)
          if (json) {
            const response = await ai.models.generateContent({
              model: configuredModel,
              contents,
              config: {
                systemInstruction: system.slice(0, 12000),
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          question: { type: Type.STRING },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          answerIndex: { type: Type.INTEGER },
                          explanation: { type: Type.STRING },
                        },
                        required: ["question", "options", "answerIndex", "explanation"],
                      },
                    },
                  },
                  required: ["questions"],
                },
              },
            });

            const text = response.text;
            if (!text) {
              return Response.json(
                { error: "Gemini returned an empty quiz response." },
                { status: 502 },
              );
            }
            return Response.json({ text });
          }

          // Conversational AI Tutor Agent with safe application tool calling
          const toolsUsed: string[] = [];

          let response = await ai.models.generateContent({
            model: configuredModel,
            contents,
            config: {
              systemInstruction: system.slice(0, 12000),
              tools: [{ functionDeclarations: agentToolDeclarations }],
            },
          });

          // Handle up to 2 rounds of safe function calls if the model invokes agent tools
          let rounds = 0;
          while (response.functionCalls && response.functionCalls.length > 0 && rounds < 2) {
            rounds += 1;
            const modelTurnContent = response.candidates?.[0]?.content;
            if (modelTurnContent) {
              contents.push(modelTurnContent);
            }

            const toolResponseParts = response.functionCalls.map((fc) => {
              const fnName = fc.name || "unknown";
              toolsUsed.push(fnName);
              const result = executeAgentTool(fnName, (fc.args as Record<string, unknown>) ?? {}, {
                ...(level ? { level } : {}),
                ...(module ? { module } : {}),
                ...(progressSummary ? { progressSummary } : {}),
              });
              return {
                functionResponse: {
                  name: fnName,
                  id: fc.id,
                  response: result,
                },
              };
            });

            contents.push({
              role: "user",
              parts: toolResponseParts,
            });

            response = await ai.models.generateContent({
              model: configuredModel,
              contents,
              config: {
                systemInstruction: system.slice(0, 12000),
                tools: [{ functionDeclarations: agentToolDeclarations }],
              },
            });
          }

          const text = response.text;
          if (!text) {
            return Response.json(
              { error: "The AI Tutor returned an empty response. Please try again." },
              { status: 502 },
            );
          }

          return Response.json({
            text,
            toolsUsed: Array.from(new Set(toolsUsed)),
          });
        } catch (err: unknown) {
          const errStatus =
            typeof err === "object" && err !== null && "status" in err
              ? (err as { status?: number }).status
              : undefined;
          const status = errStatus === 429 ? 429 : 502;
          const message =
            status === 429
              ? "AI Tutor rate limit reached. Please wait a moment and try again."
              : err instanceof Error && err.message
                ? `AI Tutor error: ${err.message}`
                : "Unable to process the AI Tutor request right now.";
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
