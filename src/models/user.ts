import mongoose from "mongoose";
import { Password } from "../services/password";

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

interface UserAttrs {
  email: string;
  password?: string;
  role?: UserRole;
  isTwoFactorEnabled?: boolean;
  twoFactorConfirmation?: mongoose.Schema.Types.ObjectId;
  name?: string;
  emailVerified?: Date;
  image?: string;
  accounts?: AccountAttrs[];
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password?: string;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  twoFactorConfirmation?: mongoose.Schema.Types.ObjectId;
  name?: string;
  emailVerified?: Date;
  image?: string;
  accounts: mongoose.Types.Array<AccountDoc>;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    // required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorConfirmation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TwoFactorConfirmation'
  },
  name: {
    type: String,
  },
  emailVerified: {
    type: Date,
  },
  image: {
    type: String,
  },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }]
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
    }
  }
});

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

interface TwoFactorConfirmationAttrs {
  userId: string;
}

interface TwoFactorConfirmationDoc extends mongoose.Document {
  userId: string;
  user: UserDoc;
}

interface TwoFactorConfirmationModel extends mongoose.Model<TwoFactorConfirmationDoc> {
  build(attrs: TwoFactorConfirmationAttrs): TwoFactorConfirmationDoc;
}

const twoFactorConfirmationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

twoFactorConfirmationSchema.statics.build = (attrs: TwoFactorConfirmationAttrs) => {
  return new TwoFactorConfirmation(attrs);
};

const TwoFactorConfirmation = mongoose.model<TwoFactorConfirmationDoc, TwoFactorConfirmationModel>('TwoFactorConfirmation', twoFactorConfirmationSchema);

interface AccountAttrs {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
}

interface AccountDoc extends mongoose.Document {
  userId: string;
  user: UserDoc;
  type: string;
  provider: string;
  providerAccountId: string;
}

interface AccountModel extends mongoose.Model<AccountDoc> {
  build(attrs: AccountAttrs): AccountDoc;
}

const accountSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  providerAccountId: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Ensure the combination of provider and providerAccountId is unique
accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true } as any);

accountSchema.statics.build = (attrs: AccountAttrs) => {
  return new Account(attrs);
};

const Account = mongoose.model<AccountDoc, AccountModel>('Account', accountSchema);

export { User, UserRole, UserDoc, TwoFactorConfirmation, Account };