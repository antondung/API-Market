import { t, useLanguage, type Language, LANGUAGE_KEY } from './index';

// Track original text of modified nodes so we can revert to English seamlessly
const originalTextMap = new WeakMap<Node, string>();
const originalPlaceholderMap = new WeakMap<Element, string>();
const originalTitleMap = new WeakMap<Element, string>();

let observer: MutationObserver | null = null;
let isTranslating = false;

// Regex patterns for dynamic numbers and templates
const dynamicPatterns: Array<{ pattern: RegExp; replace: (match: RegExpMatchArray) => string }> = [
  {
    pattern: /^(\d+)\s+APIs?\s+available$/i,
    replace: (m) => `${m[1]} API khả dụng`
  },
  {
    pattern: /^(\d+)\s+Keys$/i,
    replace: (m) => `${m[1]} API Key`
  },
  {
    pattern: /^(\d+)%\s+Left$/i,
    replace: (m) => `Còn lại ${m[1]}%`
  },
  {
    pattern: /^Resets in (\d+)d$/i,
    replace: (m) => `Làm mới sau ${m[1]} ngày`
  },
  {
    pattern: /^Cap:\s*\$(\d+(\.\d+)?)$/i,
    replace: (m) => `Hạn mức: $${m[1]}`
  },
  {
    pattern: /^View Full Logs\s*\((\d+)\)$/i,
    replace: (m) => `Xem toàn bộ nhật ký (${m[1]})`
  },
  {
    pattern: /^From\s*\$(\d+(\.\d+)?)\/mo$/i,
    replace: (m) => `Từ $${m[1]}/tháng`
  },
  {
    pattern: /^From\s*\$(\d+(\.\d+)?)\/month$/i,
    replace: (m) => `Từ $${m[1]}/tháng`
  },
  {
    pattern: /^Page\s+(\d+)\s+of\s+(\d+)$/i,
    replace: (m) => `Trang ${m[1]} / ${m[2]}`
  },
  {
    pattern: /^(\d+)\s+results?$/i,
    replace: (m) => `${m[1]} kết quả`
  },
  {
    pattern: /^Welcome back,\s*(.+)$/i,
    replace: (m) => `Chào mừng quay trở lại, ${m[1]}`
  }
];

function translateString(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return null;
  // Ignore purely numbers or code symbols
  if (/^[\d.,\s:;/\-_=+#$€¥%&*()]+$/.test(trimmed)) return null;
  // Ignore HTTP methods
  if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(trimmed)) return null;
  // Ignore developer hashtags (#Fintech, #Payments, etc.)
  if (trimmed.startsWith('#')) return null;

  // Check dynamic regex patterns
  for (const item of dynamicPatterns) {
    const match = trimmed.match(item.pattern);
    if (match) {
      return item.replace(match);
    }
  }

  // Exact translation lookup
  const translated = t(trimmed);
  if (translated && translated !== trimmed) {
    return translated;
  }

  return null;
}

function isIconOrCodeElement(elem: Element | null): boolean {
  if (!elem) return false;
  if (['SCRIPT', 'STYLE', 'PRE', 'CODE', 'NOSCRIPT'].includes(elem.tagName)) return true;
  if (elem.classList.contains('material-symbols-outlined') || elem.classList.contains('material-icons') || elem.classList.contains('material-symbols-rounded')) return true;
  if (elem.closest('.material-symbols-outlined') || elem.closest('.material-icons') || elem.closest('.material-symbols-rounded')) return true;
  if (elem.closest('pre') || elem.closest('code') || elem.closest('[data-no-translate]')) return true;
  return false;
}

function processTextNode(node: Text, lang: Language) {
  if (lang === 'vi') {
    const currentVal = node.nodeValue || '';
    const trimmed = currentVal.trim();
    if (!trimmed) return;

    // Check if parent element is an icon or code element
    const parent = node.parentElement;
    if (isIconOrCodeElement(parent)) return;

    const translated = translateString(trimmed);
    if (translated) {
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, currentVal);
      }
      // Preserve leading and trailing whitespace
      const leadingSpace = currentVal.match(/^\s*/)?.[0] || '';
      const trailingSpace = currentVal.match(/\s*$/)?.[0] || '';
      node.nodeValue = leadingSpace + translated + trailingSpace;
    }
  } else {
    // English mode - restore if tracked
    if (originalTextMap.has(node)) {
      const original = originalTextMap.get(node);
      if (original !== undefined && node.nodeValue !== original) {
        node.nodeValue = original;
      }
    }
  }
}

function processElementAttributes(elem: Element, lang: Language) {
  if (isIconOrCodeElement(elem)) return;

  // Placeholder
  if (elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement) {
    if (lang === 'vi') {
      const ph = elem.placeholder;
      if (ph) {
        const trans = translateString(ph);
        if (trans) {
          if (!originalPlaceholderMap.has(elem)) {
            originalPlaceholderMap.set(elem, ph);
          }
          elem.placeholder = trans;
        }
      }
    } else {
      if (originalPlaceholderMap.has(elem)) {
        elem.placeholder = originalPlaceholderMap.get(elem)!;
      }
    }
  }

  // Title
  if (elem instanceof HTMLElement) {
    if (lang === 'vi') {
      const title = elem.title;
      if (title) {
        const trans = translateString(title);
        if (trans) {
          if (!originalTitleMap.has(elem)) {
            originalTitleMap.set(elem, title);
          }
          elem.title = trans;
        }
      }
    } else {
      if (originalTitleMap.has(elem)) {
        elem.title = originalTitleMap.get(elem)!;
      }
    }
  }
}

function walkAndTranslate(root: Node, lang: Language) {
  if (!root) return;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (isIconOrCodeElement(el)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let currentNode: Node | null = walker.currentNode;
  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      processTextNode(currentNode as Text, lang);
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      processElementAttributes(currentNode as Element, lang);
    }
    currentNode = walker.nextNode();
  }
}

export function startAutoTranslator(getLanguage: () => Language) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  const executeTranslation = () => {
    if (isTranslating) return;
    isTranslating = true;
    try {
      const lang = getLanguage();
      walkAndTranslate(document.body, lang);
    } finally {
      isTranslating = false;
    }
  };

  // Initial pass
  executeTranslation();

  // Observe DOM additions and attribute changes
  observer = new MutationObserver((mutations) => {
    if (isTranslating) return;

    let shouldTranslate = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldTranslate = true;
        break;
      }
      if (mutation.type === 'characterData') {
        const node = mutation.target as Text;
        // Check if changed text is not our translated text
        const lang = getLanguage();
        if (lang === 'vi') {
          const current = node.nodeValue?.trim() || '';
          const translated = translateString(current);
          if (translated && translated !== current) {
            shouldTranslate = true;
            break;
          }
        }
      }
    }

    if (shouldTranslate) {
      executeTranslation();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Re-run whenever language changes
  const handleLangChange = () => {
    executeTranslation();
  };

  window.addEventListener('storage', handleLangChange);
  window.addEventListener('languagechange', handleLangChange);

  return () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    window.removeEventListener('storage', handleLangChange);
    window.removeEventListener('languagechange', handleLangChange);
  };
}
