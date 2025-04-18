import React from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  children: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => {
  const markdownComponents: Options['components'] = {
    div: ({ node, className, ...props }) => <div className={className} {...props} />,
  };

  // Preprocess the markdown string
  const preprocessMarkdown = (text: string): string => {
    const tempPlaceholder = '__TEMP_MATH_DELIM__';
    let processed = text;
    // Replace \frac with \dfrac and @@ with placeholder
    processed = processed.replace(/\\frac/g, '\\dfrac').replace(/@@/g, tempPlaceholder);

    // Replace ## with placeholder only if it's not at the beginning of a line
    processed = processed.replace(/##/g, (match, offset, string) => {
      // Check if the match is at the beginning of the string or follows a newline
      if (offset === 0 || string[offset - 1] === '\n') {
        return match; // Keep '##' as is
      } else {
        return tempPlaceholder; // Replace with placeholder
      }
    });

    // Escape remaining $ not preceded by \
    try {
      // This regex ensures we only escape $ if it's not preceded by a \
      processed = processed.replace(/(?<!\\)\$/g, '\\$');
    } catch (e) {
      // Fallback for environments without lookbehind support
      console.warn("Regex lookbehind not supported, using simpler $ escape.");
      processed = processed.replace(/\$/g, '\\$');
    }

    // Replace placeholder with $
    processed = processed.replace(new RegExp(tempPlaceholder, 'g'), '$');

    return processed;
  };

  const processedMarkdown = preprocessMarkdown(children);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={markdownComponents}
    >
      {processedMarkdown}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
