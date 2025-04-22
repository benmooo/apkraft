use axum::{
    response::{IntoResponse, Response},
    Json,
};
use loco_rs::Error as LocoError;
use serde_json::json;

pub struct AppError(pub LocoError);

impl From<LocoError> for AppError {
    fn from(err: LocoError) -> Self {
        AppError(err)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self.0 {
            LocoError::JsonRejection(err) => {
                tracing::debug!(err = err.body_text(), "Overridden json rejection");
                (
                    err.status(),
                    Json(json!({"error": "bad request", "description": err.body_text()})),
                )
                    .into_response()
            }
            other_error => other_error.into_response(), // Fallback to the original implementation
        }
    }
}
