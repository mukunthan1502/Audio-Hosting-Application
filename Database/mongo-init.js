db = db.getSiblingDB("audio-host");
db.createUser({
    user: "admin",
    pwd: "password",
    roles: [{ role: "readWrite", db: "api_prod_db" }],
});
db.createCollection("users");

db.users.insertMany([
    {
        username: "Super_Admin",
        password: "1Password",
        userID: "00000000-0000-0000-0000-000000000000",
        role: "admin",
    },
    {
        username: "User",
        password: "1Password",
        userID: "8770db80-0d4b-4edc-bf84-4076d41259c6",
        role: "user",
    },
]);
