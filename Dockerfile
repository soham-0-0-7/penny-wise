# Use Node.js 20 base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install deps
# RUN cd penny-wise
COPY package*.json ./

RUN npm install

# Copy the rest of the app
COPY . .

# Build Next.js app

RUN npm run build

# Expose default port
EXPOSE 3000

# Run app with environment variables
CMD ["sh", "-c", "ACCESS_KEY=$ACCESS_KEY SECRET_KEY=$SECRET_KEY npm start"]
