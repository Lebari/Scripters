FROM python:3.11-slim

# Use the proper working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make the entrypoint script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port for Flask
EXPOSE 5000

# Set Flask environment variables to match local development
ENV FLASK_APP=run.py
ENV FLASK_ENV=development
ENV FLASK_DEBUG=1
# In Docker, we are in /app directory so we don't need backend prefix
ENV PYTHONPATH=/app
ENV IN_DOCKER=true

# Use the entrypoint script to fix imports and then run the application
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["python", "run.py"] 