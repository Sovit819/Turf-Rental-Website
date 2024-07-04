from django.urls import path
from . import views
from .views import MyTokenObtainPairView
from .views import BookingListCreateView, BookingDetailView, PaymentListCreateView, PaymentDetailView


from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [    
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('signup/', views.signup, name='Signup'),
    path('signin/', views.signin, name='Signin'),

    path('users/<int:user_id>/', views.get_user_details, name='user-detail'),


    path('turfsDetails/', views.turf_list, name='turf-list'),
    path('turfsDetails/<int:id>/', views.turf_detail, name='turf_detail'),  

    path('availability/', views.check_availability, name='check_availability'),


    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('payments/', PaymentListCreateView.as_view(), name='payment-list-create'),
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),

    
]