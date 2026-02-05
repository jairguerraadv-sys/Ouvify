"""
Testes para utilitários de anonimização de IP
"""

from django.test import RequestFactory, TestCase

from apps.core.ip_utils import (
    anonymize_ip,
    anonymize_ipv4,
    anonymize_ipv6,
    get_client_ip,
)


class IPAnonymizationTests(TestCase):
    """Testes de anonimização de endereços IP"""

    def test_anonymize_ipv4_standard(self):
        """Testa anonimização de IPv4 padrão"""
        self.assertEqual(anonymize_ipv4("192.168.1.100"), "192.168.1.0")
        self.assertEqual(anonymize_ipv4("10.0.0.255"), "10.0.0.0")
        self.assertEqual(anonymize_ipv4("172.16.254.1"), "172.16.254.0")

    def test_anonymize_ipv4_invalid(self):
        """Testa anonimização de IPv4 inválido"""
        self.assertEqual(anonymize_ipv4("invalid"), "0.0.0.0")
        self.assertEqual(anonymize_ipv4("999.999.999.999"), "0.0.0.0")
        self.assertEqual(anonymize_ipv4(""), "0.0.0.0")

    def test_anonymize_ipv6_standard(self):
        """Testa anonimização de IPv6 padrão"""
        result = anonymize_ipv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
        self.assertTrue(result.startswith("2001:db8:85a3"))

        result = anonymize_ipv6("2001:db8::1")
        self.assertTrue(result.startswith("2001:db8"))

    def test_anonymize_ipv6_invalid(self):
        """Testa anonimização de IPv6 inválido"""
        self.assertEqual(anonymize_ipv6("invalid"), "::")
        self.assertEqual(anonymize_ipv6(""), "::")

    def test_anonymize_ip_auto_detection(self):
        """Testa detecção automática de tipo de IP"""
        # IPv4
        self.assertEqual(anonymize_ip("192.168.1.100"), "192.168.1.0")

        # IPv6
        result = anonymize_ip("2001:db8::1")
        self.assertTrue(result.startswith("2001:db8"))

        # None
        self.assertEqual(anonymize_ip(None), "0.0.0.0")

        # Inválido
        self.assertEqual(anonymize_ip("invalid"), "0.0.0.0")
        self.assertEqual(anonymize_ip(""), "0.0.0.0")

    def test_anonymize_ip_preserves_geography(self):
        """Testa que anonimização preserva informação geográfica geral"""
        # IPs da mesma rede devem ter o mesmo IP anonimizado
        ip1 = "192.168.1.100"
        ip2 = "192.168.1.200"

        self.assertEqual(anonymize_ip(ip1), anonymize_ip(ip2))
        self.assertEqual(anonymize_ip(ip1), "192.168.1.0")


class ClientIPExtractionTests(TestCase):
    """Testes de extração de IP do cliente"""

    def setUp(self):
        self.factory = RequestFactory()

    def test_get_client_ip_direct(self):
        """Testa extração de IP de conexão direta"""
        request = self.factory.get("/", REMOTE_ADDR="192.168.1.100")
        self.assertEqual(get_client_ip(request), "192.168.1.100")

    def test_get_client_ip_x_forwarded_for(self):
        """Testa extração de IP via X-Forwarded-For (proxy)"""
        request = self.factory.get(
            "/", HTTP_X_FORWARDED_FOR="203.0.113.1, 192.168.1.1", REMOTE_ADDR="10.0.0.1"
        )
        # Deve retornar o primeiro IP (cliente original)
        self.assertEqual(get_client_ip(request), "203.0.113.1")

    def test_get_client_ip_x_real_ip(self):
        """Testa extração de IP via X-Real-IP (nginx)"""
        request = self.factory.get(
            "/", HTTP_X_REAL_IP="203.0.113.1", REMOTE_ADDR="10.0.0.1"
        )
        self.assertEqual(get_client_ip(request), "203.0.113.1")

    def test_get_client_ip_priority(self):
        """Testa ordem de precedência dos headers"""
        # X-Forwarded-For tem prioridade
        request = self.factory.get(
            "/",
            HTTP_X_FORWARDED_FOR="203.0.113.1",
            HTTP_X_REAL_IP="203.0.113.2",
            REMOTE_ADDR="10.0.0.1",
        )
        self.assertEqual(get_client_ip(request), "203.0.113.1")

    def test_get_client_ip_fallback(self):
        """Testa fallback quando nenhum IP está disponível"""
        request = self.factory.get("/")
        # RequestFactory usa 127.0.0.1 como padrão
        ip = get_client_ip(request)
        self.assertTrue(ip in ["0.0.0.0", "127.0.0.1"])
