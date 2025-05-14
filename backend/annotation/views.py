from django.http import JsonResponse

def test_annotation(request):
    return JsonResponse({"message": "GWAS API is working!"})
