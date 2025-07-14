"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Save, Upload, X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import type { ModuleSpec, InverterSpec } from "@/lib/supabase"

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

interface FormData {
  name: string
  location: string
  distribuidora: string
  power: string
  tipoPadrao: string
  capacidadeDisjuntor: string
}

interface UploadedFile {
  name: string
  size: number
  type: string
  url?: string
  publicId?: string
  uploading?: boolean
}

export default function CadastrarProjeto() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    distribuidora: "",
    power: "",
    tipoPadrao: "",
    capacidadeDisjuntor: "",
  })

  const [modules, setModules] = useState<ModuleSpec[]>([{ id: "1", quantity: 0, brand: "", model: "" }])

  const [inverters, setInverters] = useState<InverterSpec[]>([{ id: "1", quantity: 0, brand: "", model: "" }])

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Funções para gerenciar módulos
  const addModule = () => {
    const newId = Date.now().toString()
    setModules([...modules, { id: newId, quantity: 0, brand: "", model: "" }])
  }

  const removeModule = (id: string) => {
    if (modules.length > 1) {
      setModules(modules.filter((m) => m.id !== id))
    }
  }

  const updateModule = (id: string, field: keyof ModuleSpec, value: string | number) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  // Funções para gerenciar inversores
  const addInverter = () => {
    const newId = Date.now().toString()
    setInverters([...inverters, { id: newId, quantity: 0, brand: "", model: "" }])
  }

  const removeInverter = (id: string) => {
    if (inverters.length > 1) {
      setInverters(inverters.filter((i) => i.id !== id))
    }
  }

  const updateInverter = (id: string, field: keyof InverterSpec, value: string | number) => {
    setInverters(inverters.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      "application/acad", // DWG
      "application/dwg",
      "application/x-dwg",
      "image/vnd.dwg",
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ]

    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      })
      return false
    }

    // Para DWG, verificamos a extensão já que o MIME type pode variar
    const isDWG = file.name.toLowerCase().endsWith(".dwg")
    const isAllowedType = allowedTypes.some((type) => file.type.includes(type)) || isDWG

    if (!isAllowedType) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Apenas arquivos DWG, PDF, PNG e JPG são permitidos.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const uploadToCloudinary = async (file: File) => {
    if (!validateFile(file)) return

    const fileData: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type || "application/dwg",
      uploading: true,
    }

    setUploadedFiles((prev) => [...prev, fileData])

    try {
      // Criar FormData para enviar o arquivo
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("upload_preset", "solar_projects") // Preset do Cloudinary
      formDataUpload.append("folder", "solar-projects")

      // Upload para Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formDataUpload,
        },
      )

      if (!response.ok) {
        throw new Error("Erro no upload")
      }

      const result = await response.json()

      // Atualizar o arquivo com a URL real
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name && f.uploading
            ? {
                ...f,
                url: result.secure_url,
                publicId: result.public_id,
                uploading: false,
              }
            : f,
        ),
      )

      toast({
        title: "Arquivo enviado com sucesso!",
        description: `${file.name} foi adicionado ao projeto.`,
      })
    } catch (error) {
      console.error("Erro no upload:", error)
      setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name))
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(uploadToCloudinary)
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(uploadToCloudinary)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeFile = async (fileName: string, publicId?: string) => {
    // Se o arquivo foi enviado para Cloudinary, deletar de lá também
    if (publicId) {
      try {
        await fetch("/api/delete-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicId }),
        })
      } catch (error) {
        console.error("Erro ao deletar arquivo:", error)
      }
    }

    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName))
    toast({
      title: "Arquivo removido",
      description: `${fileName} foi removido do projeto.`,
    })
  }

  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (extension === "dwg") return "📐"
    if (extension === "pdf") return "📄"
    if (["png", "jpg", "jpeg"].includes(extension || "")) return "🖼️"
    return "📎"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validação básica
      const requiredFields = ["name", "location", "distribuidora", "power", "tipoPadrao", "capacidadeDisjuntor"]
      const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

      if (missingFields.length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        return
      }

      // Validar módulos
      const validModules = modules.filter((m) => m.quantity > 0 && m.brand && m.model)
      if (validModules.length === 0) {
        toast({
          title: "Módulos obrigatórios",
          description: "Adicione pelo menos um módulo com todos os campos preenchidos.",
          variant: "destructive",
        })
        return
      }

      // Validar inversores
      const validInverters = inverters.filter((i) => i.quantity > 0 && i.brand && i.model)
      if (validInverters.length === 0) {
        toast({
          title: "Inversores obrigatórios",
          description: "Adicione pelo menos um inversor com todos os campos preenchidos.",
          variant: "destructive",
        })
        return
      }

      // Verificar se ainda há uploads em andamento
      const uploading = uploadedFiles.some((f) => f.uploading)
      if (uploading) {
        toast({
          title: "Aguarde o upload",
          description: "Aguarde todos os arquivos terminarem de ser enviados.",
          variant: "destructive",
        })
        return
      }

      // Criar objeto do projeto
      const projectData = {
        ...formData,
        modules: validModules,
        inverters: validInverters,
        files: uploadedFiles.filter((f) => !f.uploading),
      }

      // Salvar no banco de dados via API
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Erro ao salvar projeto")
      }

      const savedProject = await response.json()

      console.log("Projeto salvo no banco:", savedProject)

      toast({
        title: "Projeto cadastrado com sucesso!",
        description: `Projeto "${formData.name}" foi salvo com ${validModules.length} tipo(s) de módulo e ${validInverters.length} tipo(s) de inversor.`,
      })

      // Aguardar um pouco para mostrar o toast antes de limpar
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Limpar formulário
      setFormData({
        name: "",
        location: "",
        distribuidora: "",
        power: "",
        tipoPadrao: "",
        capacidadeDisjuntor: "",
      })
      setModules([{ id: "1", quantity: 0, brand: "", model: "" }])
      setInverters([{ id: "1", quantity: 0, brand: "", model: "" }])
      setUploadedFiles([])

      toast({
        title: "Formulário limpo",
        description: "Pronto para cadastrar um novo projeto!",
      })
    } catch (error) {
      console.error("Erro ao salvar projeto:", error)
      toast({
        title: "Erro ao salvar projeto",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o projeto no banco de dados. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                <h1 className="text-2xl font-bold text-blue-900">Cadastrar Projeto</h1>
                <p className="text-sm text-gray-600">Adicione um novo projeto ao sistema</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Busca
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
                <CardDescription>Dados básicos do projeto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Projeto *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Residencial Vila Nova"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Localização *</Label>
                    <Input
                      id="location"
                      placeholder="Ex: São Paulo, SP"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="power">Potência Total *</Label>
                    <Input
                      id="power"
                      placeholder="Ex: 8.0 kWp"
                      value={formData.power}
                      onChange={(e) => handleInputChange("power", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="distribuidora">Distribuidora *</Label>
                    <Select
                      value={formData.distribuidora}
                      onValueChange={(value) => handleInputChange("distribuidora", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a distribuidora" />
                      </SelectTrigger>
                      <SelectContent>
                        {distribuidoras.map((dist) => (
                          <SelectItem key={dist} value={dist}>
                            {dist}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Elétricas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Elétricas</CardTitle>
                <CardDescription>Especificações do padrão elétrico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipoPadrao">Tipo de Padrão *</Label>
                    <Select
                      value={formData.tipoPadrao}
                      onValueChange={(value) => handleInputChange("tipoPadrao", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de padrão" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposPadrao.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacidadeDisjuntor">Capacidade do Disjuntor (A) *</Label>
                    <Input
                      id="capacidadeDisjuntor"
                      type="number"
                      placeholder="Ex: 40"
                      value={formData.capacidadeDisjuntor}
                      onChange={(e) => handleInputChange("capacidadeDisjuntor", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Módulos Fotovoltaicos */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Módulos Fotovoltaicos</CardTitle>
                    <CardDescription>Adicione um ou mais tipos de módulos solares</CardDescription>
                  </div>
                  <Button type="button" onClick={addModule} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Módulo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.map((module, index) => (
                  <div key={module.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Módulo {index + 1}</h4>
                      {modules.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeModule(module.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Quantidade *</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 20"
                          value={module.quantity || ""}
                          onChange={(e) => updateModule(module.id, "quantity", Number.parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Marca *</Label>
                        <Input
                          placeholder="Ex: Canadian Solar"
                          value={module.brand}
                          onChange={(e) => updateModule(module.id, "brand", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Modelo *</Label>
                        <Input
                          placeholder="Ex: CS3W-400P"
                          value={module.model}
                          onChange={(e) => updateModule(module.id, "model", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Inversores */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Inversores</CardTitle>
                    <CardDescription>Adicione um ou mais tipos de inversores ou microinversores</CardDescription>
                  </div>
                  <Button type="button" onClick={addInverter} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Inversor
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {inverters.map((inverter, index) => (
                  <div key={inverter.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Inversor {index + 1}</h4>
                      {inverters.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeInverter(inverter.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Quantidade *</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 1"
                          value={inverter.quantity || ""}
                          onChange={(e) =>
                            updateInverter(inverter.id, "quantity", Number.parseInt(e.target.value) || 0)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Marca *</Label>
                        <Input
                          placeholder="Ex: Fronius"
                          value={inverter.brand}
                          onChange={(e) => updateInverter(inverter.id, "brand", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Modelo *</Label>
                        <Input
                          placeholder="Ex: Primo 8.2-1"
                          value={inverter.model}
                          onChange={(e) => updateInverter(inverter.id, "model", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upload de Arquivos */}
            <Card>
              <CardHeader>
                <CardTitle>Arquivos do Projeto</CardTitle>
                <CardDescription>Anexe arquivos DWG, PDF, imagens (máximo 10MB por arquivo)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Área de Upload */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500 mb-4">Suporta: DWG, PDF, PNG, JPG (máx. 10MB)</p>

                  {/* Input file corrigido */}
                  <input
                    type="file"
                    multiple
                    accept=".dwg,.pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Selecionar Arquivos
                  </Button>
                </div>

                {/* Lista de Arquivos */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Arquivos Anexados ({uploadedFiles.length})</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getFileIcon(file.name, file.type)}</span>
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.uploading ? (
                              <Badge variant="secondary">Enviando...</Badge>
                            ) : (
                              <Badge variant="default">✓ Enviado</Badge>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.name, file.publicId)}
                              disabled={file.uploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4 justify-end">
              <Link href="/">
                <Button variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Salvando no banco..." : "Salvar Projeto"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
