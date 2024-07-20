from datetime import datetime
from django.utils import timezone
from django.contrib.auth import authenticate
from django.shortcuts import redirect

from django.conf import settings
from django.http import JsonResponse
from django.utils.http import urlencode
from django.http import Http404
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from base.models import TemporaryBookingData, TurfDetails, Booking, Payment, CustomUser
from .serializers import TurfDetailsSerializer, UserSerializer, BookingSerializer, PaymentSerializer

import uuid

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
        username = request.data.get('username', None)
        email = request.data.get('email')
        
        if CustomUser.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(email = email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# For signin
@api_view(['POST'])
def signin(request):
    if request.method == 'POST':
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)

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
        serializer = UserSerializer(user)
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


@api_view(['POST'])
def initiate_payment(request):
    if request.method == 'POST':
        booking_data = request.data

        payment_method = booking_data.get('payment_method')
        

        try:
            user_id = booking_data.get('user_id')
            phone_number = booking_data.get('phone_number')
            turf_id = booking_data.get('turf_id')
            date = booking_data.get('date')
            start_time = booking_data.get('start_time')
            end_time = booking_data.get('end_time')

           
            if not (user_id and phone_number and turf_id and date and start_time and end_time and payment_method):
                return JsonResponse({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
            amount = calculate_booking_amount(turf_id, start_time, end_time)
            transaction_uuid = uuid.uuid4()
            booking_id = generate_booking_id()

            if payment_method == 'cash':
                booking = Booking.objects.create(
                    booking_id = booking_id,
                    user_id=user_id,
                    turf_id=turf_id,
                    phone_number=phone_number,
                    date=date,
                    start_time=start_time,
                    end_time=end_time,
                    payment_status='Pending',
                    amount=amount,
                    booking_date = datetime.now()
                )
                payment = Payment.objects.create(
                    booking=booking,
                    amount=amount,
                    payment_method='cash',
                    phone_number=phone_number,
                    transaction_uuid = transaction_uuid
                )
                return JsonResponse({'message': 'Booking Successful with Cash Payment'}, status=status.HTTP_201_CREATED)
            
            elif payment_method == 'esewa':

                TemporaryBookingData.objects.create(
                    booking_id = booking_id,
                    transaction_uuid=transaction_uuid,
                    user_id=user_id,
                    phone_number=phone_number,
                    turf_id=turf_id,
                    date=date,
                    start_time=start_time,
                    end_time=end_time,
                    amount=amount  
                )

                esewa_data = {
                    'amt': amount,
                    'txAmt': 0,
                    'psc': 0,
                    'pdc': 0,
                    'tAmt': amount,
                    'scd': 'EPAYTEST',  # Replace with your eSewa merchant ID
                    'pid': transaction_uuid,
                    'su': settings.ESEWA_SUCCESS_URL,
                    'fu': settings.ESEWA_FAILURE_URL,
                }

                esewa_redirect_url = 'https://uat.esewa.com.np/epay/main?' + urlencode(esewa_data)
                print(esewa_redirect_url)
                return JsonResponse({'redirectUrl': esewa_redirect_url}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse({'error': 'Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
def payment_success(request):
    if request.method == 'GET':
        oid = request.GET.get('oid')
        amt = request.GET.get('amt')
        refId = request.GET.get('refId')
        
        try:
            temporary_data = TemporaryBookingData.objects.get(transaction_uuid=oid)
        except TemporaryBookingData.DoesNotExist:
            return JsonResponse({'error': 'No booking data found for this transaction'}, status=status.HTTP_400_BAD_REQUEST)
    
        if not (oid and amt and refId):
            notFound_redirect_url = f'http://localhost:5173/user/{temporary_data.user_id}/paymentSuccess?status=NOT_FOUND'
            return redirect(notFound_redirect_url)        

        # Create booking and payment records
        booking = Booking.objects.create(
            booking_id = temporary_data.booking_id,
            user_id=temporary_data.user_id,
            turf_id=temporary_data.turf_id,
            phone_number=temporary_data.phone_number,
            date=temporary_data.date,
            start_time=temporary_data.start_time,
            end_time=temporary_data.end_time,
            payment_status='Paid',
            amount=temporary_data.amount,
            booking_date=datetime.now()
        )
        payment = Payment.objects.create(
            booking=booking,
            amount=temporary_data.amount,
            payment_method='esewa',
            phone_number=temporary_data.phone_number,
            transaction_uuid=oid,
        )

        # temp_data = TemporaryBookingData.objects.get(oid)
        # print(temp_data)

        success_redirect_url = f'http://localhost:5173/user/{booking.user_id}/paymentSuccess?status=COMPLETE'
        
        return redirect(success_redirect_url)
    
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        

@api_view(['GET'])
def payment_failure(request):
    return redirect(f'http://localhost:5173/user/paymentFailure/')


def calculate_booking_amount(turf_id, start_time, end_time):
    try:
        turf = TurfDetails.objects.get(id=turf_id)
        start = datetime.strptime(start_time, '%H:%M')
        end = datetime.strptime(end_time, '%H:%M')
        duration_hours = (end - start).total_seconds() / 3600
        total_amount = duration_hours * float(turf.price)
        return round(total_amount, 2)
    
    except TurfDetails.DoesNotExist:
        raise ValueError('Turf not found')


#Generate Booking id

def generate_booking_id():
        today = timezone.now()
        year = today.strftime('%Y')
        month = today.strftime('%m')
        
        # Find the latest booking number for the current year and month
        latest_booking = Booking.objects.filter(
            booking_id__startswith=f"{year}/{month}/"
        ).order_by('-booking_id').first()

        if latest_booking:
            last_number = int(latest_booking.booking_id.split('/')[-1])
        else:
            last_number = 0

        next_number = last_number + 1
        return (f"{year}/{month}/{next_number:04d}")


@api_view(['GET'])
def booking_history(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({'error': 'User ID is required'}, status=400)
    
    bookings = Booking.objects.filter(user_id=user_id).order_by('-booking_date')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)



