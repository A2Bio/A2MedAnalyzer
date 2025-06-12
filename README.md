# Документация A2MedAnalyzer

Добро пожаловать в **A2MedAnalyzer** — мощный API, разработанный для анализа геномных и метаболических данных. Этот инструмент использует передовые биоинформатические методы для обработки данных, связанных с генами, выполнения анализа обогащения и визуализации метаболических сетей. Ниже приведена подробная информация о доступных эндпоинтах, их использовании и примерах.

## Обзор

A2MedAnalyzer построен на базе Django и интегрируется с внешними API (например, NCBI E-utils) и библиотеками, такими как `pandas`, `gseapy`, `networkx` и `plotly`. Он предоставляет RESTful эндпоинты для обработки загружаемых файлов, аннотаций генов и визуализации сетей. Все эндпоинты доступны через POST-запросы, если не указано иное.

## Требования

- **Python 3.8+**
- **Django** (с соответствующей настройкой хранения медиафайлов)
- Необходимые библиотеки: `pandas`, `gseapy`, `networkx`, `plotly`, `requests`
- Доступ к настроенной системе хранения медиафайлов (например, локальная файловая система или облачное хранилище)

## Эндпоинты

### 1. `traits`
- **Описание**: Получает исследования, связанные с определенным признаком заболевания, из GWAS API.
- **Метод**: GET
- **URL**: `/studies_by_disease_trait/<trait>`
- **Параметры**:
  - `trait` (параметр пути, строка): Признак заболевания для поиска (минимум 2 символа).
- **Ответ**:
  - `200`: JSON с данными исследований.
  - `400`: JSON с ошибкой, если `trait` недействителен.
  - `502/504`: JSON с ошибкой при сбое связи с API.
- **Пример запроса**:
  ```bash
  curl -X GET "http://localhost:8000/studies_by_disease_trait/диабет"
  ```
- **Пример ответа**:
  ```json
  {
    "page": {
      "size": 20,
      "totalElements": 50,
      "totalPages": 3,
      "number": 0
    },
    "_embedded": {
      "studies": [
        {
          "id": "GCST000001",
          "diseaseTrait": "Сахарный диабет 2 типа",
          "pubmedId": "12345678",
          "initialSampleSize": 10000
        }
      ]
    }
  }
  ```
- **Пример ошибки**:
  ```json
  {
    "error": "Параметр 'trait' обязателен и должен содержать минимум 2 символа."
  }
  ```

### 2. `filtrate`
- **Описание**: Фильтрует и обрабатывает TSV-файл с данными генов, генерируя таблицу и CSV-файл с подсчетами генов и частотами аллелей.
- **Метод**: POST
- **URL**: `/filtrate`
- **Тело запроса**:
  - `file` (multipart/form-data): TSV-файл с колонками `mappedGenes`, `pValue`, `riskAllele`, `riskFrequency`.
- **Ответ**:
  - `200`: JSON с данными таблицы и URL CSV.
  - `400`: JSON с ошибкой, если файл недействителен или отсутствует.
- **Пример запроса**:
  ```bash
  curl -X POST -F "file=@genes.tsv" http://localhost:8000/filtrate
  ```
- **Пример ответа**:
  ```json
  {
    "status": "success",
    "table_data": [
      {
        "mappedGenes": "GENE1",
        "riskAllele": "A",
        "riskFrequency": 0.25,
        "Count_Genes": 3,
        "Count_Alleles": 2
      }
    ],
    "csv_url": "http://localhost:8000/media/extracted_genes.csv"
  }
  ```
- **Пример ошибки**:
  ```json
  {
    "status": "error",
    "message": "TSV-файл должен содержать следующие колонки: mappedGenes, pValue, riskAllele, riskFrequency"
  }
  ```

### 3. `annotation`
- **Описание**: Выполняет анализ обогащения GO и KEGG для CSV-файла и генерирует графики в виде изображений.
- **Метод**: POST
- **URL**: `/annotate`
- **Тело запроса**:
  - `file` (multipart/form-data): CSV-файл с колонкой `mappedGenes` (максимум 10 МБ).
