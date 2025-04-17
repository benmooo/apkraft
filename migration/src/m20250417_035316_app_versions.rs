use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(m, "app_versions",
            &[
            
            ("id", ColType::PkAuto),
            
            ("version_code", ColType::String),
            ("version_name", ColType::String),
            ("release_notes", ColType::TextNull),
            ("apk_file_id", ColType::IntegerNull),
            ("published_at", ColType::TimestampWithTimeZoneNull),
            ],
            &[
            ("app", ""),
            ]
        ).await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "app_versions").await
    }
}
