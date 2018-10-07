from django.urls import path

from . import views

app_name = 'bbxviewer'
urlpatterns = [
    path('',views.workbench, name='main'),
    path('info',views.fetch_total_image_number, name='fetch_total_image_number'),
    path('img/<int:imgno>',views.get_image, name='get_image'),
    path('fetchprogress/<int:imgno>',views.fetchprogress, name='fetchprogress'),

    
    
]