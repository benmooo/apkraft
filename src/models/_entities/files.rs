//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.9

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "files")]
pub struct Model {
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub mime: String,
    pub size_bytes: i64,
    pub path: String,
    pub checksum_sha256: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::app_versions::Entity")]
    AppVersions,
    #[sea_orm(has_many = "super::apps::Entity")]
    Apps,
}

impl Related<super::app_versions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AppVersions.def()
    }
}

impl Related<super::apps::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Apps.def()
    }
}
