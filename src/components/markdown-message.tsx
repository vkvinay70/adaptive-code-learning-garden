import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Terminal } from "lucide-react";

function extractTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractTextContent(props?.children);
  }
  return "";
}

function CodeBlockWithCopy({ children, language }: { children: ReactNode; language: string }) {
  const [copied, setCopied] = useState(false);
  const rawCode = extractTextContent(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] text-slate-100 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-[11px] font-mono text-slate-300">
        <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-sky-300">
          <Terminal className="h-3 w-3 text-[#FFD43B]" />
          {language || "python"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-sans font-semibold text-slate-200 transition-colors hover:border-sky-400/50 hover:text-white"
          aria-label="Copy Python code snippet"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="!m-0 !border-0 !bg-transparent p-3.5 overflow-x-auto text-xs sm:text-[13px] leading-relaxed font-mono text-slate-100">
        <code>{rawCode}</code>
      </pre>
    </div>
  );
}

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="prose-tutor text-sm text-foreground">
      <ReactMarkdown
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const text = extractTextContent(children);
            const isBlock = Boolean(match) || text.includes("\n");

            if (isBlock) {
              return (
                <CodeBlockWithCopy language={match?.[1] ?? "python"}>{text}</CodeBlockWithCopy>
              );
            }

            return (
              <code
                className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.8125em] font-medium text-secondary-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
