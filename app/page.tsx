"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, Eye, Download, Calendar, MapPin, Zap, Plus } from "lucide-react"
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

// Dados de exemplo dos projetos (atualizados sem cliente)
const solarProjects = [
  {
    id: 1,
    name: "Residencial Vila Nova",
    location: "São Paulo, SP",
    date: "2024-01-15",
    moduleQuantity: 20,
    moduleBrand: "Canadian Solar",
    moduleModel: "CS3W-400P",
    inverterQuantity: 1,
    inverterBrand: "Fronius",
    inverterModel: "Primo 8.2-1",
    power: "8.0 kWp",
    distribuidora: "CPFL Energia",
    projetista: "Eng. Carlos Santos",
    files: [
      { name: "planta-baixa.dwg", size: 2048000, type: "application/dwg", url: "https://example.com/file1.dwg" },
      { name: "memorial-descritivo.pdf", size: 512000, type: "application/pdf", url: "https://example.com/file2.pdf" },
    ],
  },
  {
    id: 2,
    name: "Comercial Tech Center",
    location: "Rio de Janeiro, RJ",
    date: "2024-02-20",
    moduleQuantity: 50,
    moduleBrand: "Jinko Solar",
    moduleModel: "JKM540M-7RL3",
    inverterQuantity: 2,
    inverterBrand: "SMA",
    inverterModel: "STP 15000TL-30",
    power: "27.0 kWp",
    distribuidora: "Light",
    projetista: "Eng. Maria Oliveira",
    files: [
      { name: "projeto-eletrico.dwg", size: 2048000, type: "application/dwg", url: "https://example.com/file3.dwg" },
      { name: "relatorio-tecnico.pdf", size: 512000, type: "application/pdf", url: "https://example.com/file4.pdf" },
    ],
  },
  {
    id: 3,
    name: "Residencial Jardim América",
    location: "Belo Horizonte, MG",
    date: "2024-03-10",
    moduleQuantity: 15,
    moduleBrand: "Canadian Solar",
    moduleModel: "CS3W-400P",
    inverterQuantity: 12,
    inverterBrand: "Enphase",
    inverterModel: "IQ7+",
    power: "6.0 kWp",
    distribuidora: "Cemig",
    projetista: "Eng. Pedro Lima",
    files: [
      { name: "diagrama-unifilar.dwg", size: 2048000, type: "application/dwg", url: "https://example.com/file5.dwg" },
      { name: "analise-viabilidade.pdf", size: 512000, type: "application/pdf", url: "https://example.com/file6.pdf" },
    ],
  },
  {
    id: 4,
    name: "Industrial Metalúrgica",
    location: "Campinas, SP",
    date: "2024-01-30",
    moduleQuantity: 100,
    moduleBrand: "Trina Solar",
    moduleModel: "TSM-DE09.08",
    inverterQuantity: 3,
    inverterBrand: "Huawei",
    inverterModel: "SUN2000-50KTL-M0",
    power: "54.0 kWp",
    distribuidora: "CPFL Energia",
    projetista: "Eng. Ana Costa",
    files: [
      { name: "layout-modulos.dwg", size: 2048000, type: "application/dwg", url: "https://example.com/file7.dwg" },
      { name: "laudo-tecnico.pdf", size: 512000, type: "application/pdf", url: "https://example.com/file8.pdf" },
    ],
  },
  {
    id: 5,
    name: "Residencial Condomínio Solar",
    location: "Brasília, DF",
    date: "2024-02-05",
    moduleQuantity: 25,
    moduleBrand: "Jinko Solar",
    moduleModel: "JKM540M-7RL3",
    inverterQuantity: 1,
    inverterBrand: "Fronius",
    inverterModel: "Symo 12.5-3-M",
    power: "13.5 kWp",
    distribuidora: "CEB",
    projetista: "Eng. Roberto Silva",
    files: [
      { name: "conexao-rede.dwg", size: 2048000, type: "application/dwg", url: "https://example.com/file9.dwg" },
      {
        name: "simulacao-energetica.pdf",
        size: 512000,
        type: "application/pdf",
        url: "https://example.com/file10.pdf",
      },
    ],
  },
]

