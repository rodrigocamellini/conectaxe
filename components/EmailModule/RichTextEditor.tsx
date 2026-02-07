import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value to contentEditable
  useEffect(() => {
    if (contentRef.current && !isInternalChange.current) {
      if (contentRef.current.innerHTML !== value) {
        contentRef.current.innerHTML = value;
      }
    }
    // Reset internal change flag after sync check
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (contentRef.current) {
      isInternalChange.current = true;
      onChange(contentRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      contentRef.current.focus();
      handleInput(); // Trigger change
    }
  };

  const addImage = () => {
    const url = prompt('Insira a URL da imagem:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const addLink = () => {
    const url = prompt('Insira a URL do link:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const ToolbarButton = ({ icon: Icon, command, arg, title }: { icon: any, command: string, arg?: string, title: string }) => (
    <button
      type="button"
      onClick={() => command === 'image' ? addImage() : command === 'link' ? addLink() : execCommand(command, arg)}
      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex flex-col border border-gray-300 rounded overflow-hidden h-full">
      <div className="flex items-center flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <ToolbarButton icon={Bold} command="bold" title="Negrito" />
        <ToolbarButton icon={Italic} command="italic" title="Itálico" />
        <ToolbarButton icon={Underline} command="underline" title="Sublinhado" />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Alinhar à Esquerda" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Centralizar" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Alinhar à Direita" />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolbarButton icon={List} command="insertUnorderedList" title="Lista com Marcadores" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Lista Numerada" />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolbarButton icon={LinkIcon} command="link" title="Inserir Link" />
        <ToolbarButton icon={ImageIcon} command="image" title="Inserir Imagem" />
      </div>
      
      <div
        ref={contentRef}
        className="flex-1 p-4 overflow-y-auto focus:outline-none prose max-w-none"
        contentEditable
        onInput={handleInput}
        onBlur={handleInput} // Ensure final state is captured
        style={{ minHeight: '200px' }}
      />
      {(!value && placeholder) && (
        <div className="absolute pointer-events-none p-4 text-gray-400 mt-[41px]">
          {placeholder}
        </div>
      )}
    </div>
  );
};
