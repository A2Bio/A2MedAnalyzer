# ncbi/views.py

import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
import json

@csrf_exempt
def ncbi_gene_info(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Метод не разрешён'}, status=405)

    try:
        data = json.loads(request.body)
        gene_symbols = data.get("genes", [])

        if not gene_symbols:
            return JsonResponse({'error': 'Нет переданных генов'}, status=400)

        results = []

        for symbol in gene_symbols:
            cache_key = f"ncbi_gene_{symbol}"
            cached_result = cache.get(cache_key)
            if cached_result:
                results.append(cached_result)
                continue

            # Поиск UID только по человеку
            search_resp = requests.get(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
                params={
                    "db": "gene",
                    "term": f"{symbol}[sym] AND Homo sapiens[orgn]",
                    "retmode": "json"
                }
            )
            search_data = search_resp.json()
            id_list = search_data.get("esearchresult", {}).get("idlist", [])

            if not id_list:
                results.append({"symbol": symbol, "error": "Ген не найден"})
                continue

            gene_id = id_list[0]

            # Получаем подробную информацию
            summary_resp = requests.get(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
                params={
                    "db": "gene",
                    "id": gene_id,
                    "retmode": "json"
                }
            )

            summary_data = summary_resp.json()
            doc = summary_data.get("result", {}).get(gene_id)

            if not doc:
                results.append({"symbol": symbol, "error": "Нет данных в summary"})
                continue

            # Возвращаем всю сырую структуру doc + кэшируем
            cache.set(cache_key, doc, timeout=3600)  # кэш на 1 час
            results.append(doc)

        return JsonResponse({'results': results})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
