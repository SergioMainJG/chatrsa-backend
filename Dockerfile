
# Use the official Deno image
FROM denoland/deno:latest

# Set the working directory
WORKDIR /app

# Copy the dependency manifests
COPY deno.json deno.lock ./

# Cache the dependencies
RUN deno cache src/main.ts --lock=deno.lock

# Copy the rest of the application code
COPY . .

# Expose the port the application will run on
EXPOSE 3000

# Environment variables
ENV PROD=false
ENV PORT=3000
ENV PATH_DATABASE=/app/var/data/
ENV DATABASE=chat-rsa-database.db
ENV TABLE_USER=Users
ENV TABLE_MESSAGE=Messages
ENV JWT_SEED="KM34-2IO%5--.32S8_.DIKL'M12!40EFD:::S09123KL123"

# Define the command to run the application
CMD ["deno", "run", "--allow-net", "--allow-write", "--allow-read", "--allow-env", "--allow-ffi", "src/main.ts"]
