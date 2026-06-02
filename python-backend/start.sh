#!/bin/bash
export TF_ENABLE_ONEDNN_OPTS=0
PORT=${PORT:-5000}
exec gunicorn -b 0.0.0.0:$PORT --timeout 10000 app:app