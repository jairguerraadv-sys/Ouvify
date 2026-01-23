"""
Serviço de upload de imagens para White Label usando Cloudinary.
"""
import os
import logging
from typing import Optional, Tuple
import cloudinary
import cloudinary.uploader
from django.conf import settings
from PIL import Image
from io import BytesIO

logger = logging.getLogger(__name__)


class UploadService:
    """Gerencia upload de imagens (logo, favicon) para Cloudinary"""
    
    # Limites de tamanho
    MAX_LOGO_SIZE_MB = 5
    MAX_FAVICON_SIZE_MB = 1
    
    # Dimensões recomendadas
    LOGO_MAX_WIDTH = 1000
    LOGO_MAX_HEIGHT = 400
    FAVICON_SIZE = 512  # Favicon quadrado
    
    # Formatos aceitos
    ALLOWED_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'svg']
    
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
        
        # Validar formato
        file_ext = file.name.split('.')[-1].lower()
        if file_ext not in cls.ALLOWED_FORMATS:
            return False, f"Formato não suportado. Use: {', '.join(cls.ALLOWED_FORMATS)}"
        
        # Validar se é imagem válida (exceto SVG)
        if file_ext != 'svg':
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
                folder=f"ouvy/tenants/{tenant_subdomain}",
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
                folder=f"ouvy/tenants/{tenant_subdomain}",
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
