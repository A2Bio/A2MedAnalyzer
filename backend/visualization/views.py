from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def test_viz(request):
    return Response({"message": "Visualization data"})
 