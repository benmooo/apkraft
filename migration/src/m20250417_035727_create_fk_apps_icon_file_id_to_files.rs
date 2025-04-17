use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.create_foreign_key(
            ForeignKey::create()
                .name("fk-apps-icon_file_id-to-files")
                .from(Alias::new("apps"), Alias::new("icon_file_id"))
                .to(Alias::new("files"), Alias::new("id"))
                .on_delete(ForeignKeyAction::Cascade)
                .on_update(ForeignKeyAction::Cascade)
                .to_owned(),
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.drop_foreign_key(
            ForeignKey::drop()
                .name("fk-apps-icon_file_id-to-files")
                .table(Alias::new("apps"))
                .to_owned(),
        )
        .await?;
        Ok(())
    }
}
