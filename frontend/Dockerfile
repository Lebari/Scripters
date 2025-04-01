FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Expose the port Vite will run on
EXPOSE 5173

# Start the application with host flag to make it accessible outside the container
CMD ["bun", "run", "dev", "--host"] 