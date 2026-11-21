use axum::{
    extract::{Multipart, Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{Html, IntoResponse, Json, Response},
    routing::get,
    Router,
};
use chrono::Utc;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::SeekFrom;
use std::path::{Path as StdPath, PathBuf};
use std::sync::{Arc, Mutex};
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tower_http::cors::CorsLayer;
use tower_http::services::ServeDir;
use tracing::info;
use uuid::Uuid;

#[derive(Clone)]
struct AppState {
    db: Arc<Mutex<Connection>>,
    storage_dir: PathBuf,
}

#[derive(Debug, Serialize, Deserialize)]
struct Recording {
    id: String,
    title: String,
    filename: String,
    duration_secs: f64,
    size_bytes: i64,
    created_at: String,
    view_count: i64,
    passcode: Option<String>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("capflow_studio=info,tower_http=info")
        .init();

    let data_dir = PathBuf::from("./data");
    let storage_dir = data_dir.join("recordings");
    fs::create_dir_all(&storage_dir).expect("Failed to create storage directory");

    let db_path = data_dir.join("db.sqlite");
    let conn = Connection::open(&db_path).expect("Failed to open SQLite database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS recordings (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            filename TEXT NOT NULL,
            duration_secs REAL NOT NULL,
            size_bytes INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            view_count INTEGER DEFAULT 0,
            passcode TEXT
        )",
        [],
    )
    .expect("Failed to initialize database schema");

    let state = AppState {
        db: Arc::new(Mutex::new(conn)),
        storage_dir,
    };

    let app = Router::new()
        // API routes
        .route("/api/recordings", get(list_recordings).post(upload_recording))
        .route("/api/recordings/{id}", get(get_recording).patch(update_recording).delete(delete_recording))
        .route("/stream/{filename}", get(stream_video))
        .route("/v/{id}", get(public_player_page))
        // Static assets and fallback to index.html
        .nest_service("/static", ServeDir::new("./static"))
        .fallback(get(index_page))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3102".to_string());
    let addr = format!("0.0.0.0:{}", port);
    info!("🚀 CapFlow Screen & Cam Studio running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn index_page() -> Html<String> {
    match fs::read_to_string("./static/index.html") {
        Ok(content) => Html(content),
        Err(_) => Html("<h1>CapFlow Studio</h1><p>static/index.html not found</p>".to_string()),
    }
}

async fn public_player_page(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Response {
    let recording = {
        let conn = state.db.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT id, title, filename, duration_secs, size_bytes, created_at, view_count, passcode FROM recordings WHERE id = ?1")
            .unwrap();
        let mut rows = stmt
            .query_map([&id], |row| {
                Ok(Recording {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    filename: row.get(2)?,
                    duration_secs: row.get(3)?,
                    size_bytes: row.get(4)?,
                    created_at: row.get(5)?,
                    view_count: row.get(6)?,
                    passcode: row.get(7)?,
                })
            })
            .unwrap();

        match rows.next() {
            Some(Ok(rec)) => {
                let _ = conn.execute("UPDATE recordings SET view_count = view_count + 1 WHERE id = ?1", [&id]);
                Some(rec)
            }
            _ => None,
        }
    };

    let rec = match recording {
        Some(r) => r,
        None => {
            return (
                StatusCode::NOT_FOUND,
                Html("<h1>Video Not Found</h1><p>This recording does not exist or has been deleted.</p>".to_string()),
            )
                .into_response()
        }
    };

    let html = format!(
        r#"<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{} — CapFlow Video</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {{ background-color: #07090e; color: #f1f5f9; }}
  </style>
</head>
<body class="min-h-screen flex flex-col font-sans">
  <header class="border-b border-slate-800 bg-[#0a0e17]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm">
        ▶
      </div>
      <div>
        <h1 class="text-sm font-bold text-white">CapFlow</h1>
        <p class="text-[11px] text-slate-400">Sovereign Video Player</p>
      </div>
    </div>
    <a href="/" class="text-xs text-sky-400 hover:text-sky-300 font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors">
      Open Studio
    </a>
  </header>

  <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center">
    <div class="w-full bg-[#0e1422] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-4">
      <video
        controls
        autoplay
        playsinline
        class="w-full rounded-2xl bg-black aspect-video shadow-inner outline-none"
        src="/stream/{}"
      ></video>

      <div class="p-4 sm:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 class="text-xl font-bold text-white tracking-tight">{}</h2>
            <div class="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              <span>{}s duration</span>
              <span>•</span>
              <span>{:.1} MB</span>
              <span>•</span>
              <span>{} views</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a
              href="/stream/{}"
              download="{}.webm"
              class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
            >
              Download Video
            </a>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>Hosted securely on your local CapFlow server. No expiry date.</span>
          <button
            onclick="navigator.clipboard.writeText(window.location.href); alert('Share link copied to clipboard!');"
            class="text-sky-400 hover:underline cursor-pointer"
          >
            Copy Share Link
          </button>
        </div>
      </div>
    </div>
  </main>
</body>
</html>"#,
        rec.title,
        rec.filename,
        rec.title,
        rec.duration_secs.round(),
        (rec.size_bytes as f64) / (1024.0 * 1024.0),
        rec.view_count,
        rec.filename,
        rec.id
    );

    Html(html).into_response()
}

// REST API Handlers
async fn list_recordings(State(state): State<AppState>) -> Json<Vec<Recording>> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, title, filename, duration_secs, size_bytes, created_at, view_count, passcode FROM recordings ORDER BY created_at DESC")
        .unwrap();

    let recordings = stmt
        .query_map([], |row| {
            Ok(Recording {
                id: row.get(0)?,
                title: row.get(1)?,
                filename: row.get(2)?,
                duration_secs: row.get(3)?,
                size_bytes: row.get(4)?,
                created_at: row.get(5)?,
                view_count: row.get(6)?,
                passcode: row.get(7)?,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();

    Json(recordings)
}

async fn get_recording(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<Recording>, StatusCode> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, title, filename, duration_secs, size_bytes, created_at, view_count, passcode FROM recordings WHERE id = ?1")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut rows = stmt
        .query_map([&id], |row| {
            Ok(Recording {
                id: row.get(0)?,
                title: row.get(1)?,
                filename: row.get(2)?,
                duration_secs: row.get(3)?,
                size_bytes: row.get(4)?,
                created_at: row.get(5)?,
                view_count: row.get(6)?,
                passcode: row.get(7)?,
            })
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if let Some(Ok(rec)) = rows.next() {
        Ok(Json(rec))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn upload_recording(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<Recording>, (StatusCode, String)> {
    let id = Uuid::new_v4().to_string();
    let mut title = "Untitled Recording".to_string();
    let mut duration_secs: f64 = 0.0;
    let mut passcode: Option<String> = None;
    let mut file_bytes: Option<Vec<u8>> = None;
    let filename = format!("{}.webm", id);

    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("").to_string();
        if name == "title" {
            if let Ok(text) = field.text().await {
                if !text.trim().is_empty() {
                    title = text.trim().to_string();
                }
            }
        } else if name == "duration" {
            if let Ok(text) = field.text().await {
                if let Ok(d) = text.parse::<f64>() {
                    duration_secs = d;
                }
            }
        } else if name == "passcode" {
            if let Ok(text) = field.text().await {
                if !text.trim().is_empty() {
                    passcode = Some(text.trim().to_string());
                }
            }
        } else if name == "video" {
            if let Ok(bytes) = field.bytes().await {
                file_bytes = Some(bytes.to_vec());
            }
        }
    }

    let bytes = file_bytes.ok_or((StatusCode::BAD_REQUEST, "Missing video file".to_string()))?;
    let size_bytes = bytes.len() as i64;
    let file_path = state.storage_dir.join(&filename);

    tokio::fs::write(&file_path, bytes)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let created_at = Utc::now().to_rfc3339();

    {
        let conn = state.db.lock().unwrap();
        conn.execute(
            "INSERT INTO recordings (id, title, filename, duration_secs, size_bytes, created_at, view_count, passcode)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0, ?7)",
            params![id, title, filename, duration_secs, size_bytes, created_at, passcode],
        )
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    Ok(Json(Recording {
        id,
        title,
        filename,
        duration_secs,
        size_bytes,
        created_at,
        view_count: 0,
        passcode,
    }))
}

#[derive(Deserialize)]
struct UpdatePayload {
    title: Option<String>,
    passcode: Option<String>,
}

async fn update_recording(
    Path(id): Path<String>,
    State(state): State<AppState>,
    Json(payload): Json<UpdatePayload>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.db.lock().unwrap();

    if let Some(t) = payload.title {
        conn.execute("UPDATE recordings SET title = ?1 WHERE id = ?2", params![t, id])
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    if let Some(p) = payload.passcode {
        let pass_val = if p.trim().is_empty() { None } else { Some(p.trim().to_string()) };
        conn.execute("UPDATE recordings SET passcode = ?1 WHERE id = ?2", params![pass_val, id])
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    Ok(StatusCode::OK)
}

async fn delete_recording(
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<StatusCode, StatusCode> {
    let filename: Option<String> = {
        let conn = state.db.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT filename FROM recordings WHERE id = ?1")
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        let mut rows = stmt
            .query_map([&id], |row| row.get(0))
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        rows.next().and_then(|r| r.ok())
    };

    if let Some(fname) = filename {
        let file_path = state.storage_dir.join(fname);
        let _ = tokio::fs::remove_file(file_path).await;

        let conn = state.db.lock().unwrap();
        let _ = conn.execute("DELETE FROM recordings WHERE id = ?1", [&id]);
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

// HTTP Range Requests for Smooth Scrubbing / Seeking Video Playback
async fn stream_video(
    Path(filename): Path<String>,
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Response, StatusCode> {
    let safe_filename = StdPath::new(&filename)
        .file_name()
        .and_then(|f| f.to_str())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let file_path = state.storage_dir.join(safe_filename);
    if !file_path.exists() {
        return Err(StatusCode::NOT_FOUND);
    }

    let mut file = tokio::fs::File::open(&file_path)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let metadata = file
        .metadata()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let file_size = metadata.len();

    let range_header = headers
        .get(header::RANGE)
        .and_then(|v| v.to_str().ok());

    let (start, end) = match range_header {
        Some(range_str) if range_str.starts_with("bytes=") => {
            let parts: Vec<&str> = range_str["bytes=".len()..].split('-').collect();
            let start = parts[0].parse::<u64>().unwrap_or(0);
            let end = parts
                .get(1)
                .and_then(|e| e.parse::<u64>().ok())
                .unwrap_or(file_size.saturating_sub(1));
            (start, end.min(file_size.saturating_sub(1)))
        }
        _ => (0, file_size.saturating_sub(1)),
    };

    let chunk_size = (end - start) + 1;
    file.seek(SeekFrom::Start(start))
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut buffer = vec![0u8; chunk_size as usize];
    file.read_exact(&mut buffer)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let status = if range_header.is_some() {
        StatusCode::PARTIAL_CONTENT
    } else {
        StatusCode::OK
    };

    let mut response = Response::builder()
        .status(status)
        .header(header::CONTENT_TYPE, HeaderValue::from_static("video/webm"))
        .header(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"))
        .header(header::CONTENT_LENGTH, chunk_size.to_string())
        .body(axum::body::Body::from(buffer))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if range_header.is_some() {
        let content_range = format!("bytes {}-{}/{}", start, end, file_size);
        response
            .headers_mut()
            .insert(header::CONTENT_RANGE, HeaderValue::from_str(&content_range).unwrap());
    }

    Ok(response)
}
