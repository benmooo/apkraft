use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "apk_files",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("path", ColType::String),
                ("size_bytes", ColType::BigInteger),
                ("checksum_sha256", ColType::Text),
            ],
            &[],
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "apk_files").await
    }
}
