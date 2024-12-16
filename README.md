# Oath

Dead-simple self-hosted authentication service for side projects.

- Vercel Serverless API (Maybe I'll make this more generic, it's just 3 HTTP endpoints)
- Redis for storage
- `bcrypt` for password hashing
- `jsonwebtoken` for JWT


# Flow
## Authentication
### Register
- User calls `/register` with email and password from Webapp
- API hashes password and stores email and hashed password in Redis
- API returns JWT
- User stores JWT in local storage or cookie

### Login
- User calls `/login` with email and password
- API checks if email exists in Redis
- API compares hashed password with stored hashed password
- API returns JWT if password is correct

## Authorization
### Validate
- Your Application Server receives a request from a client with a JWT
- Your Application Server calls the `/validate` API endpoint with JWT
- API checks if JWT is valid
- API returns 200 if valid, 401 if invalid
- TODO: Check roles / scopes / permission to make this real authorization
- Your Application Server can now trust the client request and proceed.
