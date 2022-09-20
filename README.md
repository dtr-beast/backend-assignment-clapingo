# Backend Assignment


- The app can be configured with the `.env` file. but all the values are provided with defaults. in `utils/config.ts`


### Starting up the project

- I have used [PNPM](https://pnpm.io/), but the project should run with NPM as well.

- To install PNPM

```shell
npm i -g pnpm
```

- Run via PNPM

```shell
pnpm install
pnpm run dev
```

- Run via NPM

```shell
npm install
npm run dev
```

## Fake Data

- I have created a script at `fake_data\fake_data_generator.ts` to generate some users, learners and teachers.
- The favourite teachers will be printed in order
- To run the script: `npm run fake`