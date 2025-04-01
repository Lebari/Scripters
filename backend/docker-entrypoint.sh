#!/bin/bash
set -e

# Find all Python files and fix imports
find /app -type f -name "*.py" -print0 | xargs -0 sed -i 's/from backend\./from /g'
find /app -type f -name "*.py" -print0 | xargs -0 sed -i 's/import backend\./import /g'

# Execute the CMD
exec "$@" 