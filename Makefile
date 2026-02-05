.PHONY: help build up down restart logs shell-backend shell-frontend migrate test-backend test-frontend
.PHONY: repo-audit repo-audit-cover

# Cores para output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

help: ## Mostrar ajuda
	@echo "${GREEN}Comandos disponíveis:${RESET}"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${YELLOW}%-20s${RESET} %s\n", $$1, $$2}'

build: ## Build de todas as imagens Docker
	docker-compose build

up: ## Subir stack completo em background
	docker-compose up -d
	@echo "${GREEN}✓ Stack iniciado! Acesse:${RESET}"
	@echo "  Frontend:      http://localhost:3000"
	@echo "  Backend API:   http://localhost:8000"
	@echo "  Mailhog:       http://localhost:8025"
	@echo "  ElasticSearch: http://localhost:9200"

down: ## Parar todos os serviços
	docker-compose down

restart: down up ## Reiniciar stack

logs: ## Ver logs em tempo real
	docker-compose logs -f

logs-backend: ## Ver logs do backend
	docker-compose logs -f backend

logs-frontend: ## Ver logs do frontend
	docker-compose logs -f frontend

shell-backend: ## Abrir Django shell
	docker-compose exec backend python manage.py shell

shell-db: ## Abrir psql shell
	docker-compose exec postgres psql -U ouvify -d ouvify_dev

shell-frontend: ## Abrir shell no container frontend
	docker-compose exec frontend sh

migrate: ## Rodar migrations
	docker-compose exec backend python manage.py migrate

makemigrations: ## Criar novas migrations
	docker-compose exec backend python manage.py makemigrations

createsuperuser: ## Criar superusuário Django
	docker-compose exec backend python manage.py createsuperuser

test-backend: ## Rodar testes backend com coverage
	docker-compose exec backend pytest --cov=apps --cov-report=html --cov-report=term

test-frontend: ## Rodar testes frontend
	docker-compose exec frontend npm test

lint-backend: ## Lint backend (black + isort + flake8)
	docker-compose exec backend black .
	docker-compose exec backend isort .
	docker-compose exec backend flake8

lint-frontend: ## Lint frontend (eslint + prettier)
	docker-compose exec frontend npm run lint

clean: ## Limpar volumes e containers
	docker-compose down -v
	docker system prune -f

rebuild: clean build up ## Rebuild completo

ps: ## Ver status dos containers
	docker-compose ps

collectstatic: ## Coletar arquivos estáticos
	docker-compose exec backend python manage.py collectstatic --noinput

rebuild-index: ## Rebuild ElasticSearch index
	docker-compose exec backend python manage.py search_index --rebuild

backup-db: ## Backup do banco de dados
	docker-compose exec postgres pg_dump -U ouvify ouvify_dev > backup_$$(date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore backup (make restore-db FILE=backup.sql)
	cat $(FILE) | docker-compose exec -T postgres psql -U ouvify ouvify_dev

repo-audit: ## Rodar audit determinístico FE↔BE (gera tmp/repo_audit)
	python scripts/repo_audit/run_api_audit.py

repo-audit-cover: ## Rodar audit e gerar coverage TS a partir de orphans_backend
	python scripts/repo_audit/run_api_audit.py --write-fe-coverage

audit-backend: ## Auditoria determinística do backend (venv + deps + checks)
	bash scripts/audit_backend.sh
