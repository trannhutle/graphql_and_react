# Seed data:

`sequelize db:seed:all --seeders-path src/server/seeders --config src/server/config/index.js`

# Generate seed template

`sequelize seed:generate --name fake-posts --seeders-path src/server/seeders`

# Generate a entity

`sequelize model:generate --models-path src/server/models --migrations-path src/server/migrations --name User --attributes avatar:string,username:string`

# Generate a boilerplate migration fire

`sequelize migration:create --migrations-path src/server/migrations --name add-userId-to-post`

# Migrate data

`sequelize db:migrate --migrations-path src/server/migrations --config src/server/config/index.js`
