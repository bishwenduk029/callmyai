# Stage 1: Clone pipecat
FROM python:3.11-bullseye AS pipecat-builder
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/pipecat-ai/pipecat /pipecat

# Stage 2: Main application
FROM python:3.11-bullseye

# Open port 7860 for http service
ENV FAST_API_PORT=7860
EXPOSE 7860

# Set working directory
WORKDIR /app

# Copy your current project files
COPY *.py .
COPY requirements.txt .

# Copy pipecat from the builder stage
COPY --from=pipecat-builder /pipecat /pipecat

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Install pipecat with specific extras
RUN pip install "/pipecat[daily,openai,deepgram]" python-multipart

# Install models
RUN python install_deps.py

# Start the FastAPI server
CMD python bot_runner.py --port ${FAST_API_PORT}