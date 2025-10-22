
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Item {
    pub id: i64,
    pub projetc_id: i64,
    pub data: String,
    pub created_at: String,
    pub updated_at: String,
}


/**
*
* @param
*
* @return
*/
#[tauri::command]
pub async fn task_create_handler(
    project_id: i64,
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
  let sql = "INSERT INTO task_item (project_id, data) VALUES ( ?1, ?2 )";
  println!("sql={}", sql);

  conn.execute(
      &sql,
      params![project_id, data ],
  ).await.map_err(|e| e.to_string())?;
  Ok(1)
}

/**
*
* @param
*
* @return
*/
#[tauri::command]
pub async fn task_list_handler(
    project_id: i64,
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
  println!("project_id={}", project_id);

  let mut order_sql = "ORDER BY created_at ASC";
  if order != "asc".to_string() {
      order_sql = "ORDER BY created_at DESC";
  }
  println!("order_sql={}", order_sql);
  let sql = format!("SELECT id, data ,created_at, updated_at 
  FROM task_item
  WHERE project_id = {}
  {}
  "
  ,  project_id, order_sql
  );  

  let mut rows = conn.query(&sql,
      (),  // 引数なし
  ).await.unwrap();

  let mut todos: Vec<Item> = Vec::new();
  while let Some(row) = rows.next().await.unwrap() {
      let id: i64 = row.get(0).unwrap();
      let data: String = row.get(1).unwrap();
      todos.push(Item {
          id: id,
          projetc_id: project_id,
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

/**
*
* @param
*
* @return
*/
#[tauri::command]
pub async fn task_delete_handler(
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
  let sql = format!("DELETE FROM task_item WHERE id = {}", id);
  println!("sql={}", sql);
  conn.execute(
      &sql,
      (),
  ).await.map_err(|e| e.to_string())?;

  Ok(1)
}

/**
*
* @param
*
* @return
*/
#[tauri::command]
pub async fn task_update_handler(
    id: i64,
    data: String,
) -> anyhow::Result<i64, String> {
  dotenv().ok();

  let url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
  let token = env::var("TURSO_AUTH_TOKEN").expect("TURSO_AUTH_TOKEN must be set");
  println!("TURSO_DATABASE_URL={}", url);
  let db = Builder::new_remote(url, token).build().await.unwrap();
  let conn = db.connect().unwrap();    
  println!("data={}", data);

  let sql = format!("UPDATE task_item SET data = '{}' WHERE id = {}",  data, id);
  println!("sql={}", sql);
  conn.execute(
      &sql,
      (),
  ).await.map_err(|e| e.to_string())?;
  Ok(1)
}