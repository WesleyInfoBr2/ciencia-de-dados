import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LibraryRecord {
  [key: string]: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { library_type } = await req.json()

    if (!library_type) {
      return new Response(
        JSON.stringify({ error: 'library_type is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let csvUrl: string
    let tableName: string
    let processor: (records: LibraryRecord[]) => any[]

    switch (library_type) {
      case 'tools':
        csvUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.supabase.co')}/storage/v1/object/public/wiki-images/ferramentas.csv`
        tableName = 'tools'
        processor = (records) => records.map(record => ({
          name: record['Ferramenta'] || record['﻿Ferramenta'],
          description: record['Descrição'],
          category: record['Área'],
          is_free: record['Free']?.toLowerCase() === 'free',
          is_online: record['Online']?.toLowerCase() === 'online',
          status: record['Status']?.toLowerCase() || 'active',
          website_url: record['link'],
          added_date: record['Data adicionado'] ? new Date(record['Data adicionado'].replace(' (BRT)', '')) : new Date()
        }))
        break

      case 'courses':
        csvUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.supabase.co')}/storage/v1/object/public/wiki-images/formacoes.csv`
        tableName = 'educational_courses'
        processor = (records) => records.map(record => ({
          name: record['Curso'] || record['﻿Curso'],
          institution: record['Instituição'],
          duration: record['CH'],
          price: record['Valor'] || 'Gratuito',
          access_url: record['Link de acesso'],
          status: record['Status']?.toLowerCase() || 'active',
          added_date: record['Data cadastro'] ? new Date(record['Data cadastro'].replace(' (BRT)', '')) : new Date()
        }))
        break

      case 'code_python':
        csvUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.supabase.co')}/storage/v1/object/public/wiki-images/codigos-python.csv`
        tableName = 'code_packages'
        processor = (records) => records.map(record => ({
          name: record['Codigo'] || record['﻿Codigo'],
          language: 'python',
          description: record['Breve descrição'],
          website_url: record['Endereço'],
          status: record['Status']?.toLowerCase() || 'active',
          added_date: record['Data cadastro'] ? new Date(record['Data cadastro'].replace(' (BRT)', '')) : new Date()
        }))
        break

      case 'code_r':
        csvUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.supabase.co')}/storage/v1/object/public/wiki-images/codigos-r.csv`
        tableName = 'code_packages'
        processor = (records) => records.map(record => ({
          name: record['Codigo'] || record['﻿Codigo'],
          language: 'r',
          description: record['Breve descrição'],
          website_url: record['Link'],
          status: record['Status']?.toLowerCase() || 'active',
          added_date: record['Data cadastro'] ? new Date(record['Data cadastro'].replace(' (BRT)', '')) : new Date()
        }))
        break

      case 'data_sources':
        csvUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.supabase.co')}/storage/v1/object/public/wiki-images/fontes-dados.csv`
        tableName = 'data_sources'
        processor = (records) => records.map(record => ({
          name: record['Fonte'] || record['﻿Fonte'],
          documentation_url: record['Documentação'],
          example_data: record['Exemplos de dados'],
          access_method: record['Forma de acesso'],
          observations: record['Observações'],
          category: record['Área']
        }))
        break

      case 'datasets':
        csvUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.supabase.co')}/storage/v1/object/public/wiki-images/bases-dados.csv`
        tableName = 'datasets'
        processor = (records) => records.map(record => ({
          title: record['Tema'] || record['﻿Tema'],
          description: record['Descrição'],
          uploader_id: '00000000-0000-0000-0000-000000000000', // System user
          format: 'csv',
          license: record['Fonte'] || 'Unknown',
          source: record['Fonte'],
          category: 'Dados Acadêmicos',
          file_url: null,
          rows_count: parseInt(record['N respostas']) || null,
          is_public: true,
          slug: (record['Tema'] || record['﻿Tema'])?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'dataset'
        }))
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid library_type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // Use the public CSV files we copied - get them from the origin server
    const originUrl = req.url.replace('/functions/import-library-data', '')
    const csvPath = library_type === 'tools' ? 'ferramentas' : 
                   library_type === 'courses' ? 'formacoes' :
                   library_type === 'code_python' ? 'codigos-python' :
                   library_type === 'code_r' ? 'codigos-r' :
                   library_type === 'data_sources' ? 'fontes-dados' :
                   library_type === 'datasets' ? 'bases-dados' : 'unknown'
    
    const publicUrl = `${originUrl}/data/${csvPath}.csv`

    // Fetch CSV content
    const response = await fetch(publicUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    
    // Parse CSV manually (simple implementation)
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    
    const records: LibraryRecord[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      
      if (values.length === headers.length) {
        const record: LibraryRecord = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ''
        })
        records.push(record)
      }
    }

    // Process and insert records
    const processedRecords = processor(records.slice(0, 50)) // Limit to 50 records for now
    
    // Clear existing data and insert new data
    const { error: deleteError } = await supabaseClient
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Don't delete system records
      
    if (deleteError) {
      console.error('Delete error:', deleteError)
    }

    const { data, error } = await supabaseClient
      .from(tableName)
      .insert(processedRecords)

    if (error) {
      console.error('Insert error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: processedRecords.length,
        library_type,
        table: tableName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})