export default function SolarProjectSystem() {
  const [filters, setFilters] = useState({
    moduleQuantity: "",
    moduleBrand: "",
    moduleModel: "",
    inverterQuantity: "",
    inverterBrand: "",
    inverterModel: "",
    distribuidora: "",
    searchTerm: "",
  })

  const [selectedProject, setSelectedProject] = useState(null)

  // Extrair opções únicas para os selects (agora só para modelos, já que marcas são livres)
  const uniqueModuleModels = [...new Set(solarProjects.map((p) => p.moduleModel))]
  const uniqueInverterModels = [...new Set(solarProjects.map((p) => p.inverterModel))]

  // Filtrar projetos
  const filteredProjects = useMemo(() => {
    return solarProjects.filter((project) => {
      const matchesSearch =
        !filters.searchTerm ||
        project.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        project.projetista.toLowerCase().includes(filters.searchTerm.toLowerCase())

      const matchesModuleQuantity =
        !filters.moduleQuantity || project.moduleQuantity.toString() === filters.moduleQuantity

      const matchesModuleBrand =
        !filters.moduleBrand || project.moduleBrand.toLowerCase().includes(filters.moduleBrand.toLowerCase())

      const matchesModuleModel = !filters.moduleModel || project.moduleModel === filters.moduleModel

      const matchesInverterQuantity =
        !filters.inverterQuantity || project.inverterQuantity.toString() === filters.inverterQuantity

      const matchesInverterBrand =
        !filters.inverterBrand || project.inverterBrand.toLowerCase().includes(filters.inverterBrand.toLowerCase())

      const matchesInverterModel = !filters.inverterModel || project.inverterModel === filters.inverterModel

      const matchesDistribuidora = !filters.distribuidora || project.distribuidora === filters.distribuidora

      return (
        matchesSearch &&
        matchesModuleQuantity &&
        matchesModuleBrand &&
        matchesModuleModel &&
        matchesInverterQuantity &&
        matchesInverterBrand &&
        matchesInverterModel &&
        matchesDistribuidora
      )
    })
  }, [filters])

  const clearFilters = () => {
    setFilters({
      moduleQuantity: "",
      moduleBrand: "",
      moduleModel: "",
      inverterQuantity: "",
      inverterBrand: "",
      inverterModel: "",
      distribuidora: "",
      searchTerm: "",
    })
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
            <Link href="/cadastro">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Projeto
              </Button>
            </Link>
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

                <Button onClick={clearFilters} variant="outline" className="w-full">
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
                {filteredProjects.length === 0
                  ? "Nenhum projeto encontrado com os filtros aplicados."
                  : "Clique em um projeto para ver os detalhes completos."}
              </p>
            </div>

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
                            {new Date(project.date).toLocaleDateString("pt-BR")}
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
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-blue-900">MÓDULOS</h4>
                        <p className="text-sm">
                          <strong>Quantidade:</strong> {project.moduleQuantity} unidades
                        </p>
                        <p className="text-sm">
                          <strong>Marca/Modelo:</strong> {project.moduleBrand} {project.moduleModel}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-blue-900">INVERSORES</h4>
                        <p className="text-sm">
                          <strong>Quantidade:</strong> {project.inverterQuantity} unidades
                        </p>
                        <p className="text-sm">
                          <strong>Marca/Modelo:</strong> {project.inverterBrand} {project.inverterModel}
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
                                      {new Date(selectedProject.date).toLocaleDateString("pt-BR")}
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
                                  <h4 className="font-semibold mb-2">Especificações Técnicas</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Potência Total:</strong> {selectedProject.power}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Módulos Fotovoltaicos</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Quantidade:</strong> {selectedProject.moduleQuantity} unidades
                                    </p>
                                    <p>
                                      <strong>Marca:</strong> {selectedProject.moduleBrand}
                                    </p>
                                    <p>
                                      <strong>Modelo:</strong> {selectedProject.moduleModel}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Inversores</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <strong>Quantidade:</strong> {selectedProject.inverterQuantity} unidades
                                    </p>
                                    <p>
                                      <strong>Marca:</strong> {selectedProject.inverterBrand}
                                    </p>
                                    <p>
                                      <strong>Modelo:</strong> {selectedProject.inverterModel}
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
                                        <Button size="sm" variant="outline">
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
                                <Button variant="outline" className="flex-1">
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
