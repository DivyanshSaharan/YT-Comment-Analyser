#!/bin/bash
export TF_ENABLE_ONEDNN_OPTS=0
exec gunicorn -b 0.0.0.0:5000 --timeout 10000 app:app