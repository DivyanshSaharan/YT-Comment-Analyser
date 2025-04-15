# Use the official Python image as the base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install OpenJDK 17 and other required packages
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    wget \
    libhdf5-dev \
    procps \
 && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME for JDK 17
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Upgrade pip
RUN pip install --upgrade pip setuptools

# Copy the requirements file into the container
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Copy the start script into the container (already included by previous line, so this is optional)
# COPY start.sh .

# Make the start script executable
RUN chmod +x start.sh
# Expose the port that your Flask app listens on
EXPOSE 5000

# Start the Flask app using the start script
CMD ["./start.sh"]
