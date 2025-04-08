use serde::{Deserialize, Serialize};

mod helpers;
use helpers::*;

type Row = [usize; 9];
type SudokuData = [Row; 9];

type GuessCell = [usize; 9];
type GuessRow = [GuessCell; 9];
type GuessData = [GuessRow; 9];

//
#[derive(Debug, Serialize, Deserialize)]
pub struct Sudoku {
    data: SudokuData,
    guess_data: GuessData,
    shadow_data: SudokuData,
    move_positions_stack: Vec<[usize; 2]>,
}

// missing checks for position in range
impl Sudoku {
    pub fn new() -> Self {
        Self {
            data: Sudoku::new_data(),
            guess_data: Sudoku::new_guess_data(),
            shadow_data: Sudoku::new_data(),
            move_positions_stack: vec![],
        }
    }

    // getters
    pub fn data(&self) -> SudokuData {
        self.data.clone()
    }

    pub fn guess_data(&self) -> GuessData {
        self.guess_data.clone()
    }

    // static
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

    // pub
    pub fn is_filled(&mut self) -> bool {
        let data: [&SudokuData; 3] = [
            &self.data.clone(),
            &get_matrix2_columns(self.data_to_vec(self.data))
                .into_iter()
                .map(|x| x.try_into().unwrap())
                .collect::<Vec<[usize; 9]>>()
                .try_into()
                .unwrap(),
            &self.get_zones(),
        ];

        for index in 0..=2 {
            let _data: &SudokuData = data[index];
            let row_match = "123456789";

            for _index in 0..=8 {
                let mut row: [usize; 9] = _data[_index];
                row.sort();
                let row: String = row.map(|x| x.to_string()).join("");

                if row != row_match {
                    return false;
                }
            }
        }

        true
    }

