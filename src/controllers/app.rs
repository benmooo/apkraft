#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use axum::{debug_handler, extract::Query};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::{
    models::{
        _entities::apps::{ActiveModel, Entity, Model},
        apps::{AppQuery, CreateApp},
    },
    views::apps::PaginationResponse,
};

async fn load_item(ctx: &AppContext, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct QueryParams {
    pub name: Option<String>,
    pub bundle_id: Option<String>,
    pub description: Option<String>,
    pub platform_id: Option<i32>,
}

#[debug_handler]
pub async fn list(
    State(ctx): State<AppContext>,
    Query(query): Query<AppQuery>,
) -> Result<Response> {
    let res = Model::query(&ctx.db, &query).await?;
    format::json(PaginationResponse::new(res, &query.pagination))
}

#[debug_handler]
pub async fn add(
    State(ctx): State<AppContext>,
    JsonValidateWithMessage(data): JsonValidateWithMessage<CreateApp>,
) -> Result<Response> {
    let item = ActiveModel::create(&ctx.db, &data).await?;
    format::json(item)
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateApp>,
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

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/apps/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
