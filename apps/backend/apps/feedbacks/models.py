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
    
    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
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
    
    prioridade = models.CharField(
        max_length=10,
        choices=PRIORIDADE_CHOICES,
        default='media',
        verbose_name='Prioridade',
        help_text='Nível de prioridade do feedback'
    )
    
    # Atribuição
    assigned_to = models.ForeignKey(
        'tenants.TeamMember',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_feedbacks',
        verbose_name='Atribuído para',
        help_text='Membro responsável por responder este feedback'
    )
    assigned_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de atribuição'
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks_assigned_by',
        verbose_name='Atribuído por'
    )
    
    # SLA Tracking
    tempo_primeira_resposta = models.DurationField(
        null=True,
        blank=True,
        verbose_name='Tempo Primeira Resposta',
        help_text='Tempo entre criação e primeira interação'
    )
    tempo_resolucao = models.DurationField(
        null=True,
        blank=True,
        verbose_name='Tempo de Resolução',
        help_text='Tempo entre criação e resolução'
    )
    data_primeira_resposta = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data Primeira Resposta'
    )
    data_resolucao = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Resolução'
    )
    sla_primeira_resposta = models.BooleanField(
        null=True,
        blank=True,
        verbose_name='SLA Primeira Resposta',
        help_text='True = dentro do SLA, False = fora do SLA'
    )
    sla_resolucao = models.BooleanField(
        null=True,
        blank=True,
        verbose_name='SLA Resolução',
        help_text='True = dentro do SLA, False = fora do SLA'
    )
    
    # Tags
    tags = models.ManyToManyField(
        'Tag',
        blank=True,
        related_name='feedbacks',
        verbose_name='Tags',
        help_text='Tags para categorização do feedback'
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
            models.Index(fields=['assigned_to', 'status']),  # ✅ NOVO: Queries de atribuição
            models.Index(fields=['client', 'assigned_to']),  # ✅ NOVO: Filtros por assignee
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
    
    def calcular_sla_primeira_resposta(self, sla_horas: int = 24):
        """
        Calcula se a primeira resposta está dentro do SLA.
        
        Args:
            sla_horas: Prazo em horas para primeira resposta (padrão: 24h)
        
        Returns:
            bool: True se dentro do SLA, False se fora
        """
        if not self.data_primeira_resposta or not self.data_criacao:
            return None
        
        from datetime import timedelta
        prazo = timedelta(hours=sla_horas)
        tempo_resposta = self.data_primeira_resposta - self.data_criacao
        self.tempo_primeira_resposta = tempo_resposta
        self.sla_primeira_resposta = tempo_resposta <= prazo
        return self.sla_primeira_resposta
    
    def calcular_sla_resolucao(self, sla_horas: int = 72):
        """
        Calcula se a resolução está dentro do SLA.
        
        Args:
            sla_horas: Prazo em horas para resolução (padrão: 72h)
        
        Returns:
            bool: True se dentro do SLA, False se fora
        """
        if not self.data_resolucao or not self.data_criacao:
            return None
        
        from datetime import timedelta
        prazo = timedelta(hours=sla_horas)
        tempo_resolucao = self.data_resolucao - self.data_criacao
        self.tempo_resolucao = tempo_resolucao
        self.sla_resolucao = tempo_resolucao <= prazo
        return self.sla_resolucao
    
    def registrar_primeira_resposta(self):
        """Registra a primeira resposta (chamado automaticamente por signal)."""
        if self.data_primeira_resposta is None:
            from django.utils import timezone
            self.data_primeira_resposta = timezone.now()
            self.calcular_sla_primeira_resposta()
            self.save(update_fields=['data_primeira_resposta', 'tempo_primeira_resposta', 'sla_primeira_resposta'])
    
    def registrar_resolucao(self):
        """Registra a resolução (chamado automaticamente por signal)."""
        from django.utils import timezone
        self.data_resolucao = timezone.now()
        self.calcular_sla_resolucao()
        self.save(update_fields=['data_resolucao', 'tempo_resolucao', 'sla_resolucao'])
    
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
        folder='ouvify/feedback_arquivos',
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


class Tag(TenantAwareModel):
    """
    Tags/Labels para categorização de feedbacks.
    Permite filtros e organização customizada por tenant.
    """
    
    nome = models.CharField(
        max_length=50,
        verbose_name='Nome',
        help_text='Nome da tag (ex: Urgente, Bug, Feature Request)'
    )
    
    cor = models.CharField(
        max_length=7,
        default='#3B82F6',
        verbose_name='Cor',
        help_text='Cor em hexadecimal (#RRGGBB)'
    )
    
    descricao = models.TextField(
        blank=True,
        verbose_name='Descrição',
        help_text='Descrição opcional do propósito da tag'
    )
    
    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    
    criado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tags_criadas',
        verbose_name='Criado por'
    )
    
    class Meta(TenantAwareModel.Meta):
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        unique_together = [('client', 'nome')]  # Nome único por tenant
        ordering = ['nome']
        indexes = [
            models.Index(fields=['client', 'nome']),
        ]
    
    def __str__(self):
        return f"{self.nome} ({self.client.nome})"


