pub fn vec_to_size<const N: usize>() -> Vec<usize> {
    let mut range = 1..=(N);
    let result: Vec<usize> =
        std::array::from_fn::<usize, N, _>(|_| range.next().expect("too short")).into();

    result.clone()
}
pub fn rand(maximum: usize) -> usize {
    js_sys::Math::floor(js_sys::Math::random() * (maximum + 1) as f64) as usize
}

// rust does not support default arguments
// must be initialized outside for recursion
pub fn shuffle_range(
    maximum: usize,
    mut remainder: Vec<usize>,
    mut result: Vec<usize>,
) -> Vec<usize> {
    let random_index = rand(maximum - 1);

    if !result.contains(&random_index) {
        result.push(random_index);
        remainder = remainder
            .into_iter()
            .filter(|x| random_index != *x)
            .collect::<Vec<usize>>();
    }

    if 1 == remainder.len() {
        result.push(remainder.pop().unwrap());
    }

    if 0 != remainder.len() {
        return shuffle_range(maximum, remainder, result);
    }

    result
}

pub fn shuffle_matrix2_rows<T>(maxtrix2: Vec<T>) -> Vec<T>
where
    T: Clone,
{
    let mut new_matrix: Vec<T> = vec![];
    // let range = || 0..=(maxtrix2.len() - 1);
    let range = 0..=(maxtrix2.len() - 1);
    let _range: Vec<usize> = (range.clone()).collect();

    let random_index_order = shuffle_range(_range.len(), _range, vec![]);

    for _new_index in range {
        let new_index: usize = random_index_order[_new_index];

        new_matrix.push((&maxtrix2[new_index]).clone())
    }

    new_matrix
}

pub fn get_matrix2_columns<T>(matrix2: Vec<Vec<T>>) -> Vec<Vec<T>>
where
    T: Clone,
{
    let row_range = 0..=(matrix2.len() - 1);
    let column_range = 0..=(matrix2[0].len() - 1);
    let clone: Vec<Vec<T>> = matrix2.clone();

    column_range
        .clone()
        .into_iter()
        .map(|column_index| {
            row_range
                .clone()
                .into_iter()
                .map(|row_index| clone[row_index as usize][column_index].clone())
                .collect::<Vec<T>>()
        })
        .collect::<Vec<Vec<T>>>()
        .try_into()
        .unwrap()
}
