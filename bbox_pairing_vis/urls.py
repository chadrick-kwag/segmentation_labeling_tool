from django.urls import path

from . import views

app_name = 'bbox_pairing_vis'
urlpatterns = [
    path('',views.main, name='main'),
    path('info',views.fetch_total_image_number, name='fetch_total_image_number'),
    path('img/<int:imgno>',views.get_image, name='get_image'),
    path('fetchprogress/<int:imgno>',views.fetchprogress, name='fetchprogress'),
   

]