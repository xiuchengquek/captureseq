from django.conf.urls import url

from views import MelanomaViewSet, MainPageView, TissueViewSet, TranscriptInfoViewSet, CapturedRegionViewSet






urlpatterns = [
    url(r'^$', MainPageView.as_view()),
    url('^melanoma/$', MelanomaViewSet.as_view({'get': 'list'})),
    url('^melanoma/(?P<transcript_id>.+)/$', MelanomaViewSet.as_view({'get': 'retrieve'})),
    url('^tissue/(?P<transcript_id>.+)/$', TissueViewSet.as_view({'get': 'retrieve'})),
    url('^tissue/(?P<transcript_id>.+)/$', TissueViewSet.as_view({'get': 'list'})),
    url('^capturedregions/$', CapturedRegionViewSet.as_view({'get': 'list'})),
    url('^txinfo/$', TranscriptInfoViewSet.as_view({'get': 'list'})),
    url('^txinfo/(?P<transcript_id>.+)/$', TranscriptInfoViewSet.as_view({'get': 'get'}))
]
