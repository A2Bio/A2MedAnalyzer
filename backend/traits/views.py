import requests
import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET

@require_GET
def studies_by_disease_trait(request, trait):
    if not trait or len(trait) < 2:
        data = {"error": "Parameter 'trait' is required and must be at least 2 characters."}
        return JsonResponse(data, status=400)

    base_url = "https://www.ebi.ac.uk/gwas/rest/api/studies/search/findByDiseaseTrait"
    params = {"diseaseTrait": trait}

    try:
        r = requests.get(base_url, params=params, timeout=10)
        r.raise_for_status()
    except requests.Timeout:
        return JsonResponse({"error": "Timeout from GWAS API."}, status=504)
    except requests.ConnectionError:
        return JsonResponse({"error": "Connection error to GWAS API."}, status=502)
    except requests.HTTPError as e:
        return JsonResponse({"error": f"GWAS API returned HTTP error: {e.response.status_code}."}, status=502)
    except requests.RequestException as e:
        return JsonResponse({"error": f"Error communicating with GWAS API: {str(e)}"}, status=502)

    result_json = r.json()

    # Проверяем параметр ?download=true
    download = request.GET.get('download', '').lower() == 'true'
    if download:
        response = HttpResponse(
            json.dumps(result_json, indent=2),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="{trait}_studies.json"'
        return response
    else:
        return JsonResponse(result_json, safe=False)


