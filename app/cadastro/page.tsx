"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

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
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    distribuidora: "",
    projetista: "",
    moduleQuantity: "",
    moduleBrand: "",
    moduleModel: "",
    inverterQuantity: "",
    inverterBrand: "",
    inverterModel: "",
    power: "",
  })

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
      const requiredFields = [
        "name",
        "location",
        "distribuidora",
        "projetista",
        "moduleQuantity",
        "moduleBrand",
        "moduleModel",
        "inverterQuantity",
        "inverterBrand",
        "inverterModel",
        "power",
      ]
      const missingFields = requiredFields.filter((field) => !formData[field])

      if (missingFields.length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
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
        files: uploadedFiles.filter((f) => !f.uploading),
        createdAt: new Date().toISOString(),
        id: Date.now(), // ID temporário
      }

      // TEMPORÁRIO: Salvar no localStorage até implementarmos banco de dados
      const existingProjects = JSON.parse(localStorage.getItem("solarProjects") || "[]")
      const updatedProjects = [...existingProjects, projectData]
      localStorage.setItem("solarProjects", JSON.stringify(updatedProjects))

      console.log("Projeto cadastrado:", projectData)

      toast({
        title: "Projeto cadastrado com sucesso!",
        description: `Projeto "${formData.name}" foi salvo com ${uploadedFiles.length} arquivo(s) anexado(s).`,
      })

      // Aguardar um pouco para mostrar o toast antes de limpar
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Limpar formulário
      setFormData({
        name: "",
        location: "",
        distribuidora: "",
        projetista: "",
        moduleQuantity: "",
        moduleBrand: "",
        moduleModel: "",
        inverterQuantity: "",
        inverterBrand: "",
        inverterModel: "",
        power: "",
      })
      setUploadedFiles([])

      toast({
        title: "Formulário limpo",
        description: "Pronto para cadastrar um novo projeto!",
      })
    } catch (error) {
      console.error("Erro ao salvar projeto:", error)
      toast({
        title: "Erro ao salvar projeto",
        description: "Não foi possível salvar o projeto. Tente novamente.",
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
                    <Label htmlFor="projetista">Projetista *</Label>
                    <Input
                      id="projetista"
                      placeholder="Nome do projetista"
                      value={formData.projetista}
                      onChange={(e) => handleInputChange("projetista", e.target.value)}
                      required
                    />
                  </div>
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
              </CardContent>
            </Card>

            {/* Módulos Fotovoltaicos */}
            <Card>
              <CardHeader>
                <CardTitle>Módulos Fotovoltaicos</CardTitle>
                <CardDescription>Especificações dos módulos solares</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="moduleQuantity">Quantidade *</Label>
                    <Input
                      id="moduleQuantity"
                      type="number"
                      placeholder="Ex: 20"
                      value={formData.moduleQuantity}
                      onChange={(e) => handleInputChange("moduleQuantity", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="moduleBrand">Marca *</Label>
                    <Input
                      id="moduleBrand"
                      placeholder="Ex: Canadian Solar"
                      value={formData.moduleBrand}
                      onChange={(e) => handleInputChange("moduleBrand", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="moduleModel">Modelo *</Label>
                    <Input
                      id="moduleModel"
                      placeholder="Ex: CS3W-400P"
                      value={formData.moduleModel}
                      onChange={(e) => handleInputChange("moduleModel", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inversores */}
            <Card>
              <CardHeader>
                <CardTitle>Inversores</CardTitle>
                <CardDescription>Especificações dos inversores ou microinversores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="inverterQuantity">Quantidade *</Label>
                    <Input
                      id="inverterQuantity"
                      type="number"
                      placeholder="Ex: 1"
                      value={formData.inverterQuantity}
                      onChange={(e) => handleInputChange("inverterQuantity", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="inverterBrand">Marca *</Label>
                    <Input
                      id="inverterBrand"
                      placeholder="Ex: Fronius"
                      value={formData.inverterBrand}
                      onChange={(e) => handleInputChange("inverterBrand", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="inverterModel">Modelo *</Label>
                    <Input
                      id="inverterModel"
                      placeholder="Ex: Primo 8.2-1"
                      value={formData.inverterModel}
                      onChange={(e) => handleInputChange("inverterModel", e.target.value)}
                      required
                    />
                  </div>
                </div>
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
                {isSubmitting ? "Salvando..." : "Salvar Projeto"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
