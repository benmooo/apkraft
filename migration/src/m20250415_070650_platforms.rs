use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "platforms",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("code", ColType::SmallUnsignedUniq),
                ("icon_url", ColType::TextNull),
            ],
            &[],
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "platforms").await
    }
}
