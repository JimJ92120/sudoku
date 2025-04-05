# sudoku

Some Sudoku with `Canvas2D` and `WebAssembly`.

---

---

# Project's structure

```sh
/(root)
  /src # app entrypoint (Typescript / JavaScript)
  /lib # lib entrypoint (Rust)
  /static # static assets (e.g index.html)
```

---

---

# setup

## requirements

|             |                             |
| ----------- | --------------------------- |
| `yarn`      | `^1.0`                      |
| `node`      | `^20.0`                     |
| `rust`      | `^1.77.0` ( `2021` edition) |
| `cargo`     | `^1.77.0`                   |
| `wasm-pack` | `^0.10.3`                   |

## install

1. clone repository

```sh
git clone <repository-name>
```

2. install `node` dependencies

```sh
yarn
```

---

# commands

### development

```sh
yarn start
```

Project will run at `http://localhost:8080/`.

### build

```sh
# build all
yarn build

# build /lib (`wasm` module)
yarn build:wasm
```

### nix-shell environment

```sh
nix-shell env.nix
```

---

---
