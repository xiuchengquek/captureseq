from django.shortcuts import render
from django.views.generic.base import TemplateView
from rest_framework import serializers
from models import MelanomaExpression, TissueExpression
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


class MelanomaViewSet(viewsets.ViewSet):

    serializer_class = MelanomaSerializer
    queryset = MelanomaExpression.objects.all()

    def list(self,request):
        queryset = MelanomaExpression.objects.all()
        serializer = MelanomaSerializer(queryset, many=True)
        return Response(serializer.data)

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
        return Response(serializer.data)




    def retrieve(self, request, transcript_id=None):
        queryset = TissueExpression.objects.all()
        data = get_object_or_404(queryset, transcript_id=transcript_id)
        serializer = TissueSerializer(data)

        return Response(serializer.data)

