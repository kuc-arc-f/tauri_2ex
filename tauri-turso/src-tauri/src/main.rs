// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{ensure, Context, Result};
use dotenvy::dotenv;
use tauri::State;
use tauri::command;
use libsql::{Builder, Connection};
use libsql::params;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;
use std::sync::Mutex;

mod mod_chat;
mod mod_task;

// データ構造
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Item {
    pub id: i64,
    pub content: String,
    pub data: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewItem {
    pub name: String,
    pub description: String,
}

// データベース接続を管理する状態
pub struct DbState {
    pub conn: Mutex<Connection>,
}

// データベース初期化
pub async fn init_database(db_url: &str) -> Result<Connection, libsql::Error> {
    let db = Builder::new_remote(db_url.to_string(), "your-auth-token".to_string())
        .build()
        .await?;
    
    let conn = db.connect()?;
    
    // テーブル作成
    conn.execute(
      "CREATE TABLE IF NOT EXISTS todo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );",
        (),
    ).await?;
    
    Ok(conn)
}

// Tauriコマンド: アイテム追加
#[tauri::command]
async fn create_data(
    content: String,
    data: String,
) -> anyhow::Result<i64, String> {
  dotenv().ok();

  let url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
  let token = env::var("TURSO_AUTH_TOKEN").expect("TURSO_AUTH_TOKEN must be set");
  println!("TURSO_DATABASE_URL={}", url);
  let db = Builder::new_remote(url, token).build().await.unwrap();
  let conn = db.connect().unwrap();    
  println!("content={}", content);
  println!("data={}", data);
  let sql = format!("INSERT INTO {} (data) VALUES ( ?1 )", content);
  println!("sql={}", sql);

  conn.execute(
      &sql,
      params![data],
  ).await.map_err(|e| e.to_string())?;
  Ok(1)
}

#[tauri::command]
async fn list_data(
    content: String,
    order: String,
) -> anyhow::Result<String, i64> {
  dotenv().ok();

  let url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
  let token = env::var("TURSO_AUTH_TOKEN").expect("TURSO_AUTH_TOKEN must be set");
  println!("TURSO_DATABASE_URL={}", url);

  let db = Builder::new_remote(url, token).build().await.unwrap();
  let conn = db.connect().unwrap();    
  println!("content={}", content);
  println!("order_str={}", order);

  let mut order_sql = "ORDER BY created_at ASC";
  if order != "asc".to_string() {
      order_sql = "ORDER BY created_at DESC";
  }
  println!("order_sql={}", order_sql);
  let sql = format!("SELECT id, data ,created_at, updated_at 
  FROM {}
  {}
  "
  , content , order_sql
  );  

  let mut rows = conn.query(&sql,
      (),  // 引数なし
  ).await.unwrap();

  let mut todos: Vec<Item> = Vec::new();
  while let Some(row) = rows.next().await.unwrap() {
      let id: i64 = row.get(0).unwrap();
      let data: String = row.get(1).unwrap();
      //println!("{}: {} {}", id, content, data);
      todos.push(Item {
          id: id,
          content: content.clone(),
          data: data,
          created_at: row.get(2).unwrap(),
          updated_at: row.get(3).unwrap(),        
      });        
  }    
  //println!("todo {:?}", todos);
  let json_string_variable = serde_json::to_string(&todos).expect("JSON convert error");
  //println!("変換されたJSON文字列: {}", json_string_variable);

  Ok(json_string_variable.to_string())
}

// Tauriコマンド: アイテム追加
#[tauri::command]
async fn delete_data(
    content: String,
    id: i64,
) -> anyhow::Result<i64, String> {
  dotenv().ok();

  let url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
  let token = env::var("TURSO_AUTH_TOKEN").expect("TURSO_AUTH_TOKEN must be set");
  println!("TURSO_DATABASE_URL={}", url);
  let db = Builder::new_remote(url, token).build().await.unwrap();
  let conn = db.connect().unwrap();    
  println!("content={}", content);
  println!("id={}", id);
  let sql = format!("DELETE FROM {} WHERE id = {}", content, id);
  println!("sql={}", sql);
  conn.execute(
      &sql,
      (),
  ).await.map_err(|e| e.to_string())?;

  Ok(1)
}
#[tauri::command]
async fn update_data(
    id: i64,
    content: String,
    data: String,
) -> anyhow::Result<i64, String> {
  dotenv().ok();

  let url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
  let token = env::var("TURSO_AUTH_TOKEN").expect("TURSO_AUTH_TOKEN must be set");
  println!("TURSO_DATABASE_URL={}", url);
  let db = Builder::new_remote(url, token).build().await.unwrap();
  let conn = db.connect().unwrap();    
  println!("content={}", content);
  println!("data={}", data);

  //let now = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
  let sql = format!("UPDATE {} SET data = '{}' WHERE id = {}", content, data, id);
  println!("sql={}", sql);
  conn.execute(
      &sql,
      (),
  ).await.map_err(|e| e.to_string())?;
  Ok(1)
}


// Tauriコマンド: アイテム追加
#[tauri::command]
async fn chat_create_handler(postId: i64, content: String, data: String,
) -> anyhow::Result<i64, String> {
  println!("postId={}", postId);

  let resp = mod_chat::create_handler(postId, content, data).await?;
  Ok(1)
}

#[tauri::command]
async fn chat_list_handler(
    postId: i64,
    content: String,
    order: String,
) -> anyhow::Result<String, i64> {
  println!("postId={}", postId);

  let resp = mod_chat::list_handler(postId, content, order).await?;
  //println!("resp={}", resp);
  Ok(resp.to_string())
}

#[tauri::command]
async fn task_create(projectId: i64, content: String, data: String,
) -> anyhow::Result<i64, String> {
  println!("projectId={}", projectId);
  let project_id = projectId;

  let resp = mod_task::task_create_handler(project_id, content, data).await?;
  Ok(1)
}

#[tauri::command]
async fn task_list(
    projectId: i64,
    content: String,
    order: String,
) -> anyhow::Result<String, i64> {
  println!("projectId={}", projectId);
  let project_id = projectId;

  let resp = mod_task::task_list_handler(project_id, content, order).await?;
  Ok(resp.to_string())
}

#[tauri::command]
async fn task_delete(content: String, id: i64, 
) -> anyhow::Result<i64, String> {
  println!("id={}", id);
  let resp = mod_task::task_delete_handler(content, id).await?;
  Ok(1)
}

#[tauri::command]
async fn task_update(id: i64, content: String, data: String,
) -> anyhow::Result<i64, String> {

  let resp = mod_task::task_update_handler(id, data).await?;
  Ok(1)
}



fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_data,
            list_data,
            delete_data,
            update_data,
            chat_create_handler,
            chat_list_handler,
            task_create,
            task_list,
            task_delete,
            task_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");    
    tauri_turso_lib::run()
}
