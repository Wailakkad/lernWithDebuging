// components/ui/code-block.tsx
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={dracula}
      className={className}
    >
      {code}
    </SyntaxHighlighter>
  );
}