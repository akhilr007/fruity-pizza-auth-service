# Use the official Node.js image as our base
FROM node:20.17.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package.lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of our app's source code into the container
COPY . .

# Expose the port the app will run on
EXPOSE 5555

# The command to run our app
CMD ["npm", "run", "dev"]