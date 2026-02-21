from rest_framework.views import APIView
from rest_framework.response import Response
from mlapi.models import Dataset
from .serializers import DatasetReportSerializer

class DatasetReportView(APIView):
    """
    Returns all uploaded datasets with their dynamic metrics.
    """
    def get(self, request):
        datasets = Dataset.objects.all().order_by('-created_at')
        serializer = DatasetReportSerializer(datasets, many=True)
        return Response(
            {
                "count": len(datasets),
                "results": serializer.data
            }
        )
