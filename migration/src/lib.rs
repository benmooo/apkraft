#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;

mod m20250415_070650_platforms;
mod m20250415_071137_apps;
mod m20250415_075142_apk_files;
mod m20250415_082441_app_versions;
mod m20250415_101650_add_current_app_version_id_to_apps;
mod m20250415_102251_create_fk_apps_current_app_version_id_to_app_versions;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20250415_070650_platforms::Migration),
            Box::new(m20250415_071137_apps::Migration),
            Box::new(m20250415_075142_apk_files::Migration),
            Box::new(m20250415_082441_app_versions::Migration),
            Box::new(m20250415_101650_add_current_app_version_id_to_apps::Migration),
            Box::new(
                m20250415_102251_create_fk_apps_current_app_version_id_to_app_versions::Migration,
            ),
            // inject-above (do not remove this comment)
        ]
    }
}
