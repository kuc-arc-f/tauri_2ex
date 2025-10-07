# tauri-pg

 Version: 0.9.1

 Author  : 

 date    : 2025/10/04

 update  :

***
### Summary

Tauri Rust , Postgres database example

***
* table : table.sql

```
create table todo(
  "id" SERIAL NOT NULL,
  data TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

```

***
* dev-start
```
npm run tauri dev
```

***

