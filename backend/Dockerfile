FROM mcr.microsoft.com/dotnet/sdk:9.0

# Separate working directory for source code
WORKDIR /src

# Copy only csproj first for layer caching
COPY backend/backend.csproj .
RUN dotnet restore

# Copy everything else
COPY backend/. .

# Expose for app
EXPOSE 5055

# Copy entrypoint
COPY backend/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
