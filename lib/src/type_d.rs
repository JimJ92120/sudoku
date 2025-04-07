use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct Coordinates {
    pub x: isize,
    pub y: isize,
    pub z: isize,
}
#[wasm_bindgen]
impl Coordinates {
    #[wasm_bindgen(constructor)]
    pub fn new(x: isize, y: isize, z: isize) -> Self {
        Self { x, y, z }
    }
}
