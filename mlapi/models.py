from django.db import models


class Dataset(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]
    metrics = models.JSONField(null=True, blank=True)

    name = models.CharField(max_length=255)

    original_file = models.FileField(
        upload_to="datasets/original/"
    )

    cleaned_file = models.FileField(
        upload_to="datasets/cleaned/",
        null=True,
        blank=True
    )

    raw_accuracy = models.FloatField(null=True, blank=True)
    cleaned_accuracy = models.FloatField(null=True, blank=True)
    improvement = models.FloatField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    error_message = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.status})"
