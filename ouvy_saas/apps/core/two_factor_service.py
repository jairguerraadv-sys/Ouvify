"""
Serviço de Autenticação em Dois Fatores (2FA)
Suporta TOTP (Google Authenticator, Authy) e códigos de backup
"""
import pyotp
import qrcode
import io
import base64
import secrets
import hashlib
from typing import Optional, Tuple, List
from dataclasses import dataclass
from django.conf import settings
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@dataclass
class TwoFactorSetupResult:
    """Resultado da configuração de 2FA"""
    secret: str
    qr_code_base64: str
    backup_codes: List[str]
    provisioning_uri: str


@dataclass
class TwoFactorVerifyResult:
    """Resultado da verificação de 2FA"""
    success: bool
    message: str
    remaining_attempts: Optional[int] = None


class TwoFactorAuthService:
    """
    Serviço de autenticação em dois fatores
    
    Features:
    - Geração de secret TOTP
    - QR Code para apps autenticadores
    - Verificação de código TOTP
    - Códigos de backup
    - Rate limiting de tentativas
    """
    
    # Configurações
    ISSUER_NAME = 'Ouvy'
    TOTP_INTERVAL = 30  # segundos
    TOTP_DIGITS = 6
    BACKUP_CODES_COUNT = 10
    BACKUP_CODE_LENGTH = 8
    MAX_VERIFICATION_ATTEMPTS = 5
    ATTEMPT_WINDOW_SECONDS = 300  # 5 minutos
    
    def __init__(self, user):
        """
        Inicializa o serviço para um usuário específico
        
        Args:
            user: Instância do User
        """
        self.user = user
    
    def generate_secret(self) -> str:
        """
        Gera novo secret TOTP
        
        Returns:
            Secret base32 de 32 caracteres
        """
        return pyotp.random_base32()
    
    def generate_backup_codes(self) -> List[str]:
        """
        Gera códigos de backup
        
        Returns:
            Lista de códigos de backup
        """
        codes = []
        for _ in range(self.BACKUP_CODES_COUNT):
            # Gerar código alfanumérico
            code = secrets.token_hex(self.BACKUP_CODE_LENGTH // 2).upper()
            # Formatar como XXXX-XXXX
            formatted = f"{code[:4]}-{code[4:]}"
            codes.append(formatted)
        
        return codes
    
    def setup_2fa(self) -> TwoFactorSetupResult:
        """
        Configura 2FA para o usuário
        
        Returns:
            TwoFactorSetupResult com secret, QR code e backup codes
        """
        # Gerar secret
        secret = self.generate_secret()
        
        # Criar TOTP
        totp = pyotp.TOTP(
            secret,
            interval=self.TOTP_INTERVAL,
            digits=self.TOTP_DIGITS
        )
        
        # Gerar URI para QR code
        provisioning_uri = totp.provisioning_uri(
            name=self.user.email,
            issuer_name=self.ISSUER_NAME
        )
        
        # Gerar QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        # Converter QR code para base64
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')  # type: ignore[call-arg]
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Gerar códigos de backup
        backup_codes = self.generate_backup_codes()
        
        return TwoFactorSetupResult(
            secret=secret,
            qr_code_base64=qr_code_base64,
            backup_codes=backup_codes,
            provisioning_uri=provisioning_uri
        )
    
    def verify_totp(self, code: str, secret: str) -> TwoFactorVerifyResult:
        """
        Verifica código TOTP
        
        Args:
            code: Código de 6 dígitos
            secret: Secret do usuário
            
        Returns:
            TwoFactorVerifyResult
        """
        # Verificar rate limit
        if not self._check_rate_limit():
            return TwoFactorVerifyResult(
                success=False,
                message='Muitas tentativas. Aguarde alguns minutos.',
                remaining_attempts=0
            )
        
        # Validar formato do código
        if not code or len(code) != self.TOTP_DIGITS or not code.isdigit():
            self._record_failed_attempt()
            return TwoFactorVerifyResult(
                success=False,
                message='Código inválido. Digite os 6 dígitos.',
                remaining_attempts=self._get_remaining_attempts()
            )
        
        # Verificar TOTP
        totp = pyotp.TOTP(
            secret,
            interval=self.TOTP_INTERVAL,
            digits=self.TOTP_DIGITS
        )
        
        # Verificar com janela de ±1 intervalo (para tolerância de clock)
        is_valid = totp.verify(code, valid_window=1)
        
        if is_valid:
            self._clear_failed_attempts()
            return TwoFactorVerifyResult(
                success=True,
                message='Código verificado com sucesso.'
            )
        
        self._record_failed_attempt()
        return TwoFactorVerifyResult(
            success=False,
            message='Código incorreto. Tente novamente.',
            remaining_attempts=self._get_remaining_attempts()
        )
    
    def verify_backup_code(
        self,
        code: str,
        stored_codes_hash: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Verifica e consome código de backup
        
        Args:
            code: Código de backup informado
            stored_codes_hash: Hash dos códigos armazenados
            
        Returns:
            Tuple (sucesso, novo_hash_códigos)
        """
        # Normalizar código
        code = code.upper().replace('-', '').replace(' ', '')
        
        # Decodificar códigos armazenados
        try:
            stored_codes = self._decode_backup_codes(stored_codes_hash)
        except Exception:
            return False, None
        
        # Hash do código informado
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        
        # Verificar se código existe
        if code_hash in stored_codes:
            # Remover código usado
            stored_codes.remove(code_hash)
            
            # Gerar novo hash com códigos restantes
            new_hash = self._encode_backup_codes(stored_codes)
            
            return True, new_hash
        
        return False, None
    
    def hash_backup_codes(self, codes: List[str]) -> str:
        """
        Gera hash dos códigos de backup para armazenamento seguro
        
        Args:
            codes: Lista de códigos em texto plano
            
        Returns:
            String codificada com hashes dos códigos
        """
        hashed_codes = []
        for code in codes:
            # Normalizar e hashear
            normalized = code.upper().replace('-', '').replace(' ', '')
            code_hash = hashlib.sha256(normalized.encode()).hexdigest()
            hashed_codes.append(code_hash)
        
        return self._encode_backup_codes(hashed_codes)
    
    def _encode_backup_codes(self, hashed_codes: List[str]) -> str:
        """Codifica lista de hashes para armazenamento"""
        return base64.b64encode('|'.join(hashed_codes).encode()).decode()
    
    def _decode_backup_codes(self, encoded: str) -> List[str]:
        """Decodifica hashes armazenados"""
        decoded = base64.b64decode(encoded.encode()).decode()
        return decoded.split('|') if decoded else []
    
    def _check_rate_limit(self) -> bool:
        """Verifica se ainda pode tentar"""
        from django.core.cache import cache
        
        key = f'2fa_attempts:{self.user.id}'
        attempts = cache.get(key, 0)
        
        return attempts < self.MAX_VERIFICATION_ATTEMPTS
    
    def _record_failed_attempt(self) -> None:
        """Registra tentativa falha"""
        from django.core.cache import cache
        
        key = f'2fa_attempts:{self.user.id}'
        attempts = cache.get(key, 0)
        cache.set(key, attempts + 1, timeout=self.ATTEMPT_WINDOW_SECONDS)
    
    def _clear_failed_attempts(self) -> None:
        """Limpa tentativas falhas após sucesso"""
        from django.core.cache import cache
        
        key = f'2fa_attempts:{self.user.id}'
        cache.delete(key)
    
    def _get_remaining_attempts(self) -> int:
        """Retorna tentativas restantes"""
        from django.core.cache import cache
        
        key = f'2fa_attempts:{self.user.id}'
        attempts = cache.get(key, 0)
        
        return max(0, self.MAX_VERIFICATION_ATTEMPTS - attempts)


# =============================================================================
# Model mixin para 2FA
# =============================================================================

class TwoFactorUserMixin:
    """
    Mixin para adicionar campos de 2FA ao modelo User
    
    Campos necessários no modelo:
    - two_factor_enabled: BooleanField
    - two_factor_secret: CharField (encrypted)
    - two_factor_backup_codes: TextField (hashed)
    - two_factor_confirmed_at: DateTimeField
    """
    
    def enable_2fa(self, secret: str, backup_codes: List[str]) -> bool:
        """
        Habilita 2FA para o usuário
        
        Args:
            secret: Secret TOTP
            backup_codes: Lista de códigos de backup
        """
        from django.utils import timezone
        
        service = TwoFactorAuthService(self)
        
        self.two_factor_secret = secret
        self.two_factor_backup_codes = service.hash_backup_codes(backup_codes)
        self.two_factor_enabled = True
        self.two_factor_confirmed_at = timezone.now()
        self.save(update_fields=[
            'two_factor_secret',
            'two_factor_backup_codes',
            'two_factor_enabled',
            'two_factor_confirmed_at'
        ])
        
        return True
    
    def disable_2fa(self) -> bool:
        """Desabilita 2FA para o usuário"""
        self.two_factor_enabled = False
        self.two_factor_secret = None
        self.two_factor_backup_codes = None
        self.two_factor_confirmed_at = None
        self.save(update_fields=[
            'two_factor_enabled',
            'two_factor_secret',
            'two_factor_backup_codes',
            'two_factor_confirmed_at'
        ])
        
        return True
    
    def verify_2fa_code(self, code: str) -> TwoFactorVerifyResult:
        """
        Verifica código 2FA (TOTP ou backup)
        
        Args:
            code: Código informado
        """
        if not self.two_factor_enabled:
            return TwoFactorVerifyResult(
                success=True,
                message='2FA não está habilitado'
            )
        
        service = TwoFactorAuthService(self)
        
        # Tentar como TOTP primeiro
        if len(code) == 6 and code.isdigit():
            if not self.two_factor_secret:
                return TwoFactorVerifyResult(
                    success=False,
                    message='Configuração 2FA incompleta'
                )
            return service.verify_totp(code, self.two_factor_secret)
        
        # Tentar como código de backup
        if self.two_factor_backup_codes:
            success, new_hash = service.verify_backup_code(
                code,
                self.two_factor_backup_codes
            )
            
            if success:
                # Atualizar códigos restantes
                self.two_factor_backup_codes = new_hash
                self.save(update_fields=['two_factor_backup_codes'])
                
                return TwoFactorVerifyResult(
                    success=True,
                    message='Código de backup verificado. Este código foi consumido.'
                )
        
        return TwoFactorVerifyResult(
            success=False,
            message='Código inválido.'
        )
    
    def get_remaining_backup_codes_count(self) -> int:
        """Retorna quantidade de códigos de backup restantes"""
        if not self.two_factor_backup_codes:
            return 0
        
        service = TwoFactorAuthService(self)
        try:
            codes = service._decode_backup_codes(self.two_factor_backup_codes)
            return len([c for c in codes if c])
        except Exception:
            return 0
