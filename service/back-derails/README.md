## Installing the app
```
cp .env.example .env
npm install
```

Set the variables in the .env file accordingly to your environment

Install `MySQL` on your system and add a new database with the name as specified in the `.env` file.

### Run the migrations
```bash
npm run db:migrate:latest
```

## Running the app
`npm run watch`