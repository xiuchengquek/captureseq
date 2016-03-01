from django.shortcuts import render
from django.views.generic.base import TemplateView
from rest_framework import serializers
from models import MelanomaExpression, TissueExpression, TranscriptInfo
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
import json

class MainPageView(TemplateView):
    template_name = "main.html"

class MelanomaSerializer(serializers.HyperlinkedModelSerializer):
    expression = serializers.SerializerMethodField('clean_expression')
    class Meta:
        model = MelanomaExpression
        fields = ('transcript_id', 'gene_name', 'expression')
    def clean_expression(self, obj):
        return obj.expression

class TissueSerializer(serializers.HyperlinkedModelSerializer):
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

