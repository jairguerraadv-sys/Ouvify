"""
Testes de Upload - Ouvify
Sprint 1 Correções: Auditoria 30/01/2026

Cobertura:
- test_upload_arquivo_success: Upload de arquivo válido
- test_upload_invalid_type: Rejeição de tipo inválido
- test_upload_size_limit: Verificação de limite de tamanho
- test_mime_type_validation: Validação de MIME type real
"""

import io
from unittest.mock import MagicMock, patch

import pytest
from django.core.files.uploadedfile import InMemoryUploadedFile, SimpleUploadedFile
from PIL import Image

from apps.tenants.upload_service import UploadService


def create_test_image(format="PNG", size=(100, 100), filename="test.png"):
    """Cria uma imagem de teste válida."""
    image = Image.new("RGB", size, color="red")
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    buffer.seek(0)

    return InMemoryUploadedFile(
        file=buffer,
        field_name="file",
        name=filename,
        content_type=f"image/{format.lower()}",
        size=buffer.getbuffer().nbytes,
        charset=None,
    )


def create_large_image(size_mb=3):
    """Cria uma imagem grande para testar limite."""
    # Criar imagem com tamanho aproximado
    width = height = int((size_mb * 1024 * 1024 / 3) ** 0.5)
    image = Image.new("RGB", (width, height), color="blue")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    # Se o tamanho não for suficiente, adicionar padding
    content = buffer.read()
    if len(content) < size_mb * 1024 * 1024:
        content = content + b"\x00" * (size_mb * 1024 * 1024 - len(content))

    buffer = io.BytesIO(content)

    return InMemoryUploadedFile(
        file=buffer,
        field_name="file",
        name="large.png",
        content_type="image/png",
        size=len(content),
        charset=None,
    )


def create_svg_with_script():
    """Cria SVG malicioso com JavaScript."""
    svg_content = b"""<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg">
        <script>alert('XSS')</script>
    </svg>"""
    return SimpleUploadedFile(
        name="malicious.svg", content=svg_content, content_type="image/svg+xml"
    )


def create_fake_file(extension="exe", content=b"MZ\x90\x00\x03\x00\x00\x00"):
    """Cria arquivo fake (não imagem)."""
    return SimpleUploadedFile(
        name=f"malware.{extension}",
        content=content * 100,  # Pelo menos 100 bytes
        content_type="application/octet-stream",
    )


def create_tiny_file():
    """Cria arquivo muito pequeno."""
    return SimpleUploadedFile(
        name="tiny.png",
        content=b"x" * 50,  # Menos de 100 bytes
        content_type="image/png",
    )


# ======================
# TESTES DE VALIDAÇÃO DE IMAGEM
# ======================


@pytest.mark.django_db
class TestImageValidation:
    """Testes para validação de imagens via UploadService.validate_image."""

    def test_validate_valid_png(self):
        """PNG válido deve passar na validação."""
        image = create_test_image(format="PNG", filename="test.png")
        is_valid, error = UploadService.validate_image(
            image, max_size_mb=2, is_favicon=False
        )

        assert is_valid is True
        assert error is None

    def test_validate_valid_jpeg(self):
        """JPEG válido deve passar na validação."""
        image = create_test_image(format="JPEG", filename="test.jpg")
        is_valid, error = UploadService.validate_image(
            image, max_size_mb=2, is_favicon=False
        )

        assert is_valid is True
        assert error is None

    def test_validate_valid_webp(self):
        """WebP válido deve passar na validação."""
        image = create_test_image(format="WEBP", filename="test.webp")
        is_valid, error = UploadService.validate_image(
            image, max_size_mb=2, is_favicon=False
        )

        assert is_valid is True
        assert error is None

    def test_reject_svg_format(self):
        """SVG deve ser rejeitado (risco de XSS)."""
        svg = create_svg_with_script()
        is_valid, error = UploadService.validate_image(
            svg, max_size_mb=2, is_favicon=False
        )

        assert is_valid is False
        assert error is not None
        assert "suportado" in error.lower() or "formato" in error.lower()

    def test_reject_invalid_extension(self):
        """Extensão não permitida deve ser rejeitada."""
        fake = create_fake_file(extension="exe")
        is_valid, error = UploadService.validate_image(
            fake, max_size_mb=2, is_favicon=False
        )

        assert is_valid is False
        assert error is not None


