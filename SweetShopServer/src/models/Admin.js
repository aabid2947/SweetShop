import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['super_admin', 'admin', 'moderator'],
      message: 'Role must be super_admin, admin, or moderator'
    },
    required: [true, 'Admin role is required'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: ['manage_sweets', 'manage_users', 'view_analytics', 'manage_orders', 'system_config']
  }],
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
adminSchema.methods.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
adminSchema.methods.generateAuthToken = async function() {
  const admin = this;
  const token = jwt.sign({ 
    _id: admin._id.toString(),
    role: 'admin',
    adminRole: admin.role 
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  return token;
};

// Instance method to generate refresh token
adminSchema.methods.generateRefreshToken = async function() {
  const admin = this;
  const refreshToken = jwt.sign({ 
    _id: admin._id.toString(),
    type: 'refresh',
    role: 'admin' 
  }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  
  // Store refresh token in database
  admin.refreshTokens = admin.refreshTokens.concat({ token: refreshToken });
  await admin.save();
  
  return refreshToken;
};

// Instance method to remove refresh token
adminSchema.methods.removeRefreshToken = async function(token) {
  const admin = this;
  admin.refreshTokens = admin.refreshTokens.filter(tokenObj => tokenObj.token !== token);
  await admin.save();
};

// Static method to find admin by credentials
adminSchema.statics.findByCredentials = async function(email, password) {
  const admin = await this.findOne({ email, isActive: true }).select('+password');
  
  if (!admin) {
    throw new Error('Invalid login credentials');
  }
  
  const isMatch = await admin.checkPassword(password);
  
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }
  
  return admin;
};

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON output
adminSchema.set('toJSON', { virtuals: true });

// Remove sensitive data when converting to JSON
adminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  delete admin.refreshTokens;
  return admin;
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;