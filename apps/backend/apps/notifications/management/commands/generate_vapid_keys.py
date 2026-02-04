"""
Management command para gerar VAPID keys para Web Push
"""

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Gerar VAPID keys para Web Push notifications"

    def add_arguments(self, parser):
        parser.add_argument(
            "--format",
            type=str,
            default="env",
            choices=["env", "json"],
            help="Formato de saída (env ou json)",
        )

    def handle(self, *args, **options):
        try:
            from py_vapid import Vapid
        except ImportError:
            self._generate_simple_keys(options["format"])
            return

        # Gerar par de chaves
        vapid = Vapid()
        vapid.generate_keys()

        # Obter chaves em formatos necessários
        private_key = vapid.private_key.private_bytes(
            encoding=__import__(
                "cryptography.hazmat.primitives.serialization", fromlist=["Encoding"]
            ).Encoding.PEM,
            format=__import__(
                "cryptography.hazmat.primitives.serialization",
                fromlist=["PrivateFormat"],
            ).PrivateFormat.PKCS8,
            encryption_algorithm=__import__(
                "cryptography.hazmat.primitives.serialization",
                fromlist=["NoEncryption"],
            ).NoEncryption(),
        ).decode("utf-8")

        # Para Web Push, precisamos da chave pública em formato URL-safe base64
        import base64

        from cryptography.hazmat.primitives.serialization import (Encoding,
                                                                  PublicFormat)

        public_key_bytes = vapid.public_key.public_bytes(
            encoding=Encoding.X962, format=PublicFormat.UncompressedPoint
        )
        public_key = (
            base64.urlsafe_b64encode(public_key_bytes).rstrip(b"=").decode("utf-8")
        )

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS(" VAPID Keys Geradas com Sucesso!"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write("")

        output_format = options["format"]
        if output_format == "env":
            self.stdout.write(self.style.WARNING("Adicione ao seu arquivo .env:"))
            self.stdout.write("")
            self.stdout.write(f"VAPID_PUBLIC_KEY={public_key}")
            self.stdout.write("")
            self.stdout.write("# Chave privada (multi-linha - use aspas)")
            private_one_line = private_key.strip().replace("\n", "\\n")
            self.stdout.write(f'VAPID_PRIVATE_KEY="{private_one_line}"')
            self.stdout.write("")
            self.stdout.write("VAPID_ADMIN_EMAIL=admin@ouvify.app")
        else:
            import json

            output = {
                "public_key": public_key,
                "private_key": private_key.strip(),
                "admin_email": "admin@ouvify.app",
            }
            self.stdout.write(json.dumps(output, indent=2))

        self.stdout.write("")
        self.stdout.write(self.style.WARNING("⚠️  IMPORTANTE:"))
        self.stdout.write("1. Nunca compartilhe a chave privada")
        self.stdout.write("2. Adicione VAPID_PUBLIC_KEY ao frontend (.env.local)")
        self.stdout.write("3. Configure no Railway/Vercel também")

    def _generate_simple_keys(self, output_format):
        """Gera keys usando cryptography diretamente"""
        try:
            import base64

            from cryptography.hazmat.backends import default_backend
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import ec
        except ImportError:
            self.stdout.write(
                self.style.ERROR(
                    "cryptography não está instalado. Execute: pip install cryptography"
                )
            )
            return

        # Gerar chave privada EC P-256
        private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())

        # Obter chave pública
        public_key = private_key.public_key()

        # Serializar chave privada (PEM)
        private_pem = (
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            )
            .decode("utf-8")
            .strip()
        )

        # Serializar chave pública para formato URL-safe base64 (Web Push)
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.X962,
            format=serialization.PublicFormat.UncompressedPoint,
        )
        public_base64 = (
            base64.urlsafe_b64encode(public_bytes).rstrip(b"=").decode("utf-8")
        )

        # Output
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS(" VAPID Keys Geradas com Sucesso!"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write("")

        if output_format == "env":
            self.stdout.write(self.style.WARNING("Adicione ao seu arquivo .env:"))
            self.stdout.write("")
            self.stdout.write(f"VAPID_PUBLIC_KEY={public_base64}")
            self.stdout.write("")
            self.stdout.write("# Chave privada (multi-linha - use aspas)")
            # Formatar para uma linha
            private_one_line = private_pem.replace("\n", "\\n")
            self.stdout.write(f'VAPID_PRIVATE_KEY="{private_one_line}"')
            self.stdout.write("")
            self.stdout.write(f"VAPID_ADMIN_EMAIL=admin@ouvify.app")
        else:
            import json

            output = {
                "public_key": public_base64,
                "private_key": private_pem,
                "admin_email": "admin@ouvify.app",
            }
            self.stdout.write(json.dumps(output, indent=2))

        self.stdout.write("")
        self.stdout.write(self.style.WARNING("⚠️  IMPORTANTE:"))
        self.stdout.write("1. Nunca compartilhe a chave privada")
        self.stdout.write("2. Adicione VAPID_PUBLIC_KEY ao frontend (.env.local)")
        self.stdout.write("3. Configure no Railway/Vercel também")
        self.stdout.write("")
