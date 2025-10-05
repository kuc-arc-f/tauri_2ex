# tauri-turso

 Version: 0.9.1

 Author  : 

 date    : 2025/10/04

 update  :

***
### Summary

Tauri Rust , Turuso database + libsql

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
CREATE TABLE IF NOT EXISTS todo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
***
* dev-start
```
npm run tauri dev
```

***

