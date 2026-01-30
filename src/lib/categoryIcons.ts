/**
 * Mapeamento de nomes de ícones Lucide para emojis
 * Este mapa é usado para converter ícones de categoria antigos (nomes de ícones Lucide)
 * para emojis que podem ser exibidos diretamente na UI
 */

export const iconNameToEmoji: Record<string, string> = {
  // Ícones de categoria Wiki
  'BookOpen': '📖',
  'PlayCircle': '▶️',
  'Target': '🎯',
  'Book': '📚',
  'FileText': '📄',
  'Code': '💻',
  'Database': '🗄️',
  'BarChart': '📊',
  'Brain': '🧠',
  'Lightbulb': '💡',
  'Rocket': '🚀',
  'Settings': '⚙️',
  'Users': '👥',
  'Star': '⭐',
  'Heart': '❤️',
  'Check': '✅',
  'Info': 'ℹ️',
  'Warning': '⚠️',
  'Error': '❌',
  'Folder': '📁',
  'Search': '🔍',
  'Edit': '✏️',
  'Trash': '🗑️',
  'Plus': '➕',
  'Minus': '➖',
  'Calendar': '📅',
  'Clock': '🕐',
  'Mail': '📧',
  'Phone': '📞',
  'Link': '🔗',
  'Image': '🖼️',
  'Video': '🎬',
  'Music': '🎵',
  'Download': '⬇️',
  'Upload': '⬆️',
  'Share': '🔄',
  'Lock': '🔒',
  'Unlock': '🔓',
  'Key': '🔑',
  'Home': '🏠',
  'Globe': '🌐',
  'Map': '🗺️',
  'Flag': '🚩',
  'Zap': '⚡',
  'Award': '🏆',
  'Gift': '🎁',
  'Coffee': '☕',
  'Sun': '☀️',
  'Moon': '🌙',
  'Cloud': '☁️',
}

/**
 * Converte um nome de ícone Lucide para emoji
 * Se o valor já for um emoji, retorna o próprio valor
 */
export function getCategoryEmoji(iconOrEmoji: string | null | undefined): string {
  if (!iconOrEmoji) return '📁'
  
  // Se já for um emoji (caractere Unicode não-ASCII), retorna diretamente
  // Emojis começam com caracteres fora do range ASCII básico
  const isEmoji = /[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]|[\u{1F300}-\u{1F9FF}]/u.test(iconOrEmoji)
  if (isEmoji) return iconOrEmoji
  
  // Tenta converter nome de ícone para emoji
  return iconNameToEmoji[iconOrEmoji] || '📁'
}
