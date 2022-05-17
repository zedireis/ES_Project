from django.contrib import admin
from users.models import User
from kitchen.models import Food
from django.contrib.auth.admin import UserAdmin
# Register your models here.

class ClientAdmin(admin.ModelAdmin):
    list_filter = ('role',)
    fields = ['name', 'email', 'password', 'role']

admin.site.register(User, ClientAdmin)

admin.site.register(Food)