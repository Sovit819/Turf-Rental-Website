
from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, TurfDetails, TurfImage
from django.forms import inlineformset_factory


# Custom User Admin
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'is_staff', 'is_active', 'phone_number')
    list_filter = ('email', 'username', 'is_staff', 'is_active',)
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_active', 'phone_number')}
        ),
    )
    search_fields = ('email', 'username',)
    ordering = ('email',)

admin.site.register(CustomUser, CustomUserAdmin)

#Turf Details
class TurfDetailsAdminForm(forms.ModelForm):
    class Meta:
        model = TurfDetails
        fields = '__all__'

TurfImageFormSet = inlineformset_factory(
    TurfDetails, TurfImage, fields=('image',), extra=1, can_delete=True
)

class TurfImageInline(admin.TabularInline):
    model = TurfImage
    formset = TurfImageFormSet
    extra = 1

@admin.register(TurfDetails)
class TurfDetailsAdmin(admin.ModelAdmin):
    form = TurfDetailsAdminForm
    inlines = [TurfImageInline]

    list_display = ('name', 'price')
    search_fields = ('name',)
    list_filter = ('price',)

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'price')
        }),
    )