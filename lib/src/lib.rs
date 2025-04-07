use js_sys::Math::floor;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

mod js;
use js::*;

// mod type_d;
// use type_d::*;

pub struct Value<T>(T);

pub fn vec_to_size<const N: usize>() -> Vec<usize> {
    let mut range = 1..=(N);
    let result: Vec<usize> =
        std::array::from_fn::<usize, N, _>(|_| range.next().expect("too short")).into();

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

    #[wasm_bindgen]
    pub fn generate(&self) {
        log(&format!("generating data..."));

        // let guess_data: GuessData = Sudoku::new_guess_data();

        // log(&format!("{:?}", "ok"));
    }

    #[wasm_bindgen]
    pub fn update_cell(&mut self, position: JsValue, new_value: usize) {
        let position: [usize; 2] = serde_wasm_bindgen::from_value(position).unwrap();

        self._update_cell(position, new_value);
    }

    #[wasm_bindgen]
    pub fn get_related_cells_positions(&self, position: JsValue) -> JsValue {
        let position: [usize; 2] = serde_wasm_bindgen::from_value(position).unwrap();
        let result: [[[usize; 2]; 9]; 3] = self._get_related_cells_positions(position);

        serde_wasm_bindgen::to_value(&result.clone()).unwrap()
    }

    #[wasm_bindgen]
    pub fn auto_fill(&mut self) -> JsValue {
        let result: Vec<Vec<usize>> = self
            ._auto_fill()
            .iter()
            .map(|x| Vec::from(*x))
            .collect::<Vec<Vec<usize>>>();

        serde_wasm_bindgen::to_value(&result.clone()).unwrap()
    }

    #[wasm_bindgen]
    pub fn is_filled(&mut self) -> bool {
        let data: [&SudokuData; 3] = [&self.data.clone(), & self.get_columns(), &self.get_zones()];
        
        for index in 0..=2 {
            let _data: &SudokuData = data[index];
            let row_match = "123456789";

            for _index in 0..=8 {
                let mut row: [usize; 9] = _data[_index];
                row.sort();
                let row: String = row.map(|x| x.to_string()).join("");

                if row != row_match {
                    log(&format!("is_filled false: {:?}", [index, _index]));
                    log(&format!(
                        "rows:\n{:?}\n\ncolumns:\n{:?}\n\nzones:\n{:?}\n\n",
                        data[0], data[1], data[2]
                    ));

                    return false;
                }
            }
        }

        true
    }

    fn _auto_fill(&mut self) -> Vec<[usize; 2]> {
        let mut filled_cells_positions: Vec<[usize; 2]> = vec![];

        for row_index in 0..=8 {
            for column_index in 0..=8 {
                if 0 < self.data[row_index][column_index] {
                    continue;
                }

                let mut guess_data: Vec<usize> =
                    self.guess_data[row_index][column_index].try_into().unwrap();
                let sum: usize = guess_data.iter().sum::<usize>();

                guess_data.retain(|x| 0 == *x);

                if 8 == guess_data.len() {
                    self._update_cell([column_index, row_index] as [usize; 2], sum);
                    filled_cells_positions.push([column_index, row_index]);
                }
            }
        }

        filled_cells_positions
    }

    fn new_data() -> SudokuData {
        let range = 0..=8;
        let mut row: [usize; 9] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        range
            .into_iter()
            .map(|x| {
                let modulus = x % 3;
                if 0 != x && 0 == modulus {
                    row = [
                        row[(5 + modulus)..=8].to_vec(),
                        row[0..=4 + modulus].to_vec(),
                    ]
                    .concat()
                    .try_into()
                    .unwrap();
                } else if 0 < x {
                    row = [row[6..=8].to_vec(), row[0..=5].to_vec()]
                        .concat()
                        .try_into()
                        .unwrap();
                }

                return row.clone();
            })
            .collect::<Vec<[usize; 9]>>()
            .try_into()
            .unwrap()

        // generates:
        // [
        //     [1, 2, 3, 4, 5, 6, 7, 8, 9],
        //     [7, 8, 9, 1, 2, 3, 4, 5, 6],
        //     [4, 5, 6, 7, 8, 9, 1, 2, 3],
        //     //
        //     [9, 1, 2, 3, 4, 5, 6, 7, 8],
        //     [6, 7, 8, 9, 1, 2, 3, 4, 5],
        //     [3, 4, 5, 6, 7, 8, 9, 1, 2],
        //     //
        //     [8, 9, 1, 2, 3, 4, 5, 6, 7],
        //     [5, 6, 7, 8, 9, 1, 2, 3, 4],
        //     [2, 3, 4, 5, 6, 7, 8, 9, 1],
        // ]
    }

    fn new_guess_data() -> GuessData {
        let cell: GuessCell = vec_to_size::<9>().try_into().unwrap();
        let row: GuessRow = vec_to_size::<9>()
            .iter()
            .map(|_| cell.clone())
            .collect::<Vec<GuessCell>>()
            .try_into()
            .unwrap();
        let guess_data: GuessData = vec_to_size::<9>()
            .iter()
            .map(|_| row.clone())
            .collect::<Vec<GuessRow>>()
            .try_into()
            .unwrap();

        guess_data.clone()
    }

    fn _update_cell(&mut self, position: [usize; 2], new_value: usize) {
        log(&format!(
            "attempting to update_cell() at position {:?} with value {:?}",
            position, new_value
        ));

        if !self.can_update_cell(position, new_value) {
            return;
        }

        // let zone_position: [usize; 2] = [
        //     (((position[0] / 3) as f64).floor()) as usize,
        //     (((position[1] / 3) as f64).floor()) as usize,
        // ];
        let related_positions: [[[usize; 2]; 9]; 3] = self._get_related_cells_positions(position);

        // update cell
        self.data[position[1]][position[0]] = new_value;
        // update related positions
        for index in 0..=2 {
            let _related_positions = related_positions[index];

            for _index in 0..=8 {
                let _position = _related_positions[_index];

                if 0 < self.guess_data[_position[1]][_position[0]][new_value - 1] {
                    self.guess_data[_position[1]][_position[0]][new_value - 1] = 0;
                }
            }
        }

        log(&format!("update_cell() at {:?}: OK", position));
    }

    fn _get_related_cells_positions(&self, position: [usize; 2]) -> [[[usize; 2]; 9]; 3] {
        let zone_position: [usize; 2] = [
            (((position[0] / 3) as f64).floor()) as usize,
            (((position[1] / 3) as f64).floor()) as usize,
        ];

        [
            // row
            vec_to_size::<9>()
                .iter()
                .map(|x| [*x - 1, position[1]])
                .collect::<Vec<[usize; 2]>>()
                .try_into()
                .unwrap(),
            // column
            vec_to_size::<9>()
                .iter()
                .map(|x| [position[0], *x - 1])
                .collect::<Vec<[usize; 2]>>()
                .try_into()
                .unwrap(),
            // zone
            vec_to_size::<9>()
                .iter()
                .map(|x| {
                    [
                        zone_position[0] * 3 + (*x - 1) % 3,
                        zone_position[1] * 3 + ((((*x - 1) / 3) as f64).floor()) as usize,
                    ]
                })
                .collect::<Vec<[usize; 2]>>()
                .try_into()
                .unwrap(),
        ]
    }

    fn can_update_cell(&self, position: [usize; 2], new_value: usize) -> bool {

        let is_set: bool = 0 != self.data[position[1]][position[0]];
        let are_related_cells_set: bool =
            0 == self.guess_data[position[1]][position[0]][new_value - 1];

        if !is_set && !are_related_cells_set && 0 < new_value && 10 > new_value {
            return true;
        }

        // debug
        if is_set {
            log(&format!("!!! cell at {:?} is already set", position));
        } else if are_related_cells_set {
            log(&format!(
                "!!! cell at {:?} is already set in related positions",
                position
            ));
        }
        //

        return false;
    }

    fn get_columns(&self) -> SudokuData {
        let range: std::ops::RangeInclusive<usize> = 0..=8;

        range
            .clone()
            .into_iter()
            .map(|column_index| {
                let _row: [usize; 9] = range
                    .clone()
                    .into_iter()
                    .map(|row_index| self.data.clone()[row_index as usize][column_index])
                    .collect::<Vec<usize>>()
                    .try_into()
                    .unwrap();

                _row
            })
            .collect::<Vec<[usize; 9]>>()
            .try_into()
            .unwrap()
    }

    fn get_zones(&self) -> SudokuData {
        let range: std::ops::RangeInclusive<usize> = 0..=8;

        range
            .clone()
            .into_iter()
            .map(|index| {
                let row_index: usize = floor(index as f64 / 3 as f64) as usize;
                let column_index: usize = index % 3;
                let range_to_fetch = (column_index * 3)..=(column_index * 3 + 2);
                let _range = 0..=2;

                let row: [[usize; 3]; 3] = [
                    self.data.clone()[row_index * 3][range_to_fetch.clone()]
                        .try_into()
                        .unwrap(),
                    self.data.clone()[row_index * 3 + 1][range_to_fetch.clone()]
                        .try_into()
                        .unwrap(),
                    self.data.clone()[row_index * 3 + 2][range_to_fetch.clone()]
                        .try_into()
                        .unwrap(),
                ];
                let row: [usize; 9] = row.concat().try_into().unwrap();

                row
            })
            .collect::<Vec<[usize; 9]>>()
            .try_into()
            .unwrap()
    }
}
