from django.urls import path

from . import views

app_name = 'work'
urlpatterns = [
    path('index', views.index, name='index'),
    path('',views.main, name='main'),
    path('info', views.fetch_image_numbers,name='info'),
    path('img/<int:imgno>', views.fetch_image, name='fetchimg'),
    path('saveprogress', views.saveprogress, name='saveprogress'),
    path('fetchprogress/<int:imgno>', views.fetchprogress, name='fetchprogress'),
    path('convert',views.launch_conversion, name='launchconversion')
]