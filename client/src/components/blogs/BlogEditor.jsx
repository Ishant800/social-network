import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link2,
} from 'lucide-react';
import { domToTipTap, countTipTapWords } from '../../utils/tiptapJson';

export { isTipTapContentEmpty } from '../../utils/tiptapJson';

const ToolbarButton = ({ active, onClick, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    className={`rounded p-1 transition ${
      active
        ? 'bg-slate-800 text-white'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`}
  >
    {children}
  </button>
);

export default function BlogEditor({ onChange }) {
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [wordCount, setWordCount] = useState(0);
  const [bubble, setBubble] = useState(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const emitChange = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;
    const json = domToTipTap(root);
    setWordCount(countTipTapWords(json));
    onChangeRef.current?.(json);
  }, []);

  const focusEditor = () => editorRef.current?.focus();

  const exec = (command, value = null) => {
    focusEditor();
    document.execCommand(command, false, value);
    emitChange();
  };

  const formatBlock = (tag) => {
    focusEditor();
    document.execCommand('formatBlock', false, tag);
    emitChange();
  };

  const insertCodeBlock = () => {
    focusEditor();
    document.execCommand('formatBlock', false, 'pre');
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const range = sel.getRangeAt(0);
      const pre =
        range.commonAncestorContainer.parentElement?.closest('pre') ||
        editorRef.current?.querySelector('pre:last-of-type');
      if (pre && !pre.querySelector('code')) {
        const code = document.createElement('code');
        code.textContent = pre.textContent || '';
        pre.textContent = '';
        pre.appendChild(code);
      }
    }
    emitChange();
  };

  const setLink = () => {
    const url = window.prompt('Enter link URL', 'https://');
    if (url === null) return;
    if (url === '') {
      exec('unlink');
      return;
    }
    exec('createLink', url);
  };

  const updateBubble = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current?.contains(sel.anchorNode)) {
      setBubble(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      setBubble(null);
      return;
    }

    setBubble({
      top: rect.top + window.scrollY - 44,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  };

  const handleInput = () => {
    emitChange();
    updateBubble();
  };

  const toolbar = (compact = false) => (
    <>
      <ToolbarButton active={false} onClick={() => exec('bold')} title="Bold">
        <Bold className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </ToolbarButton>
      <ToolbarButton active={false} onClick={() => exec('italic')} title="Italic">
        <Italic className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </ToolbarButton>
      <ToolbarButton active={false} onClick={() => exec('underline')} title="Underline">
        <UnderlineIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </ToolbarButton>
      {!compact && <span className="mx-0.5 h-4 w-px bg-slate-200" />}
      <ToolbarButton active={false} onClick={() => formatBlock('h2')} title="Heading">
        <Heading2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </ToolbarButton>
      {!compact && (
        <ToolbarButton active={false} onClick={() => formatBlock('h3')} title="Subheading">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
      )}
      {!compact && <span className="mx-0.5 h-4 w-px bg-slate-200" />}
      <ToolbarButton active={false} onClick={() => exec('insertUnorderedList')} title="List">
        <List className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </ToolbarButton>
      {!compact && (
        <>
          <ToolbarButton active={false} onClick={() => exec('insertOrderedList')} title="Numbered list">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={false} onClick={() => formatBlock('blockquote')} title="Quote">
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={false} onClick={insertCodeBlock} title="Code">
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={false} onClick={() => exec('insertHorizontalRule')} title="Divider">
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </>
      )}
      <ToolbarButton active={false} onClick={setLink} title="Link">
        <Link2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </ToolbarButton>
    </>
  );

  return (
    <div className="blog-editor relative w-full">
      {bubble && (
        <div
          className="fixed z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1.5 py-1 shadow-md"
          style={{ top: bubble.top, left: bubble.left }}
        >
          {toolbar(true)}
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-0.5 border-b border-slate-100 pb-2">
        {toolbar(false)}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateBubble}
        onMouseUp={updateBubble}
        data-placeholder="Tell your story…"
        className="blog-editor-content blog-editor-editable min-h-[240px] w-full outline-none"
      />

      <p className="mt-2 text-right text-sm text-slate-400">{wordCount} words</p>
    </div>
  );
}
