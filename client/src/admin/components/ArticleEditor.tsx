import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { toEditorContent } from '../../shared/utils/content';

interface ArticleEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  error?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-2 py-1 text-sm font-medium ${
        active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
      } disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

export function ArticleEditor({ value, onChange, disabled, error }: ArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder: 'Write your article content...' }),
    ],
    content: toEditorContent(value),
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = toEditorContent(value);
    if (incoming !== current && value !== current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="h-48 rounded-md border border-gray-300 bg-gray-50" />;
  }

  function setLink() {
    const previousUrl = editor!.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previousUrl ?? '');
    if (url === null) return;
    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div>
      <div
        className={`rounded-md border ${
          error ? 'border-red-400' : 'border-gray-300'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            disabled={disabled}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            disabled={disabled}
          >
            I
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            disabled={disabled}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            disabled={disabled}
          >
            H3
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            disabled={disabled}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            disabled={disabled}
          >
            1. List
          </ToolbarButton>
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} disabled={disabled}>
            Link
          </ToolbarButton>
        </div>
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-4 py-3 min-h-[280px] focus:outline-none [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror]:outline-none"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
