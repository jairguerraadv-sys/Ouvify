"""
Serviço de upload de imagens para White Label usando Cloudinary.
ATUALIZADO: Auditoria Fase 2 - Validação de MIME type adicionada (26/01/2026)
"""
import os
import logging
from typing import Optional, Tuple
import cloudinary
import cloudinary.uploader
from django.conf import settings
from PIL import Image
from io import BytesIO

# MIME type detection via magic bytes
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    logging.warning("python-magic não instalado. Validação de MIME type desabilitada.")

logger = logging.getLogger(__name__)


class UploadService:
    """Gerencia upload de imagens (logo, favicon) para Cloudinary"""
    
    # Limites de tamanho
    # ===================================================
    # CONFIGURAÇÕES DE UPLOAD - Auditoria Fase 2 (26/01/2026)
    # ===================================================
    MAX_LOGO_SIZE_MB = 2  # Reduzido de 5MB
    MAX_FAVICON_SIZE_MB = 0.5  # Reduzido de 1MB
    
    # Dimensões recomendadas
    LOGO_MAX_WIDTH = 1000
    LOGO_MAX_HEIGHT = 400
    FAVICON_SIZE = 512  # Favicon quadrado
    
    # ===================================================
    # FORMATOS PERMITIDOS - Auditoria Fase 2 (26/01/2026)
    # ===================================================
    # SVG REMOVIDO: Pode conter JavaScript embutido (Stored XSS)
    # Alternativas para logos:
    # - PNG com transparência (melhor compatibilidade)
    # - WebP (menor tamanho, suporte moderno)
    ALLOWED_FORMATS = ['png', 'jpg', 'jpeg', 'webp']
    
    # MIME types permitidos (validação adicional)
    ALLOWED_MIME_TYPES = {
        'image/png': ['png'],
        'image/jpeg': ['jpg', 'jpeg'],
        'image/webp': ['webp'],
    }
    
    @classmethod
    def validate_mime_type(cls, file) -> Tuple[bool, Optional[str]]:
        """
        Valida MIME type real do arquivo (magic bytes)
        NOVO: Auditoria Fase 2 (26/01/2026)
        
        Args:
            file: UploadedFile object
            
        Returns:
            Tuple (is_valid, error_message)
        """
        if not MAGIC_AVAILABLE:
            # Se python-magic não está disponível, skip validação
            logger.warning("python-magic não disponível. Validação de MIME type ignorada.")
            return True, None
        
        try:
            # 1. Ler primeiros 2048 bytes (suficiente para magic bytes)
            file.seek(0)
            file_header = file.read(2048)
            file.seek(0)  # Reset para início
            
            # 2. Detectar MIME type real via magic bytes
            mime_type = magic.from_buffer(file_header, mime=True)
            
            # 3. Verificar se MIME type é permitido
            if mime_type not in cls.ALLOWED_MIME_TYPES:
                return False, f"Tipo de arquivo não permitido: {mime_type}"
            
            # 4. Verificar se extensão declarada bate com MIME type
            declared_extension = file.name.split('.')[-1].lower()
            expected_extensions = cls.ALLOWED_MIME_TYPES[mime_type]
            
            if declared_extension not in expected_extensions:
                return False, (
                    f"Extensão '{declared_extension}' não corresponde ao tipo real "
                    f"'{mime_type}' (esperado: {', '.join(expected_extensions)})"
                )
            
            # 5. Verificação adicional: tamanho mínimo
            if len(file_header) < 100:
                return False, "Arquivo muito pequeno ou corrompido"
            
            return True, None
            
        except Exception as e:
            logger.error(f"Erro ao validar MIME type: {e}")
            return False, "Erro ao validar tipo de arquivo"
    
    @classmethod
    def configure(cls):
        """Configura Cloudinary com credenciais do .env"""
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET'),
            secure=True
        )
    
    @classmethod
    def validate_image(cls, file, max_size_mb: int, is_favicon: bool = False) -> Tuple[bool, Optional[str]]:
        """
        Valida arquivo de imagem.
        
        Args:
            file: Arquivo uploaded (InMemoryUploadedFile ou TemporaryUploadedFile)
            max_size_mb: Tamanho máximo em MB
            is_favicon: Se True, valida como favicon (quadrado)
        
        Returns:
            Tuple (is_valid, error_message)
        """
        # Validar tamanho
        max_size_bytes = max_size_mb * 1024 * 1024
        if file.size > max_size_bytes:
            return False, f"Arquivo muito grande. Máximo: {max_size_mb}MB"
        
        if file.size < 100:
            return False, "Arquivo muito pequeno (mínimo: 100 bytes)"
        
        # Validar formato (extensão)
        file_ext = file.name.split('.')[-1].lower()
        if file_ext not in cls.ALLOWED_FORMATS:
            return False, f"Formato não suportado. Use: {', '.join(cls.ALLOWED_FORMATS)}"
        
        # ✅ NOVO: Validação de MIME type (magic bytes) - Auditoria Fase 2
        is_valid_mime, mime_error = cls.validate_mime_type(file)
        if not is_valid_mime:
            return False, mime_error
        
        # Validar se é imagem válida (PIL)
        try:
            img = Image.open(file)
            img.verify()
            
            # Reabrir para verificar dimensões
            file.seek(0)
            img = Image.open(file)
            width, height = img.size
            
            if is_favicon:
                # Favicon deve ser quadrado ou próximo disso
                aspect_ratio = width / height
                if not (0.9 <= aspect_ratio <= 1.1):
                    return False, "Favicon deve ser uma imagem quadrada"
            else:
                # Logo não deve ser muito alto
                if width > cls.LOGO_MAX_WIDTH or height > cls.LOGO_MAX_HEIGHT:
                    return False, f"Dimensões muito grandes. Máximo: {cls.LOGO_MAX_WIDTH}x{cls.LOGO_MAX_HEIGHT}px"
            
            # Resetar ponteiro do arquivo
            file.seek(0)
            
        except Exception as e:
            logger.error(f"Erro ao validar imagem: {str(e)}")
            return False, "Arquivo de imagem inválido ou corrompido"
        
        return True, None
    
    @classmethod
    def upload_logo(cls, file, tenant_subdomain: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Faz upload da logo para Cloudinary.
        
        Args:
            file: Arquivo de imagem
            tenant_subdomain: Subdomínio do tenant (usado no nome do arquivo)
        
        Returns:
            Tuple (success, url, error_message)
        """
        # Validar imagem
        is_valid, error = cls.validate_image(file, cls.MAX_LOGO_SIZE_MB, is_favicon=False)
        if not is_valid:
            return False, None, error
        
        try:
            # Configurar Cloudinary
            cls.configure()
            
            # Upload com transformações
            result = cloudinary.uploader.upload(
                file,
                folder=f"ouvify/tenants/{tenant_subdomain}",
                public_id=f"logo_{tenant_subdomain}",
                overwrite=True,
                resource_type="image",
                transformation=[
                    {'width': cls.LOGO_MAX_WIDTH, 'crop': 'limit'},
                    {'quality': 'auto:good'},
                    {'fetch_format': 'auto'}
                ]
            )
            
            url = result.get('secure_url')
            logger.info(f"Logo uploaded successfully for tenant {tenant_subdomain}: {url}")
            
            return True, url, None
            
        except Exception as e:
            error_msg = f"Erro ao fazer upload da logo: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    @classmethod
    def upload_favicon(cls, file, tenant_subdomain: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Faz upload do favicon para Cloudinary.
        
        Args:
            file: Arquivo de imagem (deve ser quadrado)
            tenant_subdomain: Subdomínio do tenant
        
        Returns:
            Tuple (success, url, error_message)
        """
        # Validar imagem
        is_valid, error = cls.validate_image(file, cls.MAX_FAVICON_SIZE_MB, is_favicon=True)
        if not is_valid:
            return False, None, error
        
        try:
            # Configurar Cloudinary
            cls.configure()
            
            # Upload com transformações para favicon
            result = cloudinary.uploader.upload(
                file,
                folder=f"ouvify/tenants/{tenant_subdomain}",
                public_id=f"favicon_{tenant_subdomain}",
                overwrite=True,
                resource_type="image",
                transformation=[
                    {'width': cls.FAVICON_SIZE, 'height': cls.FAVICON_SIZE, 'crop': 'fill'},
                    {'quality': 'auto:best'},
                    {'fetch_format': 'auto'}
                ]
            )
            
            url = result.get('secure_url')
            logger.info(f"Favicon uploaded successfully for tenant {tenant_subdomain}: {url}")
            
            return True, url, None
            
        except Exception as e:
            error_msg = f"Erro ao fazer upload do favicon: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    @classmethod
    def delete_image(cls, url: str) -> bool:
        """
        Deleta imagem do Cloudinary.
        
        Args:
            url: URL da imagem no Cloudinary
        
        Returns:
            True se deletado com sucesso
        """
        try:
            # Extrair public_id da URL
            # URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
            parts = url.split('/')
            if 'cloudinary.com' not in url:
                return False
            
            # Encontrar public_id (após /upload/ ou /upload/v{version}/)
            upload_idx = parts.index('upload')
            public_id_with_ext = '/'.join(parts[upload_idx + 2:])  # Skip version
            public_id = public_id_with_ext.rsplit('.', 1)[0]  # Remove extensão
            
            cls.configure()
            result = cloudinary.uploader.destroy(public_id)
            
            return result.get('result') == 'ok'
            
        except Exception as e:
            logger.error(f"Erro ao deletar imagem do Cloudinary: {str(e)}")
            return False
