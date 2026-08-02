import React, { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ShareReportButtonProps {
  summary: string;
  details?: string[];
  className?: string;
}

type ShareStatus = 'idle' | 'shared' | 'copied';

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  textArea.remove();
};

const ShareReportButton: React.FC<ShareReportButtonProps> = ({
  summary,
  details = [],
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [status, setStatus] = useState<ShareStatus>('idle');

  const handleShare = async () => {
    const title = document.querySelector('h1')?.textContent?.trim() || 'Sofinora calculation';
    const url = `${window.location.origin}${window.location.pathname}`;
    const takeaways = details.length > 0
      ? `\n\nKey takeaways:\n${details.map((detail) => `• ${detail}`).join('\n')}`
      : '';
    const text = `${title}\n\n${summary}${takeaways}\n\nProjection only — not financial advice.`;
    const copiedText = `${text}\n\nCalculate your own result: ${url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} — Sofinora`, text, url });
        setStatus('shared');
      } else {
        await copyText(copiedText);
        setStatus('copied');
      }
      window.setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      await copyText(copiedText);
      setStatus('copied');
      window.setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const complete = status !== 'idle';
  const label = status === 'shared' ? 'Shared' : status === 'copied' ? 'Report copied' : 'Share report';

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        isDark
          ? 'bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25'
          : 'bg-cyan-600 text-white hover:bg-cyan-700'
      } ${className}`}
      aria-label="Share this calculation report"
    >
      {complete ? <Check size={15} /> : <Share2 size={15} />}
      <span aria-live="polite">{label}</span>
    </button>
  );
};

export default ShareReportButton;
