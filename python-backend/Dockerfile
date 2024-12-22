# Use the official Python image with Python 3.10
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip setuptools

# Copy the requirements file into the container
COPY requirements.txt .

# Install the required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port that your Flask app listens on
EXPOSE 5000

# Start the Flask app
CMD ["python", "app.py"]
