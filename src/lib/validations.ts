import { z } from 'zod'

export const wikiPostSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  slug: z.string().min(1, 'Slug é obrigatório').max(100, 'Slug muito longo')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  content: z.any(),
  excerpt: z.string().max(500, 'Resumo muito longo').optional(),
  category_id: z.string().uuid().optional(),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  icon: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
})

export type WikiPostFormData = z.infer<typeof wikiPostSchema>

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}