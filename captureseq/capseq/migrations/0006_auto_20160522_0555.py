# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-05-22 05:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('capseq', '0005_snpspecificlocation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='snpspecificlocation',
            name='end',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='snpspecificlocation',
            name='start',
            field=models.IntegerField(),
        ),
    ]
