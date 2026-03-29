# Step 1: Use the official Node.js Alpine image
FROM node:20-alpine

# Step 2: Create an app directory
WORKDIR /usr/src/app

# Step 3: Copy package files first to leverage Docker cache
# This ensures 'npm install' only runs if dependencies change
COPY package*.json ./

# Step 4: Install production dependencies only
# 'ci' is faster and more reliable in container environments
RUN npm ci --only=production

# Step 5: Copy the rest of your source code
# Make sure your 'src' folder is in the same directory as the Dockerfile
COPY . .

# Step 6: Expose the port your app runs on
EXPOSE 3000

# Step 7: Run the application
# Using node directly instead of npm start saves memory
CMD ["node", "src/index.js"]