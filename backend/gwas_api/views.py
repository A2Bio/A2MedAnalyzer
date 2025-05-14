# Импортируем requests для работы с внешним HTTP API
import requests

# Импортируем декоратор для представлений, работающих с методами API
from rest_framework.decorators import api_view

# Импортируем класс Response для возврата HTTP-ответов
from rest_framework.response import Response

# Импортируем статус-коды для удобства указания типа ответа
from rest_framework import status

# Декоратор сообщает, что представление обрабатывает только GET-запросы
@api_view(['GET'])
def test_gwas(request):
    # Извлекаем значение параметра 'trait' из строки запроса (например, /api/gwas/?trait=diabetes)
    trait = request.GET.get('trait', 'diabetes')  # Значение по умолчанию
    
    # Если параметр не передан, возвращаем ошибку 400 (Bad Request)
    if not trait:
        return Response({'error': 'Параметр "trait" обязателен.'}, status=status.HTTP_400_BAD_REQUEST)

    # Формируем URL для запроса к GWAS Catalog API с использованием значения trait
    url = f'https://www.ebi.ac.uk/gwas/rest/api/studies?efoTrait={trait}'
    
    try:
        # Выполняем GET-запрос к внешнему API
        response = requests.get(url, headers={'Accept': 'application/json'})
        
        # Если сервер вернул ошибку (например, 500 или 404), возвращаем её клиенту
        if response.status_code != 200:
            return Response(
                {'error': f'Ошибка при запросе к GWAS Catalog: {response.status_code}'},
                status=status.HTTP_502_BAD_GATEWAY
            )
        
        # Преобразуем JSON-ответ в словарь Python
        data = response.json()
        
        # Получаем список исследований
        studies = data.get('_embedded', {}).get('studies', [])

        # Формируем компактный список с ключевой информацией
        simplified = []
        for study in studies:
            simplified.append({
                'id': study.get('accessionId'),
                'trait': study.get('diseaseTrait', {}).get('trait'),
                'title': study.get('publicationInfo', {}).get('title'),
                'author': study.get('publicationInfo', {}).get('author', {}).get('fullname'),
                'publication': study.get('publicationInfo', {}).get('publication'),
                'pubmedId': study.get('publicationInfo', {}).get('pubmedId'),
                'publicationDate': study.get('publicationInfo', {}).get('publicationDate'),
                'initialSampleSize': study.get('initialSampleSize'),
                'replicationSampleSize': study.get('replicationSampleSize'),
                'platform': study.get('platforms', [{}])[0].get('manufacturer'),
            })

        # Возвращаем упрощённый список
        return Response(simplified)

    # Обработка сетевых ошибок (например, отсутствие интернета или сбой соединения)
    except requests.exceptions.RequestException as e:
        return Response(
            {'error': f'Ошибка соединения: {str(e)}'},
            status=status.HTTP_502_BAD_GATEWAY
        )
