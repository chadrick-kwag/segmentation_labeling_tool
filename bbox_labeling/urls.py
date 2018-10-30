from django.urls import path

from . import views

app_name = 'bbx_labeling'
urlpatterns = [
    path('',views.main, name='main'),
    path('/info',views.fetch_total_image_number, name='fetch_total_image_number'),
    path('/img/<int:imgno>',views.get_image, name='get_image'),
    path('/fetchprogress/<int:imgno>',views.fetchprogress, name='fetchprogress'),
    path('/save', views.save_progress, name="save_progress"),
    path('/convert', views.convert_test, name="convert_test")

]