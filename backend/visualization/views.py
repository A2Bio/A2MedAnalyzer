from django.http import JsonResponse

def test_viz(request):
    return JsonResponse({"message": "GWAS API is working!"})
