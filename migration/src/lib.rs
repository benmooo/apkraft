#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;

mod m20250415_070650_platforms;
mod m20250417_032825_files;
mod m20250417_034939_apps;
mod m20250417_035316_app_versions;
mod m20250417_035727_create_fk_apps_icon_file_id_to_files;
mod m20250417_035735_create_fk_apps_current_version_id_to_app_versions;
mod m20250417_035743_create_fk_app_versions_apk_file_id_to_files;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20250415_070650_platforms::Migration),
            Box::new(m20250417_032825_files::Migration),
            Box::new(m20250417_034939_apps::Migration),
            Box::new(m20250417_035316_app_versions::Migration),
            Box::new(m20250417_035727_create_fk_apps_icon_file_id_to_files::Migration),
            Box::new(m20250417_035735_create_fk_apps_current_version_id_to_app_versions::Migration),
            Box::new(m20250417_035743_create_fk_app_versions_apk_file_id_to_files::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}