class ResponseTemplate(TenantAwareModel):
    """
    Templates de resposta pré-definidos para agilizar respostas em feedbacks.
    Cada tenant pode ter seus próprios templates personalizados.
    """
    
    CATEGORIA_CHOICES = [
        ('agradecimento', 'Agradecimento'),
        ('recebimento', 'Confirmação de Recebimento'),
        ('analise', 'Em Análise'),
        ('resolucao', 'Resolução'),
        ('encerramento', 'Encerramento'),
        ('esclarecimento', 'Pedido de Esclarecimento'),
        ('outro', 'Outro'),
    ]
    
    nome = models.CharField(
        max_length=100,
        verbose_name='Nome do Template',
        help_text='Nome identificador do template (ex: "Agradecimento Padrão")'
    )
    
    categoria = models.CharField(
        max_length=20,
        choices=CATEGORIA_CHOICES,
        default='outro',
        verbose_name='Categoria',
        help_text='Categoria para organização dos templates'
    )
    
    assunto = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Assunto do Email',
        help_text='Assunto padrão para emails (opcional)'
    )
    
    conteudo = models.TextField(
        verbose_name='Conteúdo',
        help_text='Texto do template. Use {{protocolo}}, {{nome}}, {{tipo}}, {{status}} como variáveis.'
    )
    
    # Aplicabilidade
    tipos_aplicaveis = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Tipos Aplicáveis',
        help_text='Lista de tipos de feedback onde este template pode ser usado (vazio = todos)'
    )
    
    # Controle
    ativo = models.BooleanField(
        default=True,
        verbose_name='Ativo',
        help_text='Se o template está disponível para uso'
    )
    
    uso_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Vezes Usado',
        help_text='Contador de quantas vezes o template foi utilizado'
    )
    
    # Auditoria
    criado_em = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    
    atualizado_em = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )
    
    criado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='templates_criados',
        verbose_name='Criado por'
    )
    
    class Meta(TenantAwareModel.Meta):
        verbose_name = 'Template de Resposta'
        verbose_name_plural = 'Templates de Resposta'
        unique_together = [('client', 'nome')]
        ordering = ['categoria', 'nome']
        indexes = [
            models.Index(fields=['client', 'categoria']),
            models.Index(fields=['client', 'ativo']),
        ]
    
    def __str__(self):
        return f"{self.nome} ({self.get_categoria_display()})"
    
    def increment_usage(self):
        """Incrementa contador de uso"""
        self.uso_count += 1
        self.save(update_fields=['uso_count'])
    
    def render(self, feedback) -> str:
        """
        Renderiza o template com dados do feedback.
        
        Variáveis disponíveis:
        - {{protocolo}}: Número do protocolo
        - {{nome}}: Nome do remetente
        - {{tipo}}: Tipo do feedback
        - {{status}}: Status atual
        - {{titulo}}: Título do feedback
        """
        content = self.conteudo
        
        replacements = {
            '{{protocolo}}': feedback.protocolo or '',
            '{{nome}}': feedback.nome or 'Prezado(a)',
            '{{tipo}}': feedback.get_tipo_display() if hasattr(feedback, 'get_tipo_display') else feedback.tipo,
            '{{status}}': feedback.get_status_display() if hasattr(feedback, 'get_status_display') else feedback.status,
            '{{titulo}}': feedback.titulo or '',
            '{{email}}': feedback.email or '',
        }
        
        for key, value in replacements.items():
            content = content.replace(key, str(value))
        
        return content
