from datetime import datetime
from django.contrib.auth import authenticate
from django.shortcuts import redirect
import requests
from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseServerError, JsonResponse
from django.utils.http import urlencode
from django.http import Http404
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from base.models import TurfDetails, Booking, Payment, CustomUser
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
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
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
            print(transaction_uuid)

            if payment_method == 'cash':
                booking = Booking.objects.create(
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

                # Store booking data in session
                booking_data['amount'] = 1
                request.session['booking_data'] = booking_data
                request.session.save()

                esewa_data = {
                    'amt': 1,
                    'txAmt': 0,
                    'psc': 0,
                    'pdc': 0,
                    'tAmt': 1,
                    'scd': 'EPAYTEST',  # Replace with your eSewa merchant ID
                    'pid': transaction_uuid,
                    'su': settings.ESEWA_SUCCESS_URL,
                    'fu': settings.ESEWA_FAILURE_URL,
                }

                esewa_redirect_url = 'https://uat.esewa.com.np/epay/main?' + urlencode(esewa_data)
                return JsonResponse({'redirectUrl': esewa_redirect_url}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse({'error': 'Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
def payment_success(request):
    if request.method == 'GET':
        product_code = 'EPAYTEST'
        total_amount = request.GET.get('amt')
        transaction_uuid = request.GET.get('oid')
        ref_id = request.GET.get('refId')

        if not product_code or not total_amount or not transaction_uuid:
            return HttpResponseBadRequest("Missing required parameters")

        try:
            esewa_verify_url = 'https://uat.esewa.com.np/api/epay/transaction/status/'
            params = {
                'product_code': product_code,
                'transaction_uuid': transaction_uuid,
                'total_amount': total_amount,
            }

            response = requests.get(esewa_verify_url, params=params)
            print(response)
            response_content = response.json()
            print(response_content)

            if 'status' in response_content and response_content['status'] == 'COMPLETE':
                booking_data = request.session.get('booking_data')

                if not booking_data:
                    return HttpResponseBadRequest("Booking data not found")

                booking = Booking.objects.create(
                    user_id=booking_data['user_id'],
                    turf_id=booking_data['turf_id'],
                    phone_number=booking_data['phone_number'],
                    date=booking_data['date'],
                    start_time=booking_data['start_time'],
                    end_time=booking_data['end_time'],
                    payment_status='Paid',
                    amount=booking_data['amount']
                )

                payment = Payment.objects.create(
                    booking=booking,
                    amount=total_amount,
                    payment_method='online',
                    phone_number=booking_data['phone_number']
                )

                del request.session['booking_data']
                request.session.save()

                frontend_success_url = 'http://localhost:5173/user/2/bookingHistory'  # Replace with your frontend success URL
                return redirect(frontend_success_url)

            return HttpResponseBadRequest("Payment verification failed")

        except Exception as e:
            return HttpResponseServerError(f"Error saving booking: {str(e)}")

    return HttpResponseBadRequest("Invalid HTTP method")


@api_view(['GET'])
def payment_failure(request):
    if 'booking_data' in request.session:
        del request.session['booking_data']
        request.session.save()

    return HttpResponseBadRequest("Payment Failed")


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
    

@api_view(['GET'])
def booking_history(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({'error': 'User ID is required'}, status=400)
    
    bookings = Booking.objects.filter(user_id=user_id).order_by('-booking_date')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)
