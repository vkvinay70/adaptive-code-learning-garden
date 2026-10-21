import { createFileRoute } from "@tanstack/react-router";

const PYTHON_RUNNER_SCRIPT = `
import ast, asyncio, builtins, io, json, sys, traceback

class _AsyncioRunTransformer(ast.NodeTransformer):
    def visit_FunctionDef(self, node):
        return node
    def visit_AsyncFunctionDef(self, node):
        return node
    def visit_Call(self, node):
        self.generic_visit(node)
        if (
            isinstance(node.func, ast.Attribute)
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == "asyncio"
            and node.func.attr == "run"
            and len(node.args) >= 1
        ):
            return ast.copy_location(ast.Await(value=node.args[0]), node)
        return node

async def _naomi_execute(code_str: str) -> str:
    out_buf = io.StringIO()
    err_buf = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    old_input = builtins.input
    sys.stdout, sys.stderr = out_buf, err_buf
    exc_text = ""

    input_defaults = iter(["Naomi", "42", "Python", "10", "yes", ""])
    def _safe_input(prompt=""):
        if prompt:
            print(prompt, end="")
        val = next(input_defaults, "")
        print(val)
        return val

    builtins.input = _safe_input

    try:
        tree = ast.parse(code_str, filename="<solution>", mode="exec")
        tree = _AsyncioRunTransformer().visit(tree)
        ast.fix_missing_locations(tree)
        code_obj = compile(tree, "<solution>", "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
        ns = {"__name__": "__main__", "__builtins__": builtins}
        res = eval(code_obj, ns)
        if asyncio.iscoroutine(res):
            await res
    except SystemExit:
        pass
    except SyntaxError as e:
        exc_text = "".join(traceback.format_exception_only(type(e), e)).strip()
    except BaseException as e:
        tb_entries = traceback.extract_tb(e.__traceback__)
        user_entries = [f for f in tb_entries if f.filename == "<solution>"]
        exc_only = "".join(traceback.format_exception_only(type(e), e)).strip()
        if user_entries:
            formatted_tb = "".join(traceback.format_list(user_entries)).strip()
            exc_text = f"{formatted_tb}\\n{exc_only}"
        else:
            exc_text = exc_only
    finally:
        sys.stdout, sys.stderr = old_out, old_err
        builtins.input = old_input

    return json.dumps({
        "stdout": out_buf.getvalue()[:32000],
        "stderr": err_buf.getvalue()[:16000],
        "error": exc_text[:16000],
    })

if __name__ == "__main__":
    user_code = sys.stdin.read()
    sys.stdout.write(asyncio.run(_naomi_execute(user_code)))
`;

type ChildProcessModule = {
  spawnSync: (
    command: string,
    args: readonly string[],
    options: {
      input?: string;
      encoding: "utf-8";
      timeout?: number;
      maxBuffer?: number;
      env?: Record<string, string>;
    },
  ) => {
    status: number | null;
    stdout: string;
    stderr: string;
    error?: Error & { code?: string };
  };
};

function getNodeChildProcess(): ChildProcessModule | null {
  const proc = globalThis.process as
    | (NodeJS.Process & {
        getBuiltinModule?: (id: string) => unknown;
      })
    | undefined;
  if (typeof proc?.getBuiltinModule === "function") {
    try {
      return proc.getBuiltinModule("node:child_process") as ChildProcessModule;
    } catch {
      return null;
    }
  }
  return null;
}

export const Route = createFileRoute("/api/python")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const start = performance.now();
        try {
          const body = await request.json().catch(() => null);
          if (!body || typeof body !== "object") {
            return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
          }

          const code = (body as { code?: unknown }).code;
          if (typeof code !== "string") {
            return Response.json({ error: "Missing 'code' string parameter." }, { status: 400 });
          }
          if (code.length > 64000) {
            return Response.json(
              { error: "Code snippet exceeds maximum allowed length (64 KB)." },
              { status: 400 },
            );
          }

          const cp = getNodeChildProcess();
          if (!cp) {
            return Response.json(
              { error: "Server Python runtime is unavailable in this environment." },
              { status: 503 },
            );
          }

          const procResult = cp.spawnSync("python3", ["-I", "-c", PYTHON_RUNNER_SCRIPT], {
            input: code,
            encoding: "utf-8",
            timeout: 5000,
            maxBuffer: 1024 * 1024,
            env: {
              PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin",
              PYTHONIOENCODING: "utf-8",
            },
          });

          const durationMs = Math.round(performance.now() - start);

          if (procResult.error) {
            if (procResult.error.code === "ETIMEDOUT") {
              return Response.json({
                stdout: "",
                stderr: "",
                error:
                  "Execution timed out after 5 seconds. Check your code for infinite while/for loops.",
                durationMs,
                engine: "pyodide",
              });
            }
            return Response.json(
              {
                error: `Python runtime error: ${procResult.error.message}`,
              },
              { status: 502 },
            );
          }

          const rawOut = (procResult.stdout || "").trim();
          if (!rawOut) {
            const fallbackErr = (procResult.stderr || "").trim();
            return Response.json({
              stdout: "",
              stderr: "",
              ...(fallbackErr ? { error: fallbackErr } : {}),
              durationMs,
              engine: "pyodide",
            });
          }

          const parsed = JSON.parse(rawOut) as {
            stdout?: string;
            stderr?: string;
            error?: string;
          };

          return Response.json({
            stdout: String(parsed.stdout ?? "").trimEnd(),
            stderr: String(parsed.stderr ?? "").trimEnd(),
            ...(parsed.error ? { error: String(parsed.error) } : {}),
            durationMs,
            engine: "pyodide",
          });
        } catch (err) {
          return Response.json(
            {
              error: err instanceof Error ? err.message : "Failed to execute Python code.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
