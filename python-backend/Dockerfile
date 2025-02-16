# Use the official Python image as the base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install necessary system packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    wget \
    libhdf5-dev \
    libblas-dev \
    liblapack-dev \
    gfortran \
    && apt-get clean

# Upgrade pip
RUN pip install --upgrade pip setuptools

# Copy the requirements file into the container
COPY python-backend/requirements.txt .

# Install the required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY python-backend/ .

# Copy the start script into the container
COPY python-backend/start.sh .

# Make the start script executable
RUN chmod +x start.sh

# Expose the port that your Flask app listens on
EXPOSE 5000

# Start the Flask app using the start script
CMD ["./start.sh"]
