use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "apps",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("bundle_id", ColType::StringUniq),
                ("icon_url", ColType::TextNull),
                ("description", ColType::TextNull),
            ],
            &[("platform", "")],
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "apps").await
    }
}
