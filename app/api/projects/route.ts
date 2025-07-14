import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET - Listar todos os projetos
export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from("solar_projects")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar projetos:", error)
      return NextResponse.json({ error: "Erro ao buscar projetos", details: error.message }, { status: 500 })
    }

    return NextResponse.json(projects || [])
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const projectData = {
      name: body.name,
      location: body.location,
      distribuidora: body.distribuidora,
      projetista: body.projetista,
      module_quantity: Number.parseInt(body.moduleQuantity),
      module_brand: body.moduleBrand,
      module_model: body.moduleModel,
      inverter_quantity: Number.parseInt(body.inverterQuantity),
      inverter_brand: body.inverterBrand,
      inverter_model: body.inverterModel,
      power: body.power,
      tipo_padrao: body.tipoPadrao,
      capacidade_disjuntor: Number.parseInt(body.capacidadeDisjuntor),
      files: body.files || [],
    }

    const { data: project, error } = await supabase.from("solar_projects").insert([projectData]).select().single()

    if (error) {
      console.error("Erro ao criar projeto:", error)
      return NextResponse.json({ error: "Erro ao criar projeto", details: error.message }, { status: 500 })
    }

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
