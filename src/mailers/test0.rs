#![allow(non_upper_case_globals)]

use loco_rs::prelude::*;
use serde_json::json;

static welcome: Dir<'_> = include_dir!("src/mailers/test0/welcome");

#[allow(clippy::module_name_repetitions)]
pub struct Test0 {}
impl Mailer for Test0 {}
impl Test0 {
    /// Send an email
    ///
    /// # Errors
    /// When email sending is failed
    pub async fn send_welcome(ctx: &AppContext, to: &str, msg: &str) -> Result<()> {
        Self::mail_template(
            ctx,
            &welcome,
            mailer::Args {
                to: to.to_string(),
                locals: json!({
                  "message": msg,
                  "domain": ctx.config.server.full_url()
                }),
                ..Default::default()
            },
        )
        .await?;

        Ok(())
    }
}
