from django.urls import path

from . import views

app_name = 'bbxviewer'
urlpatterns = [
    path('',views.main, name='main'),
    
    
]