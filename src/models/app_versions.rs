use crate::utils::ConditionBuilderExt;
use loco_rs::model::query::{self, paginate, PageResponse, PaginationQuery};
use loco_rs::Result;
use sea_orm::ActiveValue::Set;
use sea_orm::{entity::prelude::*, Condition, QueryOrder};
use serde::{Deserialize, Serialize};
use validator::Validate;

pub use super::_entities::app_versions::{ActiveModel, Entity, Model};
use super::{_entities::app_versions::Column, common::ToCondition};
pub type AppVersions = Entity;

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
        query: &AppVersionQuery,
    ) -> Result<PageResponse<Self>> {
        let cond = query.to_condition();
        paginate(
            db,
            AppVersions::find().order_by_desc(Column::Id),
            Some(cond),
            &query.pagination,
        )
        .await
    }
}

// implement your write-oriented logic here
impl ActiveModel {
    pub async fn create(db: &DatabaseConnection, data: &CreateAppVersion) -> Result<Model> {
        // check if bundle_id already exists in db
        if Entity::find()
            .filter(Column::AppId.eq(data.app_id))
            .filter(Column::VersionName.eq(&data.version_name))
            .filter(Column::VersionCode.eq(&data.version_code))
            .one(db)
            .await?
            .is_some()
        {
            return Err(loco_rs::Error::BadRequest(format!(
                "app {} with version {} and build number {} already exists!",
                data.app_id, data.version_name, data.version_code
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

#[derive(Debug, Deserialize, Serialize)]
pub struct AppVersionQuery {
    pub version_name: Option<String>,
    pub version_code: Option<String>,
    #[serde(flatten)]
    pub pagination: PaginationQuery,
}

impl ToCondition for AppVersionQuery {
    fn to_condition(&self) -> Condition {
        query::condition()
            .tap_if_some(&self.version_code, |c, name| {
                c.contains(Column::VersionName, name)
            })
            .tap_if_some(&self.version_code, |c, code| {
                c.contains(Column::VersionCode, code)
            })
            .build()
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, Validate)]
pub struct CreateAppVersion {
    pub app_id: i32,
    pub version_code: String,
    pub version_name: String,
    pub release_notes: Option<String>,
    pub apk_file_id: i32,
    pub published_at: Option<DateTimeWithTimeZone>,
}

impl CreateAppVersion {
    pub fn update(&self, item: &mut ActiveModel) {
        item.app_id = Set(self.app_id);
        item.version_code = Set(self.version_code.clone());
        item.version_name = Set(self.version_name.clone());
        item.release_notes = Set(self.release_notes.clone());
        item.apk_file_id = Set(Some(self.apk_file_id.clone()));
        item.published_at = Set(self.published_at.clone());
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, Validate)]
pub struct PatchAppVersion {
    pub version_code: Option<String>,
    pub version_name: Option<String>,
    pub release_notes: Option<String>,
    pub published_at: Option<DateTimeWithTimeZone>,
}

impl PatchAppVersion {
    pub fn update(&self, item: &mut ActiveModel) {
        self.version_code
            .as_ref()
            .inspect(|&code| item.version_code = Set(code.clone()));
        self.version_name
            .as_ref()
            .inspect(|&name| item.version_name = Set(name.clone()));
        self.release_notes
            .as_ref()
            .inspect(|&notes| item.release_notes = Set(Some(notes.clone())));
        self.published_at
            .as_ref()
            .inspect(|&date| item.published_at = Set(Some(date.clone())));
    }
}
