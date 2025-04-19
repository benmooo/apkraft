use loco_rs::{
    controller::views::pagination::{Pager, PagerMeta},
    model::query::{PageResponse, PaginationQuery},
};
use serde::{Deserialize, Serialize};

use crate::models::_entities::apps;

#[derive(Debug, Deserialize, Serialize)]
pub struct PaginationResponse {}

impl PaginationResponse {
    #[must_use]
    pub fn new(
        data: PageResponse<apps::Model>,
        pagination_query: &PaginationQuery,
    ) -> Pager<Vec<apps::Model>> {
        Pager {
            results: data.page,
            info: PagerMeta {
                page: pagination_query.page,
                page_size: pagination_query.page_size,
                total_pages: data.total_pages,
                total_items: data.total_items,
            },
        }
    }
}
