use loco_rs::model::query::ConditionBuilder;

pub trait OptionExt<T> {
    fn is_some_then<F: FnOnce(&T)>(&self, f: F);
}

impl<T> OptionExt<T> for Option<T> {
    fn is_some_then<F: FnOnce(&T)>(&self, f: F) {
        if let Some(value) = self {
            f(value);
        }
    }
}

pub trait ConditionBuilderExt {
    fn tap_if_some<T, F>(self, opt: &Option<T>, f: F) -> Self
    where
        F: FnOnce(Self, &T) -> Self,
        Self: Sized;
}

impl ConditionBuilderExt for ConditionBuilder {
    fn tap_if_some<T, F>(self, opt: &Option<T>, f: F) -> Self
    where
        F: FnOnce(Self, &T) -> Self,
        Self: Sized,
    {
        match opt {
            Some(val) => f(self, val),
            None => self,
        }
    }
}
