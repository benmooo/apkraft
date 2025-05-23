use crate::utils::ConditionBuilderExt;
use chrono::Utc;
use loco_rs::model::query::{self, paginate, PageResponse, PaginationQuery};
use loco_rs::{Error, Result};
use sea_orm::ActiveValue::Set;
use sea_orm::TransactionTrait;
use sea_orm::{entity::prelude::*, Condition, QueryOrder};
use serde::{Deserialize, Serialize};
use validator::Validate;

pub use super::_entities::app_versions::{ActiveModel, Entity, Model};
use super::_entities::{app_versions, apps};
use super::apps::Apps;
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

        let tx = db.begin().await?;
        let version = item.insert(&tx).await?;

        // If publish_immediately is true, update the app's current version ID
        if data.publish_immediately.unwrap_or(false) {
            Self::update_current_app_version_id(&tx, version.app_id, Some(version.id)).await?
        }

        tx.commit().await?;
        Ok(version)
    }

    pub async fn publish(db: &DatabaseConnection, id: i32, publish: bool) -> Result<()> {
        let version = Entity::find_by_id(id)
            .one(db)
            .await?
            .ok_or(Error::NotFound)?;
        let app_id = version.app_id; // Store app_id before converting to ActiveModel
        let mut version: app_versions::ActiveModel = version.into();

        // start a transaction
        let tx = db.begin().await?;

        if publish {
            version.published_at = Set(Some(Utc::now().fixed_offset()));
            version.update(&tx).await?;
            Self::update_current_app_version_id(&tx, app_id, Some(id)).await?
        } else {
            version.published_at = Set(None);
            version.update(&tx).await?;
            Self::update_current_app_version_id(&tx, app_id, None).await?
        }

        Ok(tx.commit().await?)
    }

    pub async fn update_current_app_version_id<C>(
        db: &C,
        app_id: i32,
        version_id: Option<i32>,
    ) -> Result<()>
    where
        C: ConnectionTrait,
    {
        let mut app: apps::ActiveModel = Apps::find_by_id(app_id)
            .one(db)
            .await?
            .ok_or(Error::NotFound)?
            .into();

        app.current_version_id = Set(version_id);
        app.update(db).await?;
        Ok(())
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
    pub publish_immediately: Option<bool>,
}

impl CreateAppVersion {
    pub fn update(&self, item: &mut ActiveModel) {
        item.app_id = Set(self.app_id);
        item.version_code = Set(self.version_code.clone());
        item.version_name = Set(self.version_name.clone());
        item.release_notes = Set(self.release_notes.clone());
        item.apk_file_id = Set(Some(self.apk_file_id.clone()));
        item.published_at = Set(self
            .publish_immediately
            .filter(|&is_pub| is_pub)
            .map(|_| Utc::now().fixed_offset()));
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, Validate)]
pub struct PatchAppVersion {
    pub version_code: Option<String>,
    pub version_name: Option<String>,
    pub release_notes: Option<String>,
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
    }
}

#[derive(Debug, Deserialize)]
pub struct PublishPayload {
    pub publish: bool,
}
