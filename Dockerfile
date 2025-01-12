# Use an official Node.js runtime as a parent image
FROM node:alpine

# Set the working directory in the container
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Copy package.json and package-lock.json files
COPY qr-code-generator/package*.json ./

COPY qr-code-generator/tailwind.config.js ./

# Install the application's dependencies (only production dependencies)
RUN npm install --only=production

# Copy the rest of the application code
COPY qr-code-generator/src ./src
COPY qr-code-generator/public ./public

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]