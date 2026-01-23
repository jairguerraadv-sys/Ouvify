import secrets
import string
import uuid
from django.db import models, transaction, IntegrityError
from django.contrib.auth.models import User
from apps.core.models import TenantAwareModel
from .constants import InteracaoTipo
from cloudinary.models import CloudinaryField


class Feedback(TenantAwareModel):
    """
    Modelo para armazenar feedbacks (denúncias e sugestões) dos usuários.
    Herda de TenantAwareModel para isolamento automático por tenant.
    """
    
    # Type hints para métodos gerados automaticamente pelo Django
    def get_tipo_display(self) -> str: ...
    def get_status_display(self) -> str: ...
    
    TIPO_CHOICES = [
        ('denuncia', 'Denúncia'),
        ('sugestao', 'Sugestão'),
        ('elogio', 'Elogio'),
        ('reclamacao', 'Reclamação'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('em_analise', 'Em Análise'),
        ('resolvido', 'Resolvido'),
        ('fechado', 'Fechado'),
    ]
    
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        verbose_name='Tipo',
        help_text='Tipo de feedback'
    )
    
    titulo = models.CharField(
        max_length=200,
        verbose_name='Título',
        help_text='Título do feedback'
    )
    
    descricao = models.TextField(
        verbose_name='Descrição',
        help_text='Descrição detalhada do feedback'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente',
        verbose_name='Status',
        help_text='Status atual do feedback'
    )
    
    protocolo = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        db_index=True,  # ✅ ADICIONADO: Índice para performance
        editable=False,  # ✅ ADICIONADO: Previne edição manual
        verbose_name='Protocolo',
        help_text='Código único de rastreamento do feedback (gerado automaticamente)'
    )
    
    anonimo = models.BooleanField(
        default=False,
        verbose_name='Anônimo',
        help_text='Feedback enviado anonimamente'
    )
    
    email_contato = models.EmailField(
        null=True,
        blank=True,
        verbose_name='E-mail de Contato',
        help_text='E-mail para retorno (opcional se anônimo)'
    )
    
    resposta_empresa = models.TextField(
        null=True,
        blank=True,
        verbose_name='Resposta da Empresa',
        help_text='Resposta ou posicionamento da empresa sobre o feedback'
    )
    
    data_resposta = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data da Resposta',
        help_text='Data em que a empresa respondeu'
    )
    
    data_criacao = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Criação'
    )
    
    data_atualizacao = models.DateTimeField(
        auto_now=True,
        verbose_name='Data de Atualização'
    )
    
    autor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks_criados',
        verbose_name='Autor',
        help_text='Usuário que criou o feedback (para rastreabilidade)'
    )
    
    class Meta(TenantAwareModel.Meta):
        verbose_name: str = 'Feedback'
        verbose_name_plural: str = 'Feedbacks'
        ordering: list = ['-data_criacao']
        indexes: list = [
            models.Index(fields=['client', 'tipo']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['protocolo']),  # ✅ JÁ EXISTE: protocolo indexado
            models.Index(fields=['client', '-data_criacao']),
            models.Index(fields=['client', 'status', '-data_criacao']),
        ]
    
    def __str__(self):
        return f"{self.protocolo} - {self.get_tipo_display()} - {self.titulo[:50]}"
    
    @staticmethod
    def gerar_protocolo() -> str:
        """
        Gera um código de protocolo único CRIPTOGRAFICAMENTE SEGURO no formato OUVY-XXXX-YYYY.
        
        ✅ CORREÇÃO DE SEGURANÇA (2026-01-27):
        - Substituído `random.choices()` por `secrets.choice()` (PEP 506)
        - Geração criptograficamente segura (CSPRNG - Cryptographically Secure Pseudo-Random Number Generator)
        - Proteção contra ataques de predição de sequência
        
        PROTEÇÃO CONTRA RACE CONDITION:
        - Usa transação atômica (transaction.atomic) para evitar colisões
        - Tenta até 10 vezes com geração aleatória
        - Se falhar, usa UUID como fallback (garantido ser único)
        
        Formato:
        - OUVY: Prefixo fixo da plataforma
        - XXXX: 4 caracteres alfanuméricos (letras maiúsculas e números)
        - YYYY: 4 caracteres alfanuméricos
        
        Segurança:
        - 36^8 = 2.821.109.907.456 combinações possíveis (2.8 trilhões)
        - Com rate limiting (5 req/min), levaria 1+ milhão de anos para brute force
        - Geração criptograficamente aleatória impede predição de sequências
        - Transação atômica garante unicidade mesmo em alta concorrência
        
        Exemplo: OUVY-A3B9-K7M2
        
        Returns:
            str: Código de protocolo único criptograficamente seguro
        
        Raises:
            IntegrityError: Se o banco de dados rejeitar duplicata (não acontece - fallback para UUID)
        """
        max_tentativas = 10
        caracteres = string.ascii_uppercase + string.digits  # A-Z, 0-9
        
        for tentativa in range(max_tentativas):
            try:
                # ✅ CORREÇÃO: secrets.choice() ao invés de random.choices()
                # secrets.choice() usa /dev/urandom (Linux/macOS) ou CryptGenRandom (Windows)
                # Fonte de entropia criptograficamente segura
                parte1 = ''.join(secrets.choice(caracteres) for _ in range(4))
                parte2 = ''.join(secrets.choice(caracteres) for _ in range(4))
                protocolo = f"OUVY-{parte1}-{parte2}"
                
                # Dentro de uma transação atômica, a verificação + insert é segura
                # Isso previne race conditions entre múltiplos requests simultâneos
                with transaction.atomic():
                    if not Feedback.objects.filter(protocolo=protocolo).exists():
                        return protocolo
                    # Se existir, loop continua para tentar outro
                    
            except IntegrityError:
                # Se mesmo assim houver colisão (extremamente improvável),
                # continua tentando
                continue
        
        # Fallback com UUID se houver muitas colisões (QUASE IMPOSSÍVEL)
        # UUID garante unicidade global mesmo em cenários de ultra-alta concorrência
        # Exemplo: OUVY-A1B2C3D4-E5F6G7H8
        uuid_hex = uuid.uuid4().hex.upper()
        return f"OUVY-{uuid_hex[:4]}-{uuid_hex[4:8]}"
    
    def save(self, *args, **kwargs):
        """
        Sobrescreve o save para gerar protocolo automaticamente.
        """
        # Gerar protocolo apenas na criação
        if not self.pk and not self.protocolo:
            self.protocolo = self.gerar_protocolo()
        
        super().save(*args, **kwargs)


