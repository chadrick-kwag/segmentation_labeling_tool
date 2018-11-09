from django.urls import path

from . import views

app_name = 'image_classifier'
urlpatterns = [
    path('',views.main, name='main'),
    path('info',views.fetch_total_image_number, name='fetch_total_image_number'),
    path('img/<int:imgno>',views.get_image, name='get_image'),
    path('fetchprogress/<int:imgno>',views.fetchprogress, name='fetchprogress'),
    path('saveprogress', views.save_progress, name='save_progress'),
    path('fetch_unlabeled_index',views.find_unlabeled_index, name='find_unlabeled_index'),
]