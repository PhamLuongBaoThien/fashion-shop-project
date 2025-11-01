// src/components/common/RichTextEditor/RichTextEditor.jsx

import React, { useEffect } from 'react'; 
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnorderedListOutlined, OrderedListOutlined, CodeOutlined } from '@ant-design/icons';
import { Button, Space, Divider } from 'antd';
import './RichTextEditor.css'; // Sẽ tạo file này ở bước sau

// --- THANH CÔNG CỤ ---
const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-toolbar">
      <Space wrap>
        <Button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().toggleBold()} className={editor.isActive('bold') ? 'is-active' : ''}>
          <BoldOutlined />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().toggleItalic()} className={editor.isActive('italic') ? 'is-active' : ''}>
          <ItalicOutlined />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().toggleStrike()} className={editor.isActive('strike') ? 'is-active' : ''}>
          <StrikethroughOutlined />
        </Button>
        <Divider type="vertical" />
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>
          <UnorderedListOutlined />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}>
          <OrderedListOutlined />
        </Button>
      </Space>
    </div>
  );
};

// --- TRÌNH SOẠN THẢO CHÍNH ---
const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit, // Kích hoạt các tính năng cơ bản
    ],
    content: value, // Nội dung ban đầu
    // Hàm này sẽ được gọi mỗi khi nội dung thay đổi
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // THÊM useEffect ĐỂ ĐỒNG BỘ HÓA DỮ LIỆU
  useEffect(() => {
    // Nếu editor đã sẵn sàng và giá trị mới khác với nội dung hiện tại của editor
    if (editor && value !== editor.getHTML()) {
      // Cập nhật nội dung của editor bằng phương thức của TipTap
      editor.commands.setContent(value);
    }
  }, [value, editor]); // Chạy lại mỗi khi `value` hoặc `editor` thay đổi

  return (
    <div className="tiptap-container">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;