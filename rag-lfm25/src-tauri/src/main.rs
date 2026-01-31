// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use anyhow::{ensure, Context, Result};
use bytemuck::{cast_slice, Pod, Zeroable};
use dotenvy::dotenv;
use qdrant_client::qdrant::{
    Condition, CreateCollectionBuilder, Distance, Filter, PointStruct, ScalarQuantizationBuilder,
    SearchParamsBuilder, SearchPointsBuilder, UpsertPointsBuilder, VectorParamsBuilder,
};
use qdrant_client::{Payload, Qdrant, QdrantError};
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

use tauri::State;
use tauri::command;

static COLLECT_NAME: &str = "document-3";

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
    let items : Vec<f32> = Vec::new();
    let client = reqwest::Client::new();

    let request = EmbeddingRequest {
        model: "qwen3-embedding:0.6b".to_string(),
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

/**
*
* @param
*
* @return
*/
async fn CheckSimalirity(query: String) -> String {
    dotenv().ok();
    let clientQdrant = Qdrant::from_url("http://localhost:6334").build().unwrap();

    #[derive(Debug, Serialize, Deserialize)]
    pub struct EmbedItem {
        name: String,
        content: String,
        embeddings: Vec<u8>
    }
    let input_f32 = EmbedUserQuery(query.clone()).await;
    println!("input_f32.len={}", input_f32.len());
    let search_result = clientQdrant
        .search_points(
            SearchPointsBuilder::new(COLLECT_NAME, input_f32, 1)
                .with_payload(true)
                .params(SearchParamsBuilder::default().exact(true)),
        )
        .await.unwrap();

    let resplen = search_result.result.len();
    println!("#list-start={}", resplen);

    println!("\nコサイン距離による類似検索結果:");
    let mut matches : String = "".to_string();
    let mut out_str : String = "".to_string();
    for row_resp in &search_result.result {
        let content = &row_resp.payload["content"];
        let content_str = format!("{}\n\n", content);
        matches.push_str(&content_str.clone().to_string());
    }
    //println!("matches={}\n", &matches);
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
fn print_type_of<T>(_: &T) {
    println!("Type: {}", std::any::type_name::<T>());
}
fn remove_think_tags(text: &str) -> String {
    let re = regex::Regex::new(r"(?s)<think>.*?</think>").unwrap();
    re.replace_all(text, "").trim().to_string()
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
    #[derive(Serialize)]
    struct OllamaRequest {
        model: String,
        prompt: String,
        stream: bool,
    }
    #[derive(Deserialize, Debug)]
    struct OllamaResponse {
        response: String,
    }    

    let input = CheckSimalirity(query).await;
    let send_text = format!("日本語で、回答して欲しい。\n要約して欲しい。\n{}\n", input);
    //println!("send_text={}\n", send_text);
    let new_text = format!("以下のルールを必ず守ってください。\n <think> タグや思考過程は一切出力しない\n\n {}", send_text);
    println!("new_text={}\n", new_text);
    let client = Client::new();

    let body = OllamaRequest {
        model: "lfm2.5-thinking:latest".to_string(),
        prompt: new_text.to_string(),
        stream: false,
    };

    let res = client
        .post("http://localhost:11434/api/generate")
        .json(&body)
        .send()
        .await.unwrap()
        .json::<OllamaResponse>()
        .await.unwrap();

    let no_think_str = remove_think_tags(&res.response);
    println!("no_think: {}", no_think_str);         

    return Ok(no_think_str.to_string());
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

    rag_lfm25_lib::run()
}
