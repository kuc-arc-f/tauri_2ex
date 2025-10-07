
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{ensure, Context, Result};
use tauri::State;
use tauri::command;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use sqlx::{PgPool, Row};
//use sqlx::postgres::PgPoolOptions;
//use sqlx::FromRow;
use std::env;
use std::sync::Mutex;


#[derive(Debug, sqlx::FromRow)]
struct User {
    id: i32,
    name: String,
    email: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Item {
    pub id: i32,
    pub data: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
struct NewItem {
    name: String,
    description: Option<String>,
    price: Option<f64>,
}

struct AppState {
    pool: Pool<Postgres>,
}

static DATABASE_URL: &str = "postgres://postgres:admin@localhost/postgres";

// データベース接続の初期化
async fn init_db() -> Result<Pool<Postgres>, sqlx::Error> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(DATABASE_URL)
        .await?;

    // テーブル作成（存在しない場合）
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(&pool)
    .await?;

    Ok(pool)
}

// テーブル作成
#[tauri::command]
async fn create_table() -> anyhow::Result<i64, String> 
{
    let pool = PgPoolOptions::new().max_connections(5).connect(DATABASE_URL)
        .await.unwrap();

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE
        )
        "#
    )
    .execute(&pool)
    .await.unwrap();

    Ok(200)
}

#[tauri::command]
async fn list_data(
    content: String,
    order: String,
) -> anyhow::Result<String, String>{
    println!("content={}", content);
    println!("order={}", order);
    let pool = PgPoolOptions::new().max_connections(1).connect(DATABASE_URL)
    .await.expect("Failed to create pool");

    let sql = format!("SELECT id, data,
    to_char(created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') AS created_at ,
    to_char(updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') AS updated_at 
    FROM {} 
    ORDER BY created_at DESC;
    "
    , content
    );  
    println!("sql={}", sql);
    let rows = sqlx::query(&sql)
        .fetch_all(&pool)
        .await.map_err(|e| format!("データベースエラー: {}", e))?;

    let todoItems: Vec<Item> = rows
        .into_iter()
        .map(|row| Item {
            id: row.get("id"),
            data: row.get("data"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
        .collect();
    let out = serde_json::to_string(&todoItems).unwrap();

    Ok(out.to_string())        
}

#[tauri::command]
async fn create_data(
    content: String,
    data: String
) -> anyhow::Result<i64, String>{
    println!("content={}", content);
    println!("data={}", data);
    let sql = format!("INSERT INTO {} (data) VALUES ( '{}' )", content, data);
    println!("sql={}", sql);
    let pool = PgPoolOptions::new().max_connections(1).connect(DATABASE_URL)
    .await.expect("Failed to create pool");

    let result = sqlx::query(
        &sql,
    )
    //.bind(&data)
    .execute(&pool)
    .await
    .map_err(|e| format!("データベースエラー: {}", e))?;
    Ok(200)
}

#[tauri::command]
async fn update_data(
    id: i32,
    content: String,
    data: String
) -> anyhow::Result<i64, String>{
    println!("content={}", content);
    println!("data={}", data);
    let sql = format!("UPDATE {} SET data = '{}' WHERE id = {}", content, data, id);
    println!("sql={}", sql);

    let pool = PgPoolOptions::new().max_connections(1).connect(DATABASE_URL)
    .await.expect("Failed to create pool");

    let result = sqlx::query(
        &sql,
    )
    .execute(&pool)
    .await
    .map_err(|e| format!("データベースエラー: {}", e))?;
    Ok(200)
}

#[tauri::command]
async fn delete_data(
    content: String,
    id: i32,
) -> anyhow::Result<i64, String>{
    println!("content={}", content);
    let sql = format!("DELETE FROM {} WHERE id = {}", content, id);
    println!("sql={}", sql);

    let pool = PgPoolOptions::new().max_connections(1).connect(DATABASE_URL)
    .await.expect("Failed to create pool");

    let result = sqlx::query(
        &sql,
    )
    .execute(&pool)
    .await
    .map_err(|e| format!("データベースエラー: {}", e))?;
    Ok(200)
}

//#[tokio::main]
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_data,
            list_data,
            delete_data,
            update_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");    
    tauri_pg_lib::run()
}
