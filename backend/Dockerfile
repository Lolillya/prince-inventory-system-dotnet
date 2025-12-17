FROM mcr.microsoft.com/dotnet/sdk:9.0 AS base

# Separate working directory for source code
WORKDIR /src

# Install debugger
RUN apt-get update && apt-get install -y unzip && \
    curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg

# Copy only csproj first for layer caching
COPY backend/backend.csproj .
RUN dotnet restore

# Copy everything else
COPY backend/. .

# Expose for app and debugger
EXPOSE 5055

# Copy entrypoint
COPY backend/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
