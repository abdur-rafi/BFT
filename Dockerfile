# Use the official Node.js image as a base
FROM node:alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code
# RUN npm run build

# Expose a dynamic port (to be set at runtime)
# EXPOSE ${PORT}

# Start the server
CMD ["npm", "start"]
