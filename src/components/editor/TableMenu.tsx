import { useState } from 'react'
import { Editor } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table2, Plus, Minus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Settings2 } from 'lucide-react'

interface TableMenuProps {
  editor: Editor
}

// Grid de seleção de tamanho de tabela (estilo Excel)
function TableSizeSelector({ onSelect }: { onSelect: (rows: number, cols: number) => void }) {
  const [hoverRow, setHoverRow] = useState(0)
  const [hoverCol, setHoverCol] = useState(0)
  const maxRows = 8
  const maxCols = 8

  return (
    <div className="p-3">
      <div className="text-sm text-muted-foreground mb-2 text-center">
        {hoverRow > 0 && hoverCol > 0 ? `${hoverRow} × ${hoverCol}` : 'Selecione o tamanho'}
      </div>
      <div 
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}
        onMouseLeave={() => { setHoverRow(0); setHoverCol(0) }}
      >
        {Array.from({ length: maxRows }).map((_, row) =>
          Array.from({ length: maxCols }).map((_, col) => (
            <button
              key={`${row}-${col}`}
              type="button"
              className={`w-5 h-5 border rounded-sm transition-colors ${
                row < hoverRow && col < hoverCol
                  ? 'bg-primary border-primary'
                  : 'bg-muted/50 border-border hover:border-primary/50'
              }`}
              onMouseEnter={() => { setHoverRow(row + 1); setHoverCol(col + 1) }}
              onClick={() => onSelect(row + 1, col + 1)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function TableMenu({ editor }: TableMenuProps) {
  const [open, setOpen] = useState(false)
  
  const isInTable = editor.isActive('table')

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setOpen(false)
  }

  if (!isInTable) {
    // Botão para inserir nova tabela
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            title="Inserir tabela"
          >
            <Table2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <TableSizeSelector onSelect={insertTable} />
        </PopoverContent>
      </Popover>
    )
  }

  // Menu de edição de tabela existente
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="default"
          title="Opções de tabela"
          className="gap-1"
        >
          <Table2 className="w-4 h-4" />
          <Settings2 className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Adicionar coluna à esquerda
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
          <ArrowRight className="w-4 h-4 mr-2" />
          Adicionar coluna à direita
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
          <Minus className="w-4 h-4 mr-2" />
          Remover coluna
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
          <ArrowUp className="w-4 h-4 mr-2" />
          Adicionar linha acima
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
          <ArrowDown className="w-4 h-4 mr-2" />
          Adicionar linha abaixo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
          <Minus className="w-4 h-4 mr-2" />
          Remover linha
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
          <Table2 className="w-4 h-4 mr-2" />
          Alternar linha de cabeçalho
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
          <Table2 className="w-4 h-4 mr-2" />
          Alternar coluna de cabeçalho
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => editor.chain().focus().deleteTable().run()}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir tabela
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