# ======================
# TESTES DE LIMITE DE TAMANHO
# ======================


@pytest.mark.django_db
class TestUploadSizeLimit:
    """Testes para limite de tamanho de upload."""

    def test_reject_oversized_logo(self):
        """Logo maior que 2MB deve ser rejeitada."""
        large_image = create_large_image(size_mb=3)
        is_valid, error = UploadService.validate_image(
            large_image, max_size_mb=UploadService.MAX_LOGO_SIZE_MB, is_favicon=False
        )

        assert is_valid is False
        assert "grande" in error.lower() or "máximo" in error.lower()

    def test_reject_oversized_favicon(self):
        """Favicon maior que 0.5MB deve ser rejeitado."""
        # Criar imagem quadrada maior que 0.5MB
        image = Image.new("RGB", (800, 800), color="green")
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        content = buffer.getvalue()

        # Padding para garantir > 0.5MB
        if len(content) < 600 * 1024:
            content = content + b"\x00" * (600 * 1024 - len(content))

        buffer = io.BytesIO(content)
        large_favicon = InMemoryUploadedFile(
            file=buffer,
            field_name="file",
            name="large_favicon.png",
            content_type="image/png",
            size=len(content),
            charset=None,
        )

        is_valid, error = UploadService.validate_image(
            large_favicon,
            max_size_mb=int(UploadService.MAX_FAVICON_SIZE_MB),
            is_favicon=True,
        )

        assert is_valid is False
        assert "grande" in error.lower() or "máximo" in error.lower()

    def test_accept_valid_size(self):
        """Imagem dentro do limite deve ser aceita."""
        image = create_test_image(format="PNG", size=(200, 200))
        is_valid, error = UploadService.validate_image(
            image, max_size_mb=2, is_favicon=False
        )

        assert is_valid is True
        assert error is None

    def test_reject_too_small_file(self):
        """Arquivo menor que 100 bytes deve ser rejeitado."""
        tiny = create_tiny_file()
        is_valid, error = UploadService.validate_image(
            tiny, max_size_mb=2, is_favicon=False
        )

        assert is_valid is False
        assert "pequeno" in error.lower()


# ======================
# TESTES DE VALIDAÇÃO DE MIME TYPE
# ======================


