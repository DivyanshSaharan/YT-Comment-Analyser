#!/bin/bash
exec gunicorn -b 0.0.0.0:5000 --timeout 10000 app:app