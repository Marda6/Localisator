#!/bin/sh
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
    exec python3 start_local.py
fi
printf '%s\n' 'Python 3 was not found. Open localisator.html directly, or install Python 3.'
exit 1
