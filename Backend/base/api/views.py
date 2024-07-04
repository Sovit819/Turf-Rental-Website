
from django.contrib.auth import authenticate
# from base.models import CustomUser
# from django.contrib.auth.models import User


from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework import generics
from rest_framework.response import Response
from base.models import TurfDetails, Booking, Payment, CustomUser
from .serializers import TurfDetailsSerializer, UserSerializer, BookingSerializer, PaymentSerializer

# For Token
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token',
        '/api/token/refresh',
    ]
    return Response(routes)

# For signup
@api_view(['POST'])
def signup(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # username = serializer.validated_data.get('username')
            # # Check if username already exists
            # if User.objects.filter(username=username).exists():
            #     return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# For signin
@api_view(['POST'])
def signin(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
# Users Details
@api_view(['GET'])
def get_user_details(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        serializer = UserSerializer(user)  # Use your serializer here
        return Response(serializer.data, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    

# Turf Details
@api_view(['GET'])
def turf_list(request):
    turfs = TurfDetails.objects.all()
    serializer = TurfDetailsSerializer(turfs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def turf_detail(request, id):
    try:
        turf = TurfDetails.objects.get(id=id)
        serializer = TurfDetailsSerializer(turf)
        return Response(serializer.data)
    except TurfDetails.DoesNotExist:
        raise Http404
    

# Booking Views
class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

@api_view(['POST'])
def check_availability(request):
    if request.method == 'POST':
        data = request.data
        turf_id = data.get('turf')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        try:
            # Check if there are any overlapping bookings
            overlapping_bookings = Booking.objects.filter(
                turf_id=turf_id,
                date=date,
                start_time__lt=end_time,
                end_time__gt=start_time
            )

            if overlapping_bookings.exists():
                return Response({'message': 'Slot not available. Please choose another time.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'Slot is available!'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Payment Views
class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