    pub fn auto_fill(&mut self) -> Vec<[usize; 2]> {
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
                    self.update_cell([column_index, row_index] as [usize; 2], sum);
                    filled_cells_positions.push([column_index, row_index]);
                }
            }
        }

        filled_cells_positions
    }

    pub fn update_cell(&mut self, position: [usize; 2], new_value: usize) -> bool {
        if !self.can_update_cell(position, new_value) {
            return false;
        }

        let related_positions: [[[usize; 2]; 9]; 3] = self.get_related_cells_positions(position);

        // update data
        self.data[position[1]][position[0]] = new_value;
        // update guess_data
        for index in 0..=2 {
            let _related_positions = related_positions[index];

            for _index in 0..=8 {
                let _position = _related_positions[_index];

                if 0 < self.guess_data[_position[1]][_position[0]][new_value - 1] {
                    self.guess_data[_position[1]][_position[0]][new_value - 1] = 0;
                }
            }
        }
        // update move_positions_stack
        if !self.add_move_position(position) {
            return false;
        }

        true
    }

    pub fn generate(&mut self, shift_count: usize, remove_count: usize) {
        let mut data: SudokuData = self.generate_random_data(shift_count);

        // drop n cells to be filled
        // check if remove_count <= 9 x 9 - 1 = 80
        // does not account possible duplicated random_position
        for _ in 0..=remove_count {
            let random_position: [usize; 2] = [rand(8), rand(8)];

            if 0 != data[random_position[1]][random_position[0]] {
                data[random_position[1]][random_position[0]] = 0;
            }
        }

        self.data = data.clone();
        self.shadow_data = data.clone();
        self.move_positions_stack = vec![];
        self.reset_guess_data();
    }

    pub fn restart(&mut self) {
        self.data = self.shadow_data.clone();
        self.move_positions_stack = vec![];
        self.reset_guess_data();
    }

    pub fn erase(&mut self, position: [usize; 2]) -> bool {
        if 0 == self.shadow_data[position[1]][position[0]]
            && 0 < self.data[position[1]][position[0]]
        {
            self.data[position[1]][position[0]] = 0;
            self.reset_guess_data();

            return true;
        }

        false
    }

    pub fn pop_last_move_position(&mut self) -> bool {
        let last_position = self.move_positions_stack.pop();

        // assumed true
        if !last_position.is_none() {
            let last_position: [usize; 2] = last_position.unwrap();

            self.data[last_position[1]][last_position[0]] = 0;

            self.reset_guess_data();

            return true;
        }

        false
    }

    //
    fn generate_random_data(&mut self, shift_count: usize) -> SudokuData {
        let mut data: SudokuData = Sudoku::new_data();
        let half_count = if 2 <= shift_count {
            js_sys::Math::floor(shift_count as f64 / 2.0) as usize
        } else {
            shift_count
        };
        for _ in 0..=1 {
            // possibly add inverse rows and columns indices
            data = self.shift_rows_randomly(half_count, data);
            data = self.shift_columns_randomly(half_count, data);
        }

        data
    }

    fn reset_guess_data(&mut self) {
        let mut guess_data: GuessData = Sudoku::new_guess_data();
        for row_index in 0..=8 {
            for column_index in 0..=8 {
                let related_positions: Vec<[usize; 2]> = self
                    .get_related_cells_positions([column_index, row_index])
                    .concat()
                    .to_vec();

                for related_position_index in 0..=(related_positions.len() - 1) {
                    let position: [usize; 2] = related_positions[related_position_index];
                    let value: usize = self.data[position[1]][position[0]];

                    if 0 != value && guess_data[row_index][column_index].contains(&value) {
                        guess_data[row_index][column_index][value - 1] = 0;
                    }
                }
            }
        }

        self.guess_data = guess_data;
    }

    fn shift_rows_randomly(&mut self, shift_count: usize, data: SudokuData) -> SudokuData {
        let rows: SudokuData = data.clone();

        self.shift_items(shift_count, rows)
    }

    fn shift_columns_randomly(&mut self, shift_count: usize, data: SudokuData) -> SudokuData {
        let mut columns: SudokuData = get_matrix2_columns(self.data_to_vec(data))
            .into_iter()
            .map(|x| x.try_into().unwrap())
            .collect::<Vec<[usize; 9]>>()
            .try_into()
            .unwrap();
        columns = self.shift_items(shift_count, columns.clone());

        get_matrix2_columns(self.data_to_vec(columns))
            .into_iter()
            .map(|x| x.try_into().unwrap())
            .collect::<Vec<[usize; 9]>>()
            .try_into()
            .unwrap()
    }

    fn add_move_position(&mut self, position: [usize; 2]) -> bool {
        if 0 < self.data[position[1]][position[0]] && !self.move_positions_stack.contains(&position)
        {
            self.move_positions_stack.push(position);

            return true;
        }

        false
    }

    // helpers
    fn shift_items(&mut self, shift_count: usize, items: SudokuData) -> SudokuData {
        let rows: SudokuData = items.clone();
        let mut rows_group: [Vec<[usize; 9]>; 3] = [
            rows[0..=2].to_vec(),
            rows[3..=5].to_vec(),
            rows[6..=8].to_vec(),
        ];

        for _ in 0..=(shift_count - 1) {
            for index in 0..=2 {
                rows_group[index] = shuffle_matrix2_rows(rows_group[index].clone());
            }

            rows_group = shuffle_matrix2_rows::<Vec<[usize; 9]>>(rows_group.clone().to_vec())
                .try_into()
                .unwrap();
        }

        rows_group
            .into_iter()
            .flatten()
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
                let row_index: usize = js_sys::Math::floor(index as f64 / 3 as f64) as usize;
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

    fn get_related_cells_positions(&self, position: [usize; 2]) -> [[[usize; 2]; 9]; 3] {
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

    fn data_to_vec(&self, data: SudokuData) -> Vec<Vec<usize>> {
        data.clone()
            .to_vec()
            .into_iter()
            .map(|x| x.to_vec())
            .collect()
    }

    fn can_update_cell(&self, position: [usize; 2], new_value: usize) -> bool {
        let is_set: bool = 0 != self.data[position[1]][position[0]];
        let are_related_cells_set: bool =
            0 == self.guess_data[position[1]][position[0]][new_value - 1];

        if !is_set && !are_related_cells_set && 0 < new_value && 10 > new_value {
            return true;
        }

        // debug
        // if is_set {
        //     log(&format!("!!! cell at {:?} is already set", position));
        // } else if are_related_cells_set {
        //     log(&format!(
        //         "!!! cell at {:?} is already set in related positions",
        //         position
        //     ));
        // }
        //

        return false;
    }
}
