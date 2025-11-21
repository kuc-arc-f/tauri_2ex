// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{ensure, Context, Result};
use bytemuck::{cast_slice, Pod, Zeroable};
use dotenvy::dotenv;
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


fn cosine_similarity(a: &[f32], b: &[f32]) -> Result<f64, Box<dyn std::error::Error>> {
    if a.len() != b.len() {
        return Err(Box::new(VectorLengthError));
    }

    let mut dot_product = 0.0_f64;
    let mut a_magnitude = 0.0_f64;
    let mut b_magnitude = 0.0_f64;

    for i in 0..a.len() {
        dot_product += (a[i] * b[i]) as f64;
        a_magnitude += (a[i] * a[i]) as f64;
        b_magnitude += (b[i] * b[i]) as f64;
    }

    if a_magnitude == 0.0 || b_magnitude == 0.0 {
        return Ok(0.0);
    }

    Ok(dot_product / (a_magnitude.sqrt() * b_magnitude.sqrt()))
}


/**
*
* @param
*
* @return
*/
async fn EmbedUserQuery(query :String) -> Vec<f32> {
    let model_embed_name = env::var("MODEL_EMBED_NAME").expect("MODEL_EMBED_NAME must be set");
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

    let con_str = pg_conn_str.to_string();
    let pool = PgPoolOptions::new().max_connections(5)
    .connect(&con_str).await.expect("Failed to create pool");      
    
    let sql = "SELECT name, content, embeddings FROM embeddings".to_string();
    println!("sql={}", sql);

    let rows = sqlx::query(&sql)
        .fetch_all(&pool)
        .await.unwrap();
    let embed_items: Vec<EmbedItem> = rows
        .into_iter()
        .map(|row| EmbedItem {
            name: row.get("name"),
            content: row.get("content"),
            embeddings: row.get("embeddings"),
        })
        .collect();
        
    println!("emb.len={}", embed_items.len());
    let mut matches : String = "".to_string();
    //println!("emb.len[0]={}", embed_items[0].embeddings.len());
    //println!("    最初の5要素: {:?}", &embed_items[0].embeddings[..embed_items[0].embeddings.len().min(5)]);
    for v in &embed_items {
        let f32_value = conver_u8_to_f32(v.embeddings.clone());
        match cosine_similarity(&input_f32, &f32_value) {
            Ok(similarity) => {
                println!("cosine_similarity= {}", similarity);
                if similarity > 0.5 {
                    matches.push_str(&v.content.clone());
                }
            }
            Err(e) => eprintln!("エラー: {}", e),
        }
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
    let send_text = format!("日本語で、回答して欲しい。\n{}", input);
    println!("send_text={}\n", send_text);

    // APII send
    let send_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent".to_string();

    let body = json!({
        "contents": [
        {
            "parts": [
            {
                "text": &send_text
            }
            ]
        }
        ]
    });
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert("x-goog-api-key", HeaderValue::from_str(&api_key).unwrap());
    let res = client
        .post(&send_url)
        .headers(headers)
        .json(&body)
        .send()
        .await.unwrap();

    println!("Status: {:?}", res.status());  
    let mut out_text: String = "".to_string();
    if res.status().is_success() {
        let response_body: Value = res.json().await.unwrap();
        println!("response_body={}", response_body);
        out_text = serde_json::to_string(&response_body).unwrap();
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
    //tauri_rag_lib::run()
    tauri_rag_ollama_lib::run()
}

