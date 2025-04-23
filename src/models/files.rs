use crate::utils::ConditionBuilderExt;
use loco_rs::model::query::{self, paginate, PageResponse, PaginationQuery};
use loco_rs::Result;
use sea_orm::entity::prelude::*;
use sea_orm::{Condition, QueryOrder};
use serde::{Deserialize, Serialize};

pub use super::_entities::files::{ActiveModel, Column, Entity, Model};
use super::common::ToCondition;
pub type Files = Entity;

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if !insert && self.updated_at.is_unchanged() {
            let mut this = self;
            this.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

// implement your read-oriented logic here
impl Model {
    pub async fn query(
        db: &DatabaseConnection,
        query: &FileQuery,
    ) -> Result<PageResponse<Self>> {
        let cond = query.to_condition();
        paginate(
            db,
            Files::find().order_by_desc(Column::Id),
            Some(cond),
            &query.pagination,
        )
        .await
    }
}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}

#[derive(Debug, Deserialize, Serialize)]
pub struct FileQuery {
    pub name: Option<String>,
    pub mime: Option<String>,
    #[serde(flatten)]
    pub pagination: PaginationQuery,
}

impl ToCondition for FileQuery {
    fn to_condition(&self) -> Condition {
        query::condition()
            .tap_if_some(&self.name, |c, name| {
                c.contains(Column::Name, name)
            })
            .tap_if_some(&self.mime, |c, mime| {
                c.contains(Column::Mime, mime)
            })
            .build()
    }
}
