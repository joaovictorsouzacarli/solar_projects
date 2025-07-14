import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SolarProject = {
  id: string
  name: string
  location: string
  distribuidora: string
  projetista: string
  module_quantity: number
  module_brand: string
  module_model: string
  inverter_quantity: number
  inverter_brand: string
  inverter_model: string
  power: string
  tipo_padrao: string
  capacidade_disjuntor: number
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
