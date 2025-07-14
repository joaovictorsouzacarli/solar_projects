import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ModuleSpec = {
  id: string
  quantity: number
  brand: string
  model: string
}

export type InverterSpec = {
  id: string
  quantity: number
  brand: string
  model: string
}

export type SolarProject = {
  id: string
  name: string
  location: string
  distribuidora: string
  power: string
  tipo_padrao: string
  capacidade_disjuntor: number
  modules: ModuleSpec[]
  inverters: InverterSpec[]
  files: Array<{
    name: string
    size: number
    type: string
    url: string
    publicId: string
  }>
  created_at: string
  updated_at: string
}
