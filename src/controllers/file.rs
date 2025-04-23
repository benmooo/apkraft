#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use axum::{
    body::Body,
    debug_handler,
    extract::{Multipart, Query},
    http::{header, StatusCode},
};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::models::_entities::files::{self, ActiveModel, Entity, Model};
use crate::views::api_response::PagedApiResponse;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Params {
    pub description: Option<String>,
}

impl Params {
    fn update(&self, item: &mut ActiveModel) {
        item.description = Set(self.description.clone());
    }
}

async fn load_item(ctx: &AppContext, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(
    State(ctx): State<AppContext>,
    Query(query): Query<crate::models::files::FileQuery>,
) -> Result<PagedApiResponse<Model>> {
    let res = Model::query(&ctx.db, &query).await?;
    Ok(res.into())
}

#[debug_handler]
pub async fn add(
    State(ctx): State<AppContext>,
    Query(query): Query<Params>,
    mut multipart: Multipart,
) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    query.update(&mut item);

    // we only care the first file
    if let Some(field) = multipart.next_field().await.map_err(Error::msg)? {
        item.name = Set(field
            .file_name()
            .ok_or(Error::string("empty file name"))?
            .to_owned());
        item.mime = Set(field
            .content_type()
            .ok_or(Error::string("content type is null"))?
            .to_owned());

        // consume the fileds bytes  and save the file using storage
        let bytes = field.bytes().await.map_err(Error::msg)?;
        item.size_bytes = Set(bytes.len() as i64);

        let path = Uuid::new_v4().to_string();
        item.path = Set(path.clone());
        let file_path = std::path::Path::new(&path);
        ctx.storage.upload(file_path, &bytes).await?;

        // calculate the checksum_sha256
        let mut hasher = Sha256::new();
        hasher.update(&bytes);
        let checksum = hex::encode(hasher.finalize());
        item.checksum_sha256 = Set(checksum);
    }

    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<Params>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn remove(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

#[debug_handler]
pub async fn serve_file(
    Path(key): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    // Find the file in the database by path
    let file = Entity::find()
        .filter(files::Column::Path.eq(&key))
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    // Create file path for storage retrieval
    let file_path = std::path::Path::new(&file.path);

    // Get the file stream from storage
    let stream: Vec<u8> = ctx.storage.download(&file_path).await.map_err(Error::msg)?;

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, file.mime)
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", file.name),
        )
        .header(header::CONTENT_LENGTH, stream.len())
        .body(Body::from(stream))?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/files/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
        .add("static/{key}", get(serve_file))
}
