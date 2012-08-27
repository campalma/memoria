# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Continent'
        db.create_table('visualization_continent', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
        ))
        db.send_create_signal('visualization', ['Continent'])

        # Adding model 'Location'
        db.create_table('visualization_location', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
        ))
        db.send_create_signal('visualization', ['Location'])

        # Adding model 'Topic'
        db.create_table('visualization_topic', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('short_name', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('color', self.gf('django.db.models.fields.CharField')(max_length=7)),
        ))
        db.send_create_signal('visualization', ['Topic'])

        # Adding model 'Cluster'
        db.create_table('visualization_cluster', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('image', self.gf('django.db.models.fields.URLField')(max_length=500)),
            ('relevancy', self.gf('django.db.models.fields.IntegerField')()),
            ('is_local', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('topic', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['visualization.Topic'])),
            ('added_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('date', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal('visualization', ['Cluster'])

        # Adding M2M table for field location on 'Cluster'
        db.create_table('visualization_cluster_location', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('cluster', models.ForeignKey(orm['visualization.cluster'], null=False)),
            ('location', models.ForeignKey(orm['visualization.location'], null=False))
        ))
        db.create_unique('visualization_cluster_location', ['cluster_id', 'location_id'])

        # Adding M2M table for field continent_location on 'Cluster'
        db.create_table('visualization_cluster_continent_location', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('cluster', models.ForeignKey(orm['visualization.cluster'], null=False)),
            ('continent', models.ForeignKey(orm['visualization.continent'], null=False))
        ))
        db.create_unique('visualization_cluster_continent_location', ['cluster_id', 'continent_id'])

        # Adding model 'Article'
        db.create_table('visualization_article', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=500)),
            ('location', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('publisher', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('content', self.gf('django.db.models.fields.CharField')(max_length=1000)),
            ('published_date', self.gf('django.db.models.fields.DateTimeField')()),
            ('added_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('cluster', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['visualization.Cluster'])),
        ))
        db.send_create_signal('visualization', ['Article'])


    def backwards(self, orm):
        # Deleting model 'Continent'
        db.delete_table('visualization_continent')

        # Deleting model 'Location'
        db.delete_table('visualization_location')

        # Deleting model 'Topic'
        db.delete_table('visualization_topic')

        # Deleting model 'Cluster'
        db.delete_table('visualization_cluster')

        # Removing M2M table for field location on 'Cluster'
        db.delete_table('visualization_cluster_location')

        # Removing M2M table for field continent_location on 'Cluster'
        db.delete_table('visualization_cluster_continent_location')

        # Deleting model 'Article'
        db.delete_table('visualization_article')


    models = {
        'visualization.article': {
            'Meta': {'object_name': 'Article'},
            'added_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'cluster': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visualization.Cluster']"}),
            'content': ('django.db.models.fields.CharField', [], {'max_length': '1000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'published_date': ('django.db.models.fields.DateTimeField', [], {}),
            'publisher': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '500'})
        },
        'visualization.cluster': {
            'Meta': {'object_name': 'Cluster'},
            'added_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'continent_location': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['visualization.Continent']", 'symmetrical': 'False'}),
            'date': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.URLField', [], {'max_length': '500'}),
            'is_local': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'location': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['visualization.Location']", 'symmetrical': 'False'}),
            'relevancy': ('django.db.models.fields.IntegerField', [], {}),
            'topic': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visualization.Topic']"})
        },
        'visualization.continent': {
            'Meta': {'object_name': 'Continent'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'visualization.location': {
            'Meta': {'object_name': 'Location'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'visualization.topic': {
            'Meta': {'object_name': 'Topic'},
            'color': ('django.db.models.fields.CharField', [], {'max_length': '7'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'short_name': ('django.db.models.fields.CharField', [], {'max_length': '500'})
        }
    }

    complete_apps = ['visualization']