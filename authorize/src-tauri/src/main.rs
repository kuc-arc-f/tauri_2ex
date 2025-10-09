// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use anyhow::{ensure, Context, Result};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{SaltString, PasswordHash, rand_core::OsRng};
use dotenvy::dotenv;
use tauri::State;
use tauri::command;
use libsql::{Builder, Connection};
use libsql::params;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;
use std::error::Error;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct User {
    id: i64,
    name: String,
    email: String,
    password: String,
}

/// パスワードをハッシュ化して PHC 文字列を返す（DB にこの文字列を保存）
fn hash_password(password: &str) -> anyhow::Result<String, String> {
    let argon2 = Argon2::default();

    // ランダムソルト生成
    let salt = SaltString::generate(&mut OsRng);

    // ハッシュを生成して PHC 形式の文字列にする（例: $argon2id$v=19$m=4096,t=3,p=1$...）
    let password_hash = argon2.hash_password(password.as_bytes(), &salt)
    .expect("error , hash_password");

    Ok(password_hash.to_string())
}

/// 入力パスワードが保存されたハッシュ（PHC 文字列）と一致するか検証
fn verify_password(password: &str, stored_phc: &str) -> anyhow::Result<bool, String> 
{
    let argon2 = Argon2::default();
    let parsed_hash = PasswordHash::new(stored_phc).expect("error , PasswordHash::new2);");
    match argon2.verify_password(password.as_bytes(), &parsed_hash) {
        Ok(()) => Ok(true),
        Err(argon2::password_hash::Error::Password) => Ok(false), // パスワード不一致
        Err(e) => Err("error, argon2.verify_password".to_string()), // その他エラー
    }
}

#[tauri::command]
async fn user_create(
    name : String, email: String, password: String,
) -> anyhow::Result<i64, String> {
  dotenv().ok();

  let url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
  let token = env::var("TURSO_AUTH_TOKEN").expect("TURSO_AUTH_TOKEN must be set");
  println!("TURSO_DATABASE_URL={}", url);
  let db = Builder::new_remote(url, token).build().await.unwrap();
  let conn = db.connect().unwrap();   

  let phc = hash_password(&password).expect("error , hash_password");
  println!("store this in DB: {}", phc);

  let sql = "INSERT INTO user (name, email, password) VALUES ( ?1 , ?2, ?3)";
  println!("sql={}", sql);

  conn.execute(
      &sql,
      params![name, email.clone(), phc],
  ).await.map_err(|e| e.to_string())?;

  let selectSql = "SELECT id, name , email , password FROM user WHERE email = ?1";
  println!("sql={}", selectSql);
  let mut rows = conn.query(&selectSql,
      params![email.clone()],
  ).await.unwrap();

  let mut db_id: i64 = 0;
  let mut count = 0;
  while let Some(row) = rows.next().await.unwrap() {
      let id: i64 = row.get(0).unwrap();
      db_id = id;
      count = count + 1;
  }  
  println!("count={} db_id={}", count, db_id);
  if count == 0 {
    return Err("error , user count= 0 Login failed".to_string());
  }  
  Ok(db_id)
}

#[tauri::command]
async fn user_login(
    email: String, password: String,
) -> anyhow::Result<i64, String> {
  dotenv().ok();

  let url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
  let token = env::var("TURSO_AUTH_TOKEN").expect("TURSO_AUTH_TOKEN must be set");
  println!("TURSO_DATABASE_URL={}", url);
  let db = Builder::new_remote(url, token).build().await.unwrap();
  let conn = db.connect().unwrap(); 
  println!("password={}", password);

  let sql = "SELECT id, name , email , password FROM user WHERE email = ?1";
  println!("sql={}", sql);
  let mut db_passwd: String = "".to_string();
  let mut db_email: String = "".to_string();
  let mut db_id: i64 = 0;

  let mut rows = conn.query(&sql,
      params![email],
  ).await.unwrap();

  let mut count = 0;
  while let Some(row) = rows.next().await.unwrap() {
      let id: i64 = row.get(0).unwrap();
      let name: String = row.get(1).unwrap();
      let row_email: String = row.get(2).unwrap();
      let row_passwd: String = row.get(3).unwrap();
      db_id = id;
      db_email = row_email;
      db_passwd = row_passwd;
      count = count + 1;
  }    
  println!("count={} db_id={}", count, db_id);
  if count == 0 {
    return Err("error , user count= 0 Login failed".to_string());
  }  
  println!("db_email={}", db_email);  

    // ログイン時
  let ok = verify_password(&password, &db_passwd).expect("error , veryfy password");
  println!("password ok? {}", ok);
  if ok == false {
    return Err("error , Login failed".to_string()); 
  }

  Ok(db_id)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            user_create,
            user_login,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");    

    authorize_lib::run()
}