@pytest.mark.django_db
class TestMimeTypeValidation:
    """Testes para validação de MIME type via magic bytes."""

    def test_validate_correct_mime_type(self):
        """MIME type correto deve ser aceito (com mock)."""
        import apps.tenants.upload_service as upload_module

        # Mock magic module
        mock_magic = MagicMock()
        mock_magic.from_buffer.return_value = "image/png"

        original_magic_available = upload_module.MAGIC_AVAILABLE
        original_magic = getattr(upload_module, "magic", None)

        try:
            upload_module.MAGIC_AVAILABLE = True
            upload_module.magic = mock_magic

            image = create_test_image(format="PNG", filename="test.png")
            is_valid, error = UploadService.validate_mime_type(image)

            assert is_valid is True
            assert error is None
        finally:
            upload_module.MAGIC_AVAILABLE = original_magic_available
            if original_magic:
                upload_module.magic = original_magic

    def test_reject_mismatched_extension(self):
        """Extensão que não bate com MIME type deve ser rejeitada."""
        import apps.tenants.upload_service as upload_module

        mock_magic = MagicMock()
        mock_magic.from_buffer.return_value = "image/png"

        original_magic_available = upload_module.MAGIC_AVAILABLE
        original_magic = getattr(upload_module, "magic", None)

        try:
            upload_module.MAGIC_AVAILABLE = True
            upload_module.magic = mock_magic

            # Arquivo .jpg mas é na verdade PNG
            image = create_test_image(format="PNG", filename="fake.jpg")
            is_valid, error = UploadService.validate_mime_type(image)

            assert is_valid is False
            assert "extensão" in error.lower() or "corresponde" in error.lower()
        finally:
            upload_module.MAGIC_AVAILABLE = original_magic_available
            if original_magic:
                upload_module.magic = original_magic

    def test_reject_disallowed_mime_type(self):
        """MIME type não permitido deve ser rejeitado."""
        import apps.tenants.upload_service as upload_module

        mock_magic = MagicMock()
        mock_magic.from_buffer.return_value = "application/pdf"

        original_magic_available = upload_module.MAGIC_AVAILABLE
        original_magic = getattr(upload_module, "magic", None)

        try:
            upload_module.MAGIC_AVAILABLE = True
            upload_module.magic = mock_magic

            fake = SimpleUploadedFile(
                name="document.pdf",
                content=b"%PDF-1.4" + b"\x00" * 2040,
                content_type="application/pdf",
            )

            is_valid, error = UploadService.validate_mime_type(fake)

            assert is_valid is False
            assert "permitido" in error.lower()
        finally:
            upload_module.MAGIC_AVAILABLE = original_magic_available
            if original_magic:
                upload_module.magic = original_magic

    def test_skip_validation_when_magic_unavailable(self):
        """Quando python-magic não está disponível, validação é ignorada."""
        import apps.tenants.upload_service as upload_module

        original_magic_available = upload_module.MAGIC_AVAILABLE

        try:
            upload_module.MAGIC_AVAILABLE = False

            image = create_test_image(format="PNG", filename="test.png")
            is_valid, error = UploadService.validate_mime_type(image)

            assert is_valid is True
            assert error is None
        finally:
            upload_module.MAGIC_AVAILABLE = original_magic_available


# ======================
# TESTES DE UPLOAD COMPLETO (COM MOCK)
# ======================


@pytest.mark.django_db
class TestUploadLogo:
    """Testes para upload de logo via UploadService.upload_logo."""

    @patch("apps.tenants.upload_service.cloudinary.uploader.upload")
    @patch("apps.tenants.upload_service.cloudinary.config")
    def test_upload_logo_success(self, mock_config, mock_upload):
        """Upload de logo válida deve retornar URL."""
        mock_upload.return_value = {
            "secure_url": "https://res.cloudinary.com/test/image/upload/logo.png"
        }

        image = create_test_image(format="PNG", size=(200, 100), filename="logo.png")
        success, url, error = UploadService.upload_logo(image, "testcompany")

        assert success is True
        assert url is not None
        assert "cloudinary.com" in url
        assert error is None

    @patch("apps.tenants.upload_service.cloudinary.uploader.upload")
    @patch("apps.tenants.upload_service.cloudinary.config")
    def test_upload_logo_rejects_svg(self, mock_config, mock_upload):
        """Upload de SVG deve ser rejeitado."""
        svg = create_svg_with_script()
        success, url, error = UploadService.upload_logo(svg, "testcompany")

        assert success is False
        assert url is None
        assert error is not None
        mock_upload.assert_not_called()


# ======================
# TESTES DE UPLOAD FAVICON
# ======================


