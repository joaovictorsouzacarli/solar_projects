import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET - Buscar projeto por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: project, error } = await supabase.from("solar_projects").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Erro ao buscar projeto:", error)
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Atualizar projeto
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data: project, error } = await supabase
      .from("solar_projects")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar projeto:", error)
      return NextResponse.json({ error: "Erro ao atualizar projeto" }, { status: 500 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE - Deletar projeto
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("solar_projects").delete().eq("id", params.id)

    if (error) {
      console.error("Erro ao deletar projeto:", error)
      return NextResponse.json({ error: "Erro ao deletar projeto" }, { status: 500 })
    }

    return NextResponse.json({ message: "Projeto deletado com sucesso" })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
