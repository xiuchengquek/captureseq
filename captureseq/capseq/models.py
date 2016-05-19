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
    loci_id = models.IntegerField(primary_key=True)
    chr = models.IntegerField()
    start = models.IntegerField()
    end = models.IntegerField()
    width = models.IntegerField()
    strand = models.CharField(max_length=1)
    name = models.CharField(max_length=100)
    track = models.CharField(max_length=30)
    details = JSONField()

class TranscriptInfo(models.Model):
    transcript_id = models.CharField(max_length=30)
    exons = JSONField()

class SnpsByLoci(models.Model):
    captured_region = models.ForeignKey(CapturedRegion, related_name='snps_details')
    snp = models.CharField(max_length=20)
    disease_id = models.IntegerField()
    pubmed = models.IntegerField(null=True)
    pvalue = models.CharField(max_length=10)

class traitsDetails(models.Model):
    disease = models.CharField(max_length=200)
    disease_id = models.IntegerField()
    efo_term = models.CharField(max_length=200)
    efo_link = models.CharField(max_length=200)
    parent_term = models.CharField(max_length=200)
    parent_link = models.CharField(max_length=200)


class regionToTx(models.Model):
    loci_id  = models.IntegerField()
    transcript_id = models.CharField(max_length=30)

