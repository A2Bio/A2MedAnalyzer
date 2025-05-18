# Документация A2MedAnalyzer

## Введение

**A2MedAnalyzer** — это веб-приложение для анализа генетических данных, разработанное для биоинформатиков, генетиков и исследователей. Оно предоставляет инструменты для фильтрации генетических данных, аннотации генов с анализом обогащения (GO/KEGG) и поиска исследований по заболеваниям/признакам через внешний GWAS Catalog API. Проект состоит из фронтенда (React, размещён на GitHub Pages) и бэкенда (Django REST API).

- **Цели**:
  - Фильтрация TSV-файлов с генами, аллелями, p-value и частотами риска.
  - Анализ обогащения генов (GO Biological Process, KEGG Pathways) с визуализацией scatter plots.
  - Получение данных исследований по признакам из GWAS Catalog.
- **Технологии**:
  - **Фронтенд**: React, GitHub Pages (`https://a2bio.github.io/A2MedAnalyzer/`).
  - **Бэкенд**: Django, Django REST Framework, Pandas, gseapy, seaborn, matplotlib, requests.
  - **Хранилище**: Файловая система (CSV, PNG). Возможна интеграция SQLite для метаданных.
- **Аудитория**: Биоинформатики, разработчики, исследователи.

## Установка и настройка
Установка бэкенда
Клонируйте репозиторий бэкенда:
git clone <your-backend-repo>
cd a2medanalyzer-backend
Установите зависимости:
pip install -r requirements.txt
Настройте переменные окружения в .env:
DEBUG=True
SECRET_KEY=your-secret-key
MEDIA_ROOT=./media
MEDIA_URL=/media/
Настройте Django в settings.py:
import os
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(BASE_DIR, 'media'))
MEDIA_URL = '/media/'
CORS_ALLOWED_ORIGINS = ['https://a2bio.github.io']
LOGGING = {
    'version': 1,
    'handlers': {'file': {'class': 'logging.FileHandler', 'filename': 'debug.log'}},
    'loggers': {'': {'level': 'INFO', 'handlers': ['file']}}
}
Выполните миграции:
python manage.py migrate
Запустите сервер:
python manage.py runserver
Бэкенд доступен на http://localhost:8000.
Установка фронтенда
### Фронтенд размещён на https://a2bio.github.io/A2MedAnalyzer/. Для локальной разработки:
Клонируйте репозиторий фронтенда:
git clone <your-frontend-repo>
cd a2medanalyzer-frontend
Установите зависимости:
npm install
Запустите:
npm start
Фронтенд доступен на http://localhost:3000.
### Архитектура API
REST API реализован с использованием Django REST Framework и включает три основных эндпоинта:
Эндпоинт	Метод	Описание	Входные данные	Выходные данные
/api/filtrate	POST	Фильтрация TSV-файлов по генам и аллелям.	TSV-файл (mappedGenes, pValue, etc.)	JSON (table_data, csv_url), CSV-файл
/api/annotate	POST	Аннотация генов с GO/KEGG-анализом и визуализацией.	CSV-файл (mappedGenes)	JSON (image_urls для PNG)
/api/traits/{trait}	GET	Исследования по признаку из GWAS API.	Параметр trait (например, “breast+cancer”)	JSON или <trait>_studies.json
Эндпоинт: /api/filtrate
Описание: Фильтрует TSV-файлы, выбирая записи с pValue ≤ 5×10⁻⁸ и riskFrequency ≠ "NR". Группирует гены и аллели, удаляет дубликаты, сохраняет уникальные гены в CSV.
Вход:
TSV-файл с колонками: mappedGenes, pValue, riskAllele, riskFrequency.
Пример:
mappedGenes	pValue	riskAllele	riskFrequency
BRCA1	1e-9	A	0.05
TP53	2e-8	G	0.02
Выход:
JSON: status, table_data (таблица с генами, аллелями, частотами), csv_url (URL CSV).
CSV: extracted_genes.csv с уникальными mappedGenes.
Пример запроса:
curl -X POST -F "file=@data.tsv" http://localhost:8000/api/filtrate
Пример ответа:
{
  "status": "success",
  "table_data": [
    {"mappedGenes": "BRCA1", "riskAllele": "A", "riskFrequency": 0.05, "Count_Genes": 2, "Count_Alleles": 1}
  ],
  "csv_url": "http://localhost:8000/media/extracted_genes.csv"
}
Ошибки:
400 Bad Request: Отсутствуют требуемые столбцы, неверный формат файла.
Эндпоинт: /api/annotate
Описание: Выполняет анализ обогащения (GO Biological Process, KEGG Pathways) для генов из CSV-файла с помощью gseapy. Генерирует scatter plots с seaborn, сохраняет их как PNG.
Вход:
CSV-файл с колонкой mappedGenes (разделители: , или ;).
Максимальный размер файла: 10 МБ.
Пример:
mappedGenes
BRCA1
TP53
Выход:
JSON: status, image_urls (URL PNG-файлов: go_enrichment_bubble.png, kegg_enrichment_bubble.png).
Пример запроса:
curl -X POST -F "file=@genes.csv" http://localhost:8000/api/annotate
Пример ответа:

