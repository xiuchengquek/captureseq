from django.conf.urls import url

from views import MelanomaViewSet, MainPageView, TissueViewSet, TranscriptInfoViewSet,get_captured_region_bedfile,\
    CapturedRegionViewSet, CapturedRegionLinkedTraitsViewSet, traitsDetailsViewSet, SnpsByLociViewSets, RegionToTxViewSet






urlpatterns = [
    url(r'^$', MainPageView.as_view()),
    url('^melanoma/$', MelanomaViewSet.as_view({'get': 'list'})),
    url('^melanoma/(?P<transcript_id>.+)/$', MelanomaViewSet.as_view({'get': 'retrieve'})),
    url('^tissue/(?P<transcript_id>.+)/$', TissueViewSet.as_view({'get': 'retrieve'})),
    url('^tissue/(?P<transcript_id>.+)/$', TissueViewSet.as_view({'get': 'list'})),
    url('^capturedregions/$', CapturedRegionViewSet.as_view({'get': 'list'})),
    url('^capturedregionstraits/$', traitsDetailsViewSet.as_view({'get': 'list'})),
    url('^capturedregions/bed/$', get_captured_region_bedfile),
    url('^capturedregions/tx_id/$', RegionToTxViewSet.as_view({'get' : 'list'})),
    url('^traits/all/$', traitsDetailsViewSet.as_view({'get': 'list'})),
    url('^traits/parents/(?P<parent_term>[^/]+)/$', traitsDetailsViewSet.as_view({'get': 'get_by_parents'})),
    url('^snp/$', SnpsByLociViewSets.as_view({'get': 'list'})),
    url('^txinfo/$', TranscriptInfoViewSet.as_view({'get': 'list'})),
    url('^txinfo/(?P<transcript_id>.+)/$', TranscriptInfoViewSet.as_view({'get': 'get'}))
]
