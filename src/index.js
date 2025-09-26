const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const { Donor, Receiver } = require("./mongodb");  // Import the models
const templatePath = path.join(__dirname, '..', 'templates');
const bcrypt = require('bcrypt');

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parses form data

app.set("view engine", "hbs");
app.set("views", templatePath);

//main page route
app.get("/", (req, res) => {
    res.render("first");
});
//login page route
app.get("/login", (req, res)=>{
    res.render("login");
})
// Signup Page Route
app.get("/signup", (req, res) => {
    res.render("signup");
});
// Forgot Password Route
app.get("/forgotpass", (req, res) => {
    res.render("forgotpass");
});
// Donor Home Route
app.get("/donor", (req, res) => {
    const name = req.query.name || "Donor"; // Default name if not provided
    res.render("donor", { name });
});
// Recycler Home Route
app.get("/recycler", (req, res) => {
    const name = req.query.name || "Recycler"; // Default name if not provided
    res.render("recycler", { name });
});

// Handle Forgot Password Logic for both Donors and Receivers
app.post("/forgotpass", async (req, res) => {
    try {
        const { name, userType } = req.body;

        // Validate input
        if (!name || !userType) {
            return res.render("forgotpass", { error: "Please enter username and select user type." });
        }

        // Search in the database based on user type
        let user;
        if (userType === "donor") {
            user = await Donor.findOne({ username: name });
        } else if (userType === "recycler") {
            user = await Receiver.findOne({ username: name });
        }

        if (!user) {
            return res.render("forgotpass", { error: "User not found." });
        }

        // Redirect to reset password page
        res.render("resetpass", { name, userType });
    } catch (error) {
        console.error("Error in /forgotpass:", error);
        res.status(500).send("An error occurred.");
    }
});


// Reset Password Logic
app.post("/resetpass", async (req, res) => {
    try {
        const { name, newPassword, userType } = req.body;

        // Validate input
        if (!name || !newPassword || !userType) {
            return res.render("resetpass", { error: "All fields are required." });
        }

        // Find the user based on the userType
        let user;
        if (userType === "donor") {
            user = await Donor.findOne({ username: name });
        } else if (userType === "recycler") {
            user = await Receiver.findOne({ username: name });
        }

        // If user is not found
        if (!user) {
            return res.render("resetpass", { error: "User not found." });
        }

        // Hash the new password before saving (if using bcrypt)
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Save the updated user
        await user.save();

        // Redirect to login page with a success message
        res.render("login", { message: "Password successfully updated!" });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).send("An error occurred.");
    }
});


// Login Logic for Donors and Receivers
app.post("/login", async (req, res) => {
    try {
        const { name, password, userType } = req.body;

        // Check if the username and password are provided
        if (!name || !password || !userType) {
            return res.render("login", { error: "Please provide username, password, and user type." });
        }

        let user;
        if (userType === "donor") {
            user = await Donor.findOne({ username: name });
        } else if (userType === "recycler") {
            user = await Receiver.findOne({ username: name });
        }

        // Check if user exists
        if (!user) {
            return res.render("login", { error: "User not found." });
        }

        // Compare passwords (hash the password if you're using bcrypt)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { error: "Incorrect password." });
        }

        // Redirect to home page based on user type
        if (userType === "donor") {
            return res.render("donor", { name: user.username });
        } else if (userType === "recycler") {
            return res.render("recycler", { name: user.username });
        }
        if (userType === "donor") {
            res.redirect(`/donor?name=${encodeURIComponent(user.username)}`);
        } else if (userType === "recycler") {
            res.redirect(`/recycler?name=${encodeURIComponent(user.username)}`);
        }

        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("An error occurred during login.");
    }
});







// Signup Logic for both Donors and Receivers
app.post('/signup', async (req, res) => {
    try {
        const { username, phoneNumber, password, userType, companyName } = req.body;

        // Validate required fields
        if (!username || !phoneNumber || !password || !userType) {
            return res.status(400).send("All fields are required.");
        }

        if (userType === 'donor') {
            const donor = new Donor({ username, phoneNumber, password });
            await donor.save();
            res.redirect(`/donor?name=${encodeURIComponent(donor.username)}`);
        } else if (userType === 'recycler') {
            if (!companyName) {
                return res.status(400).send("Company name is required for recyclers.");
            }
            const recycler = new Receiver({ username, companyName, phoneNumber, password });
            await recycler.save();
            res.redirect(`/recycler?name=${encodeURIComponent(recycler.username)}`);
        }
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).send("An error occurred during signup.");
    }
});



// Start Server
app.listen(4000, () => {
    console.log("Server connected on port 4000");
});






