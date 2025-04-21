use crate::utils::ConditionBuilderExt;
use loco_rs::{model::query::paginate, Result};
use validator::Validate;

pub use super::_entities::apps::{ActiveModel, Entity, Model};
use super::{_entities::apps, common::ToCondition};
use loco_rs::model::query::{self, PageResponse, PaginationQuery};
use sea_orm::{entity::prelude::*, ActiveValue::Set, Condition, QueryOrder};
use serde::{Deserialize, Serialize};
pub type Apps = Entity;

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
    pub async fn query(db: &DatabaseConnection, query: &AppQuery) -> Result<PageResponse<Self>> {
        let cond = query.to_condition();
        paginate(
            db,
            Apps::find().order_by_desc(apps::Column::Id),
            Some(cond),
            &query.pagination,
        )
        .await
    }
}

// implement your write-oriented logic here
impl ActiveModel {
    pub async fn create(db: &DatabaseConnection, data: &CreateApp) -> Result<Model> {
        // check if bundle_id already exists in db
        if Entity::find()
            .filter(apps::Column::BundleId.eq(&data.bundle_id))
            .one(db)
            .await?
            .is_some()
        {
            return Err(loco_rs::Error::BadRequest(format!(
                "bundle_id with {} already exists!",
                data.bundle_id
            )));
        }

        let mut item = ActiveModel {
            ..Default::default()
        };
        data.update(&mut item);
        Ok(item.insert(db).await?)
    }
}

// implement your custom finders, selectors oriented logic here
impl Entity {}

#[derive(Debug, Deserialize)]
pub struct AppQuery {
    pub name: Option<String>,
    pub bundle_id: Option<String>,
    pub description: Option<String>,
    pub platform_id: Option<i32>,
    #[serde(flatten)]
    pub pagination: PaginationQuery,
}

impl ToCondition for AppQuery {
    fn to_condition(&self) -> Condition {
        query::condition()
            .tap_if_some(&self.name, |c, name| c.contains(apps::Column::Name, name))
            .tap_if_some(&self.bundle_id, |c, bundle_id| {
                c.contains(apps::Column::BundleId, bundle_id)
            })
            .tap_if_some(&self.description, |c, description| {
                c.contains(apps::Column::Description, description)
            })
            .tap_if_some(&self.platform_id, |c, platform_id| {
                // for platform_id we use the eq method
                c.eq(apps::Column::PlatformId, *platform_id)
            })
            .build()
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, Validate)]
pub struct CreateApp {
    pub name: String,
    pub bundle_id: String,
    pub icon_file_id: Option<i32>,
    pub current_version_id: Option<i32>,
    pub description: Option<String>,
    pub platform_id: i32,
}

impl CreateApp {
    pub fn update(&self, item: &mut ActiveModel) {
        item.name = Set(self.name.clone());
        item.bundle_id = Set(self.bundle_id.clone());
        item.icon_file_id = Set(self.icon_file_id.clone());
        item.current_version_id = Set(self.current_version_id.clone());
        item.description = Set(self.description.clone());
        item.platform_id = Set(self.platform_id);
    }
}
