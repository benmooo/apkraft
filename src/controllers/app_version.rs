#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use axum::{debug_handler, extract::Query};
use loco_rs::prelude::*;

use crate::{
    models::{
        _entities::app_versions::{Entity, Model},
        app_versions::{
            ActiveModel, AppVersionQuery, CreateAppVersion, PatchAppVersion, PublishPayload,
        },
    },
    views::{
        api_response::{ApiResponse, PagedApiResponse},
        api_result::AppError,
    },
};

async fn load_item(ctx: &AppContext, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(
    State(ctx): State<AppContext>,
    Query(query): Query<AppVersionQuery>,
) -> Result<PagedApiResponse<Model>> {
    let res = Model::query(&ctx.db, &query).await?;
    Ok(res.into())
}

#[debug_handler]
pub async fn add(
    State(ctx): State<AppContext>,
    axum::Json(data): axum::Json<CreateAppVersion>,
) -> std::result::Result<ApiResponse<Model, ()>, AppError> {
    let res = ActiveModel::create(&ctx.db, &data).await?;
    Ok(ApiResponse::ok(res, None))
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    axum::Json(params): axum::Json<PatchAppVersion>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn publish(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    axum::Json(payload): axum::Json<PublishPayload>,
) -> Result<Response> {
    ActiveModel::publish(&ctx.db, id, payload.publish).await?;
    format::empty()
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

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/app-versions/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
        .add("{id}/publish", post(publish))
}
