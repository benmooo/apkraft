// use axum::{http::{Response, StatusCode}, response::IntoResponse};

// pub struct MyError(loco_rs::Error);

// impl IntoResponse for MyError {
//     fn into_response(self) -> Response {
//         let status = match &self.0 {
//             loco_rs::Error::JsonRejection(_) => StatusCode::BAD_REQUEST,
//             _ => StatusCode::INTERNAL_SERVER_ERROR,
//         };

//         let body = json!({
//             "error": self.0.to_string(),
//             "details": format!("{:?}", self.0), // 调试详情
//         });

//         (status, Json(body)).into_response()
//     }
// }

// // 使用示例
// async fn handler() -> Result<Json<Data>, MyError> {
//     let data = do_something().map_err(MyError)?;
//     Ok(Json(data))
// }
