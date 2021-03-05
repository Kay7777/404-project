# Generated by Django 3.1.6 on 2021-03-05 00:38

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_delete_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='', max_length=100)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='categories', to='api.author')),
                ('posts', models.ManyToManyField(blank=True, related_name='categories', to='api.Post')),
            ],
            options={
                'verbose_name_plural': 'categories',
            },
        ),
    ]
