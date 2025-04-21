use axum::{response::IntoResponse, Json};
use loco_rs::model::query::PageResponse;
use serde::Serialize;
use serde_repr::{Deserialize_repr, Serialize_repr};

pub type PagedApiResponse<T> = ApiResponse<Vec<T>, PageInfo>;

#[derive(Debug, Serialize)]
pub struct ApiResponse<T, I> {
    pub code: ApiResponseCode,
    // skip if data is None
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub info: Option<I>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

pub trait ToApiResponse<T, I> {
    fn to_api_response(self) -> ApiResponse<T, I>;
}

impl<T, I> ApiResponse<T, I> {
    pub fn new(
        code: ApiResponseCode,
        data: Option<T>,
        info: Option<I>,
        error: Option<String>,
    ) -> Self {
        Self {
            code,
            data,
            info,
            error,
        }
    }

    pub fn ok(data: T, info: Option<I>) -> Self {
        Self::new(ApiResponseCode::Ok, Some(data), info, None)
    }

    pub fn error(error_code: ApiResponseCode, error_msg: String) -> Self {
        Self::new(error_code, None, None, Some(error_msg))
    }

    pub fn error_with_info(
        error_code: ApiResponseCode,
        error_msg: String,
        info: Option<I>,
    ) -> Self {
        Self::new(error_code, None, info, Some(error_msg))
    }
}

impl<T> From<PageResponse<T>> for ApiResponse<Vec<T>, PageInfo> {
    fn from(page_response: PageResponse<T>) -> Self {
        Self::new(
            ApiResponseCode::Ok,
            Some(page_response.page),
            Some(PageInfo {
                total_items: page_response.total_items,
                total_pages: page_response.total_pages,
            }),
            None,
        )
    }
}

#[derive(Debug, Clone, Copy, Serialize)]
pub struct PageInfo {
    pub total_items: u64,
    pub total_pages: u64,
}

impl<T: Serialize, I: Serialize> IntoResponse for ApiResponse<T, I> {
    fn into_response(self) -> axum::response::Response {
        Json(self).into_response()
    }
}

#[derive(Debug, Clone, Copy, Serialize_repr, Deserialize_repr)]
#[repr(u16)]
pub enum ApiResponseCode {
    Ok = 0,                   // Success response
    BadRequest = 400,         // Bad request (e.g., missing parameter)
    Unauthorized = 401,       // Unauthorized (e.g., missing authentication)
    Forbidden = 403,          // Forbidden (e.g., insufficient permissions)
    NotFound = 404,           // Not found (e.g., resource not found)
    InternalError = 500,      // Internal server error
    ServiceUnavailable = 503, // Service unavailable (e.g., server maintenance)
}

impl ApiResponseCode {
    pub fn as_u16(&self) -> u16 {
        *self as u16
    }
}
