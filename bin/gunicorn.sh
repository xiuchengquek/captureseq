#!/bin/bash

NAME="captureseq"                                  # Name of the application
DJANGODIR=/home/xiuque/captureseq/captureseq
SOCKFILE=/home/xiuque/captureseq/captureseq/gunicorn.sock
USER=www-data
GROUP=www-data                                     # the group to run as
NUM_WORKERS=3                                     # how many worker processes should Gunicorn spawn
DJANGO_SETTINGS_MODULE=captureseq.settings             # which settings file should Django use
DJANGO_WSGI_MODULE=captureseq.wsgi                     # WSGI module name
GUNICORN=/home/xiuque/captureseq/env/bin/gunicorn


# Activate the virtual environment
cd $DJANGODIR
. /home/xiuque/captureseq/env/bin/activate
export DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
export PYTHONPATH=$DJANGODIR:$PYTHONPATH
pwd

# Create the run directory if it doesn't exist
RUNDIR=$(dirname $SOCKFILE)
test -d $RUNDIR || mkdir -p $RUNDIR

# Start your Django Unicorn
# Programs meant to be run under supervisor should not daemonize themselves (do not use --daemon)
exec gunicorn ${DJANGO_WSGI_MODULE}:application \
  --workers $NUM_WORKERS \
  -u www-data --group=$GROUP \
  --bind=unix:${SOCKFILE} \
  --log-level=debug \
  --log-file=/home/xiuque/captureseq/captureseq/gunicorn.log