{
  "status": "success",
  "image_urls": [
    {"name": "go_enrichment_bubble.png", "url": "http://localhost:8000/media/annotation_go_enrichment_bubble.png"},
    {"name": "kegg_enrichment_bubble.png", "url": "http://localhost:8000/media/annotation_kegg_enrichment_bubble.png"}
  ]
}
Ошибки:
400 Bad Request: Отсутствует столбец mappedGenes, файл слишком большой, пустой список генов.
Эндпоинт: /api/traits/{trait}
Описание: Запрашивает исследования по заболеванию/признаку из GWAS Catalog API (https://www.ebi.ac.uk/gwas/rest/api). Поддерживает скачивание JSON с параметром download=true.
Вход:
Параметр trait (например, “breast+cancer”).
Опционально: download=true для скачивания файла.
Выход:
JSON с данными исследований или файл <trait>_studies.json.
Пример запроса:

curl http://localhost:8000/api/traits/breast+cancer

Скачивание:

curl http://localhost:8000/api/traits/breast+cancer?download=true
Ошибки:
400 Bad Request: trait короче 2 символов.
502 Bad Gateway: Ошибка соединения с GWAS API.
504 Gateway Timeout: Таймаут GWAS API.

### Через фронтенд
Перейдите на https://a2bio.github.io/A2MedAnalyzer/.
Фильтрация: Загрузите TSV-файл, получите таблицу и CSV.
Аннотация: Загрузите CSV с генами, просмотрите scatter plots (GO/KEGG).
Признаки: Введите заболевание (например, “breast cancer”), скачайте данные GWAS.
### Через API (Postman/cURL)
Фильтрация:
curl -X POST -F "file=@data.tsv" http://localhost:8000/api/filtrate
Аннотация:
curl -X POST -F "file=@genes.csv" http://localhost:8000/api/annotate
Признаки:
curl http://localhost:8000/api/traits/breast+cancer
Пример фронтенд-кода (Axios)
javascript

// Фильтрация
const formData = new FormData();
formData.append('file', tsvFile);
axios.post('http://localhost:8000/api/filtrate', formData)
  .then(response => console.log(response.data.table_data));

// Аннотация
axios.post('http://localhost:8000/api/annotate', formData)
  .then(response => console.log(response.data.image_urls));

// Признаки
axios.get('http://localhost:8000/api/traits/breast+cancer')
  .then(response => console.log(response.data));
### Безопасность
Валидация данных:
Проверка столбцов TSV/CSV.
Ограничение размера файла (10 МБ).
Проверка длины trait (≥ 2 символа).
Обработка ошибок:
Возврат JSON с status: error и message (HTTP 400, 502, 504).
Логирование:
Ошибки и события записываются в debug.log.
Пример:
python
logger.error(f"Ошибка обработки CSV: {str(e)}")

### CSRF-защита:
Отключена (@csrf_exempt) для упрощения разработки. Рекомендуется включить токены для продакшена.

### Ограничения
Отсутствует база данных; результаты хранятся в файлах (MEDIA_ROOT).
Зависимость от внешнего GWAS API (возможны таймауты или лимиты).
Ограничение размера входных файлов: 10 МБ.
Локальный запуск бэкенда требует ручной настройки CORS для фронтенда.

###  Структура репозитория

a2medanalyzer-backend/
├── docs/
│   ├── api.md
│   ├── installation.md
│   ├── usage.md
├── media/
│   ├── extracted_genes.csv
│   ├── annotation_*.png
├── a2medanalyzer/
│   ├── settings.py
│   ├── urls.py
├── filtrate/
│   ├── views.py
├── annotation/
│   ├── views.py
├── traits/
│   ├── views.py
├── requirements.txt
├── README.md
├── manage.py
 
### Требования
- Python 3.8+ и `pip`.
- Git.
- Доступ к интернету для GWAS API (`https://www.ebi.ac.uk/gwas/rest/api`).
- Зависимости:
  ```bash
  django==4.2
  djangorestframework==3.14
  pandas==2.0
  gseapy==1.0
  seaborn==0.12
  matplotlib==3.7
  requests==2.31
