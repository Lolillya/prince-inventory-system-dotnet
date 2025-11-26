# Use .NET SDK image for development with hot-reload
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /app/backend

# Copy project and restore dependencies
COPY backend/backend.csproj ./
RUN dotnet restore

# Copy the rest of the backend files
COPY backend/. ./

# Expose the port the app listens on
EXPOSE 5055

# Set up the entrypoint
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENTRYPOINT ["/bin/bash", "./docker-entrypoint.sh"]
CMD ["dotnet", "watch", "run", "--urls", "http://*:5055"]