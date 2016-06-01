from django.shortcuts import render
from django.views.generic.base import TemplateView
from rest_framework import serializers
from models import MelanomaExpression, TissueExpression, TranscriptInfo, CapturedRegion, SnpsByLoci, traitsDetails,\
    regionToTx, snpSpecificLocation
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
import json

import csv
from django.http import HttpResponse


class MainPageView(TemplateView):
    template_name = "data_row.html"


class CapturedRegionSerializer(serializers.ModelSerializer):
    details = serializers.SerializerMethodField('clean_details')
    class Meta:
        model = CapturedRegion
        fields = ('loci_id', 'chr', 'start','end', 'strand', 'width', 'track', 'details')
    def clean_details(self, obj):
        return obj.details




class CapturedRegionViewSet(viewsets.ModelViewSet):
    queryset = CapturedRegion.objects.all()
    serializer_class = CapturedRegionSerializer

class MelanomaSerializer(serializers.HyperlinkedModelSerializer):
    expression = serializers.SerializerMethodField('clean_expression')
    class Meta:
        model = MelanomaExpression
        fields = ('transcript_id', 'gene_name', 'expression')
    def clean_expression(self, obj):
        return obj.expression

class TissueSerializer(serializers.ModelSerializer):
    expression = serializers.SerializerMethodField('clean_expression')
    class Meta:
        model = TissueExpression
        fields = ('transcript_id', 'expression')
    def clean_expression(self, obj):
        return obj.expression

class TranscriptInfoSerializer(serializers.HyperlinkedModelSerializer):
    """
    A simple ViewSet for viewing accounts.
    """
    exons = serializers.SerializerMethodField('clean_exons')
    class Meta:
        model = TranscriptInfo
        fields = ('transcript_id', 'exons')
    def clean_exons(self, obj):
        return obj.exons

class TranscriptInfoViewSet(viewsets.ViewSet):
    serializer_class = TranscriptInfoSerializer
    queryset =TranscriptInfo.objects.all()

    def list(self,request):
        queryset = TranscriptInfo.objects.all()
        serializer = TranscriptInfoSerializer(queryset, many=True)
        data = [x['transcript_id'] for x in serializer.data]
        return Response(data)

    def get(self, request, transcript_id=None):
        queryset = TranscriptInfo.objects.all()
        data = get_object_or_404(queryset, transcript_id=transcript_id)
        serializer = TranscriptInfoSerializer(data)
        return Response(serializer.data)

class MelanomaViewSet(viewsets.ViewSet):
    serializer_class = MelanomaSerializer
    queryset = MelanomaExpression.objects.all()
    def list(self,request):
        queryset = MelanomaExpression.objects.all()
        serializer = MelanomaSerializer(queryset, many=True)
        data = [x['transcript_id'] for x in serializer.data]
        return Response(data)

    def retrieve(self, request, transcript_id=None):
        queryset = MelanomaExpression.objects.all()
        data = get_object_or_404(queryset, transcript_id=transcript_id)
        serializer = MelanomaSerializer(data)
        return Response(serializer.data)

class TissueViewSet(viewsets.ViewSet):
    serializer_class = TissueSerializer
    queryset = TissueExpression.objects.all()

    def list(self,request):
        queryset = TissueExpression.objects.all()
        serializer = TissueExpression(queryset, many=True)
        data = [x['transcript_id'] for x in serializer.data]
        return Response(data)

    def retrieve(self, request, transcript_id=None):
        queryset = TissueExpression.objects.all()
        data = get_object_or_404(queryset, transcript_id=transcript_id)
        serializer = TissueSerializer(data)
        return Response(serializer.data)


class traitsDetailsSeralizer(serializers.ModelSerializer):

    class Meta:
        model = traitsDetails
        fields = ('disease', 'disease_id', 'efo_term' , 'efo_link' , 'parent_term', 'parent_link')


class traitsDetailsViewSet(viewsets.ModelViewSet):

    queryset = traitsDetails.objects.all()
    serializer_class = traitsDetailsSeralizer

    def get_by_parents(self, request, parent_term):
        queryset = traitsDetails.objects.filter(parent_term =parent_term)
        disease = [x.disease for x in queryset]
        SnpsByLoci.filter(disease__in = disease)
        serializer = traitsDetailsSeralizer(queryset, many=True)
        return Response(serializer.data)


class SnpsByLociSerializers(serializers.ModelSerializer):
    class Meta:
        model = SnpsByLoci
        fields = ('captured_region', 'snp', 'disease_id', 'pubmed', 'pvalue')

class CapturedRegionSerializers(serializers.ModelSerializer):
    class Meta:
        model = CapturedRegion
        fields = ('snps_details','chr', 'start','end', 'strand', 'width', 'track', 'details')


class ReverseSnpsByLociSerializers(serializers.ModelSerializer):

    captured_region = CapturedRegionSerializer()

    class Meta:
        model = SnpsByLoci
        fields = ('captured_region', 'snp', 'disease_id', 'pubmed', 'pvalue')





class SnpsByLociViewSets(viewsets.ModelViewSet):
    queryset = SnpsByLoci.objects.all()
    serializer_class = SnpsByLociSerializers



class LinkedSnpsByLociViewSets(viewsets.ModelViewSet):
    queryset = SnpsByLoci.objects.all()
    serializer_class = ReverseSnpsByLociSerializers




class CapturedRegionLinkedTraitsSerializers(serializers.ModelSerializer):
    details = serializers.SerializerMethodField('clean_details')
    snps_details = SnpsByLociSerializers(many=True, read_only=True)
    class Meta:
        model = CapturedRegion
        fields = ('snps_details','chr', 'start','end', 'strand', 'width', 'track', 'details')
    def clean_details(self, obj):
        return obj.details


class CapturedRegionLinkedTraitsViewSet(viewsets.ViewSet):
    queryset = CapturedRegion.objects.all()
    serializer_class = CapturedRegionLinkedTraitsSerializers
    def list(self, request):
        queryset = CapturedRegion.objects.all()
        serializer = CapturedRegionLinkedTraitsSerializers(instance=queryset, many=True)
        return Response(serializer.data)


def get_captured_region_bedfile(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="captured_region.csv"'
    writer = csv.writer(response, delimiter='\t', quoting=csv.QUOTE_NONE)
    queryset = CapturedRegion.objects.all()
    for x in queryset:
        entry = [x.chr, x.start, x.end, x.loci_id ]
        entry  = [str(x) for x in entry]
        writer.writerow(entry)
    return response


class RegionToTxSerializers(serializers.ModelSerializer):
    class Meta:
        model = regionToTx
        fields = ('loci_id' , 'transcript_id')



class RegionToTxViewSet(viewsets.ViewSet):
    queryset = regionToTx.objects.all()
    serializers_class  = RegionToTxSerializers

    def list(self,requests):
        queryset = regionToTx.objects.all()
        serializer = RegionToTxSerializers(instance=queryset, many=True)
        return Response(serializer.data)



class getSnpLocationSerializers(serializers.ModelSerializer):
    class Meta:
        model = snpSpecificLocation
        fields = ('snp_id', 'chr', 'start', 'end')

class getSnpLocation(viewsets.ViewSet):
    queryset = snpSpecificLocation.objects.all()
    serializers = getSnpLocationSerializers


    def list(self, requests):
        queryset = snpSpecificLocation.objects.all()
        serializers = getSnpLocationSerializers(queryset, many =True)
        return Response(serializers.data)



















