# Документация A2MedAnalyzer

**A2MedAnalyzer** — это комплексный инструмент для анализа геномных и метаболических данных. Он состоит из backend API, построенного на Django, и frontend веб-сайта, размещенного на GitHub Pages. API предоставляет эндпоинты для различных биоинформатических задач, таких как получение исследований, фильтрация данных генов, выполнение анализа обогащения и визуализация метаболических сетей. Frontend предлагает удобный интерфейс для взаимодействия с этими эндпоинтами API, делая его доступным для пользователей без знаний программирования. Веб-сайт доступен по адресу [https://a2bio.github.io/A2MedAnalyzer](https://a2bio.github.io/A2MedAnalyzer). Пользователи могут выбрать использовать веб-сайт или взаимодействовать с API напрямую.

## Документация по frontend

Frontend A2MedAnalyzer представляет собой статический веб-сайт, который предоставляет пользовательский интерфейс для взаимодействия с API. Он включает следующие разделы:

- **Traits**: Позволяет пользователям искать GWAS-исследования, связанные с определенным признаком заболевания.
- **Filtrate**: Позволяет пользователям загружать TSV-файл для фильтрации и анализа данных генов.
- **Annotation**: Позволяет пользователям загружать CSV-файл для выполнения анализа обогащения GO и KEGG.
- **NCBI**: Позволяет пользователям получать информацию о генах из NCBI.
- **Metabolic Network**: Позволяет пользователям загружать CSV-файл для построения и визуализации метаболической сети.

Каждый раздел содержит формы для ввода данных, кнопки для отправки запросов и области для отображения результатов, таких как таблицы, изображения или скачиваемые файлы.

Для использования frontend:

1. Перейдите по адресу [https://a2bio.github.io/A2MedAnalyzer](https://a2bio.github.io/A2MedAnalyzer).
2. Выберите нужный раздел.
3. Следуйте инструкциям на экране для ввода данных и просмотра результатов.

## Документация по API

API A2MedAnalyzer предоставляет пять основных эндпоинтов для выполнения биоинформатических задач. Ниже приведено подробное описание каждого из них.

### 1. `traits`
- **Описание**: Получает исследования, связанные с определенным признаком заболевания, из GWAS API.
- **Метод**: GET
- **URL**: `/studies_by_disease_trait/<trait>`
- **Параметры**:
  - `trait` (параметр пути, строка): Признак заболевания для поиска (минимум 2 символа).
- **Ответ**:
  - Код `200`: JSON с данными исследований.
  - Код `400`: JSON с ошибкой, если `trait` недействителен.
  - Код `502/504`: JSON с ошибкой при сбое связи с API.
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

### 2. `filtrate`
- **Описание**: Фильтрует и обрабатывает TSV-файл с данными генов, генерируя таблицу и CSV-файл с подсчетами генов и частотами аллелей.
- **Метод**: POST
- **URL**: `/filtrate`
- **Тело запроса**:
  - `file` (multipart/form-data): TSV-файл с колонками `mappedGenes`, `pValue`, `riskAllele`, `riskFrequency`.
- **Ответ**:
  - Код `200`: JSON с данными таблицы и URL CSV.
  - Код `400`: JSON с ошибкой, если файл недействителен или отсутствует.
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

### 3. `annotation`
- **Описание**: Выполняет анализ обогащения GO и KEGG для CSV-файла и генерирует графики в виде изображений.
- **Метод**: POST
- **URL**: `/annotate`
- **Тело запроса**:
  - `file` (multipart/form-data): CSV-файл с колонкой `mappedGenes`.
- **Ответ**:
  - Код `200`: JSON с URL изображений.
  - Код `400`: JSON с ошибкой, если файл недействителен или отсутствует.
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

### 4. `ncbi`
- **Описание**: Получает информацию о генах из NCBI по списку символов генов.
- **Метод**: POST
- **URL**: `/ncbi_gene_info`
- **Тело запроса** (JSON):
  - `genes` (массив): Список символов генов (например, `["MC4R", "BRCA1"]`).
- **Ответ**:
  - Код `200`: JSON с данными генов или ошибками.
  - Код `400`: JSON с ошибкой, если гены не предоставлены.
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

### 5. `metabolic_network`
- **Описание**: Строит и визуализирует метаболическую сеть на основе обогащения KEGG из CSV-файла, сохраняя результат как HTML и данные рёбер как CSV.
- **Метод**: POST
- **URL**: `/metabolic_network`
- **Тело запроса**:
  - `file` (multipart/form-data): CSV-файл с колонкой `mappedGenes`.
- **Ответ**:
  - Код `200`: JSON с URL графика и CSV.
  - Код `400`: JSON с ошибкой, если файл недействителен или отсутствует.
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

## Установка и настройка

### API

Для установки и запуска API выполните следующие шаги:

1. **Клонируйте репозиторий**:
   ```bash
   git clone https://github.com/yourusername/A2MedAnalyzer.git
   cd A2MedAnalyzer
   ```

2. **Установите зависимости**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Настройте Django**:
   - Отредактируйте `settings.py`, указав пути для `MEDIA_ROOT` и `MEDIA_URL` для хранения загружаемых файлов и результатов.

4. **Запустите сервер**:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend

Frontend A2MedAnalyzer размещен на GitHub Pages и доступен по адресу [https://a2bio.github.io/A2MedAnalyzer](https://a2bio.github.io/A2MedAnalyzer). Локальная установка не требуется. Однако, если вы хотите запустить его локально:

1. **Настройте API по инструкции выше**
2. **Перейдите в папку frontend проекта A2MedAnalyzer**
3. **Запустите сайт локально, выполнив следующие команды в терминале**:
  ```bash
  cd frontend
  npm start
  ```

## Устранение неполадок и поддержка

### Общие проблемы

- **Таймауты API**:
  - Уменьшите размер входных данных или проверьте интернет-соединение. Это связано с использованием разработчиками бесплатного хостинга с ограниченной оперативной памятью.
- **Отсутствующие зависимости**:
  - Выполните `pip install -r requirements.txt` для установки всех необходимых библиотек.
- **Проблемы с конфигурацией**:
  - Проверьте настройки `MEDIA_ROOT` и `MEDIA_URL` в `settings.py`.
    
### **Если вы столкнулись с ошибками, которые не были описаны в этой документации, или у вас есть предложения по оптимизации web-приложения, вы можете связаться с разработчиками**:
Мы в telegram:
  - @gnom_genome (Ангелина)
  - @your_alin (Алина)
Корпоративная почта ЮФУ:
  - kolesniko@sfedu.ru (Ангелина)
  - porotnikova@sfedu.ru (Алина)
