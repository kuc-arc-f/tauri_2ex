# authorize

 Version: 0.9.1

 Author  : 

 date    : 2025/10/04

 update  :

***
### Summary

authorize , Tauri Rust + Turuso database + libsql


***
### setup
* .env

```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```
***
* table : scheme.sql

```
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
```

***
* dev-start
```
npm run tauri dev
```

* build
```
npm run tauri build
```

***

