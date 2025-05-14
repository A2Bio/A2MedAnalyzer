import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
def search_gwas_by_trait(request):
    trait = request.GET.get('trait')

    if not trait:
        return Response({'error': 'Параметр "trait" обязателен.'}, status=status.HTTP_400_BAD_REQUEST)

    url = f'https://www.ebi.ac.uk/gwas/rest/api/studies?efoTrait={trait}'

    try:
        # Логирование URL
        print(f'Запрос к API: {url}')
        
        response = requests.get(url, headers={'Accept': 'application/json'})
        
        # Логирование ответа от API
        print(f'Ответ от API: {response.status_code}')
        
        if response.status_code != 200:
            return Response(
                {'error': f'Ошибка при запросе к GWAS Catalog: {response.status_code}'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        data = response.json()
        
        # Логируем полученные данные для отладки
        print('Полученные данные от API:', data)

        studies = data.get('_embedded', {}).get('studies', [])

        if not studies:
            return Response({'error': 'Нет доступных данных по данному признаку.'}, status=status.HTTP_404_NOT_FOUND)

        simplified = []
        for study in studies:
            pub_info = study.get('publicationInfo', {})
            author_info = pub_info.get('author', {})
            simplified.append({
                'id': study.get('accessionId'),
                'trait': study.get('diseaseTrait', {}).get('trait'),
                'title': pub_info.get('title'),
                'author': author_info.get('fullname'),
                'publication': pub_info.get('publication'),
                'pubmedId': pub_info.get('pubmedId'),
                'publicationDate': pub_info.get('publicationDate'),
                'initialSampleSize': study.get('initialSampleSize'),
                'replicationSampleSize': study.get('replicationSampleSize'),
                'platform': study.get('platforms', [{}])[0].get('manufacturer'),
            })

        return Response(simplified)

    except requests.exceptions.RequestException as e:
        # Логирование ошибки запроса
        print(f'Ошибка соединения: {str(e)}')
        return Response({'error': f'Ошибка соединения: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)
