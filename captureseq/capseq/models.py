from __future__ import unicode_literals

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from jsonfield import JSONField




# Create your models here.

class MelanomaExpression(models.Model):
    transcript_id = models.CharField(max_length=30)
    gene_name = models.CharField(max_length=30)
    expression = JSONField()

class TissueExpression(models.Model):
    transcript_id = models.CharField(max_length=30)
    expression = JSONField()

class CapturedRegion(models.Model):
    chr = models.IntegerField()
    start = models.IntegerField()
    end = models.IntegerField()
    width = models.IntegerField()

    strand = models.CharField(max_length=1)
    name = models.CharField(max_length=100)
    track = models.CharField(max_length=30)

class TranscriptInfo(models.Model):
    transcript_id = models.CharField(max_length=30)
    exons = JSONField()









