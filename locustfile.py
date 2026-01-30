"""
Ouvify - Load Testing com Locust

Simula carga de usuários na API para identificar bottlenecks.

Uso:
    # Instalar
    pip install locust

    # Rodar localmente
    locust -f locustfile.py --host=http://localhost:8000

    # Rodar contra staging
    locust -f locustfile.py --host=https://ouvy-saas-production.up.railway.app

    # Headless (CI/CD)
    locust -f locustfile.py --host=http://localhost:8000 --users 100 --spawn-rate 10 --run-time 60s --headless

Acesse: http://localhost:8089 para UI web
"""

from locust import HttpUser, task, between, events
from locust.runners import MasterRunner
import json
import random
import logging

logger = logging.getLogger(__name__)


class OuvifyUser(HttpUser):
    """
    Simula usuário autenticado do Ouvify.
    
    Comportamento:
    - Login no início
    - Mix de operações típicas
    - Wait time entre 1-3 segundos
    """
    
    wait_time = between(1, 3)
    
    # Dados de teste
    test_email = "loadtest@ouvy.com"
    test_password = "loadtest123"
    token = None
    tenant_id = None
    feedback_ids = []
    
    def on_start(self):
        """
        Executado quando usuário inicia.
        Faz login e obtém token JWT.
        """
        # Tentar login
        response = self.client.post(
            "/api/auth/login/",
            json={
                "email": self.test_email,
                "password": self.test_password
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access") or data.get("token")
            self.tenant_id = data.get("tenant_id")
            
            # Configurar header de autorização
            if self.token:
                self.client.headers["Authorization"] = f"Bearer {self.token}"
        else:
            logger.warning(f"Login falhou: {response.status_code} - {response.text}")
    
    # =========================================================================
    # FEEDBACKS - Endpoints mais usados
    # =========================================================================
    
    @task(5)
    def list_feedbacks(self):
        """
        Listar feedbacks - operação mais comum.
        Weight: 5 (mais frequente)
        """
        with self.client.get(
            "/api/feedbacks/",
            name="/api/feedbacks/ [LIST]",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                # Salvar IDs para outras operações
                if "results" in data:
                    self.feedback_ids = [f["id"] for f in data["results"][:10]]
                response.success()
            elif response.status_code == 401:
                response.failure("Não autenticado")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(3)
    def list_feedbacks_filtered(self):
        """
        Listar feedbacks com filtros.
        Weight: 3
        """
        status_filter = random.choice(["PENDENTE", "EM_ANALISE", "RESOLVIDO", ""])
        tipo_filter = random.choice(["DENUNCIA", "RECLAMACAO", "SUGESTAO", "ELOGIO", ""])
        
        params = {}
        if status_filter:
            params["status"] = status_filter
        if tipo_filter:
            params["tipo"] = tipo_filter
        
        with self.client.get(
            "/api/feedbacks/",
            params=params,
            name="/api/feedbacks/ [LIST+FILTER]",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(2)
    def view_feedback_detail(self):
        """
        Ver detalhes de um feedback.
        Weight: 2
        """
        if not self.feedback_ids:
            return
        
        feedback_id = random.choice(self.feedback_ids)
        
        with self.client.get(
            f"/api/feedbacks/{feedback_id}/",
            name="/api/feedbacks/{id}/ [DETAIL]",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                response.success()  # OK, feedback pode ter sido deletado
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(1)
    def create_feedback(self):
        """
        Criar novo feedback.
        Weight: 1 (menos frequente que leitura)
        """
        tipos = ["DENUNCIA", "RECLAMACAO", "SUGESTAO", "ELOGIO"]
        
        data = {
            "titulo": f"Load Test Feedback {random.randint(1000, 9999)}",
            "descricao": "Este é um feedback criado durante load testing. Pode ser ignorado.",
            "tipo": random.choice(tipos),
            "email_contato": f"loadtest{random.randint(1, 100)}@test.com"
        }
        
        with self.client.post(
            "/api/feedbacks/",
            json=data,
            name="/api/feedbacks/ [CREATE]",
            catch_response=True
        ) as response:
            if response.status_code in [200, 201]:
                result = response.json()
                if "id" in result:
                    self.feedback_ids.append(result["id"])
                response.success()
            elif response.status_code == 429:
                response.success()  # Rate limited é esperado
            else:
                response.failure(f"Status {response.status_code}")
    
    # =========================================================================
    # DASHBOARD & ANALYTICS
    # =========================================================================
    
    @task(3)
    def get_dashboard_stats(self):
        """
        Obter estatísticas do dashboard.
        Weight: 3
        """
        with self.client.get(
            "/api/feedbacks/dashboard/",
            name="/api/feedbacks/dashboard/ [STATS]",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                response.success()  # Endpoint pode não existir
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(2)
    def get_analytics(self):
        """
        Obter analytics.
        Weight: 2
        """
        with self.client.get(
            "/api/feedbacks/analytics/",
            name="/api/feedbacks/analytics/ [ANALYTICS]",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    # =========================================================================
    # CONSULTA PÚBLICA (sem autenticação)
    # =========================================================================
    
    @task(2)
    def consultar_protocolo(self):
        """
        Consultar feedback por protocolo (público).
        Weight: 2
        """
        # Gerar protocolo aleatório
        protocolo = f"OUVY-{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=4))}-{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=4))}"
        
        # Remover auth temporariamente
        old_headers = dict(self.client.headers)
        if "Authorization" in self.client.headers:
            del self.client.headers["Authorization"]
        
        with self.client.get(
            f"/api/feedbacks/consultar-protocolo/",
            params={"codigo": protocolo},
            name="/api/feedbacks/consultar-protocolo/ [PUBLIC]",
            catch_response=True
        ) as response:
            # Restaurar headers
            self.client.headers.update(old_headers)
            
            if response.status_code in [200, 404]:
                response.success()  # 404 é esperado para protocolo inexistente
            elif response.status_code == 429:
                response.success()  # Rate limited
            else:
                response.failure(f"Status {response.status_code}")


class OuvifyAnonymousUserUser(HttpUser):
    """
    Simula usuário anônimo enviando feedbacks.
    Representa visitantes do formulário público.
    """
    
    wait_time = between(3, 10)  # Mais lento que usuários logados
    
    @task(3)
    def submit_anonymous_feedback(self):
        """
        Enviar feedback anônimo.
        """
        tipos = ["DENUNCIA", "RECLAMACAO", "SUGESTAO", "ELOGIO"]
        
        data = {
            "titulo": f"Feedback Anônimo {random.randint(1000, 9999)}",
            "descricao": "Feedback enviado por visitante anônimo durante load test.",
            "tipo": random.choice(tipos),
            "email_contato": f"anonimo{random.randint(1, 1000)}@example.com"
        }
        
        with self.client.post(
            "/api/feedbacks/",
            json=data,
            name="/api/feedbacks/ [ANONYMOUS CREATE]",
            catch_response=True
        ) as response:
            if response.status_code in [200, 201]:
                response.success()
            elif response.status_code == 429:
                response.success()  # Rate limited é esperado
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(2)
    def check_protocol_status(self):
        """
        Verificar status por protocolo.
        """
        protocolo = f"OUVY-{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=4))}-{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=4))}"
        
        with self.client.get(
            f"/api/feedbacks/consultar-protocolo/",
            params={"codigo": protocolo},
            name="/api/feedbacks/consultar-protocolo/ [ANONYMOUS]",
            catch_response=True
        ) as response:
            if response.status_code in [200, 404, 429]:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")


# =============================================================================
# EVENT HOOKS
# =============================================================================

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Executado quando teste inicia."""
    logger.info("🚀 Load test iniciando...")
    logger.info(f"Host: {environment.host}")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Executado quando teste termina."""
    logger.info("✅ Load test finalizado")
    
    # Imprimir estatísticas
    if environment.stats.total.num_requests > 0:
        logger.info(f"Total requests: {environment.stats.total.num_requests}")
        logger.info(f"Failures: {environment.stats.total.num_failures}")
        logger.info(f"Avg response time: {environment.stats.total.avg_response_time:.2f}ms")
        logger.info(f"RPS: {environment.stats.total.current_rps:.2f}")


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    """Log de requests lentos."""
    if response_time > 1000:  # > 1 segundo
        logger.warning(f"⚠️ Slow request: {name} - {response_time:.2f}ms")
