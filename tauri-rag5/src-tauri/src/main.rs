// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use anyhow::{ensure, Context, Result};
use bytemuck::{cast_slice, Pod, Zeroable};
use dotenvy::dotenv;
use pgvector::Vector;
use reqwest::Client;
use reqwest::Error;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;
use std::fmt;
use std::fs;
use std::path::Path;
use std::io::{self, Read};
use std::sync::Mutex;
use sqlx::{PgPool, Row};
use sqlx::postgres::PgPoolOptions;
use sqlx::FromRow;

use tauri::State;
use tauri::command;

static MODEL_NAME: &str = "models/gemini-embedding-001";

#[derive(Debug)]
struct VectorLengthError;

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadParam{
    name:    String,
    content: String,
    embed:   String,
}

#[derive(Deserialize, Debug)]
struct EmbeddingResponse {
    embedding: Vec<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmbeddingData {
    pub values: Vec<f32>,
}
#[derive(Serialize)]
struct EmbeddingRequest {
    model: String,
    prompt: String,
}

// エンベディング結果を格納する構造体
#[derive(Debug, Clone)]
pub struct EmbeddingResult {
    pub embedding: Vec<f32>,
}

impl fmt::Display for VectorLengthError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "vectors must have the same length")
    }
}
impl std::error::Error for VectorLengthError {}

/**
*
* @param
*
* @return
*/
async fn EmbedUserQuery(query :String) -> Vec<f32> {
    let api_key = env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY must be set");
    println!("api_key={}", api_key);

    let items : Vec<f32> = Vec::new();
    let body = json!({
      "model": &MODEL_NAME.to_string(),
      "content": {"parts":[{"text": query.to_string()}]},
      "output_dimensionality": 1024
    });

    let items : Vec<f32> = Vec::new();
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert("x-goog-api-key", HeaderValue::from_str(&api_key).unwrap());
    let send_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent".to_string();
    
    // --- POST 送信 ---
    let res = client
        .post(&send_url)
        .headers(headers)
        .json(&body)
        .send()
        .await.unwrap();

    println!("Status: {:?}", res.status());
    if res.status().is_success() {
        let response_body: Value = res.json().await.unwrap();
        
        // エンベディングデータを取得
        let embed_values = response_body["embedding"]["values"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_f64().unwrap() as f32)
            .collect::<Vec<f32>>();
        
        print!("[0]=");
        print_type_of(&embed_values[0]);
        println!("    エンベディング次元数: {}", embed_values.len());
        println!("    最初の5要素: {:?}", &embed_values[..embed_values.len().min(5)]);
        return embed_values;
    } else {
        println!("Error: {:?}", res.text().await.unwrap());
    }

    return items;
}

fn conver_u8_to_f32(data: Vec<u8>) -> Vec<f32>{
    let floats: &[f32] = cast_slice(&data);
    //println!("{:?}", floats);
    return floats.to_vec();
}

/**
*
* @param
*
* @return
*/
async fn CheckSimalirity(query: String) -> String {
    let pg_conn_str = env::var("POSTGRES_CONNECTION_STR").expect("POSTGRES_CONNECTION_STR must be set");
    println!("pg_conn_str={}", pg_conn_str);

    #[derive(Debug, Serialize, Deserialize)]
    pub struct EmbedItem {
        name: String,
        content: String,
        embeddings: Vec<u8>
    }
    let input_f32 = EmbedUserQuery(query.clone()).await;
    println!("input_f32.len={}", input_f32.len());
    let query_vec = Vector::from(input_f32);

    let con_str = pg_conn_str.to_string();
    let pool = PgPoolOptions::new().max_connections(5)
    .connect(&con_str).await.expect("Failed to create pool");      

    // コサイン距離による検索
    let rows = sqlx::query(
        "SELECT id, content , embedding
         FROM documents
         ORDER BY embedding <=> $1
         LIMIT 2"
    )
    .bind(&query_vec)
    .fetch_all(&pool)
    .await.unwrap();

    println!("\nコサイン距離による類似検索結果:");
    let mut matches : String = "".to_string();
    for row in rows {
        let id: i32 = row.get("id");
        let content: String = row.get("content");
        matches.push_str(&content.clone());
        println!("ID: {}, cont.len={}", id, content.len() );
    }
    let mut out_str : String = "".to_string();
    if matches.len() > 0 {
        out_str = format!("context: {}\n", matches);
        let out_add2 = format!("user query: {}\n" , query);
        out_str.push_str(&out_add2);
    }else {
        out_str = format!("user query: {}\n", query);
    }
    return out_str.to_string();
}

/**
*
* @param
*
* @return
*/
fn f32_vec_to_u8_vec(data: &Vec<f32>) -> &[u8] {
    let len = data.len() * std::mem::size_of::<f32>();

    unsafe {
        std::slice::from_raw_parts(
            data.as_ptr() as *const u8,
            len,
        )
    }
}
/**
*
* @param
*
* @return
*/
fn print_type_of<T>(_: &T) {
    println!("Type: {}", std::any::type_name::<T>());
}

/**
*
* @param
*
* @return
*/
#[tauri::command]
async fn rag_search(query: String,
) -> anyhow::Result<String, String> {
    dotenv().ok();
    let api_key = env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY must be set");
    println!("api_key={}", api_key);

    let input = CheckSimalirity(query).await;
    let send_text = format!("日本語で、回答して欲しい。\n{}\n", input);
    println!("send_text={}\n", send_text);

    let send_url = format!("https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={}" , api_key);
    //let mut headers = HeaderMap::new();
    //headers.insert("Content-Type", HeaderValue::from_str("application/json"));
    let body = json!({
        "contents": [{
            "parts":[{"text": &send_text}]
        }]
    });
    let client = reqwest::Client::new();
    let res = client
        .post(&send_url)
        .json(&body)
        .send()
        .await.unwrap();

    println!("Status: {:?}", res.status());  
    let mut out_text: String = "".to_string();
    if res.status().is_success() {
        out_text = res.text().await.unwrap();
        //println!("out_text: {}", out_text);
    } else {
        println!("Error: {:?}", res.text().await.unwrap());
    }    
    return Ok(out_text);
}

/**
*
* @param
*
* @return
*/
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            rag_search,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");    

    tauri_rag5_lib::run()
}
