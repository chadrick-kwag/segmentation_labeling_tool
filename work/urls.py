from django.urls import path

from . import views

app_name = 'work'
urlpatterns = [
    path('index', views.index, name='index'),
    path('',views.main, name='main')
]