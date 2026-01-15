/**
 * Serviço para upload de imagens de branding (logo e favicon)
 */

import { api } from './api';
import logger from './logger';

export interface UploadBrandingResponse {
  logo_url: string | null;
  favicon_url: string | null;
  errors: Array<{ field: string; message: string }>;
}

export interface UpdateBrandingData {
  cor_primaria?: string;
  cor_secundaria?: string;
  cor_texto?: string;
  fonte_customizada?: string;
}

/**
 * Faz upload de logo e/ou favicon para o backend
 * 
 * @param logo - Arquivo de imagem para logo (opcional)
 * @param favicon - Arquivo de imagem para favicon (opcional)
 * @returns Promise com as URLs das imagens ou erros
 */
export async function uploadBrandingImages(
  logo?: File,
  favicon?: File
): Promise<UploadBrandingResponse> {
  try {
    const formData = new FormData();
    
    if (logo) {
      formData.append('logo', logo);
    }
    
    if (favicon) {
      formData.append('favicon', favicon);
    }
    
    if (!logo && !favicon) {
      throw new Error('Nenhum arquivo fornecido para upload');
    }
    
    const response = await api.post<UploadBrandingResponse>('/upload-branding/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    logger.log('Upload de branding realizado:', response.data);
    return response.data;
  } catch (error: any) {
    logger.error('Erro no upload de branding:', error);
    
    // Extrair mensagem de erro
    const errorMessage = error.response?.data?.detail || error.message || 'Erro desconhecido';
    
    return {
      logo_url: null,
      favicon_url: null,
      errors: [{ field: 'upload', message: errorMessage }],
    };
  }
}

/**
 * Atualiza configurações de branding (cores, fonte) via PATCH
 * 
 * @param data - Dados de branding para atualizar
 * @returns Promise com os dados atualizados do tenant
 */
export async function updateBrandingSettings(data: UpdateBrandingData): Promise<any> {
  try {
    const response = await api.patch('/tenant-info/', data);
    logger.log('Configurações de branding atualizadas:', response.data);
    return response.data;
  } catch (error: any) {
    logger.error('Erro ao atualizar branding:', error);
    throw error;
  }
}

/**
 * Valida arquivo de imagem antes do upload
 * 
 * @param file - Arquivo para validar
 * @param maxSizeMB - Tamanho máximo em MB
 * @param allowedFormats - Formatos permitidos
 * @returns Objeto com validação e mensagem de erro (se houver)
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
  allowedFormats: string[] = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
): { isValid: boolean; error?: string } {
  // Validar tamanho
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`,
    };
  }
  
  // Validar formato
  if (!allowedFormats.includes(file.type)) {
    return {
      isValid: false,
      error: `Formato não suportado. Use: ${allowedFormats.map(f => f.split('/')[1]).join(', ')}`,
    };
  }
  
  return { isValid: true };
}

/**
 * Cria uma URL de preview para uma imagem selecionada
 * 
 * @param file - Arquivo de imagem
 * @returns URL de preview (blob URL)
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Libera URL de preview da memória
 * 
 * @param url - URL de preview para revogar
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
