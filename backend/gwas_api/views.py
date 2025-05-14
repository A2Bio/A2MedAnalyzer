from django.http import JsonResponse

def test_gwas(request):
    return JsonResponse({"message": "GWAS API is working!"})
