# White Label - Sistema Completo de Customização

## 📋 Visão Geral

Sistema completo de White Label implementado no Ouvy SaaS, permitindo que cada tenant (empresa cliente) customize completamente a aparência da plataforma com suas próprias cores, logo, favicon e fontes.

---

## ✅ Funcionalidades Implementadas

### Backend (Django)

#### 1. **Novos Campos no Modelo `Client`**
- `cor_primaria` (CharField): Cor primária em hexadecimal (ex: #3B82F6)
- `cor_secundaria` (CharField): Cor secundária em hexadecimal (opcional)
- `cor_texto` (CharField): Cor do texto em hexadecimal (opcional)
- `fonte_customizada` (CharField): Nome da fonte do Google Fonts (ex: Inter, Roboto)
- `logo` (URLField): URL da logo da empresa (Cloudinary)
- `favicon` (URLField): URL do favicon (Cloudinary)

#### 2. **Upload de Imagens com Cloudinary**
- **Serviço**: `apps/tenants/upload_service.py`
- **Validações**:
  - Logo: Máximo 5MB, formatos PNG/JPG/WebP/SVG
  - Favicon: Máximo 1MB, deve ser quadrado
- **Transformações automáticas**:
  - Logo redimensionada para máximo 1000x400px
  - Favicon convertido para 512x512px
  - Qualidade e formato otimizados automaticamente

#### 3. **Endpoints da API**

**GET /api/tenant-info/** (Público)
- Retorna informações de branding do tenant atual
- Cached por 5 minutos
- Resposta:
```json
{
  "nome": "Empresa ABC",
  "subdominio": "empresaabc",
  "cor_primaria": "#3B82F6",
  "cor_secundaria": "#10B981",
  "cor_texto": "#1F2937",
  "logo": "https://res.cloudinary.com/.../logo.png",
  "favicon": "https://res.cloudinary.com/.../favicon.png",
  "fonte_customizada": "Inter"
}
```

**PATCH /api/tenant-info/** (Autenticado)
- Atualiza configurações de branding
- Validação de formato hexadecimal
- Limpa cache automaticamente
- Body:
```json
{
  "cor_primaria": "#FF5733",
  "cor_secundaria": "#33FF57",
  "cor_texto": "#1A1A1A",
  "fonte_customizada": "Poppins"
}
```

**POST /api/upload-branding/** (Autenticado)
- Upload de logo e/ou favicon
- Content-Type: multipart/form-data
- Fields: `logo` (File), `favicon` (File)
- Resposta:
```json
{
  "logo_url": "https://res.cloudinary.com/.../logo.png",
  "favicon_url": "https://res.cloudinary.com/.../favicon.png",
  "errors": []
}
```

---

### Frontend (Next.js 15)

#### 1. **Hook `useTenantTheme()`**
- **Arquivo**: `hooks/use-tenant-theme.ts`
- **Funcionalidades**:
  - Busca dados do tenant via SWR (cache de 5 minutos)
  - Converte cores HEX para HSL (compatível com Tailwind)
  - Aplica CSS variables dinamicamente
  - Carrega fontes do Google Fonts dinamicamente
  - Atualiza favicon dinamicamente
  - Persiste tema no localStorage

**CSS Variables aplicadas**:
- `--primary`: Cor primária principal
- `--primary-light`: Cor primária clara (+20% luminosidade)
- `--primary-dark`: Cor primária escura (-20% luminosidade)
- `--secondary`: Cor secundária
- `--foreground`: Cor do texto
- `--font-family`: Fonte customizada

#### 2. **Serviço de Upload**
- **Arquivo**: `lib/branding-upload.ts`
- **Funções**:
  - `uploadBrandingImages(logo?, favicon?)`: Upload de imagens
  - `updateBrandingSettings(data)`: Atualizar cores e fonte
  - `validateImageFile(file, maxSizeMB, formats)`: Validação client-side
  - `createImagePreview(file)`: Gerar preview de imagem
  - `revokeImagePreview(url)`: Liberar memória de preview

#### 3. **Componentes**

**TenantBanner** (`components/TenantBanner.tsx`)
- Preview visual do tema atual
- Exibe logo, nome, cor primária
- Mostra swatch de cores
- Exemplos de botões estilizados

**ThemeLoader** (`app/layout.tsx`)
- Carrega tema no app root
- Previne FOUC (Flash of Unstyled Content)
- Aplica classe `.theme-ready` quando carregado

#### 4. **Página de Configurações**
- **Arquivo**: `app/dashboard/configuracoes/page.tsx`
- **Seções**:
  - Upload de Logo (com preview)
  - Upload de Favicon (com preview)
  - Color pickers para 3 cores
  - Input para fonte do Google Fonts
  - Botões de salvar com loading states
  - Preview de componentes estilizados

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicionar no `.env`:
```bash
# Cloudinary (Upload de Imagens)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
```

Obter credenciais em: https://cloudinary.com/console

### 2. Dependências

**Backend**:
```bash
pip install cloudinary==1.41.0 Pillow>=10.0.0
```

**Frontend**:
```bash
npm install sonner  # Para toasts
```

### 3. Migrações

```bash
cd ouvy_saas
python manage.py makemigrations tenants
python manage.py migrate
```

---

## 📖 Como Usar

### Para Desenvolvedores

**1. Aplicar tema em um componente**:
```tsx
import { useTenantTheme } from '@/hooks/use-tenant-theme';

export function MyComponent() {
  const theme = useTenantTheme();
  
  return (
    <div>
      {theme?.logo && <img src={theme.logo} alt={theme.nome} />}
      <h1 style={{ color: theme?.cor_primaria }}>{theme?.nome}</h1>
    </div>
  );
}
```

**2. Upload de logo programaticamente**:
```tsx
import { uploadBrandingImages } from '@/lib/branding-upload';

const handleUpload = async (logoFile: File) => {
  const result = await uploadBrandingImages(logoFile);
  
  if (result.errors.length === 0) {
    console.log('Logo URL:', result.logo_url);
  }
};
```

**3. Atualizar cores via API**:
```tsx
import { updateBrandingSettings } from '@/lib/branding-upload';

const handleUpdate = async () => {
  await updateBrandingSettings({
    cor_primaria: '#FF5733',
    cor_secundaria: '#33FF57',
  });
};
```

### Para Usuários Finais

1. Acessar **Dashboard > Configurações**
2. Na seção **White Label**:
   - Clicar em "Selecionar Logo" para fazer upload da logo
   - Clicar em "Selecionar Favicon" para fazer upload do favicon
   - Usar os color pickers para escolher cores
   - Digitar o nome da fonte desejada (do Google Fonts)
3. Clicar em "Salvar Configurações"
4. A página recarregará com o novo tema aplicado

---

## 🎨 Customização Avançada

### Cores Recomendadas

**Empresas de Tecnologia**:
- Primária: `#3B82F6` (Azul)
- Secundária: `#10B981` (Verde)

**Empresas Corporativas**:
- Primária: `#1E40AF` (Azul escuro)
- Secundária: `#9333EA` (Roxo)

**Startups Criativas**:
- Primária: `#EC4899` (Pink)
- Secundária: `#F59E0B` (Laranja)

### Fontes Recomendadas

**Profissionais**:
- Inter, Roboto, Open Sans, Lato

**Modernas**:
- Poppins, Montserrat, Raleway

**Elegantes**:
- Playfair Display, Merriweather, Crimson Pro

---

## 🔒 Segurança

1. **Upload de Imagens**:
   - Validação de tipo MIME
   - Limite de tamanho (5MB logo, 1MB favicon)
   - Verificação de imagem válida com Pillow
   - Upload apenas para usuários autenticados

2. **Cores**:
   - Validação de formato hexadecimal no backend
   - Regex: `^#[0-9A-Fa-f]{6}$`

3. **Cache**:
   - Invalidação automática após atualização
   - TTL de 5 minutos para informações públicas

---

## 🚀 Performance

- **Frontend**: SWR com deduplicação e cache
- **Backend**: Cache de 5 minutos no Django
- **Cloudinary**: CDN global, transformações automáticas
- **Fonts**: Carregamento assíncrono do Google Fonts

---

## 📝 TODO (Melhorias Futuras)

- [ ] Preview em tempo real das mudanças (sem reload)
- [ ] Galeria de temas pré-configurados
- [ ] Modo escuro/claro por tenant
- [ ] Customização de email templates
- [ ] Export/Import de configurações de tema
- [ ] Histórico de mudanças de branding
- [ ] Suporte para múltiplas logos (desktop/mobile)

---

## 🐛 Troubleshooting

**Erro: "No module named 'cloudinary'"**
- Solução: `pip install cloudinary==1.41.0 Pillow --only-binary=Pillow`

**Erro: "Cor primária inválida"**
- Verificar formato: deve ser `#RRGGBB` (ex: `#3B82F6`)

**Logo não aparece**
- Verificar se URL do Cloudinary está acessível
- Verificar console do navegador para erros CORS

**Tema não atualiza**
- Limpar cache do navegador
- Verificar se as CSS variables estão sendo aplicadas: F12 > Elements > :root

---

## 📚 Referências

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [SWR Documentation](https://swr.vercel.app/)
- [Google Fonts](https://fonts.google.com/)
- [Tailwind CSS Variables](https://tailwindcss.com/docs/customizing-colors)
