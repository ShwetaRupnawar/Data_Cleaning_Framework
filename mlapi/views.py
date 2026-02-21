from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files import File
from rest_framework.permissions import IsAuthenticated

from .models import Dataset
from .services.ml_engine import MLPipeline


class DatasetUploadView(APIView):

    def post(self, request):
        permission_classes = [IsAuthenticated]
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"error": "No file uploaded."},
                status=status.HTTP_400_BAD_REQUEST
            )

        dataset = Dataset.objects.create(
            name=uploaded_file.name,
            original_file=uploaded_file,
            status="processing"
        )

        try:
            pipeline = MLPipeline(dataset.original_file.path)
            results = pipeline.run()
            print(results)
            # ✅ SAVE CLEANED FILE
            cleaned_path = results.get("cleaned_file_path")

            if cleaned_path:
                with open(cleaned_path, "rb") as f:
                    dataset.cleaned_file.save(
                        f"cleaned_{dataset.name}",
                        File(f),
                        save=False
                    )

            # ✅ Save metrics
            dataset.raw_accuracy = results.get("raw_accuracy")
            dataset.cleaned_accuracy = results.get("cleaned_accuracy")
            dataset.improvement = results.get("improvement")
            dataset.status = "completed"

            dataset.save()

            return Response(
                {
                    "message": "Pipeline executed successfully",
                    "dataset": dataset.name,
                    "metrics": results
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            dataset.status = "failed"
            dataset.error_message = str(e)
            dataset.save()

            return Response(
                {"error": f"Pipeline failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )