const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Connect MongoDB to database
async function connectDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/vikrithidb", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);  // Exit the process if the connection fails
    }
}

connectDB();

// Donor Schema
const DonorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please fill a valid phone number'],  // Validate phone number
    },
    password: {
        type: String,
        required: true,
    },
});

// Receiver Schema
const ReceiverSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please fill a valid phone number'],  // Validate phone number
    },
    password: {
        type: String,
        required: true,
    },
});

// Password hashing middleware
const saltRounds = 10;

DonorSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

ReceiverSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

// Models
const Donor = mongoose.model("Donor", DonorSchema);
const Receiver = mongoose.model("Receiver", ReceiverSchema);

// Gracefully close the MongoDB connection
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
});

module.exports = { Donor, Receiver };




