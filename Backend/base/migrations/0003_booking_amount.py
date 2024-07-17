# Generated by Django 5.0.6 on 2024-07-06 03:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_alter_customuser_phone_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='amount',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
    ]
