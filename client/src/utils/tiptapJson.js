/** Convert inline DOM nodes to TipTap text nodes with marks */
function inlineChildrenToTipTap(element) {
  const result = [];

  const walk = (node, marks = []) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (text) {
        const textNode = { type: 'text', text };
        if (marks.length) textNode.marks = marks.map((m) => ({ ...m }));
        result.push(textNode);
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();
    const nextMarks = [...marks];

    if (tag === 'strong' || tag === 'b') nextMarks.push({ type: 'bold' });
    if (tag === 'em' || tag === 'i') nextMarks.push({ type: 'italic' });
    if (tag === 'u') nextMarks.push({ type: 'underline' });
    if (tag === 'code') nextMarks.push({ type: 'code' });
    if (tag === 'a') {
      nextMarks.push({
        type: 'link',
        attrs: { href: node.getAttribute('href') || '', target: '_blank' },
      });
    }
    if (tag === 'br') {
      result.push({ type: 'hardBreak' });
      return;
    }

    node.childNodes.forEach((child) => walk(child, nextMarks));
  };

  element.childNodes.forEach((child) => walk(child, []));
  return result;
}

function listItems(listEl) {
  return Array.from(listEl.children)
    .filter((li) => li.tagName === 'LI')
    .map((li) => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: inlineChildrenToTipTap(li) }],
    }));
}

function blockChildrenFromElement(element) {
  const blocks = [];

  element.childNodes.forEach((node) => {
    const block = domNodeToTipTapBlock(node);
    if (block) blocks.push(block);
  });

  if (!blocks.length) {
    return [{ type: 'paragraph', content: inlineChildrenToTipTap(element) }];
  }

  return blocks;
}

function domNodeToTipTapBlock(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').trim();
    if (!text) return null;
    return { type: 'paragraph', content: [{ type: 'text', text: node.textContent ?? '' }] };
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tag = node.tagName.toLowerCase();

  switch (tag) {
    case 'p':
      return { type: 'paragraph', content: inlineChildrenToTipTap(node) };
    case 'h1':
      return { type: 'heading', attrs: { level: 1 }, content: inlineChildrenToTipTap(node) };
    case 'h2':
      return { type: 'heading', attrs: { level: 2 }, content: inlineChildrenToTipTap(node) };
    case 'h3':
      return { type: 'heading', attrs: { level: 3 }, content: inlineChildrenToTipTap(node) };
    case 'blockquote':
      return { type: 'blockquote', content: blockChildrenFromElement(node) };
    case 'ul':
      return { type: 'bulletList', content: listItems(node) };
    case 'ol':
      return { type: 'orderedList', content: listItems(node) };
    case 'pre': {
      const codeEl = node.querySelector('code') || node;
      const code = codeEl.textContent ?? '';
      return { type: 'codeBlock', content: code ? [{ type: 'text', text: code }] : [] };
    }
    case 'hr':
      return { type: 'horizontalRule' };
    case 'div':
    default: {
      const inline = inlineChildrenToTipTap(node);
      if (inline.length) return { type: 'paragraph', content: inline };
      return null;
    }
  }
}

/** Serialize a contentEditable root element to TipTap doc JSON */
export function domToTipTap(root) {
  if (!root) return { type: 'doc', content: [{ type: 'paragraph' }] };

  const content = [];
  root.childNodes.forEach((node) => {
    const block = domNodeToTipTapBlock(node);
    if (block) content.push(block);
  });

  return {
    type: 'doc',
    content: content.length ? content : [{ type: 'paragraph' }],
  };
}

export const isTipTapContentEmpty = (json) => {
  if (!json?.content?.length) return true;

  const walk = (nodes = []) =>
    nodes.reduce((text, node) => {
      if (node.type === 'text' && node.text) return text + node.text;
      if (node.content?.length) return text + walk(node.content);
      return text;
    }, '');

  return !walk(json.content).trim();
};

export const countTipTapWords = (json) => {
  if (!json?.content?.length) return 0;
  const text = json.content.reduce((acc, node) => {
    const walk = (nodes = []) =>
      nodes.reduce((t, n) => {
        if (n.type === 'text' && n.text) return t + n.text;
        if (n.content?.length) return t + walk(n.content);
        return t;
      }, '');
    return acc + walk(node.content || []);
  }, '');
  return text.trim().split(/\s+/).filter(Boolean).length;
};
