use sea_orm::Condition;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PaginationQuery {
    #[serde(default = "default_page")]
    pub page: Option<i32>,

    #[serde(default = "default_page_size")]
    pub page_size: Option<i32>,
}

fn default_page() -> Option<i32> {
    Some(1)
}

fn default_page_size() -> Option<i32> {
    Some(20)
}

pub trait ToCondition {
    fn to_condition(&self) -> Condition;
}
