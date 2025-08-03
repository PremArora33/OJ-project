# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# ✅ Install compilers/interpreters
RUN apt-get update && \
    apt-get install -y build-essential python3 default-jdk && \
    apt-get clean

# Optional: Set JAVA_HOME if needed
ENV JAVA_HOME /usr/lib/jvm/default-java
ENV PATH $JAVA_HOME/bin:$PATH

# Copy source code
COPY . .

# Expose app port
EXPOSE 8000

# Start the app
CMD ["npm", "start"]
