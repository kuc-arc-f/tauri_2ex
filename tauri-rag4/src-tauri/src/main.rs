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
    let model_embed_name = "qwen3-embedding:0.6b".to_string();
    println!("model_embed_name={}\n", model_embed_name);

    let items : Vec<f32> = Vec::new();
    let client = reqwest::Client::new();

    let request = EmbeddingRequest {
        model: model_embed_name.to_string(),
        prompt: query.to_string(),
    };

    let res = client
        .post("http://localhost:11434/api/embeddings")
        .json(&request)
        .send()
        .await.unwrap();
    println!("Status: {:?}", res.status());

    if res.status().is_success() {
        let response_body: EmbeddingResponse = res.json().await.unwrap();
        println!("Embedding length: {}", response_body.embedding.len());
        // Print first few elements to verify without flooding console
        if response_body.embedding.len() > 0 {
             println!("dimensions.len: {}", response_body.embedding.len());
             return response_body.embedding;
         } else {
             println!("Embedding: {:?}", response_body.embedding);
        }
       
    } else {
        println!("Request failed: {:?}", res.status());
        let text = res.text().await.unwrap();
        println!("Response text: {}", text);
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
         LIMIT 3"
    )
    .bind(&query_vec)
    .fetch_all(&pool)
    .await.unwrap();

    //println!("\nコサイン距離による類似検索結果:");
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

    let input = CheckSimalirity(query).await;
    let send_text = format!("日本語で、回答して欲しい。\n{}\n", input);
    println!("send_text={}\n", send_text);

    let send_url = "http://localhost:11434/api/generate".to_string();

    let body = json!({
        "model": "gemma3:4b",
        "prompt": &send_text.clone(),
        "stream": false,
        "options": {"num_ctx": 1024, "num_predict": 200}        
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
    tauri_rag4_lib::run()
}
