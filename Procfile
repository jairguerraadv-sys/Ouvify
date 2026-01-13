web: cd ouvy_saas && python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --workers 2 --log-level info
