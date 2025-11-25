# Use .NET SDK image for development with hot-reload
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /app/backend

# Copy only the project file first so restore is cached
COPY backend/backend.csproj ./
RUN dotnet restore "backend.csproj"

# Copy backend source and build
COPY backend/. ./
RUN dotnet build "backend.csproj" -c Debug

# Expose the port the app listens on
EXPOSE 5055

# Copy and install entrypoint which will run migrations then start the app
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENTRYPOINT ["/bin/bash", "./docker-entrypoint.sh"]