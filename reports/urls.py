from django.urls import path
from .views import DatasetReportView

urlpatterns = [
    path("datasets/", DatasetReportView.as_view(), name="dataset-report"),
]
