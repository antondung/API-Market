import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'json',
  title,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-outline-variant/40 bg-[#10141f] text-[#dae2fd] shadow-inner font-code-md ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#171c2b] border-b border-outline-variant/20 text-body-sm text-on-surface-variant/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
          {title ? (
            <span className="ml-2 font-medium text-slate-300 font-headline-sm text-[13px]">{title}</span>
          ) : (
            <span className="ml-2 uppercase tracking-wider text-[11px] font-code-sm text-slate-400">{language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-code-sm rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
          title="Copy code"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed font-code-md max-h-[460px]">
        <pre className="m-0 text-slate-200">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
