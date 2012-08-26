# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
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
            ('location', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('continent_location', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('added_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('date', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal('visualization', ['Cluster'])

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
        # Deleting model 'Topic'
        db.delete_table('visualization_topic')

        # Deleting model 'Cluster'
        db.delete_table('visualization_cluster')

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
            'continent_location': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'date': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.URLField', [], {'max_length': '500'}),
            'is_local': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'relevancy': ('django.db.models.fields.IntegerField', [], {}),
            'topic': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visualization.Topic']"})
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