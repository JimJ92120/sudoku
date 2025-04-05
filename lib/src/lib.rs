use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

// mod js;
// use js::*;

mod type_d;
use type_d::*;

//
#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct Sudoku {
    data: [[usize;9];9]
}

#[wasm_bindgen]
impl Sudoku {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let mut range = 1..=9;
        let row: [usize; 9] = std::array::from_fn(|_| range.next().expect("too short"));

        Self {
            data: [row; 9],
        }
    }

    #[wasm_bindgen(getter)]
    pub fn data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.data.clone()).unwrap()
    }
}
