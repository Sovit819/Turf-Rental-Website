from django.urls import path
from . import views
from .views import MyTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [    
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('signup/', views.signup, name='Signup'),
    path('signin/', views.signin, name='Signin'),
    path('turfsDetails/', views.turf_list, name='turf-list'),
    path('turfsDetails/<int:id>/', views.turf_detail, name='turf_detail'),  # New route for turf details

    
]