@pytest.mark.django_db
class TestUploadFavicon:
    """Testes para upload de favicon via UploadService.upload_favicon."""

    @patch("apps.tenants.upload_service.cloudinary.uploader.upload")
    @patch("apps.tenants.upload_service.cloudinary.config")
    def test_upload_favicon_success(self, mock_config, mock_upload):
        """Upload de favicon quadrado deve funcionar."""
        mock_upload.return_value = {
            "secure_url": "https://res.cloudinary.com/test/image/upload/favicon.png"
        }

        # Favicon deve ser quadrado
        image = create_test_image(format="PNG", size=(64, 64), filename="favicon.png")
        success, url, error = UploadService.upload_favicon(image, "testcompany")

        assert success is True
        assert url is not None
        assert error is None

    @patch("apps.tenants.upload_service.cloudinary.uploader.upload")
    @patch("apps.tenants.upload_service.cloudinary.config")
    def test_upload_favicon_rejects_non_square(self, mock_config, mock_upload):
        """Favicon não quadrado deve ser rejeitado."""
        # Imagem retangular (não quadrada)
        image = create_test_image(format="PNG", size=(200, 100), filename="favicon.png")
        success, url, error = UploadService.upload_favicon(image, "testcompany")

        assert success is False
        assert url is None
        assert "quadrad" in error.lower()
        mock_upload.assert_not_called()


# ======================
# TESTES DE SEGURANÇA
# ======================


@pytest.mark.django_db
class TestUploadSecurity:
    """Testes de segurança para uploads."""

    def test_reject_double_extension(self):
        """Extensão dupla deve ser rejeitada."""
        # Arquivo com dupla extensão (tentativa de bypass)
        fake = SimpleUploadedFile(
            name="image.php.png",
            content=b'<?php echo "hack"; ?>' + b"\x00" * 100,
            content_type="image/png",
        )

        is_valid, error = UploadService.validate_image(
            fake, max_size_mb=2, is_favicon=False
        )

        # Deve falhar porque não é uma imagem válida
        assert is_valid is False

    def test_reject_php_disguised_as_image(self):
        """Arquivo PHP disfarçado de imagem deve ser rejeitado."""
        php_content = b'<?php system($_GET["cmd"]); ?>'
        fake = SimpleUploadedFile(
            name="shell.png",
            content=php_content + b"\x00" * 100,
            content_type="image/png",
        )

        is_valid, error = UploadService.validate_image(
            fake, max_size_mb=2, is_favicon=False
        )

        # Deve falhar porque não é uma imagem válida (PIL não consegue abrir)
        assert is_valid is False

    def test_allowed_formats_list(self):
        """Verificar lista de formatos permitidos."""
        # SVG não deve estar na lista (risco de XSS)
        assert "svg" not in UploadService.ALLOWED_FORMATS

        # Formatos seguros devem estar
        assert "png" in UploadService.ALLOWED_FORMATS
        assert "jpg" in UploadService.ALLOWED_FORMATS
        assert "jpeg" in UploadService.ALLOWED_FORMATS
        assert "webp" in UploadService.ALLOWED_FORMATS

    def test_mime_types_mapping(self):
        """Verificar mapeamento de MIME types."""
        # MIME types seguros
        assert "image/png" in UploadService.ALLOWED_MIME_TYPES
        assert "image/jpeg" in UploadService.ALLOWED_MIME_TYPES
        assert "image/webp" in UploadService.ALLOWED_MIME_TYPES

        # SVG não deve estar no mapeamento
        assert "image/svg+xml" not in UploadService.ALLOWED_MIME_TYPES


# ======================
# TESTES DE CONFIGURAÇÃO
# ======================


@pytest.mark.django_db
class TestUploadConfiguration:
    """Testes para configuração de upload."""

    def test_max_logo_size(self):
        """Limite de logo deve ser 2MB."""
        assert UploadService.MAX_LOGO_SIZE_MB == 2

    def test_max_favicon_size(self):
        """Limite de favicon deve ser 0.5MB."""
        assert UploadService.MAX_FAVICON_SIZE_MB == 0.5

    def test_logo_dimensions(self):
        """Dimensões máximas de logo."""
        assert UploadService.LOGO_MAX_WIDTH == 1000
        assert UploadService.LOGO_MAX_HEIGHT == 400

    def test_favicon_dimensions(self):
        """Dimensões de favicon."""
        assert UploadService.FAVICON_SIZE == 512
