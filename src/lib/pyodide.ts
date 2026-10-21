// Python 3 execution engine powered by Pyodide WebAssembly in-browser runtime
// with automatic real Python 3 server execution fallback (/api/python) for instant cold-starts and strict iframe environments.

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  durationMs: number;
  engine: "pyodide";
}

interface PyodideGlobals {
  set: (key: string, value: unknown) => void;
  delete?: (key: string) => void;
}

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: PyodideGlobals;
  setStdout?: (opts: { batched: (msg: string) => void }) => void;
  setStderr?: (opts: { batched: (msg: string) => void }) => void;
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string; stdin?: () => string }) => Promise<PyodideInstance>;
    __naomiPyodidePromise?: Promise<PyodideInstance>;
    __naomiPyodideInstance?: PyodideInstance;
  }
}

const PYODIDE_VERSION = "0.27.2";
const PYODIDE_CDN_URLS = [
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  `https://fastly.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
];

const PYODIDE_WRAPPER_CODE = `
import ast, asyncio, builtins, io, json, sys, traceback

class _NaomiAsyncioRunTransformer(ast.NodeTransformer):
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

async def _naomi_run_cell(code_str: str) -> str:
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
        tree = _NaomiAsyncioRunTransformer().visit(tree)
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
        "stdout": out_buf.getvalue(),
        "stderr": err_buf.getvalue(),
        "error": exc_text,
    })

await _naomi_run_cell(__naomi_user_code)
`;

function loadPyodideScriptFromUrl(cdnBaseUrl: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Python execution requires a browser environment."));
  }
  if (typeof window.loadPyodide === "function") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-pyodide-loader="true"]',
    );
    if (existing) {
      if (existing.dataset.loaded === "true" && typeof window.loadPyodide === "function") {
        resolve();
        return;
      }
      existing.remove();
    }

    const script = document.createElement("script");
    script.src = `${cdnBaseUrl}pyodide.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.pyodideLoader = "true";

    const timeoutId = window.setTimeout(() => {
      script.remove();
      reject(new Error("Timed out downloading Pyodide script from CDN."));
    }, 10000);

    script.onload = () => {
      window.clearTimeout(timeoutId);
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      script.remove();
      reject(new Error("Failed to download Pyodide script from CDN."));
    };
    document.head.appendChild(script);
  });
}

export async function ensurePyodideLoaded(): Promise<PyodideInstance> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide can only run in the browser.");
  }
  if (window.__naomiPyodideInstance) {
    return window.__naomiPyodideInstance;
  }
  if (!window.__naomiPyodidePromise) {
    window.__naomiPyodidePromise = (async () => {
      let lastErr: unknown;
      for (const cdnUrl of PYODIDE_CDN_URLS) {
        try {
          await loadPyodideScriptFromUrl(cdnUrl);
          if (typeof window.loadPyodide !== "function") {
            throw new Error("Pyodide loader did not attach to window.");
          }
          const instance = await Promise.race([
            window.loadPyodide({
              indexURL: cdnUrl,
              stdin: () => "Naomi",
            }),
            new Promise<never>((_, reject) =>
              window.setTimeout(
                () => reject(new Error("Pyodide WebAssembly initialization timed out.")),
                12000,
              ),
            ),
          ]);
          window.__naomiPyodideInstance = instance;
          return instance;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr instanceof Error
        ? lastErr
        : new Error("Unable to initialize Pyodide WebAssembly runtime.");
    })().catch((err) => {
      delete window.__naomiPyodidePromise;
      throw err;
    });
  }
  return window.__naomiPyodidePromise;
}

async function runViaPyodideInstance(
  pyodide: PyodideInstance,
  code: string,
  start: number,
): Promise<PythonExecutionResult> {
  pyodide.globals.set("__naomi_user_code", code);
  try {
    const rawJson = await pyodide.runPythonAsync(PYODIDE_WRAPPER_CODE);
    const parsed = JSON.parse(String(rawJson)) as {
      stdout?: string;
      stderr?: string;
      error?: string;
    };
    return {
      stdout: String(parsed.stdout ?? "").trimEnd(),
      stderr: String(parsed.stderr ?? "").trimEnd(),
      ...(parsed.error ? { error: String(parsed.error) } : {}),
      durationMs: Math.round(performance.now() - start),
      engine: "pyodide",
    };
  } finally {
    try {
      pyodide.globals.delete?.("__naomi_user_code");
    } catch {
      // Ignore cleanup errors
    }
  }
}

async function runViaServerPython(code: string, start: number): Promise<PythonExecutionResult> {
  const res = await fetch("/api/python", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = (await res.json().catch(() => null)) as {
    stdout?: string;
    stderr?: string;
    error?: string;
    durationMs?: number;
  } | null;

  if (!res.ok || !data) {
    throw new Error(data?.error || `Python execution request failed (${res.status})`);
  }

  return {
    stdout: String(data.stdout ?? "").trimEnd(),
    stderr: String(data.stderr ?? "").trimEnd(),
    ...(data.error ? { error: String(data.error) } : {}),
    durationMs:
      typeof data.durationMs === "number" ? data.durationMs : Math.round(performance.now() - start),
    engine: "pyodide",
  };
}

export async function runPythonInBrowser(code: string): Promise<PythonExecutionResult> {
  const start = performance.now();

  // 1. If Pyodide is already initialized in browser memory, run in-browser WebAssembly directly
  if (typeof window !== "undefined" && window.__naomiPyodideInstance) {
    try {
      return await runViaPyodideInstance(window.__naomiPyodideInstance, code, start);
    } catch {
      // Fall through to server Python runner if WASM throws an unexpected engine error
    }
  }

  // 2. Start warming up Pyodide WebAssembly in the background for subsequent runs
  if (typeof window !== "undefined" && !window.__naomiPyodidePromise) {
    ensurePyodideLoaded().catch(() => {
      // Handled gracefully by server runner or on-demand retry
    });
  }

  // 3. Execute immediately via real Python 3 server endpoint so cold-starts & strict iframes never fail or hang
  try {
    return await runViaServerPython(code, start);
  } catch {
    // 4. If server endpoint is unreachable (e.g. offline/static mode), await Pyodide in-browser
    try {
      const pyodide = await ensurePyodideLoaded();
      return await runViaPyodideInstance(pyodide, code, start);
    } catch (err) {
      return {
        stdout: "",
        stderr: "",
        error:
          err instanceof Error
            ? err.message
            : "Unable to execute Python code in the current environment.",
        durationMs: Math.round(performance.now() - start),
        engine: "pyodide",
      };
    }
  }
}
