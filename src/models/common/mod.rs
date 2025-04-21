use sea_orm::Condition;

pub trait ToCondition {
    fn to_condition(&self) -> Condition;
}
