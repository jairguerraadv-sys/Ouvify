from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsentVersionViewSet, UserConsentViewSet

router = DefaultRouter()
router.register('versions', ConsentVersionViewSet, basename='consent-versions')
router.register('user-consents', UserConsentViewSet, basename='user-consents')

urlpatterns = [
    path('', include(router.urls)),
]
