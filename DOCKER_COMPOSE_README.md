 # Docker Compose — frontend + backend + database

This repository includes Dockerfiles and a `docker-compose.yml` to run the frontend (Vite), backend (ASP.NET Core) and a Microsoft SQL Server (`mcr.microsoft.com/mssql/server`) for local development.

**Prerequisites**
- **Docker**: install Docker Engine and Docker Compose on your machine.
- **.env**: create a `.env` file at the repository root with at least a `DB_PASSWORD` value. Example:

```env
DB_PASSWORD=yourStrong(!)Password123
```

**Important files**
- `docker-compose.yml`: orchestrates `db`, `backend`, and `frontend` services.
- `backend/Dockerfile`: builds the .NET SDK image, copies the backend, restores tools, runs EF migrations and starts the app with hot-reload.
- `backend/docker-entrypoint.sh`: entrypoint that runs `dotnet tool restore`, retries `dotnet ef database update` until success, then starts `dotnet watch run`.
- `frontend/Dockerfile`: builds or runs the Vite frontend (dev server by default).

**Ports**
- Frontend: `http://localhost:8080` (host) -> `3000` (container Vite dev server)
- Backend: `http://localhost:5055` (host) -> `5055` (container)
- SQL Server: `1433` (host and container)

Quick start
1. Ensure `.env` exists and contains `DB_PASSWORD`.
2. Build and run the full stack (detached):

```bash
docker-compose up --build -d
```

3. Follow logs:

```bash
docker-compose logs -f backend frontend db
```

4. Open the frontend: `http://localhost:8080`

How migrations are applied
- The `backend` image includes an entrypoint script that runs `dotnet tool restore` (so `dotnet-ef` is available) and runs `dotnet ef database update` in a retry loop. When migrations succeed the backend is started with `dotnet watch run`.
- If automatic migration fails due to missing tools, you can run migrations manually from the host (if you have the .NET SDK) from the `backend` folder:

```bash
cd backend
dotnet tool restore
dotnet ef database update
```

Or run migrations inside a container (one-shot):

```bash
docker-compose run --rm backend dotnet ef database update --project backend/backend.csproj --startup-project backend/backend.csproj
```

Persistent data (optional)
- By default the SQL Server container has no named volume; to persist data across restarts add a volume in `docker-compose.yml`:

```yaml
	db:
		image: mcr.microsoft.com/mssql/server:2019-latest
		volumes:
			- mssql-data:/var/opt/mssql
		environment:
			SA_PASSWORD: "${DB_PASSWORD}"
			ACCEPT_EULA: "Y"

volumes:
	mssql-data:
```

Development tips
- To enable live edit/hot-reload from your host files, mount the backend source into the container by adding a volume to the `backend` service in `docker-compose.yml`:

```yaml
	backend:
		volumes:
			- ./backend:/app/backend:cached
```

- The frontend Dockerfile currently runs the Vite dev server and maps host `8080` to container `3000`. If you'd prefer a production build served by Nginx, update the `frontend/Dockerfile` to use the multi-stage build and serve `/dist`.

Common troubleshooting
- If you see `Could not find a MSBuild project file in '/app'`: make sure the `backend` Dockerfile sets `WORKDIR /app/backend` and copies the `backend` project files (already configured in this repo).
- If `dotnet-ef` is not found: run `dotnet tool restore` (inside container or locally) or add `dotnet tool install --global dotnet-ef` to the Dockerfile and add `~/.dotnet/tools` to `PATH`.
- Check service health and ports:

```bash
docker-compose ps
curl -I http://localhost:8080
curl -I http://localhost:5055
```

- Inspect container files and run commands interactively:

```bash
docker-compose exec backend bash
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD"
```

Security note
- Never commit the `.env` file to source control. Use a secure password for `SA_PASSWORD`.

Stopping and cleaning up

```bash
docker-compose down
# To remove volumes (data):
docker-compose down -v
```

If you want any of the following changes I can make them for you:
- Add a named volume for SQL Server data persistence.
- Install `dotnet-ef` at image build time.
- Add a separate one-shot `migrations` service in `docker-compose.yml`.
- Update `frontend` to serve a production build with Nginx instead of the Vite dev server.

---
Created for this repository to explain how to run Docker Compose and apply EF Core migrations automatically.



---
BEFORE LOGGIN IN, ADD A NEW USER BY REGESTERING A NEW ACCOUNT USING POSTMAN at http://localhost:5055/api/auth/register

use the following json body
{
    "username": "admin1",
    "email": "admin1@example.com",
    "password": "P@ssword_000",
    "notes": "sample note",
    "companyName": "Admin Corp",
    "firstName": "Jane",
    "lastName": "Doe",
    "phoneNumber": "09999999999",
    "RoleID": "1"
}

username: admin1
password: P@ssword_000

