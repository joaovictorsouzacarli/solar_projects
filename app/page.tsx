"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, Eye, Download, Calendar, MapPin, Zap, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { SolarProject } from "@/lib/supabase"

// Lista das principais distribuidoras de energia elétrica do Brasil
const distribuidoras = [
  "CPFL Energia",
  "Enel Distribuição",
  "Light",
  "Cemig",
  "Copel",
  "Celesc",
  "EDP",
  "Energisa",
  "Equatorial Energia",
  "Neoenergia",
  "RGE",
  "CELG",
  "Amazonas Energia",
  "Eletropaulo",
  "CEEE",
  "CERON",
  "ELETROACRE",
  "CEAL",
  "COELBA",
  "CELPE",
  "COSERN",
  "CEPISA",
  "CEMAR",
  "EMT",
  "CEMAT",
  "ENERGISA MS",
  "CEB",
  "CELG GT",
  "CHESP",
  "CFLO",
  "SULGIPE",
  "ESE",
  "COELCE",
  "CELTINS",
]

const tiposPadrao = ["Monofásico", "Bifásico", "Trifásico"]

export default function SolarProjectSystem() {
  const { toast } = useToast()
  const [solarProjects, setSolarProjects] = useState<SolarProject[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    moduleQuantity: "",
    moduleBrand: "",
    moduleModel: "",
    inverterQuantity: "",
    inverterBrand: "",
    inverterModel: "",
    distribuidora: "",
    tipoPadrao: "",
    capacidadeDisjuntor: "",
    searchTerm: "",
  })

  const [selectedProject, setSelectedProject] = useState<SolarProject | null>(null)

  // Carregar projetos do banco de dados
  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/projects")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Erro ao carregar projetos")
      }

      const projects = await response.json()
      setSolarProjects(projects)
    } catch (error) {
      console.error("Erro ao carregar projetos:", error)
      toast({
        title: "Erro ao carregar projetos",
        description:
          error instanceof Error ? error.message : "Não foi possível carregar os projetos do banco de dados.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // Extrair opções únicas para os selects
  const uniqueModuleModels = Array.from(new Set(solarProjects.map((p) => p.module_model)))
  const uniqueInverterModels = Array.from(new Set(solarProjects.map((p) => p.inverter_model)))

  // Filtrar projetos
  const filteredProjects = useMemo(() => {
    return solarProjects.filter((project) => {
      const matchesSearch =
        !filters.searchTerm ||
        project.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        project.projetista.toLowerCase().includes(filters.searchTerm.toLowerCase())

      const matchesModuleQuantity =
        !filters.moduleQuantity || project.module_quantity.toString() === filters.moduleQuantity

      const matchesModuleBrand =
        !filters.moduleBrand || project.module_brand.toLowerCase().includes(filters.moduleBrand.toLowerCase())

      const matchesModuleModel = !filters.moduleModel || project.module_model === filters.moduleModel

      const matchesInverterQuantity =
        !filters.inverterQuantity || project.inverter_quantity.toString() === filters.inverterQuantity

      const matchesInverterBrand =
        !filters.inverterBrand || project.inverter_brand.toLowerCase().includes(filters.inverterBrand.toLowerCase())

      const matchesInverterModel = !filters.inverterModel || project.inverter_model === filters.inverterModel

      const matchesDistribuidora = !filters.distribuidora || project.distribuidora === filters.distribuidora

      const matchesTipoPadrao = !filters.tipoPadrao || project.tipo_padrao === filters.tipoPadrao

      const matchesCapacidadeDisjuntor =
        !filters.capacidadeDisjuntor || project.capacidade_disjuntor.toString() === filters.capacidadeDisjuntor

      return (
        matchesSearch &&
        matchesModuleQuantity &&
        matchesModuleBrand &&
        matchesModuleModel &&
        matchesInverterQuantity &&
        matchesInverterBrand &&
        matchesInverterModel &&
        matchesDistribuidora &&
        matchesTipoPadrao &&
        matchesCapacidadeDisjuntor
      )
    })
  }, [filters, solarProjects])

  const clearFilters = () => {
    setFilters({
      moduleQuantity: "",
      moduleBrand: "",
      moduleModel: "",
      inverterQuantity: "",
      inverterBrand: "",
      inverterModel: "",
      distribuidora: "",
      tipoPadrao: "",
      capacidadeDisjuntor: "",
      searchTerm: "",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando projetos do banco de dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/connect-logo.png"
                alt="Connect Energia Solar"
                width={120}
                height={60}
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Sistema de Projetos</h1>
                <p className="text-sm text-gray-600">Busca inteligente de projetos solares</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadProjects}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Link href="/cadastro">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Projeto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Busca
                </CardTitle>
                <CardDescription>Use os filtros para encontrar projetos similares</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Busca geral */}
                <div>
                  <Label htmlFor="search">Busca Geral</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nome, local, projetista..."
                      className="pl-10"
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Filtro Distribuidora */}
                <div>
                  <Label htmlFor="distribuidora">Distribuidora</Label>
                  <Select
                    value={filters.distribuidora}
                    onValueChange={(value) => setFilters({ ...filters, distribuidora: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a distribuidora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as distribuidoras</SelectItem>
                      {distribuidoras.map((dist) => (
                        <SelectItem key={dist} value={dist}>
                          {dist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Filtros Elétricos */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-blue-900">INFORMAÇÕES ELÉTRICAS</h4>

                  <div>
                    <Label htmlFor="tipoPadrao">Tipo de Padrão</Label>
                    <Select
                      value={filters.tipoPadrao}
                      onValueChange={(value) => setFilters({ ...filters, tipoPadrao: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        {tiposPadrao.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="capacidadeDisjuntor">Capacidade Disjuntor (A)</Label>
                    <Input
                      id="capacidadeDisjuntor"
                      type="number"
                      placeholder="Ex: 40"
                      value={filters.capacidadeDisjuntor}
                      onChange={(e) => setFilters({ ...filters, capacidadeDisjuntor: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Filtros de Módulos */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-blue-900">MÓDULOS FOTOVOLTAICOS</h4>

                  <div>
                    <Label htmlFor="moduleQuantity">Quantidade de Módulos</Label>
                    <Input
                      id="moduleQuantity"
                      type="number"
                      placeholder="Ex: 20"
                      value={filters.moduleQuantity}
                      onChange={(e) => setFilters({ ...filters, moduleQuantity: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="moduleBrand">Marca dos Módulos</Label>
                    <Input
                      id="moduleBrand"
                      placeholder="Ex: Canadian Solar"
                      value={filters.moduleBrand}
                      onChange={(e) => setFilters({ ...filters, moduleBrand: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="moduleModel">Modelo dos Módulos</Label>
                    <Select
                      value={filters.moduleModel}
                      onValueChange={(value) => setFilters({ ...filters, moduleModel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os modelos</SelectItem>
                        {uniqueModuleModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Filtros de Inversores */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-blue-900">INVERSORES</h4>

                  <div>
                    <Label htmlFor="inverterQuantity">Quantidade de Inversores</Label>
                    <Input
                      id="inverterQuantity"
                      type="number"
                      placeholder="Ex: 1"
                      value={filters.inverterQuantity}
                      onChange={(e) => setFilters({ ...filters, inverterQuantity: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inverterBrand">Marca dos Inversores</Label>
                    <Input
                      id="inverterBrand"
                      placeholder="Ex: Fronius"
                      value={filters.inverterBrand}
                      onChange={(e) => setFilters({ ...filters, inverterBrand: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inverterModel">Modelo dos Inversores</Label>
                    <Select
                      value={filters.inverterModel}
                      onValueChange={(value) => setFilters({ ...filters, inverterModel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os modelos</SelectItem>
                        {uniqueInverterModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Projetos */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Projetos Encontrados ({filteredProjects.length})</h2>
              <p className="text-gray-600">
                {solarProjects.length === 0
                  ? "Nenhum projeto cadastrado ainda. Clique em 'Cadastrar Projeto' para adicionar o primeiro!"
                  : filteredProjects.length === 0
                    ? "Nenhum projeto encontrado com os filtros aplicados."
                    : "Clique em um projeto para ver os detalhes completos."}
              </p>
            </div>

            {solarProjects.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum projeto cadastrado</h3>
                <p className="text-gray-600 mb-6">
                  Comece cadastrando seu primeiro projeto solar para usar o sistema de busca.
                </p>
                <Link href="/cadastro">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Projeto
                  </Button>
                </Link>
              </div>
            )}

            <div className="grid gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(project.created_at).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {project.distribuidora}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-blue-900">ELÉTRICO</h4>
                        <p className="text-sm">
                          <strong>Padrão:</strong> {project.tipo_padrao}
                        </p>
                        <p className="text-sm">
                          <strong>Disjuntor:</strong> {project.capacidade_disjuntor}A
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-blue-900">MÓDULOS</h4>
                        <p className="text-sm">
                          <strong>Quantidade:</strong> {project.module_quantity} unidades
                        </p>
                        <p className="text-sm">
                          <strong>Marca/Modelo:</strong> {project.module_brand} {project.module_model}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-blue-900">INVERSORES</h4>
                        <p className="text-sm">
                          <strong>Quantidade:</strong> {project.inverter_quantity} unidades
                        </p>
                        <p className="text-sm">
                          <strong>Marca/Modelo:</strong> {project.inverter_brand} {project.inverter_model}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Potência:</strong> {project.power}
                        </span>
                        <span>
                          <strong>Projetista:</strong> {project.projetista}
                        </span>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedProject(project)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{project.name}</DialogTitle>
                            <DialogDescription>Detalhes completos do projeto solar</DialogDescription>
                          </DialogHeader>

                          {selectedProject && (
                            <div className="space-y-6">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Informações Gerais</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Local:</strong> {selectedProject.location}
                                    </p>
                                    <p>
                                      <strong>Data:</strong>{" "}
                                      {new Date(selectedProject.created_at).toLocaleDateString("pt-BR")}
                                    </p>
                                    <p>
                                      <strong>Distribuidora:</strong> {selectedProject.distribuidora}
                                    </p>
                                    <p>
                                      <strong>Projetista:</strong> {selectedProject.projetista}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Especificações Elétricas</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Potência Total:</strong> {selectedProject.power}
                                    </p>
                                    <p>
                                      <strong>Tipo de Padrão:</strong> {selectedProject.tipo_padrao}
                                    </p>
                                    <p>
                                      <strong>Capacidade Disjuntor:</strong> {selectedProject.capacidade_disjuntor}A
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Módulos Fotovoltaicos</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Quantidade:</strong> {selectedProject.module_quantity} unidades
                                    </p>
                                    <p>
                                      <strong>Marca:</strong> {selectedProject.module_brand}
                                    </p>
                                    <p>
                                      <strong>Modelo:</strong> {selectedProject.module_model}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Inversores</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Quantidade:</strong> {selectedProject.inverter_quantity} unidades
                                    </p>
                                    <p>
                                      <strong>Marca:</strong> {selectedProject.inverter_brand}
                                    </p>
                                    <p>
                                      <strong>Modelo:</strong> {selectedProject.inverter_model}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Arquivos do Projeto</h4>
                                {selectedProject.files && selectedProject.files.length > 0 ? (
                                  <div className="space-y-2">
                                    {selectedProject.files.map((file, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span>
                                            {file.name.endsWith(".dwg")
                                              ? "📐"
                                              : file.name.endsWith(".pdf")
                                                ? "📄"
                                                : "🖼️"}
                                          </span>
                                          <span className="text-sm">{file.name}</span>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(file.url, "_blank")}
                                        >
                                          <Download className="h-3 w-3 mr-1" />
                                          Baixar
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Nenhum arquivo anexado</p>
                                )}
                              </div>

                              <div className="flex gap-2 pt-4">
                                <Button className="flex-1">
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar Projeto
                                </Button>
                                <Button variant="outline" className="flex-1 bg-transparent">
                                  Usar como Base
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
