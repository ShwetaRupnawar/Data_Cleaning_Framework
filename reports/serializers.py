from rest_framework import serializers
from mlapi.models import Dataset

class DatasetReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = [
            "id",
            "name",
            "metrics",       # dynamic metrics dict
            "row_count",     # optional, can also get from metrics
            "column_count",  # optional
            "created_at",
        ]
