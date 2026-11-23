const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or username and password are required.",
      });
    }

    const cleanInput = username.trim().toLowerCase();

    // Check database Admin record
    let admin = await Admin.findOne({
      $or: [{ username: cleanInput }, { email: cleanInput }],
    });

    let isMatch = false;

    if (admin) {
      isMatch = await admin.comparePassword(password);
    } else {
      // Check environment-configured admin
      const envEmail = (process.env.ADMIN_EMAIL || "admin@jsramconstruction.com").toLowerCase().trim();
      const envPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "JSRam@2026" : null);
      const envUsername = envEmail.split("@")[0] || "admin";

      if (envPassword && (cleanInput === envEmail || cleanInput === envUsername) && password === envPassword) {
        // Create admin record on the fly if DB is connected
        try {
          admin = new Admin({
            username: envUsername,
            email: envEmail,
            password: envPassword,
            role: "Administrator",
          });
          await admin.save();
          isMatch = true;
        } catch {
          // If offline/in-memory fallback
          admin = {
            _id: "admin_env_user",
            username: envUsername,
            email: envEmail,
            role: "Administrator",
          };
          isMatch = true;
        }
      }
    }

    if (!admin || !isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your email/username and password.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "jsram-construction-super-secure-jwt-secret-2026";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      jwtSecret,
      { expiresIn }
    );

    return res.status(200).json({
      success: true,
      message: "Admin authentication successful.",
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("[Auth Error]", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during authentication.",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      // Check if matching req.user
      if (req.user) {
        return res.status(200).json({
          success: true,
          user: req.user,
        });
      }
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile.",
      error: error.message,
    });
  }
};

module.exports = {
  login,
  getMe,
};
