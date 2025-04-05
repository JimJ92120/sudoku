use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

mod js;
use js::*;

// mod type_d;
// use type_d::*;

pub struct Value<T>(T);

pub fn vec_to_size<const N: usize>() -> Vec<usize> {
    let mut range = 1..=(N);
    let result: Vec<usize> = std::array::from_fn::<usize, N, _>(|_| range.next().expect("too short")).into();

    result.clone()
}

//
type Row = [usize; 9];
type SudokuData = [Row; 9];

type GuessCell = [usize; 9];
type GuessRow = [GuessCell; 9];
type GuessData = [GuessRow; 9];

//
#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct Sudoku {
    data: SudokuData,
    guess_data: GuessData,
}

#[wasm_bindgen]
impl Sudoku {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            data: Sudoku::new_data(),
            guess_data: Sudoku::new_guess_data(),
        }
    }

    #[wasm_bindgen(getter)]
    pub fn data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.data.clone()).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn guess_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.guess_data.clone()).unwrap()
    }

    fn new_data() -> SudokuData {
        let row: Row = vec_to_size::<9>()
            .iter().map(|_| 0).collect::<Vec<usize>>()
            .try_into().unwrap();

        [row; 9].clone()
    }

    fn new_guess_data() -> GuessData {
        let cell: GuessCell = vec_to_size::<9>().try_into().unwrap();
        let row: GuessRow = vec_to_size::<9>().iter().map(|_| cell.clone()).collect::<Vec<GuessCell>>().try_into().unwrap();
        let guess_data: GuessData = vec_to_size::<9>().iter().map(|_| row.clone()).collect::<Vec<GuessRow>>().try_into().unwrap();

        guess_data.clone()
    }

    #[wasm_bindgen]
    pub fn generate(&self) {
        log(&format!("generating data..."));

        // let guess_data: GuessData = Sudoku::new_guess_data();

        // log(&format!("{:?}", "ok"));
    }

    #[wasm_bindgen]
    pub fn update_cell(&mut self, position: JsValue, new_value: usize) {
        let position: Vec<usize> = serde_wasm_bindgen::from_value(position).unwrap();

        if 0 == self.data[position[1]][position[0]] {           
            self.data[position[1]][position[0]] = new_value;

            let zone_position: [usize; 2] = [
                (((position[0] / 3) as f64).floor()) as usize,
                (((position[1] / 3) as f64).floor()) as usize
            ];

            let related_positions: [[[usize; 2]; 9]; 3] = [
                // row
                vec_to_size::<9>().iter().map(
                    |x| [ *x - 1, position[1]]
                ).collect::<Vec<[usize; 2]>>().try_into().unwrap(),
                // column
                vec_to_size::<9>().iter().map(
                    |x| [position[0], *x - 1]
                ).collect::<Vec<[usize; 2]>>().try_into().unwrap(),
                // zone
                vec_to_size::<9>().iter().map(
                    |x| [
                        zone_position[0] * 3 + (*x - 1) % 3,
                        zone_position[1] * 3 + ((((*x - 1) / 3) as f64).floor()) as usize
                    ]
                ).collect::<Vec<[usize; 2]>>().try_into().unwrap()
            ];

            for index in 0..=2 {
                let _related_positions = related_positions[index];
                
                for _index in 0..=8 {
                    let _position = _related_positions[_index];

                    if 0 < self.guess_data[_position[1]][_position[0]][new_value - 1] {
                        self.guess_data[_position[1]][_position[0]][new_value - 1] = 0;
                    }
                }
            }
        }
    }
}
