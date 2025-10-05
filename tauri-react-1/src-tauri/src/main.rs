// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::command;
use serde::{Deserialize, Serialize};
use reqwest::Error;
use serde_json::json;
use serde_json::Value;

// Learn more about Tauri commands at https://v1.tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
async fn post_external_api(url: String, data: String) -> String {
  let client = reqwest::Client::new();

  // JSON文字列をValue型にデコード
  let value: Value = serde_json::from_str(&data).expect("REASON");
  println!("data={}", data );
  println!("url={}", url );
  println!("value={:?}", &value );
  //return "".to_string();

  // POSTリクエストを送信
  let response: Result<reqwest::Response, Error> = client.post(url)
      .json(&value)
      .send()
      .await;
  // ステータスコードを取得
  //println!("Response: {}", body);
  //println!("response: {:?}", response);
  match response {
    Ok(resp) => {
        let status = resp.status();
        println!("HTTP Status: {}", status.to_string());

        if status.is_success() {
            println!("Request was successful!");
            let body = resp.text().await.unwrap();
            //println!("Response.body: {}", body);
            let payload = json!({
              "status": 200,
              "body": &body.to_string()
            });
            //println!("payload: {}", payload);
            return payload.to_string();
        } else if status.is_client_error() {
            println!("Client error occurred!");
            let body = resp.text().await.unwrap();
            let payload = json!({
              "status": 400,
              "body": &body.to_string()
            });
            return payload.to_string();
        } else if status.is_server_error() {
            println!("Server error occurred!");
            let body = resp.text().await.unwrap();
            let payload = json!({
              "status": 500,
              "body": &body.to_string()
            });
            return payload.to_string();
        }
    }
    Err(err) => {
        eprintln!("Request failed: {}", err);
    }
  }
  return "".to_string();
}


#[command]
async fn get_external_api(url: String) -> String {
  println!("url={}", url );
  let client = reqwest::Client::new();

  // GETリクエストを送信
  let response = client.get(url).send().await;
  //println!("response: {:?}", response);
  // HTTPステータスコードを取得
  match response {
    Ok(resp) => {
      let status = resp.status();
      println!("HTTP Status: {}", status.to_string());
      if status.is_success() {
        println!("Request was successful!");
        let body = resp.text().await.unwrap();
        println!("Response.body: {}", body);
        let payload = json!({
          "status": 200,
          "body": &body.to_string()
        });
        //println!("payload: {}", payload);
        return payload.to_string();
      } else if status.is_client_error() {
        println!("Client error occurred!");
        let body = resp.text().await.unwrap();
        let payload = json!({
          "status": 400,
          "body": &body.to_string()
        });
        return payload.to_string();
      } else if status.is_server_error() {
        println!("Server error occurred!");
        let body = resp.text().await.unwrap();
        let payload = json!({
          "status": 500,
          "body": &body.to_string()
        });
        return payload.to_string();
      }
    }
    Err(err) => {
        eprintln!("Request failed: {}", err);
    }
  }
  return "".to_string();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![post_external_api, get_external_api, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
