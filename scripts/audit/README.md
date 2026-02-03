# Scripts de auditoria

## find_duplicates.py
Detector simples de blocos duplicados (por padrão, procura blocos idênticos de 20 linhas).

Exemplos:
- `python scripts/audit/find_duplicates.py --min-lines 20 --ext py ts tsx js jsx`
- `python scripts/audit/find_duplicates.py --min-lines 30 --ext py`

Observações:
- Heurístico (pode ter falsos positivos/negativos).
- Serve como apoio rápido quando não se quer instalar ferramentas externas.

## find_unreferenced.py
Heurística para listar arquivos potencialmente não referenciados (frontend e backend).

Exemplos:
- `python scripts/audit/find_unreferenced.py frontend`
- `python scripts/audit/find_unreferenced.py backend`

Observações:
- Heurístico e conservador: muitos arquivos são referenciados por convenção/config (Next/Django/toolchain).
- Use como lista de revisão manual.

## run_part1_continuation.py
Runner que gera um artefato único com a varredura da Parte 1 (continuação).

Exemplo:
- `python scripts/audit/run_part1_continuation.py`

Saída:
- `scripts/audit/PART1_CONTINUATION_RESULTS.md`
