use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

mod sudoku;
use sudoku::*;

//
#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct Game {
    sudoku: Sudoku,
}

#[wasm_bindgen]
impl Game {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            sudoku: Sudoku::new(),
        }
    }

    // getters
    #[wasm_bindgen(getter)]
    pub fn data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sudoku.data().clone()).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn guess_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sudoku.guess_data()).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn shadow_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sudoku.shadow_data()).unwrap()
    }

    //
    #[wasm_bindgen]
    pub fn generate(&mut self, shift_count: usize, remove_count: usize) {
        self.sudoku.generate(shift_count, remove_count);
    }

    #[wasm_bindgen]
    pub fn is_filled(&mut self) -> bool {
        self.sudoku.is_filled()
    }

    #[wasm_bindgen]
    pub fn update_cell(&mut self, position: JsValue, new_value: usize) -> bool {
        let position: [usize; 2] = serde_wasm_bindgen::from_value(position).unwrap();

        self.sudoku.update_cell(position, new_value)
    }

    #[wasm_bindgen]
    pub fn auto_fill(&mut self) -> JsValue {
        let result: Vec<Vec<usize>> = self
            .sudoku
            .auto_fill()
            .iter()
            .map(|x| Vec::from(*x))
            .collect::<Vec<Vec<usize>>>();

        serde_wasm_bindgen::to_value(&result.clone()).unwrap()
    }

    #[wasm_bindgen]
    pub fn restart(&mut self) {
        self.sudoku.restart();
    }

    #[wasm_bindgen]
    pub fn erase(&mut self, position: JsValue) -> bool {
        let position: [usize; 2] = serde_wasm_bindgen::from_value(position).unwrap();

        self.sudoku.erase(position)
    }

    #[wasm_bindgen]
    pub fn undo(&mut self) -> bool {
        self.sudoku.pop_last_move_position()
    }
}