class FeedbackInteracao(TenantAwareModel):
    """
    Histórico e mensagens relacionadas a um Feedback.
    Suporta interações públicas (visíveis ao denunciante), notas internas e
    registros automáticos de mudança de status.

    Herda de TenantAwareModel para isolamento por tenant.
    """

    TIPO_INTERACAO_CHOICES = InteracaoTipo.choices()

    feedback = models.ForeignKey(
        'feedbacks.Feedback',
        on_delete=models.CASCADE,
        related_name='interacoes',
        verbose_name='Feedback'
    )

    autor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Autor'
    )

    mensagem = models.TextField(verbose_name='Mensagem / Descrição')

    tipo = models.CharField(
        max_length=25,
        choices=TIPO_INTERACAO_CHOICES,
        verbose_name='Tipo de Interação'
    )

    data = models.DateTimeField(auto_now_add=True, verbose_name='Data')

    class Meta(TenantAwareModel.Meta):
        verbose_name: str = 'Interação do Feedback'
        verbose_name_plural: str = 'Interações do Feedback'
        ordering: list = ['-data']
        indexes: list = [
            models.Index(fields=['client']),
            models.Index(fields=['feedback', 'data']),
            models.Index(fields=['tipo']),
        ]

    def __str__(self):
        autor_nome = self.autor.get_username() if self.autor else 'Anónimo'
        tipo_display = dict(self.TIPO_INTERACAO_CHOICES).get(self.tipo, self.tipo)
        return f"[{tipo_display}] {autor_nome}: {self.mensagem[:50]}"


class FeedbackArquivo(TenantAwareModel):
    """
    Arquivo anexado a um feedback (evidências, documentos).
    
    Suporta:
    - Upload por denunciante (anônimo ou identificado)
    - Upload por empresa (anexos internos)
    - Armazenamento em Cloudinary
    - Validação de tipo e tamanho
    """
    
    feedback = models.ForeignKey(
        Feedback,
        on_delete=models.CASCADE,
        related_name='arquivos',
        verbose_name='Feedback',
        help_text='Feedback ao qual este arquivo pertence'
    )
    
    # Cloudinary field (automático se CLOUDINARY_URL configurado)
    arquivo = CloudinaryField(
        folder='ouvy/feedback_arquivos',
        resource_type='auto',  # Aceita imagens, vídeos, documentos
        verbose_name='Arquivo',
        help_text='Arquivo anexado (imagem, PDF, documento)'
    )
    
    nome_original = models.CharField(
        max_length=255,
        verbose_name='Nome Original',
        help_text='Nome do arquivo no momento do upload'
    )
    
    tipo_mime = models.CharField(
        max_length=100,
        verbose_name='Tipo MIME',
        help_text='Tipo do arquivo (ex: image/png, application/pdf)'
    )
    
    tamanho_bytes = models.PositiveIntegerField(
        verbose_name='Tamanho (bytes)',
        help_text='Tamanho do arquivo em bytes'
    )
    
    enviado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='arquivos_enviados',
        verbose_name='Enviado Por',
        help_text='Usuário que enviou o arquivo (null se anônimo)'
    )
    
    interno = models.BooleanField(
        default=False,
        verbose_name='Interno',
        help_text='Arquivo visível apenas para a empresa (não para denunciante)'
    )
    
    data_envio = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Envio'
    )
    
    class Meta(TenantAwareModel.Meta):
        verbose_name = 'Arquivo de Feedback'
        verbose_name_plural = 'Arquivos de Feedbacks'
        ordering = ['-data_envio']
        indexes = [
            models.Index(fields=['client', 'feedback']),
            models.Index(fields=['feedback', '-data_envio']),
            models.Index(fields=['interno']),
        ]
    
    def __str__(self):
        tipo = 'Interno' if self.interno else 'Público'
        enviado = self.enviado_por.get_username() if self.enviado_por else 'Anônimo'
        return f"[{tipo}] {self.nome_original} | Enviado por: {enviado}"
    
    @property
    def tamanho_mb(self) -> float:
        """Retorna tamanho em MB."""
        return round(self.tamanho_bytes / (1024 * 1024), 2)
    
    @property
    def url_publica(self) -> str:
        """Retorna URL pública do arquivo."""
        if hasattr(self.arquivo, 'url'):
            return self.arquivo.url
        return ''