- **Ответ**:
  - `200`: JSON с URL изображений.
  - `400`: JSON с ошибкой, если файл недействителен или отсутствует.
- **Пример запроса**:
  ```bash
  curl -X POST -F "file=@genes.csv" http://localhost:8000/annotate
  ```
- **Пример ответа**:
  ```json
  {
    "status": "success",
    "message": "Анализ и генерация изображений завершены",
    "image_urls": [
      {"name": "go_enrichment_bubble.png", "url": "http://localhost:8000/media/annotation_go_enrichment_bubble.png"},
      {"name": "kegg_enrichment_bubble.png", "url": "http://localhost:8000/media/annotation_kegg_enrichment_bubble.png"}
    ]
  }
  ```
- **Пример ошибки**:
  ```json
  {
    "status": "error",
    "message": "Файл слишком большой. Максимум 10 МБ."
  }
  ```

### 4. `ncbi`
- **Описание**: Получает информацию о генах из NCBI по списку символов генов.
- **Метод**: POST
- **URL**: `/ncbi_gene_info`
- **Тело запроса** (JSON):
  - `genes` (массив): Список символов генов (например, `["MC4R", "BRCA1"]`).
- **Ответ**:
  - `200`: JSON с данными генов или ошибками.
  - `400`: JSON с ошибкой, если гены не предоставлены.
  - `500`: JSON с ошибкой при сбое обработки.
- **Пример запроса**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"genes": ["MC4R", "BRCA1"]}' http://localhost:8000/ncbi_gene_info
  ```
- **Пример ответа**:
  ```json
  {
    "results": [
      {
        "name": "мелано кортин 4 рецептор",
        "description": "...",
        "location": "18q21.32"
      },
      {
        "symbol": "BRCA1",
        "error": "Ген не найден"
      }
    ]
  }
  ```
- **Пример ошибки**:
  ```json
  {
    "error": "Нет переданных генов"
  }
  ```

### 5. `metabolic_network`
- **Описание**: Строит и визуализирует метаболическую сеть на основе обогащения KEGG из CSV-файла, сохраняя результат как HTML и данные рёбер как CSV.
- **Метод**: POST
- **URL**: `/metabolic_network`
- **Тело запроса**:
  - `file` (multipart/form-data): CSV-файл с колонкой `mappedGenes` (максимум 10 МБ).
- **Ответ**:
  - `200`: JSON с URL графика и CSV.
  - `400`: JSON с ошибкой, если файл недействителен или отсутствует.
- **Пример запроса**:
  ```bash
  curl -X POST -F "file=@genes.csv" http://localhost:8000/metabolic_network
  ```
- **Пример ответа**:
  ```json
  {
    "status": "success",
    "message": "Метаболическая сеть создана с foldChange из KEGG",
    "plot_url": "http://localhost:8000/media/metabolic_network_abcdef123456.html",
    "csv_url": "http://localhost:8000/media/metabolic_network_edges_abcdef123456.csv"
  }
  ```
- **Пример ошибки**:
  ```json
  {
    "status": "error",
    "message": "Нет значимых результатов обогащения KEGG"
  }
  ```

## Установка

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/yourusername/A2MedAnalyzer.git
   cd A2MedAnalyzer
   ```

2. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```

3. Настройте настройки Django (например, `MEDIA_ROOT` и `MEDIA_URL` в `settings.py`).

4. Запустите сервер:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

## Настройка

- Убедитесь, что `MEDIA_ROOT` и `MEDIA_URL` настроены в вашем файле `settings.py` для хранения файлов.
- Настройте логирование в `settings.py`, если требуется детальная отладка ошибок.

## Внесение вклада

Приветствуются сообщения об ошибках или pull-запросы в репозитории GitHub. Вклад в улучшение эндпоинтов или добавление новых функций приветствуется
