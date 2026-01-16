"""
Quick local test for anonymous bidirectional chat flow using DRF APIClient.

Run with:
  /Users/jairneto/Desktop/ouvy_saas/ouvy_saas/venv/bin/python scripts/test_chat_flow.py
"""

import os
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # type: ignore

django.setup()

from rest_framework.test import APIClient  # type: ignore
from django.contrib.auth.models import User  # type: ignore
from rest_framework.authtoken.models import Token  # type: ignore
from apps.tenants.models import Client  # type: ignore
from apps.feedbacks.models import Feedback  # type: ignore


def main():
    client_obj = Client.objects.first()
    if not client_obj:
        print("❌ No tenant Client found. Create one first.")
        sys.exit(1)

    user, _ = User.objects.get_or_create(
        username="empresa_teste", defaults={"email": "empresa@test.com"}
    )
    tok, _ = Token.objects.get_or_create(user=user)

    fb = Feedback.objects.create(
        client=client_obj,
        tipo="denuncia",
        titulo="Chat Anon Flow",
        descricao="Teste fluxo bidirecional",
        status="pendente",
        anonimo=True,
    )
    print("feedback_id", fb.id, "protocolo", fb.protocolo, "tenant", fb.client_id)

    api = APIClient()

    # 1) Empresa autenticada faz pergunta
    api.credentials(
        HTTP_AUTHORIZATION=f"Token {tok.key}", HTTP_X_TENANT_ID=str(fb.client_id)
    )
    resp_empresa = api.post(
        f"/api/feedbacks/{fb.id}/adicionar-interacao/",
        {"mensagem": "Pergunta da empresa (RH) ao denunciante"},
        format="json",
    )
    print("empresa_status", resp_empresa.status_code)
    inters = resp_empresa.data.get("interacoes", []) if hasattr(resp_empresa, "data") else []
    print("empresa_first_tipo", inters[0]["tipo"] if inters else None)

    # 2) Denunciante anônimo responde com protocolo
    api.credentials(HTTP_X_TENANT_ID=str(fb.client_id))
    resp_anon = api.post(
        f"/api/feedbacks/{fb.id}/adicionar-interacao/",
        {"protocolo": fb.protocolo, "mensagem": "Resposta anônima do denunciante"},
        format="json",
    )
    print("anon_status", resp_anon.status_code)
    print("anon_tipo", resp_anon.data.get("tipo") if hasattr(resp_anon, "data") else None)

    # 3) Empresa adiciona NOTA_INTERNA (deve ser ocultada na consulta pública)
    api.credentials(
        HTTP_AUTHORIZATION=f"Token {tok.key}", HTTP_X_TENANT_ID=str(fb.client_id)
    )
    resp_nota = api.post(
        f"/api/feedbacks/{fb.id}/adicionar-interacao/",
        {"mensagem": "Nota interna (não deve aparecer ao denunciante)", "tipo": "NOTA_INTERNA"},
        format="json",
    )
    print("nota_status", resp_nota.status_code)

    # 4) Consulta pública por protocolo (deve mostrar apenas interações públicas)
    api.credentials(HTTP_X_TENANT_ID=str(fb.client_id))
    resp_consulta = api.get(
        "/api/feedbacks/consultar-protocolo/", {"codigo": fb.protocolo}
    )
    print("consulta_status", resp_consulta.status_code)
    interacoes_pub = (
        resp_consulta.data.get("interacoes", []) if hasattr(resp_consulta, "data") else []
    )
    print("consulta_tipos", [i["tipo"] for i in interacoes_pub])
    print(
        "tem_nota_interna",
        any(i.get("tipo") == "NOTA_INTERNA" for i in interacoes_pub),
    )


if __name__ == "__main__":
    main()
