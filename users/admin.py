from django.contrib import admin
from users.models import User
from django.contrib.auth.admin import UserAdmin
# Register your models here.

class ClientAdmin(admin.ModelAdmin):
    list_filter = ('role',)
    fields = ['name', 'email', 'password', 'role']

admin.site.register(User, ClientAdmin)
