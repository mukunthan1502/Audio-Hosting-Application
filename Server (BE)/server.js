const app = require("./Controller/app");
require("dotenv").config();

const PORT = parseInt(process.env.PORT);

app.listen(PORT, () => {
    console.log(`'Audio Hosting Service on http://localhost: ${PORT}`);
});
