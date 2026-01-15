"""
Constantes do módulo de Feedbacks.
Centraliza strings mágicas para facilitar manutenção e evitar erros de digitação.
"""


class FeedbackStatus:
    """Status possíveis para um feedback."""
    PENDENTE = 'pendente'
    EM_ANALISE = 'em_analise'
    RESOLVIDO = 'resolvido'
    FECHADO = 'fechado'
    
    @classmethod
    def choices(cls):
        """Retorna lista de tuplas para uso em models.CharField(choices=...)"""
        return [
            (cls.PENDENTE, 'Pendente'),
            (cls.EM_ANALISE, 'Em Análise'),
            (cls.RESOLVIDO, 'Resolvido'),
            (cls.FECHADO, 'Fechado'),
        ]
    
    @classmethod
    def values(cls):
        """Retorna lista de valores válidos."""
        return [cls.PENDENTE, cls.EM_ANALISE, cls.RESOLVIDO, cls.FECHADO]


class FeedbackTipo:
    """Tipos de feedback suportados."""
    SUGESTAO = 'sugestao'
    BUG = 'bug'
    ELOGIO = 'elogio'
    RECLAMACAO = 'reclamacao'
    DUVIDA = 'duvida'
    
    @classmethod
    def choices(cls):
        """Retorna lista de tuplas para uso em models.CharField(choices=...)"""
        return [
            (cls.SUGESTAO, 'Sugestão'),
            (cls.BUG, 'Bug/Erro'),
            (cls.ELOGIO, 'Elogio'),
            (cls.RECLAMACAO, 'Reclamação'),
            (cls.DUVIDA, 'Dúvida'),
        ]
    
    @classmethod
    def values(cls):
        """Retorna lista de valores válidos."""
        return [cls.SUGESTAO, cls.BUG, cls.ELOGIO, cls.RECLAMACAO, cls.DUVIDA]


class InteracaoTipo:
    """Tipos de interação em um feedback."""
    MENSAGEM_PUBLICA = 'MENSAGEM_PUBLICA'
    NOTA_INTERNA = 'NOTA_INTERNA'
    MUDANCA_STATUS = 'MUDANCA_STATUS'
    PERGUNTA_EMPRESA = 'PERGUNTA_EMPRESA'
    RESPOSTA_USUARIO = 'RESPOSTA_USUARIO'
    MENSAGEM_AUTOMATICA = 'MENSAGEM_AUTOMATICA'
    
    @classmethod
    def choices(cls):
        """Retorna lista de tuplas para uso em models.CharField(choices=...)"""
        return [
            (cls.MENSAGEM_PUBLICA, 'Mensagem Pública'),
            (cls.NOTA_INTERNA, 'Nota Interna'),
            (cls.MUDANCA_STATUS, 'Mudança de Status'),
            (cls.PERGUNTA_EMPRESA, 'Pergunta da Empresa'),
            (cls.RESPOSTA_USUARIO, 'Resposta do Usuário'),
            (cls.MENSAGEM_AUTOMATICA, 'Mensagem Automática'),
        ]
    
    @classmethod
    def values(cls):
        """Retorna lista de valores válidos."""
        return [
            cls.MENSAGEM_PUBLICA,
            cls.NOTA_INTERNA,
            cls.MUDANCA_STATUS,
            cls.PERGUNTA_EMPRESA,
            cls.RESPOSTA_USUARIO,
            cls.MENSAGEM_AUTOMATICA,
        ]

    @classmethod
    def public_values(cls):
        """Tipos exibidos para o denunciante na tela pública."""
        return [
            cls.PERGUNTA_EMPRESA,
            cls.RESPOSTA_USUARIO,
            cls.MENSAGEM_AUTOMATICA,
            cls.MUDANCA_STATUS,
            cls.MENSAGEM_PUBLICA,
        ]


# Protocolo
PROTOCOLO_PREFIX = 'OUVY'
PROTOCOLO_LENGTH = 8  # Formato: OUVY-XXXX-YYYY


# Limites
MAX_FEEDBACK_TITULO_LENGTH = 200
MAX_FEEDBACK_DESCRICAO_LENGTH = 2000
MAX_INTERACAO_MENSAGEM_LENGTH = 1000
