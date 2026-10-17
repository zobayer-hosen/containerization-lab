
# containerization-lab

Node.js (Express 5) register/login API backed by PostgreSQL, using JWT auth stored in an httpOnly cookie and bcrypt password hashing.

## Setup

```bash
npm install
cp .env.example .env      # then edit DATABASE_URL and JWT_SECRET
npm run migrate           # applies migrations/*.sql
npm start                 # or: npm run dev (auto-reload)
```

| Variable         | Required | Default | Example                                              |
| ---------------- | -------- | ------- | ---------------------------------------------------- |
| `DATABASE_URL`   | yes      |         | `postgres://postgres:postgres@localhost:5432/auth_db` |
| `JWT_SECRET`     | yes      |         | a long random string                                 |
| `PORT`           | no       | `3000`  |                                                      |
| `JWT_EXPIRES_IN` | no       | `1h`    | `15m`, `7d` (the cookie expires at the same time)    |
| `COOKIE_SECURE`  | no       | `false` | set `true` when served over HTTPS                    |

## Migrations

`npm run migrate` runs every `migrations/*.sql` file not yet listed in the `schema_migrations` table, in filename order, each in its own transaction. Running it again is a no-op. To add a migration, create the next numbered file, e.g. `002_add_something.sql`.

## API

| Method | Path                 | Auth   | Body                        |
| ------ | -------------------- | ------ | --------------------------- |
| GET    | `/health`            |        | (also checks the database)  |
| POST   | `/api/auth/register` |        | `{ name, email, password }` |
| POST   | `/api/auth/login`    |        | `{ email, password }`       |
| POST   | `/api/auth/logout`   |        |                             |
| GET    | `/api/auth/me`       | cookie |                             |

Register and login return `{ user }` and set a `token` cookie (`HttpOnly`, `SameSite=Lax`, `Path=/`). The browser sends it back automatically; browser JavaScript cannot read it. Logout clears it. The token is not included in the response body.

With curl, use a cookie jar (`-c` saves cookies, `-b` sends them):

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Zobayer","email":"zob@example.com","password":"secret123"}'

curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zob@example.com","password":"secret123"}'

curl -b cookies.txt http://localhost:3000/api/auth/me

curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/logout
```

From a browser frontend, send requests with `fetch(url, { credentials: "include" })`.

Errors: `400` validation or bad JSON, `401` wrong credentials, missing cookie or invalid/expired token, `409` email already registered.




docker image : this is the blueprint , it's instruction file how to run application all of this here in this docker image

docker Continer : it a enviroment , there executed the full application, and multiple container has to be possible

docker Hub : wich is stor the the image/image information

dokcerfile : instruction file, how to make docker image

volume : if the container delete the volume stores the imfortant imformation

Docker Network : the connection between others container

Docker Compose : use one compose file configure multiple container and run 

Doker Engin : aita docker a main software jeta container make and running kore

Docker Registry : saving the docker image ,ex: docker HUB

port mapping : connecting the port local to container , run anywhere

docker demon : dockerd background service which is execute the main work 


## ther  Docker client contacted the Docker daemon
## docker daemon pulled the "hello-world" image form the Docker HUb
## the daemon created a new container from that image which runs the executable that produces the output you are currently reading
## the Docker daemon steamed that output to the Docker client , which sent it to your rerminal 





